#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const OWNER = 'swisskyrepo';
const REPO = 'PayloadsAllTheThings';
const BRANCH = 'master';

const EXCLUDED_DIRECTORIES = new Set([
  '.github',
  '_template_vuln',
  '_LEARNING_AND_SOCIALS',
  '.git',
  '.vscode',
  'overrides',
]);

const TAG_RULES = [
  { tag: 'Injection', patterns: [/injection/i, /sqli/i, /xss/i, /xxe/i, /xpath/i, /xslt/i, /ssti/i] },
  { tag: 'Authentication', patterns: [/auth/i, /oauth/i, /jwt/i, /account/i, /saml/i] },
  { tag: 'Misconfiguration', patterns: [/misconfiguration/i, /insecure/i, /cache/i, /proxy/i] },
  { tag: 'Server-Side', patterns: [/server side/i, /ssrf/i, /deserialization/i, /rmi/i] },
  { tag: 'Client-Side', patterns: [/client side/i, /dom/i, /clickjacking/i, /tabnabbing/i] },
  { tag: 'Enumeration', patterns: [/hidden parameters/i, /directory traversal/i, /virtual hosts/i] },
  { tag: 'Bypass', patterns: [/bypass/i, /rate limit/i, /request smuggling/i, /type juggling/i] },
];

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^#+\s+/gm, '')
    .replace(/[\*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(markdown) {
  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;

  for (const match of markdown.matchAll(headingRegex)) {
    const level = match[1].length;
    const title = match[2].trim();

    if (!title) {
      continue;
    }

    headings.push({
      level,
      title,
      slug: slugify(title),
    });
  }

  return headings;
}

function extractCodeBlocks(markdown) {
  const blocks = [];
  const codeRegex = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;

  for (const match of markdown.matchAll(codeRegex)) {
    const language = match[1] || 'text';
    const content = match[2].trim();

    if (!content) {
      continue;
    }

    blocks.push({
      language,
      preview: content.split('\n').slice(0, 4).join('\n'),
    });
  }

  return blocks;
}

function inferTags(category, markdown, headings) {
  const normalized = [category, markdown.slice(0, 600), headings.map((heading) => heading.title).join(' ')]
    .join(' ')
    .toLowerCase();

  const tags = TAG_RULES.filter((rule) => rule.patterns.some((pattern) => pattern.test(normalized))).map(
    (rule) => rule.tag
  );

  if (!tags.length) {
    return ['General'];
  }

  return [...new Set(tags)].sort();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'payload-library-sync',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch JSON (${response.status}) for ${url}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/plain',
      'User-Agent': 'payload-library-sync',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch markdown (${response.status}) for ${url}`);
  }

  return response.text();
}

async function getCategoryReadmes() {
  const treeUrl = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
  const treeResponse = await fetchJson(treeUrl);

  if (!Array.isArray(treeResponse.tree)) {
    throw new Error('Unexpected git tree payload from GitHub API');
  }

  const directories = new Set(
    treeResponse.tree
      .filter((entry) => entry.type === 'tree' && !entry.path.includes('/'))
      .map((entry) => entry.path)
  );

  return treeResponse.tree
    .filter((entry) => entry.type === 'blob' && /^[^/]+\/README\.md$/.test(entry.path))
    .map((entry) => {
      const category = entry.path.split('/')[0];
      return {
        category,
        path: entry.path,
      };
    })
    .filter((entry) => {
      if (!directories.has(entry.category)) {
        return false;
      }

      if (entry.category.startsWith('_') || entry.category.startsWith('.')) {
        return false;
      }

      if (EXCLUDED_DIRECTORIES.has(entry.category)) {
        return false;
      }

      return true;
    });
}

async function sync() {
  console.log('Fetching category tree from GitHub...');
  const readmes = await getCategoryReadmes();

  if (!readmes.length) {
    throw new Error('No category README files found in upstream repository');
  }

  console.log(`Found ${readmes.length} category README files`);

  const categories = [];
  const failures = [];

  for (let index = 0; index < readmes.length; index += 1) {
    const entry = readmes[index];
    const rawPath = entry.path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${rawPath}`;

    process.stdout.write(`[${index + 1}/${readmes.length}] ${entry.category}\r`);

    try {
      const markdown = await fetchText(rawUrl);
      const headings = extractHeadings(markdown);
      const codeBlocks = extractCodeBlocks(markdown);
      const plainText = stripMarkdown(markdown);
      const tags = inferTags(entry.category, markdown, headings);

      categories.push({
        slug: slugify(entry.category),
        title: entry.category,
        tags,
        path: entry.path,
        sourceUrl: `https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${rawPath}`,
        markdown,
        headings,
        codeBlocks,
        codeBlockCount: codeBlocks.length,
        excerpt: plainText.slice(0, 280),
      });
    } catch (error) {
      failures.push({ category: entry.category, reason: String(error) });
    }
  }

  process.stdout.write('\n');

  categories.sort((a, b) => a.title.localeCompare(b.title));
  const facetCounts = categories.reduce((acc, category) => {
    for (const tag of category.tags) {
      acc[tag] = (acc[tag] ?? 0) + 1;
    }

    return acc;
  }, {});

  const output = {
    generatedAt: new Date().toISOString(),
    source: {
      owner: OWNER,
      repo: REPO,
      branch: BRANCH,
      repositoryUrl: `https://github.com/${OWNER}/${REPO}`,
    },
    stats: {
      categoryCount: categories.length,
      totalCodeBlocks: categories.reduce((sum, item) => sum + item.codeBlockCount, 0),
      failedCategories: failures.length,
      facetCounts,
    },
    failures,
    categories,
  };

  const outputDir = path.join(process.cwd(), 'data', 'generated');
  const outputPath = path.join(outputDir, 'categories.json');

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`Saved ${categories.length} categories to ${outputPath}`);

  if (failures.length) {
    console.log(`Warning: ${failures.length} categories failed to sync`);
  }
}

sync().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
