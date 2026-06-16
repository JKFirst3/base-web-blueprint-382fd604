import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutz — Lavidro" },
      { name: "description", content: "Datenschutzerklärung von Lavidro." },
      { property: "og:title", content: "Datenschutz — Lavidro" },
      { property: "og:description", content: "Datenschutzerklärung von Lavidro." },
      { property: "og:url", content: "https://lavidro.com/datenschutz" },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/datenschutz" }],
  }),
  component: DatenschutzPage,
});

function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Datenschutz</h1>
        <p className="mt-6 text-foreground/75">
          Wir respektieren deine Privatsphäre. Deine im Warteliste-Formular angegebenen Daten
          (Name, E-Mail-Adresse, optionale Angaben) werden ausschließlich zur Kontaktaufnahme
          und zum Versand von Produkt-Updates verwendet. Eine ausführliche Datenschutzerklärung
          folgt in Kürze.
        </p>
        <Link to="/" className="mt-10 inline-block text-sm underline underline-offset-4">← Zurück zur Startseite</Link>
      </main>
      <Footer />
    </div>
  );
}
