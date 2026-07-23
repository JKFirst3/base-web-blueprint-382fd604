import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { track } from "@/lib/track";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Welche Aufgaben übernimmt LAVIDRO?",
    a: "LAVIDRO übernimmt je nach Ausbaustufe das Sortieren, das Umladen zwischen Waschmaschine und Trockner, das Falten sowie das Bereitstellen bzw. Einsortieren der Wäsche.",
  },
  {
    q: "Welche der drei Produktlösungen passt zu welchem Haushalt?",
    a: "LAVIDRO Arm ist flexibel und benötigt keine Umbauten. LAVIDRO Cabinet integriert sich diskret in einen Wandschrank. LAVIDRO One arbeitet als humanoider Roboter über den gesamten Wäscheprozess hinweg.",
  },
  {
    q: "Ist LAVIDRO für private Haushalte vorgesehen?",
    a: "Ja. LAVIDRO ist als System für den privaten Haushalt konzipiert und integriert sich in bestehende Hauswirtschaftsräume.",
  },
  {
    q: "Wann wird LAVIDRO verfügbar?",
    a: "Die Lösungen befinden sich aktuell in der Entwicklung. Über eine Vorbestellung erhältst du exklusive Einblicke, bevor sie verfügbar sind.",
  },
  {
    q: "Benötigt LAVIDRO spezielle Waschmaschinen oder Trockner?",
    a: "LAVIDRO arbeitet mit gängigen Geräten zusammen. Details zu unterstützten Modellen klären wir in der persönlichen Produktvorstellung.",
  },
  {
    q: "Wie sicher ist das System im Haushalt?",
    a: "Sensorik, Bewegungssteuerung und definierte Arbeitsbereiche sind auf sicheren Betrieb im Haushalt ausgelegt. Konkrete Zertifikate folgen mit der Marktreife.",
  },
  {
    q: "Wie behandelt LAVIDRO empfindliche Textilien?",
    a: "Griffkraft, Timing und Programme sind auf empfindliche Textilien abgestimmt, damit Pflegemuster qualitätssicher wiederholbar bleiben.",
  },
  {
    q: "Kann LAVIDRO nachgerüstet werden?",
    a: "LAVIDRO Arm lässt sich ohne Umbauten in einen bestehenden Hauswirtschaftsraum integrieren. LAVIDRO Cabinet und One erfordern eine individuelle Planung.",
  },
  {
    q: "Welche Umbauten sind erforderlich?",
    a: "Für Arm keine. Für Cabinet die Integration in einen Wandschrank. Für One eine passende Fläche im Hauswirtschaftsraum.",
  },
  {
    q: "Welche Wartung benötigt das System?",
    a: "Details zu Wartungsintervallen und -umfang stellen wir mit dem Marktstart bereit.",
  },
  {
    q: "Was unterscheidet Arm, Cabinet und One?",
    a: "Arm ist mobil und flexibel, Cabinet ist möbelintegriert und diskret, One ist humanoid und übernimmt den gesamten Ablauf autonom.",
  },
  {
    q: "Wie kann eine Produktvorstellung vereinbart werden?",
    a: "Über den Bereich „LAVIDRO live erleben“ – digital oder im Showroom in Paderborn.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <p className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Fragen &amp; Antworten
        </p>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Häufig gestellte Fragen
        </h2>

        <div className="mt-12 border-t border-[rgba(23,23,23,0.16)]">
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-[rgba(23,23,23,0.16)]">
                <button
                  type="button"
                  onClick={() => {
                    const next = isOpen ? null : i;
                    setOpen(next);
                    if (next !== null) track("faq_open", { faq_id: String(i) });
                  }}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-base font-medium sm:text-lg">{it.q}</span>
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[rgba(23,23,23,0.2)]">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? 400 : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p className="pb-6 pr-12 text-[15px] leading-relaxed text-foreground/75">
                    {it.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
