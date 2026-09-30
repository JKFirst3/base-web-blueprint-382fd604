import mobilImage from "@/assets/design-das-sich-einfuegt.png.asset.json";
import praezision from "@/assets/praezision-uebernimmt.png.asset.json";
import qualitaet from "@/assets/qualitaet-bleibt.png.asset.json";

const TILES = [
  {
    image: mobilImage.url,
    title: "Design, das sich einfügt",
    body: "Flexible Installation im Hauswirtschaftsraum – ohne Umbauten. Möbeldesign, das sich diskret einordnet.",
  },
  {
    image: praezision.url,
    title: "Präzision, die übernimmt",
    body: "Sensorik, Bewegungssteuerung und autonome Abläufe – zwischen Waschmaschine, Trockner und Ablage.",
  },
  {
    image: qualitaet.url,
    title: "Qualität, die bleibt",
    body: "Textilschonende Pflege, sichere Griffe und wiederholbare Ergebnisse in jeder Ausbaustufe.",
  },
];

export function FeatureImages() {
  return (
    <section className="bg-black">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {TILES.map((t) => (
          <article
            key={t.title}
            className="group relative h-[68vh] min-h-[560px] overflow-hidden md:h-[720px]"
          >
            <img
              src={t.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
              aria-hidden
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.8) 100%)",
              }}
            />
            <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white sm:p-10">
              <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {t.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">{t.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
