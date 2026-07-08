import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LeadFormCard } from "@/components/site/LeadForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

type StepId =
  | "einsammeln"
  | "sortieren"
  | "waschen"
  | "falten"
  | "bereitstellen"
  | "einlagern";

const STEPS: { id: StepId; label: string }[] = [
  { id: "einsammeln", label: "Wäsche im Haus einsammeln" },
  { id: "sortieren", label: "Wäsche sortieren" },
  { id: "waschen", label: "Wäsche waschen & trocknen" },
  { id: "falten", label: "Wäsche falten" },
  { id: "bereitstellen", label: "Wäsche bereitstellen" },
  { id: "einlagern", label: "Wäsche in den Schrank bringen" },
];

type TierId = "core" | "plus" | "pro" | "ultimate";

const TIER_STEPS: Record<TierId, StepId[]> = {
  core: ["waschen"],
  plus: ["sortieren", "waschen"],
  pro: ["sortieren", "waschen", "falten", "bereitstellen"],
  ultimate: ["einsammeln", "sortieren", "waschen", "falten", "bereitstellen", "einlagern"],
};

const TIER_LABEL: Record<TierId, string> = {
  core: "Core",
  plus: "Plus",
  pro: "Pro",
  ultimate: "Ultimate",
};

const TIER_TAGLINE: Record<TierId, string> = {
  core: "Grundfunktionen",
  plus: "Zusätzliche Funktionen",
  pro: "Umfangreiche Funktionen",
  ultimate: "Voller Funktionsumfang",
};

type Variant = { size: string; tier: TierId; price: number };

type Solution = {
  id: string;
  name: string;
  description: string;
  image: string;
  variants: Variant[];
};

const SOLUTIONS: Solution[] = [
  {
    id: "mobil",
    name: "Mobiler Roboter",
    description:
      "Flexible Roboterlösung, die zwischen Waschmaschine und Trockner arbeitet und je nach Ausbaustufe sortiert, faltet und bereitstellt.",
    image: mobilImage.url,
    variants: [
      { size: "S", tier: "core", price: 6000 },
      { size: "M", tier: "plus", price: 9000 },
      { size: "L", tier: "pro", price: 12000 },
    ],
  },
  {
    id: "wand",
    name: "Integrierter Wandschrank",
    description:
      "Ein oder zwei Roboterarme im integrierten Wandschrank übernehmen von der Beladung bis zum Bereitstellen den gesamten Waschprozess.",
    image: wandImage.url,
    variants: [
      { size: "S", tier: "core", price: 7500 },
      { size: "M", tier: "plus", price: 10500 },
      { size: "L", tier: "pro", price: 13500 },
    ],
  },
  {
    id: "humanoid",
    name: "Humanoider Roboter",
    description:
      "Humanoider Roboter, der die Wäsche eigenständig holt, den kompletten Waschprozess übernimmt und die gefaltete Wäsche wieder verteilt.",
    image: humanoidImage.url,
    variants: [
      { size: "L", tier: "pro", price: 22500 },
      { size: "XL", tier: "ultimate", price: 30000 },
    ],
  },
];

const formatPrice = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

function KonfiguratorPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);

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
              Entdecke unsere Lösungen für automatisierte Wäschepflege. Finde das System, das
              perfekt zu deinem Zuhause passt.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3 items-start">
            {SOLUTIONS.filter((s) => expandedId === null || expandedId === s.id).map((s) =>
              expandedId === s.id ? (
                <ExpandedCard
                  key={s.id}
                  solution={s}
                  onClose={() => setExpandedId(null)}
                  onBuy={() => setBuyOpen(true)}
                />
              ) : (
                <CompactCard
                  key={s.id}
                  solution={s}
                  onOpen={() => setExpandedId(s.id)}
                  onBuy={() => setBuyOpen(true)}
                />
              ),
            )}
          </div>
        </section>
      </main>
      <Footer />

      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none">
          <LeadFormCard
            intro={
              <div className="mb-6 rounded-2xl border border-accent/40 bg-accent/20 p-4 text-center text-sm text-foreground/80">
                <p className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  In Entwicklung
                </p>
                <p className="mt-2">
                  Unsere Lösungen befinden sich aktuell noch in der Entwicklung und sind noch
                  nicht käuflich erhältlich. Trag dich unten ein, um als Erste:r Bescheid zu
                  wissen, sobald es losgeht.
                </p>
              </div>
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


function CompactCard({ solution, onOpen, onBuy }: { solution: Solution; onOpen: () => void; onBuy: () => void }) {
  const cheapest = solution.variants.reduce((a, b) => (a.price < b.price ? a : b));
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="aspect-[4/3] overflow-hidden bg-background">
        <img
          src={solution.image}
          alt={solution.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-display text-xl font-semibold leading-tight">{solution.name}</h2>
        <p className="mt-3 flex-1 text-sm text-foreground/70">{solution.description}</p>
        <p className="mt-3 text-sm text-foreground/60">ab {formatPrice(cheapest.price)}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 rounded-full bg-accent px-4 py-2 font-display text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Weitere Infos
          </button>
          <button
            type="button"
            onClick={onBuy}
            className="flex-1 rounded-full bg-foreground px-4 py-2 font-display text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Kaufen
          </button>
        </div>
      </div>
    </article>
  );
}

function ExpandedCard({ solution, onClose, onBuy }: { solution: Solution; onClose: () => void; onBuy: () => void }) {
  const [index, setIndex] = useState(0);
  const variant = solution.variants[index];
  const activeSteps = new Set(TIER_STEPS[variant.tier]);

  return (
    <article className="relative md:col-span-3 overflow-hidden rounded-2xl border border-border shadow-lg">
      <div className="absolute inset-0">
        <img
          src={solution.image}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-4 top-4 rounded-full border border-foreground/20 bg-background/80 p-2 text-foreground/70 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight">{solution.name}</h2>
          <p className="mt-3 text-sm text-foreground/75">{solution.description}</p>

          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {TIER_LABEL[variant.tier]}
                </p>
                <p className="mt-1 text-sm text-foreground/70">{TIER_TAGLINE[variant.tier]}</p>
              </div>
              <p className="font-display text-2xl font-semibold">{formatPrice(variant.price)}</p>
            </div>

            <input
              type="range"
              min={0}
              max={solution.variants.length - 1}
              step={1}
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              className="mt-6 w-full accent-foreground"
              aria-label="Ausbaustufe wählen"
            />
            <div className="mt-2 flex justify-between text-xs text-foreground/60">
              {solution.variants.map((v, i) => (
                <button
                  key={v.size}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`font-display uppercase tracking-wider ${
                    i === index ? "text-foreground" : ""
                  }`}
                >
                  {TIER_LABEL[v.tier]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-foreground/30 bg-background/70 px-4 py-2 font-display text-sm font-medium text-foreground hover:bg-foreground/5"
            >
              Zurück
            </button>
            <button
              type="button"
              className="flex-1 rounded-full bg-foreground px-4 py-2 font-display text-sm font-medium text-background hover:opacity-90"
            >
              Kaufen · {formatPrice(variant.price)}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-6">
          <h3 className="font-display text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Funktionsumfang
          </h3>
          <ul className="mt-4 space-y-3">
            {STEPS.map((step) => {
              const included = activeSteps.has(step.id);
              return (
                <li key={step.id} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 flex-none items-center justify-center rounded-full ${
                      included ? "bg-foreground text-background" : "bg-foreground/10 text-foreground/40"
                    }`}
                  >
                    {included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                  <span className={included ? "text-foreground" : "text-foreground/50"}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-foreground/60">
            Schiebe den Regler nach rechts, um weitere Prozessschritte freizuschalten.
          </p>
        </div>
      </div>
    </article>
  );
}
