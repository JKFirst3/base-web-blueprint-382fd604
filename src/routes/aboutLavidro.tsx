import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const TITLE = "Über Lavidro — Team & Projekt";
const DESCRIPTION =
  "Lerne das Team hinter Lavidro kennen und erfahre, wofür wir stehen: intelligente Textilpflege für den modernen Alltag.";

export const Route = createFileRoute("/aboutLavidro")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://lavidro.com/aboutLavidro" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/aboutLavidro" }],
  }),
  component: AboutLavidroPage,
});

function AboutLavidroPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Über uns
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Über Lavidro
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/75">
              Lavidro befreit dich vom Waschen, Sortieren und Zusammenlegen — damit du deine Zeit
              wieder für das nutzen kannst, was dir wirklich wichtig ist.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Unser Projekt</h2>
            <div className="mt-6 space-y-4 text-foreground/80">
              <p>
                Lavidro ist ein junges Projekt mit einer klaren Mission: den Aufwand rund um
                Textilpflege radikal zu reduzieren. Wir verbinden clevere Logistik mit einer
                digitalen Erfahrung, die sich nahtlos in deinen Alltag einfügt.
              </p>
              <p>
                Vom Abholen über professionelle Reinigung bis zur sortierten Rückgabe — wir denken
                jeden Schritt vom Ergebnis her: mehr Zeit, weniger Chaos, dieselbe Qualität wie
                zu Hause, nur ohne die Arbeit.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
            Unser Team
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-foreground/70">
            Ein kleines, engagiertes Team mit Erfahrung in Produktentwicklung, Logistik und
            digitalen Diensten.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Jonah Blümel", role: "Founder" },
              { name: "Jan-Kevin Ploch", role: "Founder" },
              { name: "Robin Zach", role: "Founder" },
            ].map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <div className="mx-auto h-24 w-24 rounded-full bg-secondary" aria-hidden />
                <h3 className="mt-5 font-display text-lg font-semibold">{m.name}</h3>
                <p className="mt-1 text-sm text-foreground/70">{m.role}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Details zu unserem Team folgen in Kürze.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
