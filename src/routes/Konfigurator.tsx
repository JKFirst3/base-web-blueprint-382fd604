import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const TITLE = "Konfigurator — Lavidro";
const DESCRIPTION =
  "Stelle dir dein individuelles Lavidro-Paket zusammen. Der Konfigurator ist bald verfügbar.";

export const Route = createFileRoute("/Konfigurator")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://lavidro.com/Konfigurator" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/Konfigurator" }],
  }),
  component: KonfiguratorPage,
});

function KonfiguratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 md:py-32 lg:px-8">
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Konfigurator
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Dein Lavidro nach Mass
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/75">
              Bald kannst du hier dein persönliches Lavidro-Paket zusammenstellen — passend zu
              deinem Haushalt, deinem Stil und deinem Alltag. Wir arbeiten mit Hochdruck daran.
            </p>
          </div>

          <div className="mt-16 rounded-3xl border border-border bg-card p-10 text-center shadow-sm sm:p-14">
            <h2 className="font-display text-2xl font-semibold">Coming soon</h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground/70">
              Trag dich auf unserer Warteliste ein, um als Erste:r Zugang zum Konfigurator zu
              erhalten.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
