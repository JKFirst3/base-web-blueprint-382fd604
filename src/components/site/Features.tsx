import { Sparkles, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Vollständig Autonom",
    body:
      "Lavidro übernimmt den gesamten Post-Wash-Prozess: Entladen, Trocknen, Falten und Sortieren – ohne dass du eingreifen musst.",
  },
  {
    icon: ShieldCheck,
    title: "Textilschonend & Sicher",
    body:
      "Präzise Sensorik und intelligente Pflegemuster schützen selbst deine empfindlichsten Kleidungsstücke.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <div className="mb-12 max-w-2xl">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Was Lavidro anders macht
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Pflege auf einem neuen Niveau.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {features.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-background/60 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/75">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
