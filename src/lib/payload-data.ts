import { readFile } from "node:fs/promises";
import path from "node:path";

export type PayloadHeading = {
  level: number;
  title: string;
  slug: string;
};

export type PayloadCodeBlock = {
  language: string;
  preview: string;
};

export type PayloadCategory = {
  slug: string;
  title: string;
  tags: string[];
  path: string;
  sourceUrl: string;
  markdown: string;
  headings: PayloadHeading[];
  codeBlocks: PayloadCodeBlock[];
  codeBlockCount: number;
  excerpt: string;
};

export type PayloadCategorySummary = Pick<
  PayloadCategory,
  "slug" | "title" | "tags" | "sourceUrl" | "headings" | "codeBlockCount" | "excerpt"
>;

export type PayloadLibraryData = {
  generatedAt: string;
  source: {
    owner: string;
    repo: string;
    branch: string;
    repositoryUrl: string;
  };
  stats: {
    categoryCount: number;
    totalCodeBlocks: number;
    failedCategories: number;
    facetCounts: Record<string, number>;
  };
  failures: { category: string; reason: string }[];
  categories: PayloadCategory[];
};

const DATA_PATH = path.join(process.cwd(), "data", "generated", "categories.json");

let cache: PayloadLibraryData | null = null;

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return ["General"];
  }

  const tags = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return tags.length ? [...new Set(tags)] : ["General"];
}

function normalizeLibraryData(input: PayloadLibraryData): PayloadLibraryData {
  const categories = Array.isArray(input.categories)
    ? input.categories.map((category) => ({
        ...category,
        tags: normalizeTags((category as { tags?: unknown }).tags),
      }))
    : [];

  const facetCounts = categories.reduce<Record<string, number>>((acc, category) => {
    for (const tag of category.tags) {
      acc[tag] = (acc[tag] ?? 0) + 1;
    }

    return acc;
  }, {});

  return {
    ...input,
    stats: {
      ...(input.stats ?? {
        categoryCount: 0,
        totalCodeBlocks: 0,
        failedCategories: 0,
        facetCounts: {},
      }),
      categoryCount: categories.length,
      facetCounts,
    },
    categories,
  };
}

export async function getPayloadLibraryData(): Promise<PayloadLibraryData> {
  if (cache) {
    return cache;
  }

  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    cache = normalizeLibraryData(JSON.parse(raw) as PayloadLibraryData);
    return cache;
  } catch {
    throw new Error(
      "Missing generated data. Run `npm run sync:data` to pull content from swisskyrepo/PayloadsAllTheThings."
    );
  }
}

export async function getAllCategories(): Promise<PayloadCategory[]> {
  const data = await getPayloadLibraryData();
  return data.categories;
}

export async function getCategorySummaries(): Promise<PayloadCategorySummary[]> {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
    title: category.title,
    tags: category.tags,
    sourceUrl: category.sourceUrl,
    headings: category.headings,
    codeBlockCount: category.codeBlockCount,
    excerpt: category.excerpt,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<PayloadCategory | undefined> {
  const categories = await getAllCategories();
  return categories.find((category) => category.slug === slug);
}
