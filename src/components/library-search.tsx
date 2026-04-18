"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PayloadCategorySummary } from "@/lib/payload-data";

type LibrarySearchProps = {
  categories: PayloadCategorySummary[];
};

export function LibrarySearch({ categories }: LibrarySearchProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const facets = useMemo(() => {
    const counts = new Map<string, number>();

    for (const category of categories) {
      const tags = Array.isArray(category.tags) && category.tags.length ? category.tags : ["General"];

      for (const tag of tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return [
      { tag: "All", count: categories.length },
      ...Array.from(counts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
    ];
  }, [categories]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();

    return categories.filter((category) => {
      const tags = Array.isArray(category.tags) && category.tags.length ? category.tags : ["General"];
      const matchesTag = selectedTag === "All" || tags.includes(selectedTag);
      const searchable = [
        category.title,
        category.excerpt,
        category.headings.map((heading) => heading.title).join(" "),
        tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !value || searchable.includes(value);

      return matchesTag && matchesQuery;
    });
  }, [categories, query, selectedTag]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  return (
    <section className="space-y-4">
      <div className="terminal-card p-4 md:p-5">
        <label htmlFor="search" className="text-sm text-[var(--muted)]">
          Search payload category names, headings, and summaries
        </label>
        <input
          id="search"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Try: ssrf, jwt, xss, directory traversal..."
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {facets.map((facet) => (
            <button
              key={facet.tag}
              type="button"
              onClick={() => {
                setSelectedTag(facet.tag);
                setPage(1);
              }}
              className={selectedTag === facet.tag ? "facet-chip facet-chip-active" : "facet-chip"}
            >
              {facet.tag} <span className="text-xs">({facet.count})</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="filter-action-button"
            disabled={!query}
            onClick={() => {
              setQuery("");
              setPage(1);
            }}
          >
            Clear keyword
          </button>
          <button
            type="button"
            className="filter-action-button"
            disabled={!query && selectedTag === "All"}
            onClick={() => {
              setQuery("");
              setSelectedTag("All");
              setPage(1);
            }}
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {paginated.map((category) => (
          <article key={category.slug} className="terminal-card p-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="font-semibold text-lg">{category.title}</h3>
              <span className="text-xs text-[var(--muted)]">{category.codeBlockCount} blocks</span>
            </div>

            <p className="text-sm text-[var(--muted)] line-clamp-3">{category.excerpt}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Array.isArray(category.tags) && category.tags.length ? category.tags : ["General"]).map((tag) => (
                <span key={tag} className="facet-pill">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <Link href={`/library/${category.slug}`} className="accent-link">
                Open Category
              </Link>
              <a href={category.sourceUrl} target="_blank" rel="noreferrer" className="accent-link">
                Upstream
              </a>
            </div>
          </article>
        ))}
      </div>

      {!filtered.length ? (
        <div className="terminal-card p-6 text-sm text-[var(--muted)]">
          No matching categories. Try broader keywords.
        </div>
      ) : (
        <div className="terminal-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[var(--muted)]">
            Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="pagination-button"
              disabled={safePage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </button>
            <span className="text-sm text-[var(--muted)]">
              Page {safePage} / {pageCount}
            </span>
            <button
              type="button"
              className="pagination-button"
              disabled={safePage >= pageCount}
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
