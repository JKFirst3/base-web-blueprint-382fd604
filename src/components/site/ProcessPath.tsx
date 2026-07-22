import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    n: "01",
    title: "Sortieren",
    body:
      "Textilien werden nach Farbe, Material, Pflegebedarf und Haushaltslogik erkannt.",
  },
  {
    n: "02",
    title: "Beladen",
    body:
      "Der Roboterarm führt Kleidung präzise in Waschmaschine oder Trockner.",
  },
  {
    n: "03",
    title: "Entladen",
    body:
      "Bewegung, Timing und Griffstärke werden auf empfindliche Textilien abgestimmt.",
  },
  {
    n: "04",
    title: "Bereitstellen",
    body:
      "Die fertige Wäsche wird geordnet übergeben, damit sie direkt griffbereit ist.",
  },
];

// SVG path across a 1000x1000 viewBox – S-curve top-right → bottom-left
const PATH_D =
  "M 950 80 C 950 300, 500 260, 500 500 C 500 740, 50 700, 50 920";

// Point positions along the path for milestone markers, approx.
const MILESTONES = [
  { x: 900, y: 180 },
  { x: 660, y: 380 },
  { x: 340, y: 620 },
  { x: 100, y: 840 },
];

export function ProcessPath() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const dashOffset = len * (1 - progress);

  return (
    <section id="module" ref={wrapRef} className="relative bg-[#EBE6DF]">
      <div className="sticky top-0 flex h-screen min-h-[640px] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Module für LAVIDRO
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
              Ein System. Vier Schritte. Ein Versprechen: freie Zeit.
            </h2>
          </div>

          {/* Desktop: SVG S-path */}
          <div className="relative hidden md:col-span-8 md:block">
            <svg
              viewBox="0 0 1000 1000"
              preserveAspectRatio="xMidYMid meet"
              className="h-[560px] w-full"
              aria-hidden
            >
              <path
                d={PATH_D}
                fill="none"
                stroke="rgba(23,23,23,0.15)"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                ref={pathRef}
                d={PATH_D}
                fill="none"
                stroke="#171717"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={len}
                strokeDashoffset={dashOffset}
              />
              {MILESTONES.map((m, i) => {
                const activeAt = (i + 0.5) / MILESTONES.length;
                const active = progress >= activeAt - 0.05;
                return (
                  <g key={i} opacity={active ? 1 : 0} style={{ transition: "opacity 400ms" }}>
                    <circle cx={m.x} cy={m.y} r={22} fill="#050505" />
                    <text
                      x={m.x}
                      y={m.y + 5}
                      textAnchor="middle"
                      fontFamily="Montserrat, sans-serif"
                      fontSize={14}
                      fontWeight={600}
                      fill="#ffffff"
                    >
                      {STEPS[i].n}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Labels layered next to markers */}
            <div className="pointer-events-none absolute inset-0">
              {STEPS.map((s, i) => {
                const activeAt = (i + 0.5) / STEPS.length;
                const active = progress >= activeAt - 0.05;
                const m = MILESTONES[i];
                const leftPct = (m.x / 1000) * 100;
                const topPct = (m.y / 1000) * 100;
                // Push label horizontally: right side markers → label to the left, left side → to the right
                const isRight = m.x > 500;
                return (
                  <div
                    key={s.n}
                    className="absolute w-[220px] transition-all duration-500"
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: `translate(${isRight ? "-110%" : "10%"}, -50%)`,
                      opacity: active ? 1 : 0,
                    }}
                  >
                    <p className="font-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                      Schritt {s.n}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/75">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: vertical path */}
          <div className="relative md:hidden">
            <div className="absolute left-4 top-0 h-full w-px bg-[rgba(23,23,23,0.15)]" />
            <div
              className="absolute left-4 top-0 w-px bg-[#171717] transition-[height] duration-500"
              style={{ height: `${Math.min(100, progress * 100)}%` }}
            />
            <div className="space-y-8 pl-12">
              {STEPS.map((s, i) => {
                const activeAt = (i + 0.5) / STEPS.length;
                const active = progress >= activeAt - 0.05;
                return (
                  <div
                    key={s.n}
                    className="relative transition-opacity duration-500"
                    style={{ opacity: active ? 1 : 0.25 }}
                  >
                    <span
                      className="absolute -left-[34px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#050505] text-[11px] font-semibold text-white"
                      style={{ opacity: active ? 1 : 0 }}
                    >
                      {s.n}
                    </span>
                    <h3 className="font-display text-base font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-foreground/75">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Spacer so section is ~3 viewport heights tall */}
      <div className="pointer-events-none h-[200vh]" aria-hidden />
    </section>
  );
}
