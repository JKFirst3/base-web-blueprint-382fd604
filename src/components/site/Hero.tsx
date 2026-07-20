import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-laundry-room.png.asset.json";

function scrollToWaitlist() {
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Full-height image on the right side of the page */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden md:block md:w-1/2"
        aria-hidden
      >
        <img
          src={heroImage.url}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:gap-16 md:py-28 lg:px-8 lg:py-32">
        <div className="relative z-10 animate-fade-in-up">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground">
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
              className="rounded-full px-7 py-6 text-base transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
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

        {/* Mobile-only image (right column is used by the absolute image on md+) */}
        <div className="relative animate-fade-in md:hidden">
          <img
            src={heroImage.url}
            alt="Moderne Waschküche mit autonomem Lavidro-Roboterarm"
            className="h-auto w-full rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
