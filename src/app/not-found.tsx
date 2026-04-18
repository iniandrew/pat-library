import Link from "next/link";

export default function NotFound() {
  return (
    <div className="terminal-card p-8 max-w-xl">
      <p className="terminal-line">$ error --code 404</p>
      <h1 className="mt-3 text-2xl font-bold">Category not found</h1>
      <p className="mt-2 text-[var(--muted)]">The requested payload category does not exist in this snapshot.</p>
      <Link href="/library" className="accent-link mt-4 inline-flex">
        Return to Library
      </Link>
    </div>
  );
}
