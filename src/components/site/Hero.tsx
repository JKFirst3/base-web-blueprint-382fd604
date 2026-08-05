import { useEffect, useRef, useState } from "react";
import heroImage from "@/assets/hero-laundry-room.png.asset.json";
import { track } from "@/lib/track";

function scrollToWaitlist() {
  track("live_experience_click", { cta_label: "hero_live_erleben" });
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        // clamp to ~18px parallax range
        setOffset(Math.min(18, Math.max(0, y * 0.08)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="top" ref={ref} className="relative h-screen min-h-[640px] w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${offset}px) scale(1.06)` }}
        aria-hidden
      >
        <img
          src={heroImage.url}
          alt=""
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </div>
      {/* Dark gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.25) 40%, rgba(5,5,5,0.6) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-black/60"
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-end px-5 pb-24 text-center text-white sm:px-8 sm:pb-28 md:pb-36">
        <p className="font-display text-[11px] uppercase tracking-[0.32em] text-white/75 animate-fade-in-up">
          Die Evolution der Wäschepflege
        </p>
        <h1 className="mt-5 font-display text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl md:text-7xl lg:text-[92px] animate-fade-in-up">
          Wäsche.
          <br />
          Einfach.
          <br />
          Fertig.
        </h1>
        <div className="mt-9 flex items-center gap-3 animate-fade-in-up">
          <button
            type="button"
            onClick={scrollToWaitlist}
            className="rounded-full bg-white px-6 py-3 text-[13px] font-medium text-[#050505] transition hover:bg-white/90"
          >
            Lavidro live erleben
          </button>
          <a
            href="#system"
            onClick={() => track("cta_click", { cta_label: "hero_entdecken" })}
            className="inline-flex items-center gap-2 rounded-full border border-white/45 px-5 py-3 text-[13px] font-medium text-white transition hover:border-white hover:bg-white/10"
          >
            Entdecken
            <span
              aria-hidden
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/60"
            >
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
