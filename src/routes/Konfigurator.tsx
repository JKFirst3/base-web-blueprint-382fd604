import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import mobilImage from "@/assets/konfigurator-mobil.png.asset.json";
import wandImage from "@/assets/konfigurator-wand.png.asset.json";
import humanoidImage from "@/assets/konfigurator-humanoid.png.asset.json";

const TITLE = "Lösungen — Lavidro";
const DESCRIPTION =
  "Entdecke die drei Lavidro-Lösungen für automatisierte Wäscheaufbereitung.";

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

type Solution = {
  id: string;
  name: string;
  description: string;
  image: string;
};

const SOLUTIONS: Solution[] = [
  {
    id: "mobil",
    name: "Mobiler Roboter",
    description:
      "Flexible Roboterlösung, die zwischen Waschmaschine und Trockner arbeitet und je nach Ausbaustufe sortiert, faltet und bereitstellt.",
    image: mobilImage.url,
  },
  {
    id: "wand",
    name: "Integrierter Wandschrank",
    description:
      "Ein oder zwei Roboterarme im integrierten Wandschrank übernehmen von der Beladung bis zum Bereitstellen den gesamten Waschprozess.",
    image: wandImage.url,
  },
  {
    id: "humanoid",
    name: "Humanoider Roboter",
    description:
      "Humanoider Roboter, der die Wäsche eigenständig holt, den kompletten Waschprozess übernimmt und die gefaltete Wäsche wieder verteilt.",
    image: humanoidImage.url,
  },
];

function KonfiguratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="overflow-x-clip">
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 md:pt-24 lg:px-8">
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Produkt
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Unsere LAVIDRO-Lösungen
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/75">
              Drei Systeme, die deinen Wäschealltag automatisieren. Wähle die Lösung, die zu
              deinem Zuhause passt.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {SOLUTIONS.map((s) => (
              <article
                key={s.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden bg-background">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-semibold leading-tight">
                    {s.name}
                  </h2>
                  <p className="mt-3 flex-1 text-sm text-foreground/70">{s.description}</p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      className="flex-1 rounded-full border border-foreground/30 bg-background px-4 py-2 font-display text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-foreground/5"
                    >
                      Weitere Infos
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-full bg-foreground px-4 py-2 font-display text-sm font-medium text-background transition-opacity hover:opacity-90"
                    >
                      Kaufen
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
