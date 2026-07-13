import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
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
  description: string[];
  image: string;
  variants: Variant[];
};

const SOLUTIONS: Solution[] = [
  {
    id: "mobil",
    name: "Mobiler Wäscheassistent",
    description: [
      "Flexibel im Hauswirtschaftsraum einsetzbar, keine Umbauten nötig",
      "Übernimmt den Ablauf zwischen Waschmaschine und Trockner",
      "Sortiert, faltet und stellt Wäsche je nach Ausbaustufe bereit",
    ],
    image: mobilImage.url,
    variants: [
      { size: "S", tier: "core", price: 6000 },
      { size: "M", tier: "plus", price: 9000 },
      { size: "L", tier: "pro", price: 12000 },
    ],
  },
  {
    id: "wand",
    name: "Integrierter Wäscheschrank",
    description: [
      "Vollautomatischer Waschschrank mit intelligenter Robotik",
      "Diskret im Wandschrank verbaut, elegantes Möbeldesign",
      "Übernimmt Prozess vom Sortieren bis zur gefalteten Kleidung",
    ],
    image: wandImage.url,
    variants: [
      { size: "S", tier: "core", price: 7500 },
      { size: "M", tier: "plus", price: 10500 },
      { size: "L", tier: "pro", price: 13500 },
    ],
  },
  {
    id: "humanoid",
    name: "Humanoider Wäschroboter",
    description: [
      "Autonomer Roboter übernimmt die gesamte Wäscheorganisation",
      "Erkennt anfallende Wäsche eigenständig",
      "Führt den Wäscheprozess aus und räumt die Kleidung zurück",
    ],
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
  const [buyItem, setBuyItem] = useState<{ solution: Solution; variant: Variant } | null>(null);
  const [compareTier, setCompareTier] = useState<TierId | null>(null);

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
          <div className="grid gap-6 md:grid-cols-3 items-stretch">
            {SOLUTIONS.filter((s) => expandedId === null || expandedId === s.id).map((s) =>
              expandedId === s.id ? (
                <ExpandedCard
                  key={s.id}
                  solution={s}
                  onClose={() => {
                    setExpandedId(null);
                    setCompareTier(null);
                  }}
                  onBuy={(variant) => setBuyItem({ solution: s, variant })}
                  onCompare={(tier) => setCompareTier(tier)}
                />
              ) : (
                <CompactCard
                  key={s.id}
                  solution={s}
                  onOpen={() => setExpandedId(s.id)}
                  onBuy={() => setBuyItem({ solution: s, variant: s.variants[0] })}
                />
              ),
            )}
          </div>

        </section>
      </main>
      <Footer />

      <Dialog
        open={!!(expandedId && compareTier)}
        onOpenChange={(open) => { if (!open) setCompareTier(null); }}
      >
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          {expandedId && compareTier && (
            <ComparePanel
              tier={compareTier}
              currentId={expandedId}
              onSelect={(id: string) => {
                setExpandedId(id);
                setCompareTier(null);
              }}
              onClose={() => setCompareTier(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!buyItem} onOpenChange={(open) => { if (!open) setBuyItem(null); }}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          {buyItem && (
            <PreorderCard
              solution={buyItem.solution}
              variant={buyItem.variant}
              onClose={() => setBuyItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


function CompactCard({ solution, onOpen, onBuy }: { solution: Solution; onOpen: () => void; onBuy: () => void }) {

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="aspect-[4/3] overflow-hidden bg-background">
        <img
          src={solution.image}
          alt={solution.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-display text-lg font-semibold leading-tight whitespace-nowrap">{solution.name}</h2>
        <ul className="mt-3 flex-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-foreground/70">
          {solution.description.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        
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

function ExpandedCard({ solution, onClose, onBuy, onCompare }: { solution: Solution; onClose: () => void; onBuy: (variant: Variant) => void; onCompare: (tier: TierId) => void }) {
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

      <div className="relative p-5 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-3 top-3 rounded-full border border-foreground/20 bg-background/80 p-1.5 text-foreground/70 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="pr-10 font-display text-2xl font-semibold leading-tight">{solution.name}</h2>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-foreground/75">{solution.description}</p>

        <div className="mx-auto mt-3 flex aspect-[38/16] h-56 items-center justify-center rounded-lg border border-dashed border-foreground/25 bg-background/50 text-[10px] uppercase tracking-[0.25em] text-foreground/40">
          Bild folgt
        </div>


        <div className="mt-4">
          <h3 className="font-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Funktionsumfang
          </h3>
          <ul className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {STEPS.map((step) => {
              const included = activeSteps.has(step.id);
              return (
                <li
                  key={step.id}
                  className={`flex flex-col items-center gap-1 rounded-md border p-1.5 text-center ${
                    included
                      ? "border-foreground/20 bg-background text-foreground"
                      : "border-dashed border-foreground/15 bg-transparent text-foreground/40"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-full ${
                      included ? "bg-foreground text-background" : "bg-foreground/10 text-foreground/40"
                    }`}
                  >
                    {included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </span>
                  <span className="text-[10px] leading-tight">{step.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {TIER_LABEL[variant.tier]}
              </p>
              <p className="mt-0.5 text-xs text-foreground/70">{TIER_TAGLINE[variant.tier]}</p>
            </div>
            <p className="font-display text-xl font-semibold">{formatPrice(variant.price)}</p>
          </div>

          <input
            type="range"
            min={0}
            max={solution.variants.length - 1}
            step={1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="mt-2 w-full accent-foreground"
            aria-label="Ausbaustufe wählen"
          />
          <div className="mt-1 flex justify-between text-[10px] text-foreground/60">
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

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-foreground/30 bg-background/70 px-4 py-2 font-display text-xs font-medium text-foreground hover:bg-foreground/5"
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={() => onCompare(variant.tier)}
            className="flex-1 rounded-full bg-accent px-4 py-2 font-display text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Vergleichen
          </button>
          <button
            type="button"
            onClick={() => onBuy(variant)}
            className="flex-1 rounded-full bg-foreground px-4 py-2 font-display text-xs font-medium text-background hover:opacity-90"
          >
            Kaufen · {formatPrice(variant.price)}
          </button>
        </div>
      </div>


    </article>
  );
}

function ComparePanel({
  tier,
  currentId,
  onSelect,
  onClose,
}: {
  tier: TierId;
  currentId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const matches = SOLUTIONS.map((s) => {
    const variant = s.variants.find((v) => v.tier === tier);
    return variant ? { solution: s, variant } : null;
  }).filter((x): x is { solution: Solution; variant: Variant } => x !== null);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Vergleich · {TIER_LABEL[tier]}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            Lösungen mit gleichem Funktionsumfang
          </h3>
          <p className="mt-1 text-sm text-foreground/70">{TIER_TAGLINE[tier]}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-foreground/30 bg-background px-4 py-2 font-display text-sm font-medium text-foreground hover:bg-foreground/5"
        >
          Zurück
        </button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {matches.map(({ solution, variant }) => {
          const isCurrent = solution.id === currentId;
          return (
            <article
              key={solution.id}
              className={`flex flex-col overflow-hidden rounded-xl border ${
                isCurrent ? "border-foreground" : "border-border"
              } bg-background`}
            >
              <div className="aspect-[4/3] overflow-hidden bg-background">
                <img
                  src={solution.image}
                  alt={solution.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h4 className="font-display text-base font-semibold leading-tight">
                  {solution.name}
                </h4>
                <p className="mt-2 flex-1 text-sm text-foreground/70">{solution.description}</p>
                <p className="mt-3 font-display text-lg font-semibold">
                  {formatPrice(variant.price)}
                </p>
                <button
                  type="button"
                  onClick={() => onSelect(solution.id)}
                  disabled={isCurrent}
                  className="mt-4 rounded-full bg-foreground px-4 py-2 font-display text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isCurrent ? "Aktuell ausgewählt" : "Auswählen"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PreorderCard({
  solution,
  variant,
  onClose,
}: {
  solution: Solution;
  variant: Variant;
  onClose: () => void;
}) {
  const monthly = Math.round(variant.price / 36);
  const [payment, setPayment] = useState<"upfront" | "monthly">("monthly");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("preorders").insert({
      name: name.trim(),
      email: email.trim(),
      solution_id: solution.id,
      solution_name: solution.name,
      tier: variant.tier,
      size: variant.size,
      payment_type: payment,
      price_eur: variant.price,
      monthly_eur: payment === "monthly" ? monthly : null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Vorbestellung fehlgeschlagen. Bitte versuche es erneut.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-lg md:grid-cols-2">
      <div className="relative hidden min-h-[420px] bg-accent/40 md:block">
        <img
          src={solution.image}
          alt={solution.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-3 top-3 rounded-full border border-foreground/20 bg-background/80 p-1.5 text-foreground/70 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="flex h-full min-h-[360px] flex-col justify-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              In Entwicklung
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">
              Vielen Dank für dein Interesse.
            </h3>
            <p className="mt-4 text-sm text-foreground/75">
              Unsere Lösungen sind noch in der Entwicklung. Du erhältst exklusive
              Einblicke in unsere Prototypen, bevor sie verfügbar sind.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 self-start rounded-full bg-foreground px-5 py-2 font-display text-sm text-background hover:opacity-90"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Vorbestellen
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                {solution.name}
              </h3>
              <p className="mt-1 text-xs text-foreground/70">
                {TIER_LABEL[variant.tier]} · {TIER_TAGLINE[variant.tier]}
              </p>
            </div>

            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Zahlungsart
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayment("monthly")}
                  className={`rounded-xl border p-3 text-left transition ${
                    payment === "monthly"
                      ? "border-foreground bg-background"
                      : "border-border bg-background/50 hover:border-foreground/40"
                  }`}
                >
                  <p className="font-display text-lg font-semibold">
                    {formatPrice(monthly)}
                    <span className="ml-1 text-xs font-normal text-foreground/60">/Monat</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground/60">36 Monate</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPayment("upfront")}
                  className={`rounded-xl border p-3 text-left transition ${
                    payment === "upfront"
                      ? "border-foreground bg-background"
                      : "border-border bg-background/50 hover:border-foreground/40"
                  }`}
                >
                  <p className="font-display text-lg font-semibold">
                    {formatPrice(variant.price)}
                    <span className="ml-1 text-xs font-normal text-foreground/60">einmalig</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground/60">Sofort bezahlen</p>
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Name
                </span>
                <input
                  required
                  type="text"
                  value={name}
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  E-Mail
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-full bg-foreground px-5 py-3 font-display text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Wird gesendet…" : "Vorbestellen"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
