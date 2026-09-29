import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — Lavidro" },
      { name: "description", content: "Impressum von Lavidro: Anbieterkennzeichnung, Anschrift, Kontaktdaten und Verantwortliche für die Inhalte dieser Website." },
      { property: "og:title", content: "Impressum — Lavidro" },
      { property: "og:description", content: "Impressum von Lavidro: Anbieterkennzeichnung, Anschrift, Kontaktdaten und Verantwortliche für die Inhalte dieser Website." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lavidro.com/impressum" },
      { name: "twitter:card", content: "summary" },
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
            Factory33 Ecosystem GmbH
            <br />
            Ausblick 1<br />
            33100 Paderborn
          </address>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Vertretung und Registereintrag</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Geschäftsführer: Dr. Slawa Tomin und Jannik Woste
            <br />
            Sitz der Gesellschaft: Paderborn
            <br />
            Registergericht: Amtsgericht Paderborn
            <br />
            Handelsregister: HRB 17652
            <br />
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE455405858
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Kontakt</h2>
          <p className="mt-4 text-foreground/80">
            E-Mail:{" "}
            <a href="mailto:info@factory33.de" className="underline underline-offset-4">
              info@factory33.de
            </a>
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Verantwortlich für den Inhalt</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Factory33 Ecosystem GmbH, vertreten durch die Geschäftsführer Dr. Slawa Tomin und
            Jannik Woste, Anschrift wie oben.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Haftung für Inhalte und Links</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
            Gesetzen verantwortlich. Soweit diese Website Links zu externen Angeboten enthält,
            haben wir auf deren Inhalte keinen Einfluss. Für die Inhalte verlinkter Seiten ist stets
            der jeweilige Anbieter verantwortlich. Bei Bekanntwerden von Rechtsverletzungen werden
            wir entsprechende Links entfernen.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Urheberrecht</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            Die von uns erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen
            Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Jede Verwertung außerhalb
            der Grenzen des Urheberrechts bedarf der vorherigen Zustimmung der jeweiligen
            Rechteinhaber.
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
