import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payload Library",
  description:
    "Programmer-style searchable mirror of swisskyrepo/PayloadsAllTheThings categories and payload references.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <div className="page-bg" aria-hidden="true" />
        <div className="relative min-h-screen flex flex-col">
          <SiteHeader />
          <main className="container flex-1 py-8 md:py-12">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
