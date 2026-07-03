import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cn } from "@/lib/utils";
import mobilImage from "@/assets/konfigurator-mobil.png.asset.json";
import wandImage from "@/assets/konfigurator-wand.png.asset.json";
import humanoidImage from "@/assets/konfigurator-humanoid.png.asset.json";

const TITLE = "Konfigurator — Lavidro";
const DESCRIPTION =
  "Stelle dir dein individuelles Lavidro-System zusammen: Platz wählen, Prozessschritte automatisieren, Lösung erhalten.";

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

type SpaceOption = "1-3" | "3-4" | "4+";

const SPACE_OPTIONS: { id: SpaceOption; label: string; hint: string }[] = [
  { id: "1-3", label: "1 – 3 m²", hint: "Kompakt für kleine Räume" },
  { id: "3-4", label: "3 – 4 m²", hint: "Ausgewogen für Familien" },
  { id: "4+", label: "ab 4 m²", hint: "Voller Funktionsumfang" },
];

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
  area: number;
  priceBuy: number;
  priceRent: number;
  steps: Record<StepId, boolean>;
};

const PRODUCTS: Product[] = [
  {
    id: "mobil-s",
    name: "Mobiler Roboter — Größe S",
    description:
      "Roboterarm auf einer Schiene zwischen Waschmaschine und Trockner, der be-, um- und entladen kann.",
    area: 2,
    priceBuy: 1500,
    priceRent: 75,
    steps: { einsammeln: false, sortieren: false, waschen: true, falten: false, bereitstellen: false, einlagern: false },
  },
  {
    id: "mobil-m",
    name: "Mobiler Roboter — Größe M",
    description:
      "Einarmiger Roboter auf einer mobilen Plattform, der zusätzlich sortieren kann.",
    area: 3,
    priceBuy: 5000,
    priceRent: 250,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: false, einlagern: false },
  },
  {
    id: "mobil-l",
    name: "Mobiler Roboter — Größe L",
    description:
      "Zweiarmiger Roboter auf mobiler Plattform, der zusätzlich sortiert, faltet und die gefaltete Wäsche bereitstellt.",
    area: 4,
    priceBuy: 7000,
    priceRent: 350,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: true, einlagern: false },
  },
  {
    id: "wand-s",
    name: "Integrierter Wandschrank — Größe S",
    description:
      "Roboterarm im integrierten Wandschrank auf einer Schiene zwischen Waschmaschine und Trockner. Sortieren und Falten übernimmst du selbst.",
    area: 3,
    priceBuy: 2250,
    priceRent: 112,
    steps: { einsammeln: false, sortieren: false, waschen: true, falten: false, bereitstellen: false, einlagern: false },
  },
  {
    id: "wand-m",
    name: "Integrierter Wandschrank — Größe M",
    description:
      "Roboterarm im Wandschrank, der zusätzlich sortiert. Wäsche wird selbst in den HWR gebracht und abgeholt.",
    area: 4,
    priceBuy: 6000,
    priceRent: 300,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: false, einlagern: false },
  },
  {
    id: "wand-l",
    name: "Integrierter Wandschrank — Größe L",
    description:
      "Zwei Roboterarme im Wandschrank vom Sortieren bis zum Bereitstellen. Wäsche wird selbst in den HWR gebracht und abgeholt.",
    area: 5,
    priceBuy: 8000,
    priceRent: 400,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: true, einlagern: false },
  },
  {
    id: "humanoid-l",
    name: "Humanoider Roboter — Größe L",
    description:
      "Humanoider Roboter, der im definierten Bereich vom Sortieren bis zum Falten alles übernimmt. Wäsche wird selbst in den HWR gebracht und abgeholt.",
    area: 5,
    priceBuy: 10000,
    priceRent: 500,
    steps: { einsammeln: false, sortieren: true, waschen: true, falten: true, bereitstellen: true, einlagern: false },
  },
  {
    id: "humanoid-xl",
    name: "Humanoider Roboter — Größe XL",
    description:
      "Humanoider Roboter, der die schmutzige Wäsche eigenständig holt, den Waschprozess im HWR durchführt und die gefaltete Wäsche wieder verteilt.",
    area: 5,
    priceBuy: 15000,
    priceRent: 750,
    steps: { einsammeln: true, sortieren: true, waschen: true, falten: true, bereitstellen: true, einlagern: true },
  },
];

const SPACE_MAX: Record<SpaceOption, number> = { "1-3": 3, "3-4": 4, "4+": Infinity };

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
  const [space, setSpaceState] = useState<SpaceOption | null>(null);
  const [steps, setStepsState] = useState<StepId[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const step2Ref = useRef<HTMLElement>(null);
  const step3Ref = useRef<HTMLElement>(null);

  const step2Unlocked = space !== null;
  const step3Unlocked = step2Unlocked && steps.length > 0;

  useEffect(() => {
    if (space) {
      const t = setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [space]);

  useEffect(() => {
    if (steps.length === 1) {
      const t = setTimeout(() => {
        step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
      return () => clearTimeout(t);
    }
  }, [steps.length]);

  // Direct user changes to Step 1 / Step 2 clear any manual product override
  const setSpace = (s: SpaceOption) => {
    setSelectedId(null);
    setSpaceState(s);
  };
  const toggleStep = (id: StepId) => {
    setSelectedId(null);
    setStepsState((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="mx-auto max-w-5xl px-4 pb-10 pt-16 sm:px-6 md:pt-24 lg:px-8">
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Konfigurator
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Dein Lavidro nach Mass
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/75">
              In drei Schritten zu deinem persönlichen System — wähle deinen verfügbaren Platz,
              die Prozessschritte, die automatisiert werden sollen, und erhalte deine passende
              Lösung.
            </p>
          </div>
        </section>

        {/* Step 1 */}
        <ConfigStep
          index={1}
          title="Wie viel Platz möchtest du bereitstellen?"
          subtitle="Wähle die Fläche, die dir zur Verfügung steht."
          active
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {SPACE_OPTIONS.map((opt) => (
              <SelectCard
                key={opt.id}
                selected={space === opt.id}
                onClick={() => setSpace(opt.id)}
                title={opt.label}
                subtitle={opt.hint}
              />
            ))}
          </div>
        </ConfigStep>

        {/* Step 2 */}
        <ConfigStep
          ref={step2Ref}
          index={2}
          title="Welche Prozessschritte möchtest du automatisieren?"
          subtitle="Mehrfachauswahl möglich."
          active={step2Unlocked}
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

        {/* Step 3 */}
        <ConfigStep
          ref={step3Ref}
          index={3}
          title="Deine Lösung"
          subtitle="Basierend auf deiner Auswahl."
          active={step3Unlocked}
          last
        >
          <SolutionResult
            space={space}
            steps={steps}
            selectedId={selectedId}
            onSelectProduct={(product) => {
              setSelectedId(product.id);
              // If the product doesn't fit current filters, adjust them
              const nextSpace = (SPACE_OPTIONS.find((o) => SPACE_MAX[o.id] >= product.area)?.id ??
                space) as SpaceOption;
              if (nextSpace !== space) setSpaceState(nextSpace);
              setStepsState((prev) => prev.filter((s) => product.steps[s]));
            }}
          />
        </ConfigStep>

        <div className="h-24" />
      </main>
      <Footer />
    </div>
  );
}

function SolutionResult({
  space,
  steps,
  selectedId,
  onSelectProduct,
}: {
  space: SpaceOption | null;
  steps: StepId[];
  selectedId: string | null;
  onSelectProduct: (product: Product) => void;
}) {
  const maxArea = space ? SPACE_MAX[space] : Infinity;

  const scored = PRODUCTS.map((p) => {
    const missing = steps.filter((s) => !p.steps[s]);
    const areaOver = Math.max(0, p.area - maxArea);
    return { product: p, missing, areaOver, fits: areaOver === 0 && missing.length === 0 };
  });

  const perfect = scored
    .filter((m) => m.fits)
    .sort((a, b) => a.product.priceBuy - b.product.priceBuy);

  const manual = selectedId ? scored.find((s) => s.product.id === selectedId) ?? null : null;
  const primary = manual ?? perfect[0] ?? null;

  // Alternatives = everything else, excluding the primary. Prefer perfect matches first,
  // then closest compromises.
  const alternatives = scored
    .filter((s) => s.product.id !== primary?.product.id)
    .sort(
      (a, b) =>
        Number(!a.fits) - Number(!b.fits) ||
        a.missing.length - b.missing.length ||
        a.areaOver - b.areaOver ||
        a.product.priceBuy - b.product.priceBuy,
    )
    .slice(0, 3);

  const spaceLabel = SPACE_OPTIONS.find((s) => s.id === space)?.label ?? "—";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Zusammenfassung
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Platz</dt>
                <dd className="font-display text-lg">{spaceLabel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Automatisierte Schritte</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
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
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-6">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {primary ? "Empfohlene Lösung" : "Keine perfekte Lösung"}
            </p>
            {primary ? (
              <>
                <div className="mt-4 aspect-[16/10] overflow-hidden rounded-xl bg-background">
                  <img
                    src={productImage(primary.product.id)}
                    alt={primary.product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-4 font-display text-2xl font-semibold">{primary.product.name}</p>
                <p className="mt-2 text-sm text-foreground/70">{primary.product.description}</p>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Platzbedarf</dt>
                    <dd className="font-display text-base">{primary.product.area} m²</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Einmalkauf</dt>
                    <dd className="font-display text-base">{formatEuro(primary.product.priceBuy)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Miete</dt>
                    <dd className="font-display text-base">
                      {formatEuro(primary.product.priceRent)} / Monat
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <>
                <p className="mt-4 font-display text-lg font-semibold">
                  Keine Lösung erfüllt exakt deine Auswahl.
                </p>
                <p className="mt-2 text-sm text-foreground/70">
                  Sieh dir unten alternative Lösungen an — bei jeder ist markiert, welche
                  Kompromisse du eingehen müsstest.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {primary ? "Weitere Optionen" : "Alternative Lösungen mit Kompromissen"}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {alternatives.map(({ product, missing, areaOver }) => {
              const hasCompromise = missing.length > 0 || areaOver > 0;
              return (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className={cn(
                    "group rounded-2xl border bg-card p-5 text-left transition-all cursor-pointer",
                    hasCompromise
                      ? "border-foreground/40 hover:border-foreground hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                      : "border-border hover:border-foreground/60 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                  )}
                >
                  <div className="mb-4 aspect-[16/10] overflow-hidden rounded-lg bg-background">
                    <img
                      src={productImage(product.id)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="font-display text-base font-semibold leading-tight">
                    {product.name}
                  </p>
                  <p className="mt-2 text-xs text-foreground/60">{product.description}</p>
                  <dl className="mt-4 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Platz</dt>
                      <dd className={cn(areaOver > 0 && "font-semibold text-foreground")}>
                        {product.area} m²
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Kauf</dt>
                      <dd>{formatEuro(product.priceBuy)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Miete</dt>
                      <dd>{formatEuro(product.priceRent)} / Mon.</dd>
                    </div>
                  </dl>
                  {hasCompromise && (
                    <div className="mt-4 space-y-2 rounded-lg border border-foreground/30 bg-background p-3">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-foreground">
                        Kompromiss
                      </p>
                      {areaOver > 0 && (
                        <p className="text-[11px] text-foreground/80">
                          Benötigt <span className="font-semibold">{product.area} m²</span> —
                          das sind {areaOver} m² mehr als dein gewählter Platz ({spaceLabel}).
                        </p>
                      )}
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
                  )}
                </button>
              );
            })}
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

function SelectCard({
  selected,
  onClick,
  title,
  subtitle,
  variant = "tile",
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  variant?: "tile" | "row";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all",
        "hover:border-foreground/40 hover:shadow-sm",
        selected
          ? "border-foreground ring-2 ring-foreground/80"
          : "border-border",
        variant === "tile" && "flex-col items-stretch sm:min-h-32",
      )}
      aria-pressed={selected}
    >
      <div className="flex flex-1 flex-col">
        <span className="font-display text-lg font-semibold leading-tight">{title}</span>
        {subtitle && (
          <span className="mt-1 text-sm text-foreground/60">{subtitle}</span>
        )}
      </div>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background",
          variant === "tile" && "absolute right-4 top-4",
        )}
        aria-hidden
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
