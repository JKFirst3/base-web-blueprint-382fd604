import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { readConsent, writeConsent } from "@/lib/consent";

type View = "hidden" | "banner" | "settings";

export function CookieBanner() {
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState(false);
  const [hasChoice, setHasChoice] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setHasChoice(Boolean(existing));
    const legalPage = /^\/(datenschutz|impressum)\/?$/.test(window.location.pathname);
    if (!existing && !legalPage) setView("banner");
    setAnalytics(existing?.analytics ?? false);

    const openHandler = () => {
      const c = readConsent();
      setHasChoice(Boolean(c));
      setAnalytics(c?.analytics ?? false);
      setView("settings");
    };
    window.addEventListener("lavidro:open-consent", openHandler);
    return () => window.removeEventListener("lavidro:open-consent", openHandler);
  }, []);

  const acceptAll = () => {
    setHasChoice(true);
    writeConsent(true);
    setAnalytics(true);
    setView("hidden");
  };
  const acceptNecessary = () => {
    setHasChoice(true);
    writeConsent(false);
    setAnalytics(false);
    setView("hidden");
  };
  const saveSelection = () => {
    setHasChoice(true);
    writeConsent(analytics);
    setView("hidden");
  };

  if (view === "hidden") return null;

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && hasChoice) setView("hidden");
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/35" />
        {view === "banner" && (
          <Dialog.Content
            aria-describedby="lv-cookie-description"
            onEscapeKeyDown={(e) => {
              if (!hasChoice) e.preventDefault();
            }}
            onInteractOutside={(e) => e.preventDefault()}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              document.getElementById("lv-cookie-title")?.focus();
            }}
            className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-[110] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain focus:outline-none sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-4 text-black shadow-2xl sm:p-5">
              <Dialog.Title
                tabIndex={-1}
                id="lv-cookie-title"
                className="text-base font-semibold sm:text-lg"
              >
                Ihre Cookie-Auswahl
              </Dialog.Title>
              <Dialog.Description
                id="lv-cookie-description"
                className="mt-2 text-sm leading-relaxed text-black/80"
              >
                Wir speichern Ihre Cookie-Auswahl. Mit Ihrer Zustimmung analysiert PostHog pseudonym
                die Nutzung und das Produktinteresse, um Lavidro zu verbessern. Die Analyse ist
                freiwillig und jederzeit widerrufbar.
              </Dialog.Description>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={acceptNecessary}
                  className="min-h-11 rounded-full bg-black px-3 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  Nur notwendige
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="min-h-11 rounded-full bg-black px-3 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  Alle akzeptieren
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setView("settings")}
                  className="min-h-11 text-xs underline underline-offset-4"
                >
                  Einstellungen
                </button>
                <div className="flex gap-3 text-xs">
                  <a
                    href="/datenschutz"
                    className="inline-flex min-h-11 items-center underline underline-offset-4"
                  >
                    Datenschutz
                  </a>
                  <a
                    href="/impressum"
                    className="inline-flex min-h-11 items-center underline underline-offset-4"
                  >
                    Impressum
                  </a>
                </div>
              </div>
            </div>
          </Dialog.Content>
        )}

        {view === "settings" && (
          <Dialog.Content
            aria-describedby={undefined}
            onEscapeKeyDown={(e) => {
              if (!hasChoice) {
                e.preventDefault();
                setView("banner");
              }
            }}
            onInteractOutside={(e) => e.preventDefault()}
            className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-[110] max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl bg-white p-4 text-black shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title id="lv-cookie-settings-title" className="text-lg font-semibold">
                Cookie-Einstellungen
              </Dialog.Title>
              <button
                type="button"
                aria-label={hasChoice ? "Schließen" : "Zurück zur Cookie-Auswahl"}
                onClick={() => setView(hasChoice ? "hidden" : "banner")}
                className="min-h-11 min-w-11 rounded-full p-1 text-black/60 hover:bg-black/5 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold">Notwendig</h3>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/70">
                    Immer aktiv
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/70">
                  Speichert Ihre Cookie-Auswahl und ermöglicht technisch notwendige Funktionen.
                </p>
              </div>

              <div className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold">Analyse</h3>
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <span className="sr-only">Analyse-Cookies aktivieren</span>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="relative inline-block h-6 w-11 rounded-full bg-black/15 transition peer-checked:bg-black peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-2">
                      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                    </span>
                  </label>
                </div>
                <p className="mt-2 text-sm text-black/70">
                  Pseudonyme Nutzungsanalyse mit PostHog, nur nach Ihrer Einwilligung: fünf
                  Ereignisse zum Kaufinteresse inklusive der Wahl zwischen Kaufpreis und Abo sowie
                  die sichtbare Aufenthaltsdauer je Seite. Bei gekennzeichneten Anzeigenlinks gehört
                  dazu auch die fest vorgegebene Kampagnenkennung. Beim Absenden werden nur
                  Haushaltsgröße, eine fest vorgegebene Mehrwert-Kategorie und die Angabe, ob ein
                  Jobtitel ausgefüllt wurde, ausgewertet. Keine Namen, E-Mail-Adressen oder
                  Freitexte. Jederzeit widerrufbar.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={acceptNecessary}
                className="min-h-11 rounded-full bg-black px-3 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="min-h-11 rounded-full bg-black px-3 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Alle akzeptieren
              </button>
              <button
                type="button"
                onClick={saveSelection}
                className="min-h-11 rounded-full bg-black px-3 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Auswahl speichern
              </button>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <a href="/datenschutz" className="inline-flex min-h-11 items-center underline">
                Datenschutz
              </a>
              <a href="/impressum" className="inline-flex min-h-11 items-center underline">
                Impressum
              </a>
            </div>
          </Dialog.Content>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
