import { openConsentSettings } from "@/lib/consent";

export function Footer() {
  return (
    <footer className="site-footer">
      <a className="footer-brand" href="/admin/funnel" aria-label="Funnel Admin öffnen">
        <img src="/assets/lavidro-icon.svg" alt="" />
        <span>© 2026 Lavidro. Alle Rechte vorbehalten.</span>
      </a>
      <div>
        <a href="/aboutLavidro">Über Lavidro</a>
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
        <a href="/kontakt">Kontakt</a>
        <button
          type="button"
          onClick={() => openConsentSettings()}
          className="cursor-pointer bg-transparent p-0 text-inherit underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
        >
          Cookie-Einstellungen
        </button>
      </div>
    </footer>
  );
}
