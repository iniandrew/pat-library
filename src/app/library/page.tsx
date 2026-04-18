import { LibrarySearch } from "@/components/library-search";
import { getCategorySummaries, getPayloadLibraryData } from "@/lib/payload-data";

export default async function LibraryPage() {
  const [categories, library] = await Promise.all([getCategorySummaries(), getPayloadLibraryData()]);

  return (
    <div className="space-y-6">
      <section className="terminal-card p-6">
        <p className="terminal-line">$ ls categories/</p>
        <h1 className="mt-3 text-3xl font-bold">Payload Categories</h1>
        <p className="mt-2 text-[var(--muted)]">
          Snapshot source: {library.source.owner}/{library.source.repo} ({library.source.branch})
        </p>
      </section>

      <LibrarySearch categories={categories} />
    </div>
  );
}
