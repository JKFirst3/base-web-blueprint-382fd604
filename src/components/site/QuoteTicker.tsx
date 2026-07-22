export function QuoteTicker() {
  // Placeholder ticker — real testimonials pending release approval.
  const placeholder = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    text: "Erfahrungsberichte folgen in Kürze.",
  }));
  const doubled = [...placeholder, ...placeholder];

  return (
    <section
      aria-label="Erste Resonanz"
      className="relative overflow-hidden border-y border-[rgba(23,23,23,0.12)] bg-[#F7F5F2] py-6"
    >
      <div
        className="flex w-max animate-marquee gap-0 whitespace-nowrap"
        style={{ animationDuration: "50s" }}
      >
        {doubled.map((q, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-r border-[rgba(23,23,23,0.12)] px-8 text-[13px] text-foreground/70"
          >
            <span className="font-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Erste Resonanz
            </span>
            <span>{q.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
