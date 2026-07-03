import mieleLogo from "@/assets/miele-logo.png.asset.json";
import uniPaderbornLogo from "@/assets/uni-paderborn-logo.png.asset.json";
import factory33Logo from "@/assets/factory33-logo.png.asset.json";
export function SocialProof() {
  const quotes = [
    {
      text: "Wäsche wird im Alltag oft vergessen, da die einzelnen Prozessschritte nicht bündig nacheinander laufen. Ein Roboter löst genau dieses Timing-Problem.",
      author: "Alena K.",
      role: "Teilnehmerin Konzeptbefragung",
    },
    {
      text: "Ein durchdachtes Konzept, das genau meinen Nerv trifft: weniger Aufwand, gleiche Qualität.",
      author: "Julian K.",
      role: "Teilnehmer Konzeptbefragung",
    },
    {
      text: "Wenn Lavidro hält, was es verspricht, ist das für mich der spannendste Ansatz zur Textilpflege seit Langem.",
      author: "Sophie M.",
      role: "Teilnehmerin Konzeptbefragung",
    },
  ];

  const partners = [
    { name: "Miele", note: "Industriepartner", logo: mieleLogo.url },
    { name: "Universität Paderborn", note: "Forschungspartner", logo: uniPaderbornLogo.url },
    { name: "Factory33", note: "Innovationspartner", logo: factory33Logo.url },
  ];

  return (
    <section className="border-t border-border/60 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Konzeptbefragung
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Stimmen aus unserer Konzeptbefragung
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/70">
            Lavidro ist noch nicht als Produkt verfügbar. Diese Rückmeldungen stammen aus
            Interviews und Umfragen, in denen wir unser Konzept mit potenziellen Nutzer:innen
            geteilt haben.
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
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-background px-6 py-4 text-center transition-colors hover:border-foreground/30"
              >
                <img
                  src={p.logo}
                  alt={`${p.name} Logo`}
                  loading="lazy"
                  className="max-h-14 w-auto max-w-[70%] object-contain"
                />
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {p.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
