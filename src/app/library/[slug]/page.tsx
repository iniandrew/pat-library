import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ScrollTopButton } from "@/components/scroll-top-button";
import { getAllCategories, getCategoryBySlug } from "@/lib/payload-data";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return {
    title: `${category.title} | Payload Library`,
    description: category.excerpt,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="terminal-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="terminal-line">$ cat {category.path}</p>
          <Link href="/library" className="accent-link text-sm">
            Back to Library
          </Link>
        </div>

        <h1 className="mt-3 text-3xl font-bold">{category.title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <span>{category.codeBlockCount} code blocks</span>
          <a href={category.sourceUrl} target="_blank" rel="noreferrer" className="accent-link">
            View Upstream Markdown
          </a>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Array.isArray(category.tags) && category.tags.length ? category.tags : ["General"]).map((tag) => (
            <span key={tag} className="facet-pill">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {category.headings.length ? (
        <section className="terminal-card p-6">
          <h2 className="text-lg font-semibold mb-3">Table of Contents</h2>
          <div className="flex flex-wrap gap-2">
            {category.headings
              .filter((heading) => heading.level <= 3)
              .slice(0, 24)
              .map((heading) => (
                <a key={`${heading.slug}-${heading.title}`} href={`#${heading.slug}`} className="toc-chip">
                  {heading.title}
                </a>
              ))}
          </div>
        </section>
      ) : null}

      <section className="terminal-card p-6 md:p-8 overflow-x-auto">
        <MarkdownRenderer markdown={category.markdown} />
      </section>
      <ScrollTopButton />
    </div>
  );
}
