const ITEMS = [
  {
    title: "Herausragende Innovation",
    body:
      "Robotik, Sensorik und Software greifen als ein System ineinander – entwickelt für den realen Haushalt.",
  },
  {
    title: "Schonende Textilpflege",
    body:
      "Griffkraft, Bewegung und Programme sind auf empfindliche Textilien abgestimmt und wiederholbar sicher.",
  },
  {
    title: "Smart-Home-Funktionen",
    body:
      "Integration in bestehende Wohnräume und digitale Routinen – weitere Funktionen sind geplant.",
  },
  {
    title: "Persönliche Beratung",
    body:
      "Unverbindliche Produktvorstellung digital oder im Showroom Paderborn – inklusive Feedbackgespräch.",
  },
];

export function QualityArguments() {
  return (
    <section id="qualitaet" className="bg-[#F7F5F2] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <p className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Einmal LAVIDRO, immer LAVIDRO
            </p>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Gute Gründe für ein autonomes Wäschesystem.
            </h2>
          </div>
        </div>

        <div className="mt-16 grid gap-0 border-t border-[rgba(23,23,23,0.16)] md:grid-cols-2">
          {ITEMS.map((it, i) => (
            <article
              key={it.title}
              className={`border-b border-[rgba(23,23,23,0.16)] px-2 py-10 md:px-8 ${
                i % 2 === 0 ? "md:border-r" : ""
              }`}
            >
              <p className="font-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                0{i + 1}
              </p>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                {it.title}
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-foreground/75">
                {it.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
