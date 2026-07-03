export function SocialProof() {
  const quotes = [
    {
      text: "Endlich eine Lösung, die den Wäsche-Alltag wirklich neu denkt. Ich habe Stunden pro Woche zurückgewonnen.",
      author: "Anna R.",
      role: "Beta-Nutzerin, Berlin",
    },
    {
      text: "Lavidro fühlt sich an wie ein persönlicher Concierge für Textilpflege — durchdacht, verlässlich, elegant.",
      author: "Julian K.",
      role: "Early Adopter, München",
    },
    {
      text: "Was mich überzeugt: Meine Kleidung sieht länger neu aus und ich muss mich um nichts mehr kümmern.",
      author: "Sophie M.",
      role: "Warteliste, Hamburg",
    },
  ];

  const partners = ["Cleanly Co.", "Textilia", "Fabriq", "Nordwash", "Linea", "Vestra"];

  return (
    <section className="border-t border-border/60 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Stimmen & Partner
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Vertrauen, das wir uns verdienen
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/70">
            Was frühe Nutzer:innen über Lavidro sagen — und mit wem wir zusammenarbeiten.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <figure
              key={i}
              className="relative flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-sm transition-transform hover:-translate-y-1"
            >
              <span
                aria-hidden
                className="absolute -top-4 left-6 font-display text-6xl leading-none text-accent"
              >
                &ldquo;
              </span>
              <blockquote className="relative pt-4 text-foreground/85">
                <p className="text-[15px] leading-relaxed">{q.text}</p>
              </blockquote>
              <figcaption className="mt-6 border-t border-border/60 pt-4">
                <div className="font-display text-sm font-semibold">{q.author}</div>
                <div className="text-xs text-muted-foreground">{q.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-20">
          <p className="text-center font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Unsere Partner
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((name) => (
              <div
                key={name}
                className="flex h-16 items-center justify-center rounded-xl border border-border/70 bg-background/60 px-4 font-display text-base font-semibold tracking-wide text-foreground/70 transition-colors hover:text-foreground"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
