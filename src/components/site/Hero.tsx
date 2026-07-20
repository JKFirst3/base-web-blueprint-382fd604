import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-laundry-room.png.asset.json";

function scrollToWaitlist() {
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Full-bleed background image */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <img
          src={heroImage.url}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:gap-16 md:py-28 lg:px-8 lg:py-32">
        <div className="relative z-10 animate-fade-in-up">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-white/70">
            &nbsp;
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Wäsche.
            <br />
            Einfach.
            <br />
            Fertig.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Das erste System, das den&nbsp;vollständigen Wäscheprozess&nbsp;nach&nbsp;deinen
            Gewohnheiten, autonom&nbsp;und&nbsp;qualitätssicher übernimmt, damit Wäsche erledigt
            ist,&nbsp;bevor du dran denkst.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              onClick={scrollToWaitlist}
              size="lg"
              className="rounded-full bg-accent px-7 py-6 text-base text-accent-foreground transition-all hover:bg-accent/90 active:scale-[0.98]"
            >
              LAVIDRO live erleben
            </Button>

            <a
              href="#features"
              className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              Mehr erfahren ↓
            </a>
          </div>
        </div>



      </div>
    </section>
  );
}
