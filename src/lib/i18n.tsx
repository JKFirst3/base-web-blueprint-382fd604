import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Globe2 } from "lucide-react";

export type Locale = "de" | "en";

const STORAGE_KEY = "lavidro-locale";

const english: Record<string, string> = {
  "LAVIDRO live erleben": "Experience LAVIDRO live",
  "Über LAVIDRO": "About LAVIDRO",
  Produkte: "Products",
  Qualität: "Quality",
  Entdecken: "Discover",
  "Die Evolution der Wäschepflege": "The evolution of laundry care",
  "Wäsche.": "Laundry.",
  "Einfach.": "Simply.",
  "Fertig.": "Done.",
  "Das erste System, bei dem Robotik nicht nach Labor aussieht, sondern wie ein Teil des Zuhauses.":
    "The first system where robotics does not look like a laboratory, but like part of the home.",
  "Interior Designerin": "Interior designer",
  "Wenn Lavidro Sortieren und Bereitstellen wirklich übernimmt, ist das für Familien ein echter Zeitgewinn.":
    "If LAVIDRO really takes over sorting and making laundry available, it gives families back valuable time.",
  "Smart-Home-Berater": "Smart home consultant",
  "Die Idee fühlt sich an wie der nächste logische Schritt nach Waschmaschine und Trockner.":
    "The idea feels like the next logical step after the washing machine and dryer.",
  Pilotkundin: "Pilot customer",
  "Lavidro Produktwelt": "The LAVIDRO product range",
  "Drei Systeme für einen vollständig autonomen Wäschealltag.":
    "Three systems for a fully autonomous laundry routine.",
  "Mobiler Wäscheassistent": "Mobile laundry assistant",
  "Integrierter Wäscheschrank": "Integrated laundry cabinet",
  Wäscheschrank: "Laundry cabinet",
  "Humanoider Wäschroboter": "Humanoid laundry robot",
  "Produkt anzeigen": "View product",
  "Design, das sich einfügt": "Design that fits in",
  "Eine ruhige Installation für moderne Wohnräume: präzise Technik, hochwertige Materialien und eine klare, wohnliche Formensprache.":
    "A calm installation for modern homes: precise technology, premium materials and a clear, homely design language.",
  "Qualität, die bleibt": "Quality that lasts",
  "Sortieren, Beladen, Entladen und Bereitstellen werden zu einem verlässlichen, wiederholbaren Kreislauf.":
    "Sorting, loading, unloading and making laundry available become a reliable, repeatable cycle.",
  "Präzision, die übernimmt": "Precision that takes over",
  "Sensorik und Robotik erkennen, greifen und bewegen Textilien mit abgestimmten Pflegeprofilen für den Alltag.":
    "Sensors and robotics identify, handle and move textiles with coordinated care profiles for everyday life.",
  "Individuelle Konfiguration": "Individual configuration",
  "Wäschepflege ganz nach Ihren Gewohnheiten.": "Laundry care tailored to your habits.",
  "Lavidro lernt, wie Ihr Haushalt Wäsche organisiert: welche Textilien besondere Pflege brauchen, welche Ablageorte wichtig sind und welche Routinen automatisch ablaufen sollen.":
    "LAVIDRO learns how your household organises laundry: which textiles need special care, which storage locations matter and which routines should run automatically.",
  "Zeitersparnis durch Lavidro": "Time savings with LAVIDRO",
  Automatisierungspotenzial: "Automation potential",
  "Bis zu": "Up to",
  "weniger Zeitaufwand": "less time spent",
  "Details anzeigen": "View details",
  "Module für Lavidro": "LAVIDRO modules",
  "Ein System. Vier Schritte. Ein Versprechen: freie Zeit.":
    "One system. Four steps. One promise: more free time.",
  Sortieren: "Sort",
  "Textilien werden nach Farbe, Material, Pflegebedarf und Haushaltslogik erkannt.":
    "Textiles are recognised by colour, material, care requirements and household routines.",
  Beladen: "Load",
  "Be- & Entladen": "Load & unload",
  "Der Roboterarm führt Kleidung präzise in Waschmaschine oder Trockner.":
    "The robotic arm precisely places garments into the washing machine or dryer.",
  "Der Roboterarm führt Kleidung präzise in und aus Waschmaschine oder Trockner.":
    "The robotic arm precisely loads and unloads the washing machine or dryer.",
  Entladen: "Unload",
  Falten: "Fold",
  "Bewegung, Timing und Griffstärke werden auf empfindliche Textilien abgestimmt.":
    "Movement, timing and grip strength are adapted to delicate textiles.",
  "Bewegung, Timing und Griffstärke werden auf empfindliche Textilien abgestimmt um die Wäsche präzise zu Falten":
    "Movement, timing and grip strength are adapted to fold laundry precisely while protecting delicate textiles.",
  Bereitstellen: "Make available",
  "Die fertige Wäsche wird geordnet übergeben, damit sie direkt griffbereit ist.":
    "Finished laundry is handed over in order, ready whenever you need it.",
  "Autonomie, die im Hintergrund arbeitet.": "Autonomy that works in the background.",
  "Lavidro verbindet mechanische Präzision mit intelligenten Pflegeentscheidungen. So wird aus einer wiederkehrenden Aufgabe ein ruhiger, automatisierter Ablauf.":
    "LAVIDRO combines mechanical precision with intelligent care decisions. A recurring chore becomes a calm, automated process.",
  "Einmal Lavidro, immer Lavidro": "Once LAVIDRO, always LAVIDRO",
  "Gute Gründe für ein autonomes Wäschesystem.": "Good reasons for an autonomous laundry system.",
  "Herausragende Innovation": "Outstanding innovation",
  "Robotik, Sensorik und Software arbeiten als ein geschlossenes Pflegesystem.":
    "Robotics, sensors and software work together as one integrated care system.",
  "Schonende Textilpflege": "Gentle textile care",
  "Adaptive Profile schützen empfindliche Kleidung und sorgen für wiederholbare Ergebnisse.":
    "Adaptive profiles protect delicate garments and ensure repeatable results.",
  "Spürbare Zeitersparnis": "Noticeable time savings",
  "Automatisierte Routinen reduzieren wiederkehrende Handgriffe und schaffen Freiraum im Alltag.":
    "Automated routines reduce repetitive tasks and free up time in everyday life.",
  "Zuverlässige Abläufe": "Reliable processes",
  "Sensorik, Timing und abgestimmte Prozesse sorgen bei jedem Durchlauf für konsistente Ergebnisse.":
    "Sensors, timing and coordinated processes ensure consistent results with every cycle.",
  "Erleben Sie LAVIDRO live.": "Experience LAVIDRO live.",
  "Erhalten Sie Einblicke in die Entwicklung und sichern Sie sich frühen Zugang, sobald Lavidro für erste Haushalte verfügbar wird.":
    "Get insights into our development and secure early access when LAVIDRO becomes available for first households.",
  "Art der Anfrage": "Request type",
  "Newsletter anmelden": "Join newsletter",
  "Erleben Sie LAVIDRO bei einer unverbindlichen Produktvorstellung digital oder vor Ort in Paderborn.":
    "Experience LAVIDRO in a non-binding product presentation, digitally or on site in Paderborn.",
  "Wir würden dich gerne zu einem unverbindlichen Interview remote oder vor Ort in Paderborn einladen.":
    "We would like to invite you to a non-binding interview, remotely or in Paderborn.",
  Name: "Name",
  "Ihr Name": "Your name",
  "E-Mail-Adresse": "Email address",
  "Was soll Lavidro zuerst für Sie übernehmen?": "What should LAVIDRO take over first?",
  "Bitte auswählen": "Please select",
  "Waschen und Trocknen": "Wash and dry",
  Zusammenlegen: "Fold laundry",
  "Den gesamten Prozess": "The complete process",
  Telefonnummer: "Phone number",
  "Wann passt es Ihnen zeitlich am besten?": "What time works best for you?",
  "z. B. werktags ab 18 Uhr oder samstags vormittags":
    "e.g. weekdays after 6 pm or Saturday mornings",
  "Ich stimme zu, Updates von Lavidro zu erhalten.": "I agree to receive updates from LAVIDRO.",
  "Jetzt eintragen": "Sign up now",
  "Häufig gestellte Fragen": "Frequently asked questions",
  "Welche Aufgaben übernimmt Lavidro?": "What tasks does LAVIDRO take over?",
  "Lavidro ist als System für Sortieren, Beladen, Entladen und Bereitstellen von Wäsche gedacht.":
    "LAVIDRO is designed as a system for sorting, loading, unloading and making laundry available.",
  "Ist Lavidro für private Haushalte vorgesehen?": "Is LAVIDRO designed for private households?",
  "Ja. Die Bildsprache und Systemidee zielen auf hochwertige Hauswirtschaftsräume in privaten Haushalten.":
    "Yes. The concept is aimed at premium utility rooms in private households.",
  "Wann wird Lavidro verfügbar?": "When will LAVIDRO be available?",
  "Mit Ihrer Anmeldung erfahren Sie zuerst von Entwicklungsfortschritten, Pilotphasen und Möglichkeiten, LAVIDRO live zu erleben.":
    "By signing up, you will be among the first to hear about development progress, pilot phases and opportunities to experience LAVIDRO live.",
  "Benötigt Lavidro spezielle Waschmaschinen oder Trockner?":
    "Does LAVIDRO require special washing machines or dryers?",
  "Das System ist für die Zusammenarbeit mit vielen gängigen Frontladern geplant. Die konkrete Kompatibilität wird vor der Installation geprüft.":
    "The system is planned to work with many common front-loading appliances. Specific compatibility is checked before installation.",
  "Wie sicher ist das System im Haushalt?": "How safe is the system at home?",
  "Sensoren überwachen Arbeitsbereich, Bewegung und Kontakt. Bei einer unerwarteten Situation stoppt das System automatisch.":
    "Sensors monitor the work area, movement and contact. The system stops automatically in an unexpected situation.",
  "Wie behandelt Lavidro empfindliche Textilien?": "How does LAVIDRO handle delicate textiles?",
  "Pflegeprofile berücksichtigen Material, Griffstärke und Bewegungsablauf, damit sensible Kleidungsstücke besonders schonend gehandhabt werden.":
    "Care profiles consider material, grip strength and movement so delicate garments are handled especially gently.",
  "Kann Lavidro in einem bestehenden Hauswirtschaftsraum nachgerüstet werden?":
    "Can LAVIDRO be retrofitted into an existing utility room?",
  "Eine Nachrüstung ist grundsätzlich vorgesehen. Platz, Anschlüsse und Bewegungsbereich werden vorab individuell geprüft.":
    "Retrofitting is generally planned. Space, connections and the movement area are assessed individually in advance.",
  "Welche Wartung ist erforderlich?": "What maintenance is required?",
  "Regelmäßige Systemdiagnosen laufen automatisch. Mechanische Komponenten werden im Rahmen eines planbaren Serviceintervalls geprüft.":
    "Regular system diagnostics run automatically. Mechanical components are checked as part of a planned service interval.",
  "Alle Rechte vorbehalten.": "All rights reserved.",
  "© 2026 Lavidro. Alle Rechte vorbehalten.": "© 2026 Lavidro. All rights reserved.",
  Impressum: "Legal notice",
  Datenschutz: "Privacy policy",
  Kontakt: "Contact",
  "Cookie-Einstellungen": "Cookie settings",
  "Über uns": "About us",
  "Das Team von LAVIDRO": "The LAVIDRO team",
  "Gemeinsam für automatisierte Wäschepflege.": "Together for automated laundry care.",
  "Das Team hinter LAVIDRO": "The team behind LAVIDRO",
  "Drei Gründer. Eine gemeinsame Mission.": "Three founders. One shared mission.",
  Gründer: "Founder",
  "Das Team von LAVIDRO entwickelt das erste System, das den vollständigen Wäscheprozess nach Ihren Gewohnheiten autonom und qualitätssicher übernimmt.":
    "The LAVIDRO team is developing the first system that autonomously and reliably handles the complete laundry process according to your habits.",
  "Unser Arbeitsplatz": "Our workplace",
  "Garage33, Gründungszentrum der Universität Paderborn.":
    "Garage33, the University of Paderborn's start-up centre.",
  "Start-up Campus OWL": "OWL start-up campus",
  "Raum für Entwicklung und Austausch": "Space for development and exchange",
  "Garage33, Universität Paderborn": "Garage33, University of Paderborn",
  "Unsere Partner": "Our partners",
  "Gemeinsam bringen wir LAVIDRO voran.": "Together, we move LAVIDRO forward.",
  Industriepartner: "Industry partner",
  Forschungspartner: "Research partner",
  Gründungspartner: "Founding partner",
  Produktvorschau: "Product preview",
  "Zurück zu den Produkten": "Back to products",
  "LAVIDRO Mobile konfigurieren": "Configure LAVIDRO Mobile",
  "Lavidro Cabinet konfigurieren": "Configure Lavidro Cabinet",
  "LAVIDRO One konfigurieren": "Configure LAVIDRO One",
  konfigurieren: "configure",
  Konfigurieren: "Configure",
  Variante: "Variant",
  Funktionsumfang: "Features",
  Vorbestellen: "Pre-order",
  Vergleichen: "Compare",
  Vergleich: "Comparison",
  "Welche Lavidro Lösung passt zu Ihnen?": "Which LAVIDRO solution is right for you?",
  "Vergleich schließen": "Close comparison",
  "Wäsche im Haus einsammeln": "Collect laundry in the home",
  "Wäsche sortieren": "Sort laundry",
  "Wäsche waschen & trocknen": "Wash & dry laundry",
  "Wäsche falten": "Fold laundry",
  "Wäsche bereitstellen": "Make laundry available",
  "Wäsche in den Schrank bringen": "Put laundry away",
  "Der flexible Einstieg in die automatisierte Wäschepflege":
    "A flexible entry into automated laundry care",
  "Mehr Automatisierung für den vollständigen Ablauf": "More automation for the complete process",
  "Planungsrichtwert ab 3 m² Fläche": "Planning guideline from 3 m² of space",
  "Planungsrichtwert ab 5 m² Fläche": "Planning guideline from 5 m² of space",
  "Umfangreiche Funktionen": "Extensive features",
  "Voller Funktionsumfang": "Full feature set",
  "Roboterarm auf fahrbarer Basis statt fest montierter Lösung":
    "Robotic arm on a mobile base instead of a fixed installation",
  "Flexibel im Hauswirtschaftsraum positionierbar": "Flexible positioning in the utility room",
  "Automatisiert den Ablauf zwischen Wäsche, Maschinen und Ablage":
    "Automates the flow between laundry, appliances and storage",
  "Integrierter Wäscheschrank mit intelligenter Robotik":
    "Integrated laundry cabinet with intelligent robotics",
  "Diskret integriert mit elegantem Möbeldesign":
    "Discreetly integrated with elegant furniture design",
  "Planungsrichtwert: ab 3 m² bis 5 m² Fläche": "Planning guideline: from 3 m² to 5 m² of space",
  "Übernimmt die gesamte Wäscheorganisation": "Handles the entire laundry organisation",
  "Erkennt anfallende Wäsche eigenständig": "Independently detects laundry that needs attention",
  "Führt den Prozess aus und räumt Kleidung zurück":
    "Carries out the process and puts garments away",
  "Ein mobiler Roboterarm auf fahrbarer Basis für automatisierte Wäschepflege. Er wird flexibel im Hauswirtschaftsraum positioniert und verbindet die Stationen des Wäschealltags.":
    "A mobile robotic arm on a wheeled base for automated laundry care. It can be positioned flexibly in the utility room and connects the stations of the laundry routine.",
  "Vollautomatischer Wäscheschrank mit intelligenter Robotik, diskret integriert und für den Prozess vom Sortieren bis zur bereitgestellten Kleidung konzipiert.":
    "A fully automated laundry cabinet with intelligent robotics, discreetly integrated and designed for the process from sorting to ready-to-wear clothing.",
  "Die umfassende Lösung für die vollständige Wäscheorganisation – vom Erkennen über die Pflege bis zum Bereitstellen der Kleidung.":
    "The comprehensive solution for complete laundry organisation – from recognising laundry to care and making garments available.",
  "Vorbestellung eingegangen": "Pre-order received",
  "Heute ist Ihre Vorbestellung bei uns eingegangen.": "We have received your pre-order today.",
  "Vorbestellung bestätigt": "Pre-order confirmed",
  "Wir begleiten Sie transparent auf dem Weg zu Ihrem LAVIDRO System.":
    "We will guide you transparently on the way to your LAVIDRO system.",
  Schließen: "Close",
  vormerken: "reserve",
  "Vorbestellung absenden": "Submit pre-order",
  "Mit Ihren Angaben sichern Sie sich den aktuellen Vorbestellungsstatus.":
    "With your details, you secure the current pre-order status.",
  "In etwa 3 Monaten": "In around 3 months",
  "Weitere Produktinformationen": "Further product information",
  "Wir teilen den aktuellen Entwicklungsstand und die nächsten Schritte mit Ihnen.":
    "We will share the current development status and next steps with you.",
  "In etwa 6 Monaten": "In around 6 months",
  "Auslieferung und Installation": "Delivery and installation",
  "Sie erhalten ein konkretes Update zum voraussichtlichen Liefertermin.":
    "You will receive a specific update on the expected delivery date.",
  "Wir verwenden Cookies": "We use cookies",
  "Notwendige Cookies sorgen dafür, dass diese Website zuverlässig funktioniert. Mit Ihrer Zustimmung verwenden wir außerdem First-Party-Analytics, um zu verstehen, welche LAVIDRO-Produkte und Konfigurationen besonders relevant sind.":
    "Necessary cookies ensure that this website works reliably. With your consent, we also use first-party analytics to understand which LAVIDRO products and configurations are most relevant.",
  Einstellungen: "Settings",
  "Nur notwendige": "Necessary only",
  "Alle akzeptieren": "Accept all",
  "Immer aktiv": "Always active",
  Notwendig: "Necessary",
  Analyse: "Analytics",
  "Speichert Ihre Cookie-Auswahl und ermöglicht technisch notwendige Funktionen.":
    "Saves your cookie choice and enables technically necessary functions.",
  "Analyse-Cookies aktivieren": "Enable analytics cookies",
  "Hilft uns zu verstehen, welche Seiten, Produkte und Konfigurationen genutzt werden.":
    "Helps us understand which pages, products and configurations are used.",
  "Auswahl speichern": "Save selection",
  "Bitte geben Sie eine gültige E-Mail-Adresse ein.": "Please enter a valid email address.",
  "Bitte stimmen Sie der Zusendung von Updates zu.": "Please agree to receive updates.",
  "Wird eingetragen …": "Signing up...",
  "Danke. Wir melden uns, um Ihre LAVIDRO-Produktvorstellung abzustimmen.":
    "Thank you. We will contact you to arrange your LAVIDRO product presentation.",
  "Danke. Sie erhalten künftig Neuigkeiten von LAVIDRO.":
    "Thank you. You will now receive news from LAVIDRO.",
  "Die Eintragung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.":
    "Your sign-up could not be saved. Please try again.",
  "Schreib uns": "Write to us",
  "Hast du Fragen, Anregungen oder möchtest mit uns zusammenarbeiten? Wir freuen uns auf deine Nachricht.":
    "Do you have questions, suggestions or would you like to work with us? We look forward to hearing from you.",
  Betreff: "Subject",
  Nachricht: "Message",
  "Nachricht senden": "Send message",
  "Wird gesendet…": "Sending...",
  "Nachricht gesendet.": "Message sent.",
  "Danke für deine Nachricht. Wir melden uns so bald wie möglich bei dir.":
    "Thank you for your message. We will get back to you as soon as possible.",
  "Seite nicht gefunden": "Page not found",
  "Die gesuchte Seite existiert nicht oder wurde verschoben.":
    "The page you requested does not exist or has been moved.",
  "Zur Startseite": "Back to home",
  "Lavidro Startseite": "LAVIDRO home",
  Hauptnavigation: "Main navigation",
  "Lavidro Produkte entdecken": "Discover LAVIDRO products",
  "Stimmen zu Lavidro": "Voices on LAVIDRO",
  "Lavidro Vorteile": "LAVIDRO benefits",
  "LAVIDRO Mobile anzeigen": "View LAVIDRO Mobile",
  "Lavidro Cabinet anzeigen": "View Lavidro Cabinet",
  "LAVIDRO One anzeigen": "View LAVIDRO One",
  "LAVIDRO Mobile als Roboterarm auf fahrbarer Basis":
    "LAVIDRO Mobile as a robotic arm on a mobile base",
  "Integrierter Lavidro Wäscheschrank im Hauswirtschaftsraum":
    "Integrated LAVIDRO laundry cabinet in a utility room",
  "Humanoider LAVIDRO Roboter im Hauswirtschaftsraum": "Humanoid LAVIDRO robot in a utility room",
  "Lavidro System in einer wohnlichen Waschküche": "LAVIDRO system in a homely laundry room",
  "Roboterarm bei der sorgfältigen Wäschepflege": "Robotic arm performing careful laundry care",
  "Roboterarm beim Beladen einer Waschmaschine": "Robotic arm loading a washing machine",
  "Lavidro Roboterarm im Einsatz": "LAVIDRO robotic arm in action",
  "Garage33 Start-up Campus in Paderborn": "Garage33 start-up campus in Paderborn",
  "Außenansicht des Garage33 Start-up Campus": "Exterior view of the Garage33 start-up campus",
  "Innenbereich der Garage33": "Inside Garage33",
  "Garage33 Start-up Campus OWL Schild": "Garage33 start-up campus OWL sign",
  "LAVIDRO Produktvorschau": "LAVIDRO product preview",
  Konfiguration: "Configuration",
};

const german = Object.fromEntries(Object.entries(english).map(([de, en]) => [en, de]));

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function translateText(value: string, locale: Locale) {
  const original = compact(value);
  const translated = (locale === "en" ? english : german)[original];
  if (!translated) return value;

  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

function translateDom(root: ParentNode, locale: Locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const translated = translateText(node.nodeValue ?? "", locale);
    if (translated !== node.nodeValue) node.nodeValue = translated;
  });

  const elements =
    root instanceof Element ? [root, ...root.querySelectorAll("*")] : root.querySelectorAll("*");
  elements.forEach((element) => {
    ["aria-label", "alt", "placeholder", "title"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;
      const translated = translateText(value, locale);
      if (translated !== value) element.setAttribute(attribute, translated);
    });
  });
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("de");
  const previousLocale = useRef<Locale>("de");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "de") setLocale(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);

    // The server already renders German. Mutating that markup during hydration
    // makes React compare against a moving DOM and produces hydration errors.
    if (locale === "en" || previousLocale.current === "en") {
      translateDom(document.body, locale);
    }
    previousLocale.current = locale;
    window.dispatchEvent(new CustomEvent("lavidro:language-change", { detail: locale }));

    if (locale !== "en") return;

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element || node instanceof DocumentFragment)
            translateDom(node, locale);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const next = locale === "de" ? "en" : "de";
  return (
    <button
      className="language-switcher"
      type="button"
      onClick={() => setLocale(next)}
      aria-label={locale === "de" ? "Switch to English" : "Auf Deutsch wechseln"}
      title={locale === "de" ? "Switch to English" : "Auf Deutsch wechseln"}
    >
      <Globe2 aria-hidden="true" size={16} strokeWidth={1.8} />
      <span>{locale.toUpperCase()}</span>
    </button>
  );
}

export function LanguageSlot() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.querySelector<HTMLElement>("[data-language-slot]"));
  }, []);

  return slot ? createPortal(<LanguageSwitcher />, slot) : null;
}
