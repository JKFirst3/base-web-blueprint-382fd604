import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cn } from "@/lib/utils";

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
  { id: "buegeln", label: "Wäsche bügeln" },
  { id: "falten", label: "Wäsche falten" },
  { id: "bereitstellen", label: "Wäsche bereitstellen" },
  { id: "einlagern", label: "Wäsche im Schrank einlagern" },
] as const;

type StepId = (typeof PROCESS_STEPS)[number]["id"];

function KonfiguratorPage() {
  const [space, setSpace] = useState<SpaceOption | null>(null);
  const [steps, setSteps] = useState<StepId[]>([]);

  const step2Ref = useRef<HTMLElement>(null);
  const step3Ref = useRef<HTMLElement>(null);

  const step2Unlocked = space !== null;
  const step3Unlocked = step2Unlocked && steps.length > 0;

  useEffect(() => {
    if (space) {
      // small delay so layout has expanded before scrolling
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

  const toggleStep = (id: StepId) => {
    setSteps((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
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
          <div className="grid gap-3 sm:grid-cols-2">
            {PROCESS_STEPS.map((s) => (
              <SelectCard
                key={s.id}
                selected={steps.includes(s.id)}
                onClick={() => toggleStep(s.id)}
                title={s.label}
                variant="row"
              />
            ))}
          </div>
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
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Zusammenfassung
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Platz</dt>
                    <dd className="font-display text-lg">
                      {SPACE_OPTIONS.find((s) => s.id === space)?.label ?? "—"}
                    </dd>
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
                  Empfohlene Lösung
                </p>
                <p className="mt-4 font-display text-2xl font-semibold">
                  Wird bald verfügbar
                </p>
                <p className="mt-3 text-sm text-foreground/70">
                  Die Entscheidungsmatrix, die deine Auswahl auf ein konkretes Lavidro-Setup
                  abbildet, wird demnächst ergänzt. Anschließend siehst du hier genau, welches
                  Modulset zu deinem Zuhause passt.
                </p>
              </div>
            </div>
          </div>
        </ConfigStep>

        <div className="h-24" />
      </main>
      <Footer />
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
