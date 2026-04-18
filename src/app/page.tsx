import Link from "next/link";
import { getPayloadLibraryData } from "@/lib/payload-data";

export default async function Home() {
  const data = await getPayloadLibraryData();
  const featured = [...data.categories]
    .sort((a, b) => b.codeBlockCount - a.codeBlockCount)
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <section className="hero-panel">
        <p className="terminal-line">$ payload-library --source swisskyrepo/PayloadsAllTheThings</p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mt-4">Payload Library</h1>
        <p className="mt-4 max-w-3xl text-[var(--muted)] text-base md:text-lg">
          Explore payload references and bypass techniques in a searchable interface built from upstream
          PayloadsAllTheThings content.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/library" className="button-primary">
            Open Library
          </Link>
          <a
            href={data.source.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="button-secondary"
          >
            View Source Repository
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="terminal-card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Categories</p>
          <p className="mt-2 text-3xl font-semibold">{data.stats.categoryCount}</p>
        </article>
        <article className="terminal-card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Code Blocks</p>
          <p className="mt-2 text-3xl font-semibold">{data.stats.totalCodeBlocks}</p>
        </article>
        <article className="terminal-card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Last Snapshot</p>
          <p className="mt-2 text-lg font-semibold">{new Date(data.generatedAt).toLocaleString()}</p>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">High-Signal Categories</h2>
          <Link href="/library" className="accent-link text-sm">
            Browse all
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((category) => (
            <article key={category.slug} className="terminal-card p-5">
              <h3 className="text-lg font-semibold">{category.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)] line-clamp-3">{category.excerpt}</p>
              <p className="mt-4 text-xs text-[var(--muted)]">{category.codeBlockCount} code blocks</p>
              <Link href={`/library/${category.slug}`} className="accent-link mt-4 inline-flex text-sm">
                Open category
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
