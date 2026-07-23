import { useEffect, useRef, useState } from "react";
import { readConsent, writeConsent } from "@/lib/consent";

type View = "hidden" | "banner" | "settings";

export function CookieBanner() {
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) setView("banner");
    setAnalytics(existing?.analytics ?? false);

    const openHandler = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? false);
      setView("settings");
    };
    window.addEventListener("lavidro:open-consent", openHandler);
    return () => window.removeEventListener("lavidro:open-consent", openHandler);
  }, []);

  useEffect(() => {
    if (view !== "settings") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setView("hidden");
    };
    document.addEventListener("keydown", onKey);
    // focus first control
    dialogRef.current?.querySelector<HTMLElement>("button, [href], input, [tabindex]")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [view]);

  const acceptAll = () => {
    writeConsent(true);
    setAnalytics(true);
    setView("hidden");
  };
  const acceptNecessary = () => {
    writeConsent(false);
    setAnalytics(false);
    setView("hidden");
  };
  const saveSelection = () => {
    writeConsent(analytics);
    setView("hidden");
  };

  if (view === "hidden") return null;

  return (
    <>
      {view === "banner" && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="lv-cookie-title"
          className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-5 text-black shadow-2xl sm:p-6">
            <h2 id="lv-cookie-title" className="text-base font-semibold sm:text-lg">
              Wir verwenden Cookies
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-black/80">
              Notwendige Cookies sorgen dafür, dass diese Website zuverlässig funktioniert. Mit
              Ihrer Zustimmung verwenden wir außerdem First-Party-Analytics, um zu verstehen, welche
              LAVIDRO-Produkte und Konfigurationen besonders relevant sind.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setAnalytics(readConsent()?.analytics ?? false);
                  setView("settings");
                }}
                className="rounded-full border border-black/20 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Einstellungen
              </button>
              <button
                type="button"
                onClick={acceptNecessary}
                className="rounded-full border border-black/20 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "settings" && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setView("hidden");
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lv-cookie-settings-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 text-black shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="lv-cookie-settings-title" className="text-lg font-semibold">
                Cookie-Einstellungen
              </h2>
              <button
                type="button"
                aria-label="Schließen"
                onClick={() => setView("hidden")}
                className="rounded-full p-1 text-black/60 hover:bg-black/5 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  Hilft uns zu verstehen, welche Seiten, Produkte und Konfigurationen genutzt
                  werden.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={acceptNecessary}
                className="rounded-full border border-black/20 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full border border-black/20 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Alle akzeptieren
              </button>
              <button
                type="button"
                onClick={saveSelection}
                className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Auswahl speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
