import { useEffect, useRef, useState } from "react";

export function HabitsProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    if (played) return;
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(100);
      setPlayed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setPlayed(true);
            const start = performance.now();
            const dur = 1400;
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(eased * 100));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [played]);

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Individuelle Konfiguration
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Wäschepflege ganz nach deinen Gewohnheiten.
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-foreground/75">
            Das erste System, das den vollständigen Wäscheprozess nach deinen Gewohnheiten, autonom
            und qualitätssicher übernimmt, damit Wäsche erledigt ist, bevor du dran denkst.
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/70">
            Individuelle Routinen, Ablageorte, Sortierlogik und Ausbaustufen – LAVIDRO passt sich an
            dein Zuhause an, nicht umgekehrt.
          </p>
        </div>
        <div ref={ref}>
          <p className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Automatisierungspotenzial
          </p>
          <p className="mt-4 font-display text-[96px] font-semibold leading-none tracking-tight sm:text-[128px]">
            {value}
            <span className="text-3xl font-medium text-foreground/60">%</span>
          </p>
          <p className="mt-2 text-sm text-foreground/70">bis zu 100 % weniger Zeitaufwand</p>
          <div
            className="mt-6 h-[2px] w-full overflow-hidden bg-[rgba(23,23,23,0.12)]"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-[#050505] transition-[width] duration-[1400ms] ease-out"
              style={{ width: `${value}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Angestrebter Zielwert / erwartetes Automatisierungspotenzial.
          </p>
        </div>
      </div>
    </section>
  );
}
