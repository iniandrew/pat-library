export const metadata = {
  title: "Disclaimer | Payload Library",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <section className="terminal-card p-6 md:p-8 space-y-4">
        <p className="terminal-line">$ cat DISCLAIMER.md</p>
        <h1 className="text-3xl font-bold">Usage Disclaimer</h1>
        <p className="text-[var(--muted)]">
          Payload Library mirrors offensive security payload references for education, defense, and authorized
          testing only.
        </p>

        <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
          <li>Use this content only in environments where you have explicit permission.</li>
          <li>Do not use these payloads against systems you do not own or control.</li>
          <li>Always follow local laws, contracts, and responsible disclosure practices.</li>
          <li>Upstream content is maintained by swisskyrepo and contributors.</li>
        </ul>
      </section>
    </div>
  );
}
