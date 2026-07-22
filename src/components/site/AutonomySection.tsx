import heroImage from "@/assets/hero-laundry-room.png.asset.json";

export function AutonomySection() {
  return (
    <section className="relative isolate min-h-[90vh] overflow-hidden bg-black text-white">
      <img
        src={heroImage.url}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-5 py-32 sm:px-8 md:grid-cols-12 md:py-40">
        <div className="md:col-span-7">
          <p className="font-display text-[11px] uppercase tracking-[0.3em] text-white/70">
            Textile Care Intelligence
          </p>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-6xl">
            Autonomie, die im Hintergrund arbeitet.
          </h2>
          <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-white/85">
            LAVIDRO verbindet mechanische Präzision mit intelligenten Pflegeentscheidungen. So
            wird aus einer wiederkehrenden Aufgabe ein ruhiger, automatisierter Ablauf.
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">
            Sensorik erkennt Textilien und Zustand, die Ausbaustufen decken vom Umladen zwischen
            Wasch­maschine und Trockner bis zum Einsortieren in den Schrank ab – qualitätssicher und
            wiederholbar.
          </p>
        </div>
      </div>
    </section>
  );
}
