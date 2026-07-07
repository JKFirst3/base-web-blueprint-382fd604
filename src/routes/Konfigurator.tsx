import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cn } from "@/lib/utils";
import mobilImage from "@/assets/konfigurator-mobil.png.asset.json";
import wandImage from "@/assets/konfigurator-wand.png.asset.json";
import humanoidImage from "@/assets/konfigurator-humanoid.png.asset.json";

const TITLE = "Konfigurator — Lavidro";
const DESCRIPTION =
  "Stelle dir dein individuelles Lavidro-System zusammen: Prozessschritte automatisieren, Lösung erhalten.";

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

const PROCESS_STEPS = [
  { id: "einsammeln", label: "Wäsche im Haus einsammeln" },
  { id: "sortieren", label: "Wäsche sortieren" },
  { id: "waschen", label: "Wäsche waschen / trocknen" },
  { id: "falten", label: "Wäsche falten" },
  { id: "bereitstellen", label: "Wäsche bereitstellen" },
  { id: "einlagern", label: "Wäsche in den Schrank bringen" },
] as const;

type StepId = (typeof PROCESS_STEPS)[number]["id"];

type Product = {
  id: string;
  name: string;
  description: string;
  priceBuy: number;
  steps: Record<StepId, boolean>;
};

const PRODUCTS: Product[] = [
  {
    id: "mobil-s",
    name: "Mobiler Roboter — Größe S",
    description:
      "Roboterarm auf einer Schiene zwischen Waschmaschine und Trockner, der be-, um- und entladen kann.",
    priceBuy: 6000,
    steps: { einsammeln: false, sortieren: false, waschen: true, falten: false, bereitstellen: false, einlagern: false },
  },
  {
    id: "mobil-m",
    name: "Mobiler Roboter — Größe M",
    description:
      "Einarmiger Roboter auf einer mobilen Plattform, der zusätzlich sortieren kann.",
    priceBuy: 9000,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: false, einlagern: false },
  },
  {
    id: "mobil-l",
    name: "Mobiler Roboter — Größe L",
    description:
      "Zweiarmiger Roboter auf mobiler Plattform, der zusätzlich sortiert, faltet und die gefaltete Wäsche bereitstellt.",
    priceBuy: 12000,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: true, einlagern: false },
  },
  {
    id: "wand-s",
    name: "Integrierter Wandschrank — Größe S",
    description:
      "Roboterarm im integrierten Wandschrank auf einer Schiene zwischen Waschmaschine und Trockner. Sortieren und Falten übernimmst du selbst.",
    priceBuy: 7500,
    steps: { einsammeln: false, sortieren: false, waschen: true, falten: false, bereitstellen: false, einlagern: false },
  },
  {
    id: "wand-m",
    name: "Integrierter Wandschrank — Größe M",
    description:
      "Roboterarm im Wandschrank, der zusätzlich sortiert. Wäsche wird selbst in den HWR gebracht und abgeholt.",
    priceBuy: 10500,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: false, einlagern: false },
  },
  {
    id: "wand-l",
    name: "Integrierter Wandschrank — Größe L",
    description:
      "Zwei Roboterarme im Wandschrank vom Sortieren bis zum Bereitstellen. Wäsche wird selbst in den HWR gebracht und abgeholt.",
    priceBuy: 13500,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: true, einlagern: false },
  },
  {
    id: "humanoid-l",
    name: "Humanoider Roboter — Größe L",
    description:
      "Humanoider Roboter, der im definierten Bereich vom Sortieren bis zum Falten alles übernimmt. Wäsche wird selbst in den HWR gebracht und abgeholt.",
    priceBuy: 22500,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: true, einlagern: false },
  },
  {
    id: "humanoid-xl",
    name: "Humanoider Roboter — Größe XL",
    description:
      "Humanoider Roboter, der die schmutzige Wäsche eigenständig holt, den Waschprozess im HWR durchführt und die gefaltete Wäsche wieder verteilt.",
    priceBuy: 30000,
    steps: { einsammeln: true, sortieren: true, waschen: true, falten: true, bereitstellen: true, einlagern: true },
  },
];

function formatEuro(v: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
}

function productImage(id: string): string {
  if (id.startsWith("humanoid")) return humanoidImage.url;
  if (id.startsWith("wand")) return wandImage.url;
  return mobilImage.url;
}

function KonfiguratorPage() {
  const [steps, setStepsState] = useState<StepId[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const step2Ref = useRef<HTMLElement>(null);

  const step2Unlocked = steps.length > 0;

  useEffect(() => {
    if (steps.length === 1) {
      const t = setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [steps.length]);

  const toggleStep = (id: StepId) => {
    setSelectedId(null);
    setStepsState((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="overflow-x-clip">
        <section className="mx-auto max-w-5xl px-4 pb-10 pt-16 sm:px-6 md:pt-24 lg:px-8">
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Produkt
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Deine passende LAVIDRO-Lösung
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/75">
              Entdecke das automatisierte Wäschesystem, das deinen Alltag einfacher macht. Wähle
              die Funktionen, die du automatisieren möchtest — anschließend erhältst du die passende
              Lösung.
            </p>
          </div>
        </section>

        {/* Step 1: Prozessschritte */}
        <ConfigStep
          index={1}
          title="Welche Prozessschritte möchtest du automatisieren?"
          subtitle="Welche Prozessschritte der Wäscheaufbereitung sind für dich die größte Belastung? Mehrfachauswahl möglich."
          active
        >
          <ol className="flex w-full flex-col items-stretch gap-1.5 md:flex-row md:gap-2">
            {PROCESS_STEPS.map((s, i) => {
              const selected = steps.includes(s.id);
              return (
                <li
                  key={s.id}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1 md:flex-row md:gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => toggleStep(s.id)}
                    aria-pressed={selected}
                    className={cn(
                      "group relative flex w-full min-w-0 flex-row items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:border-foreground/40 hover:shadow-sm",
                      "md:h-32 md:flex-col md:items-start md:justify-between md:gap-0 md:p-3 lg:p-4",
                      selected
                        ? "border-foreground ring-2 ring-foreground/80"
                        : "border-border",
                    )}
                  >
                    <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:order-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="flex-1 hyphens-auto break-words font-display text-sm font-semibold leading-tight md:text-[11px] lg:text-[13px]"
                      lang="de"
                    >
                      {s.label}
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        "md:absolute md:right-2 md:top-2 lg:right-3 lg:top-3",
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background",
                      )}
                      aria-hidden
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 rotate-90 text-foreground/25 md:h-5 md:w-5 md:rotate-0",
                      i === PROCESS_STEPS.length - 1 && "invisible md:invisible",
                    )}
                    aria-hidden
                  />
                </li>
              );
            })}
          </ol>
        </ConfigStep>

        {/* Step 2: Lösung */}
        <ConfigStep
          ref={step2Ref}
          index={2}
          title="Deine Lösung"
          subtitle="Basierend auf deiner Auswahl."
          active={step2Unlocked}
          last
        >
          <SolutionResult
            steps={steps}
            selectedId={selectedId}
            onSelectProduct={(product) => {
              setSelectedId(product.id);
              setStepsState(PROCESS_STEPS.map((s) => s.id).filter((id) => product.steps[id]));
            }}
          />
        </ConfigStep>

        <div className="h-24" />
      </main>
      <Footer />
    </div>
  );
}

function StepChecklist({ product }: { product: Product }) {
  return (
    <ul className="mt-4 space-y-1.5">
      {PROCESS_STEPS.map((s) => {
        const included = product.steps[s.id];
        return (
          <li key={s.id} className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                included
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground/50",
              )}
              aria-hidden
            >
              {included ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
            </span>
            <span className={cn(included ? "text-foreground/90" : "text-foreground/50")}>
              {s.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function SolutionResult({
  steps,
  selectedId,
  onSelectProduct,
}: {
  steps: StepId[];
  selectedId: string | null;
  onSelectProduct: (product: Product) => void;
}) {
  const scored = PRODUCTS.map((p) => {
    const missing = steps.filter((s) => !p.steps[s]);
    return { product: p, missing, fits: missing.length === 0 };
  });

  const perfect = scored
    .filter((m) => m.fits)
    .sort((a, b) => a.product.priceBuy - b.product.priceBuy);

  const manual = selectedId ? scored.find((s) => s.product.id === selectedId) ?? null : null;
  const primary = manual ?? perfect[0] ?? null;

  const fittingAlternatives = scored
    .filter((s) => s.fits && s.product.id !== primary?.product.id)
    .sort((a, b) => a.product.priceBuy - b.product.priceBuy)
    .slice(0, 3);

  const optionCount = (primary ? 1 : 0) + fittingAlternatives.length;

  const showCompromises = optionCount < 3;
  const compromiseAlternatives = showCompromises
    ? scored
        .filter((s) => !s.fits && s.product.id !== primary?.product.id)
        .sort(
          (a, b) =>
            a.missing.length - b.missing.length ||
            a.product.priceBuy - b.product.priceBuy,
        )
        .slice(0, 3)
    : [];

  const gridCols =
    optionCount >= 4
      ? "md:grid-cols-2 lg:grid-cols-4"
      : optionCount === 3
        ? "md:grid-cols-3"
        : optionCount === 2
          ? "md:grid-cols-2"
          : "md:grid-cols-1";

  return (
    <div className="space-y-8">
      {/* Zusammenfassung */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Deine Auswahl
        </p>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Automatisierte Schritte</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {steps.length === 0 && <span className="text-foreground/60">—</span>}
            {steps.map((id) => {
              const label = PROCESS_STEPS.find((s) => s.id === id)?.label;
              return (
                <span
                  key={id}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empfohlene Lösung + weitere passende Optionen */}
      {primary ? (
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {fittingAlternatives.length > 0
              ? "Empfohlene Lösung & weitere passende Optionen"
              : "Empfohlene Lösung"}
          </p>
          <div className={cn("mt-6 grid gap-4", gridCols)}>
            {/* Empfohlen */}
            <article
              className="relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border-2 border-foreground bg-card p-4 shadow-md sm:p-5"
              aria-label="Empfohlene Lösung"
            >
              <span className="mb-3 self-start rounded-full bg-foreground px-3 py-1 font-display text-[10px] uppercase tracking-[0.2em] text-background">
                Empfohlen
              </span>
              <div className="mb-4 aspect-[16/10] overflow-hidden rounded-lg bg-background">
                <img
                  src={productImage(primary.product.id)}
                  alt={primary.product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="break-words font-display text-base font-semibold leading-tight">
                {primary.product.name}
              </p>
              <p className="mt-2 break-words text-xs text-foreground/70">{primary.product.description}</p>
              <StepChecklist product={primary.product} />
              <dl className="mt-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Kauf</dt>
                  <dd>{formatEuro(primary.product.priceBuy)}</dd>
                </div>
              </dl>
            </article>

            {/* Weitere passende */}
            {fittingAlternatives.map(({ product }) => {
              const extras = PROCESS_STEPS.filter(
                (s) => product.steps[s.id] && !steps.includes(s.id),
              );
              return (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-all cursor-pointer hover:border-foreground/60 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:p-5"
                  aria-label={`Weitere Option: ${product.name}`}
                >
                  <span className="mb-3 self-start rounded-full border border-border bg-background px-3 py-1 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Weitere Option
                  </span>
                  <div className="mb-4 aspect-[16/10] overflow-hidden rounded-lg bg-background">
                    <img
                      src={productImage(product.id)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="break-words font-display text-base font-semibold leading-tight">
                    {product.name}
                  </p>
                  <p className="mt-2 break-words text-xs text-foreground/60">{product.description}</p>
                  <StepChecklist product={product} />
                  <dl className="mt-4 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Kauf</dt>
                      <dd>{formatEuro(product.priceBuy)}</dd>
                    </div>
                  </dl>
                  {extras.length > 0 && (
                    <div className="mt-4 space-y-2 rounded-lg border border-foreground/20 bg-secondary/40 p-3">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground">
                        Zusätzlich automatisiert
                      </p>
                      <p className="text-[11px] text-foreground/80">
                        <span className="font-semibold">
                          {extras.map((s) => s.label).join(", ")}
                        </span>
                      </p>
                    </div>
                  )}
                  <p className="mt-4 font-display text-[10px] uppercase tracking-[0.2em] text-foreground/70 group-hover:text-foreground">
                    Diese Lösung wählen →
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Keine perfekte Lösung
          </p>
          <p className="mt-4 font-display text-lg font-semibold">
            Keine Lösung erfüllt exakt deine Auswahl.
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            Sieh dir unten alternative Lösungen an — bei jeder ist markiert, welche
            Kompromisse du eingehen müsstest.
          </p>
        </div>
      )}

      {/* Kompromiss-Alternativen */}
      {compromiseAlternatives.length > 0 && (
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {primary ? "Optionen mit Kompromissen" : "Alternative Lösungen mit Kompromissen"}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {compromiseAlternatives.map(({ product, missing }) => (
              <button
                type="button"
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-foreground/40 bg-card p-4 text-left transition-all cursor-pointer hover:border-foreground hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:p-5"
              >
                <div className="mb-4 aspect-[16/10] overflow-hidden rounded-lg bg-background">
                  <img
                    src={productImage(product.id)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="break-words font-display text-base font-semibold leading-tight">
                  {product.name}
                </p>
                <p className="mt-2 break-words text-xs text-foreground/60">{product.description}</p>
                <StepChecklist product={product} />
                <dl className="mt-4 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Kauf</dt>
                    <dd>{formatEuro(product.priceBuy)}</dd>
                  </div>
                </dl>
                <div className="mt-4 space-y-2 rounded-lg border border-foreground/30 bg-background p-3">
                  <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground">
                    Kompromiss
                  </p>
                  {missing.length > 0 && (
                    <p className="text-[11px] text-foreground/80">
                      Übernimmt folgende Schritte nicht:{" "}
                      <span className="font-semibold">
                        {missing
                          .map((id) => PROCESS_STEPS.find((s) => s.id === id)?.label)
                          .join(", ")}
                      </span>
                    </p>
                  )}
                  <p className="mt-2 font-display text-[10px] uppercase tracking-[0.2em] text-foreground/70 group-hover:text-foreground">
                    Diese Lösung wählen →
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function ConfigStep({
  ref,
  index,
  title,
  subtitle,
  active,
  last,
  children,
}: {
  ref?: React.Ref<HTMLElement>;
  index: number;
  title: string;
  subtitle?: string;
  active: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      ref={ref}
      className={cn(
        "border-t border-border/60 transition-opacity duration-500",
        !active && "pointer-events-none opacity-40",
        !last && "",
      )}
    >
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="mb-8 flex items-baseline gap-4">
          <span className="font-display text-sm font-medium text-muted-foreground">
            Schritt {index}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-foreground/70">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
