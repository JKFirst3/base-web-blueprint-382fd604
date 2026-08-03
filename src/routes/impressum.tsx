import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — Lavidro" },
      { name: "description", content: "Impressum von LAVIDRO: Anbieterkennzeichnung, Anschrift, Kontaktdaten und Verantwortliche für die Inhalte dieser Website." },
      { property: "og:title", content: "Impressum — Lavidro" },
      { property: "og:description", content: "Impressum von LAVIDRO: Anbieterkennzeichnung, Anschrift, Kontaktdaten und Verantwortliche für die Inhalte dieser Website." },
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
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">Impressum</h1>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Angaben gemäß&nbsp;§ 5 des DDG</h2>
          <address className="mt-4 not-italic text-foreground/80 leading-relaxed">
            Robin Zach
            <br />
            Jonah Blümel
            <br />
            Jan-Kevin Ploch
            <br />
            Ausblick 1<br />
            33100 Paderborn
          </address>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Kontakt</h2>
          <p className="mt-4 text-foreground/80">
            E-Mail:{" "}
            <a href="mailto:lavidro@gmx.net" className="underline underline-offset-4">
              lavidro@gmx.net
            </a>
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">
            Verbraucherstreitbeilegung / Universalschlichtungsstelle
          </h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <Link to="/" className="mt-12 inline-block text-sm underline underline-offset-4">
          ← Zurück zur Startseite
        </Link>
      </main>
      <Footer />
    </div>
  );
}
