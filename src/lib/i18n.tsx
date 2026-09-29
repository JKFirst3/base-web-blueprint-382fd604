import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Globe2 } from "lucide-react";

export type Locale = "de" | "en";

const STORAGE_KEY = "lavidro-locale";

const english: Record<string, string> = {
  "Lavidro live erleben": "Experience Lavidro live",
  "Über Lavidro": "About Lavidro",
  Produkte: "Products",
  Qualität: "Quality",
  Entdecken: "Discover",
  "Die Evolution der Wäschepflege": "The evolution of laundry care",
  "Wäsche.": "Laundry.",
  "Einfach.": "Simply.",
  "Fertig.": "Done.",
  '"Es ist ein unglaubliches Gefühl, dass ich mich um die Wäsche einfach nicht mehr kümmern muss. Lavidro erledigt alles im Hintergrund, während ich mich den Dingen widme, die mir wirklich wichtig sind."':
    '"It is an incredible feeling not having to worry about the laundry anymore. Lavidro takes care of everything in the background while I focus on the things that truly matter to me."',
  '"Besonders gefällt mir das elegante Design des Wäscheschranks. Außerdem muss ich mir keine Sorgen um meine Kinder oder unsere Katze machen, da sich keine Maschine durch das Haus bewegt."':
    '"I especially love the elegant design of the laundry cabinet. I also do not have to worry about my children or our cat because no machine moves through the house."',
  "Mutter und Katzenhalterin": "Mother and cat owner",
  '"Seit wir Lavidro nutzen, hat sich unser Alltag spürbar verändert. Ich spare jede Woche viele Stunden und kann diese Zeit endlich mit meiner Familie verbringen, statt mich um die Wäsche zu kümmern."':
    '"Since we started using Lavidro, our everyday life has changed noticeably. I save many hours every week and can finally spend that time with my family instead of taking care of the laundry."',
  Familienvater: "Father",
  '"Dank Lavidro kann meine Mutter deutlich länger selbstständig in ihrem Zuhause leben. Das gibt ihr und unserer ganzen Familie ein gutes Gefühl."':
    '"Thanks to Lavidro, my mother can continue living independently in her own home for much longer. That gives her and our entire family peace of mind."',
  Angehörige: "Family member",
  '"Für uns kommt eine Haushaltshilfe nicht infrage. Ein automatisiertes Wäschesystem wie Lavidro ist die ideale Alternative, weil es uns zuverlässig im Alltag entlastet und gleichzeitig unsere Privatsphäre bewahrt."':
    '"Hiring domestic help is not an option for us. An automated laundry system like Lavidro is the ideal alternative because it reliably makes everyday life easier while preserving our privacy."',
  Unternehmerin: "Entrepreneur",
  Pilotkundin: "Pilot customer",
  "Lavidro Produktwelt": "The Lavidro product range",
  "Drei Systeme für einen vollständig autonomen Wäschealltag.":
    "Three systems for a fully autonomous laundry routine.",
  "Mobiler Wäscheassistent": "Mobile laundry assistant",
  "Einzelteilbehandlung im Schrank": "Single-garment care inside the cabinet",
  "Einzelne Wäscheaufbereitung": "Individual garment care",
  "Lavidro One anzeigen": "View Lavidro One",
  "Lavidro One mit Roboterarm zur Fleckenbehandlung im Schrank":
    "Lavidro One with a robotic arm treating stains inside the cabinet",
  "Flecken gezielt behandeln": "Targeted stain treatment",
  "Kleidungsstücke auffrischen": "Refresh garments",
  "Integrierter Wäscheschrank": "Integrated laundry cabinet",
  Wäscheschrank: "Laundry cabinet",
  "Autonomer Wäscheschrank": "Autonomous laundry cabinet",
  "Autonomer Lavidro Wäscheschrank im Hauswirtschaftsraum": "Autonomous Lavidro laundry cabinet in a utility room",
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
    "Lavidro learns how your household organises laundry: which textiles need special care, which storage locations matter and which routines should run automatically.",
  "Zeitersparnis durch Lavidro": "Time savings with Lavidro",
  Automatisierungspotenzial: "Automation potential",
  "Bis zu": "Up to",
  "weniger Zeitaufwand": "less time spent",
  "Details anzeigen": "View details",
  "Module für Lavidro": "Lavidro modules",
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
    "Lavidro combines mechanical precision with intelligent care decisions. A recurring chore becomes a calm, automated process.",
  "Einmal Lavidro, immer Lavidro": "Once Lavidro, always Lavidro",
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
  "Erleben Sie Lavidro live.": "Experience Lavidro live.",
  "Entwicklungsupdates von Lavidro.": "Development updates from Lavidro.",
  "Mit Ihrer Newsletter-Anmeldung erfahren Sie zuerst von Entwicklungsfortschritten und Pilotphasen.":
    "By subscribing to the newsletter, you will be among the first to hear about development progress and pilot phases.",
  "Erhalten Sie Einblicke in die Entwicklung und sichern Sie sich frühen Zugang, sobald Lavidro für erste Haushalte verfügbar wird.":
    "Get insights into our development and secure early access when Lavidro becomes available for first households.",
  "Art der Anfrage": "Request type",
  "Newsletter anmelden": "Join newsletter",
  "Erleben Sie Lavidro bei einer unverbindlichen Produktvorstellung digital oder vor Ort in Paderborn.":
    "Experience Lavidro in a non-binding product presentation, digitally or on site in Paderborn.",
  "Wir würden dich gerne zu einem unverbindlichen Interview remote oder vor Ort in Paderborn einladen.":
    "We would like to invite you to a non-binding interview, remotely or in Paderborn.",
  Name: "Name",
  "Ihr Name": "Your name",
  "E-Mail-Adresse": "Email address",
  "Was soll Lavidro zuerst für Sie übernehmen?": "What should Lavidro take over first?",
  "Bitte auswählen": "Please select",
  "Waschen und Trocknen": "Wash and dry",
  Zusammenlegen: "Fold laundry",
  "Den gesamten Prozess": "The complete process",
  Telefonnummer: "Phone number",
  "Wann passt es Ihnen zeitlich am besten?": "What time works best for you?",
  "z. B. werktags ab 18 Uhr oder samstags vormittags":
    "e.g. weekdays after 6 pm or Saturday mornings",
  "Ich stimme zu, Updates von Lavidro zu erhalten.": "I agree to receive updates from Lavidro.",
  "Jetzt eintragen": "Sign up now",
  "Häufig gestellte Fragen": "Frequently asked questions",
  "Welche Aufgaben übernimmt Lavidro?": "What tasks does Lavidro take over?",
  "Lavidro ist als System für Sortieren, Beladen, Entladen und Bereitstellen von Wäsche gedacht.":
    "Lavidro is designed as a system for sorting, loading, unloading and making laundry available.",
  "Ist Lavidro für private Haushalte vorgesehen?": "Is Lavidro designed for private households?",
  "Ja. Die Bildsprache und Systemidee zielen auf hochwertige Hauswirtschaftsräume in privaten Haushalten.":
    "Yes. The concept is aimed at premium utility rooms in private households.",
  "Wann wird Lavidro verfügbar?": "When will Lavidro be available?",
  "Mit Ihrer Anmeldung erfahren Sie zuerst von Entwicklungsfortschritten, Pilotphasen und Möglichkeiten, Lavidro live zu erleben.":
    "By signing up, you will be among the first to hear about development progress, pilot phases and opportunities to experience Lavidro live.",
  "Benötigt Lavidro spezielle Waschmaschinen oder Trockner?":
    "Does Lavidro require special washing machines or dryers?",
  "Das System ist für die Zusammenarbeit mit vielen gängigen Frontladern geplant. Die konkrete Kompatibilität wird vor der Installation geprüft.":
    "The system is planned to work with many common front-loading appliances. Specific compatibility is checked before installation.",
  "Wie sicher ist das System im Haushalt?": "How safe is the system at home?",
  "Sensoren überwachen Arbeitsbereich, Bewegung und Kontakt. Bei einer unerwarteten Situation stoppt das System automatisch.":
    "Sensors monitor the work area, movement and contact. The system stops automatically in an unexpected situation.",
  "Wie behandelt Lavidro empfindliche Textilien?": "How does Lavidro handle delicate textiles?",
  "Pflegeprofile berücksichtigen Material, Griffstärke und Bewegungsablauf, damit sensible Kleidungsstücke besonders schonend gehandhabt werden.":
    "Care profiles consider material, grip strength and movement so delicate garments are handled especially gently.",
  "Kann Lavidro in einem bestehenden Hauswirtschaftsraum nachgerüstet werden?":
    "Can Lavidro be retrofitted into an existing utility room?",
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
  "Das Team von Lavidro": "The Lavidro team",
  "Gemeinsam für automatisierte Wäschepflege.": "Together for automated laundry care.",
  "Das Team hinter Lavidro": "The team behind Lavidro",
  "Drei Gründer. Eine gemeinsame Mission.": "Three founders. One shared mission.",
  Gründer: "Founder",
  "Das Team von Lavidro entwickelt das erste System, das den vollständigen Wäscheprozess nach Ihren Gewohnheiten autonom und qualitätssicher übernimmt.":
    "The Lavidro team is developing the first system that autonomously and reliably handles the complete laundry process according to your habits.",
  "Unser Arbeitsplatz": "Our workplace",
  "Garage33, Gründungszentrum der Universität Paderborn.":
    "Garage33, the University of Paderborn's start-up centre.",
  "Start-up Campus OWL": "OWL start-up campus",
  "Raum für Entwicklung und Austausch": "Space for development and exchange",
  "Garage33, Universität Paderborn": "Garage33, University of Paderborn",
  "Unsere Partner": "Our partners",
  "Gemeinsam bringen wir Lavidro voran.": "Together, we move Lavidro forward.",
  Industriepartner: "Industry partner",
  Forschungspartner: "Research partner",
  Gründungspartner: "Founding partner",
  Produktvorschau: "Product preview",
  Produktdetails: "Product details",
  "Zurück zu den Produkten": "Back to products",
  Variante: "Variant",
  Funktionsumfang: "Features",
  Anfragen: "Request",
  "Wäsche. Einfach. Fertig.": "Laundry. Simply. Done.",
  "Dreckige Wäsche dem System geben und saubere, gefaltete Wäsche zurückbekommen.": "Hand dirty laundry to the system and get clean, folded laundry back.",
  "Bereitet Ihre schönsten Wäschestücke wieder auf – ganz ohne Waschen.": "Refreshes your favourite garments – without washing.",
  "Entwicklungsziel: 99 % der Bakterien und Gerüche entfernen – Wirksamkeit noch nicht nachgewiesen.": "Development goal: remove 99% of bacteria and odours – effectiveness not yet proven.",
  "In Entwicklung · Marktstart geplant 2027": "In development · Market launch planned for 2027",
  "Voraussichtliche, unverbindliche Preisindikation": "Estimated, non-binding price indication",
  Kaufpreis: "Purchase price",
  "Monatlicher Betrag": "Monthly amount",
  "Monatlicher Beitrag (Abo)": "Monthly subscription",
  "Bezahlart": "Payment option",
  "Inkl. 19 % MwSt. und Versand. Preise können sich bis zu einem späteren Angebot ändern. Keine Zahlungspflicht durch die Anfrage.":
    "Including 19% VAT and shipping. Prices may change before a future offer. Your request does not create a payment obligation.",
  Vergleichen: "Compare",
  Vergleich: "Comparison",
  "Welche Lavidro Lösung passt zu Ihnen?": "Which Lavidro solution is right for you?",
  "Vergleich schließen": "Close comparison",
  "Wäsche im Haus einsammeln": "Collect laundry in the home",
  "Wäsche sortieren": "Sort laundry",
  "Wäsche waschen & trocknen": "Wash & dry laundry",
  "Wäsche falten": "Fold laundry",
  "Wäsche nach Personen bereitstellen": "Provide laundry per person",
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
  "Ein mobiler Roboterarm auf fahrbarer Basis für automatisierte Wäschepflege. Er wird flexibel im Hauswirtschaftsraum positioniert und verbindet die Stationen des Wäschealltags.":
    "A mobile robotic arm on a wheeled base for automated laundry care. It can be positioned flexibly in the utility room and connects the stations of the laundry routine.",
  "Vollautomatischer Wäscheschrank mit intelligenter Robotik, diskret integriert und für den Prozess vom Sortieren bis zur bereitgestellten Kleidung konzipiert.":
    "A fully automated laundry cabinet with intelligent robotics, discreetly integrated and designed for the process from sorting to ready-to-wear clothing.",
  Schließen: "Close",
  "Während der Entwicklung": "During development",
  "Anfrage eingegangen": "Request received",
  "Ihre unverbindliche Anfrage ist bei uns eingegangen.": "We have received your non-binding request.",
  "In Entwicklung · Marktstart geplant 2027. Wir prüfen Ihre Anfrage und informieren Sie über die nächsten Schritte dazu.": "In development · Market launch planned for 2027. We will review your request and tell you about the next steps.",
  "Unverbindliche Anfrage": "Non-binding request",
  "Anfrage absenden": "Send request",
  "Bearbeitung der Anfrage": "Processing your request",
  "Wir informieren Sie bei Bedarf über die nächsten Schritte Ihrer Anfrage.": "We will let you know about the next steps of your request as needed.",
  "Ihre Anfrage ist unverbindlich und löst keine Zahlungspflicht aus.": "Your request is non-binding and does not create a payment obligation.",
  "Wie sieht Ihr Haushalt aus? (freiwillig)": "How many people live in your household? (optional)",
  "1 Person": "1 person",
  "2 Personen": "2 people",
  "3–4 Personen": "3–4 people",
  "5 oder mehr Personen": "5 or more people",
  "Ihr Jobtitel (freiwillig)": "Your job title (optional)",
  "Was wäre für Sie der größte Mehrwert von Lavidro? (freiwillig)": "What would be Lavidro's greatest benefit to you? (optional)",
  "Weniger Zeit für Wäsche aufwenden": "Spend less time on laundry",
  "Wiederkehrende Hausarbeit reduzieren": "Reduce repetitive housework",
  "Möglichst lange selbständig im eigenen Zuhause leben": "Live independently at home for as long as possible",
  "Weniger Abhängigkeit von Haushaltshilfen": "Rely less on household help",
  "Schonender und zuverlässigere Textilpflege": "Gentler and more reliable garment care",
  Sonstige: "Other",
  "Sonstige – bitte erläutern": "Other – please specify",
  Ausblick: "Outlook",
  "Marktstart geplant 2027": "Market launch planned for 2027",
  "Ein verbindliches Angebot oder ein Liefertermin ist damit nicht verbunden.":
    "This does not constitute a binding offer or delivery date.",
  "Wir verwenden Cookies": "We use cookies",
  "Notwendige Cookies sorgen dafür, dass diese Website zuverlässig funktioniert. Mit Ihrer Zustimmung verwenden wir außerdem First-Party-Analytics, um zu verstehen, welche Lavidro-Produkte und Konfigurationen besonders relevant sind.":
    "Necessary cookies ensure that this website works reliably. With your consent, we also use first-party analytics to understand which Lavidro products and configurations are most relevant.",
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
  "Danke. Wir melden uns, um Ihre Lavidro-Produktvorstellung abzustimmen.":
    "Thank you. We will contact you to arrange your Lavidro product presentation.",
  "Danke. Sie erhalten künftig Neuigkeiten von Lavidro.":
    "Thank you. You will now receive news from Lavidro.",
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
  "Lavidro Startseite": "Lavidro home",
  Hauptnavigation: "Main navigation",
  "Lavidro Produkte entdecken": "Discover Lavidro products",
  "Stimmen zu Lavidro": "Voices on Lavidro",
  "Lavidro Vorteile": "Lavidro benefits",
  "Lavidro Mobile anzeigen": "View Lavidro Mobile",
  "Lavidro Cabinet anzeigen": "View Lavidro Cabinet",
  "Lavidro Mobile als humanoider Wäscheroboter": "Lavidro Mobile as a humanoid laundry robot",
  "Integrierter Lavidro Wäscheschrank im Hauswirtschaftsraum":
    "Integrated Lavidro laundry cabinet in a utility room",
  "Lavidro System in einer wohnlichen Waschküche": "Lavidro system in a homely laundry room",
  "Roboterarm bei der sorgfältigen Wäschepflege": "Robotic arm performing careful laundry care",
  "Roboterarm beim Beladen einer Waschmaschine": "Robotic arm loading a washing machine",
  "Lavidro Roboterarm im Einsatz": "Lavidro robotic arm in action",
  "Garage33 Start-up Campus in Paderborn": "Garage33 start-up campus in Paderborn",
  "Außenansicht des Garage33 Start-up Campus": "Exterior view of the Garage33 start-up campus",
  "Innenbereich der Garage33": "Inside Garage33",
  "Garage33 Start-up Campus OWL Schild": "Garage33 start-up campus OWL sign",
  "Lavidro Produktvorschau": "Lavidro product preview",
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
