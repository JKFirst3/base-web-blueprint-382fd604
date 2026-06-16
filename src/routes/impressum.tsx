import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — Lavidro" },
      { name: "description", content: "Impressum und Anbieterkennzeichnung von Lavidro." },
      { property: "og:title", content: "Impressum — Lavidro" },
      { property: "og:description", content: "Impressum und Anbieterkennzeichnung von Lavidro." },
      { property: "og:url", content: "https://lavidro.com/impressum" },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/impressum" }],
  }),
  component: ImpressumPage,
});

function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Impressum</h1>
        <p className="mt-6 text-foreground/75">
          Angaben gemäß § 5 TMG folgen in Kürze. Für Anfragen wende dich bitte an{" "}
          <a href="mailto:hello@lavidro.com" className="underline underline-offset-4">hello@lavidro.com</a>.
        </p>
        <Link to="/" className="mt-10 inline-block text-sm underline underline-offset-4">← Zurück zur Startseite</Link>
      </main>
      <Footer />
    </div>
  );
}
