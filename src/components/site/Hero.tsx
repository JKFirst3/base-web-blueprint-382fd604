import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-laundry-room.png.asset.json";

function scrollToWaitlist() {
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:gap-16 md:py-28 lg:px-8 lg:py-32">
        <div className="animate-fade-in-up">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Textile Care Intelligence
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Nie wieder Waschen, Sortieren oder Falten
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
            Das erste System, das den&nbsp;vollständigen Wäscheprozess&nbsp;nach&nbsp;deinen
            Gewohnheiten, autonom&nbsp;und&nbsp;qualitätssicher übernimmt, damit Wäsche erledigt
            ist,&nbsp;bevor du dran denkst.
          </p>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Lavidro — Textile Care Intelligence.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              onClick={scrollToWaitlist}
              size="lg"
              className="rounded-full px-7 py-6 text-base transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
            >
              Auf die Warteliste setzen
            </Button>
            <a
              href="#features"
              className="text-sm font-medium text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
            >
              Mehr erfahren ↓
            </a>
          </div>
        </div>

        <div className="relative animate-fade-in">
          <div className="absolute -inset-6 rounded-[3rem] bg-card/40 blur-2xl" aria-hidden />
          <div className="relative flex items-center justify-center rounded-[2.5rem] border border-border bg-card/60 p-8 shadow-sm sm:p-12">
            <img
              src={heroImage.url}
              alt="Moderne Waschküche mit autonomem Lavidro-Roboterarm"
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
