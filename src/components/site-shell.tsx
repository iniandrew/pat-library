import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container flex items-center justify-between gap-6 py-4">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            &gt;_
          </span>
          <span>Payload Library</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm md:text-base">
          <Link href="/library" className="nav-link">
            Library
          </Link>
          <Link href="/disclaimer" className="nav-link">
            Disclaimer
          </Link>
          <a
            href="https://github.com/swisskyrepo/PayloadsAllTheThings"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            Source Repo
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] mt-16">
      <div className="container py-8 text-sm text-[var(--muted)] flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p>Built with ♥ by Andrew.</p>
        <p>Use responsibly in legal, authorized security testing contexts.</p>
      </div>
    </footer>
  );
}
