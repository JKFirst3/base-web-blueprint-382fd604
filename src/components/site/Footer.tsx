import { Link } from "@tanstack/react-router";
import { LogoHorizontal } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.1)] bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" aria-label="LAVIDRO Startseite" className="inline-block">
              <LogoHorizontal className="h-9 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              LAVIDRO – Textile Care Intelligence. Ein System für den vollständig autonomen
              Wäschealltag.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="font-display text-[11px] uppercase tracking-[0.3em] text-white/50">
              Erkunden
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/Konfigurator" className="text-white/85 hover:text-white">
                  Produkte
                </Link>
              </li>
              <li>
                <Link to="/aboutLavidro" className="text-white/85 hover:text-white">
                  Über LAVIDRO
                </Link>
              </li>
              <li>
                <a href="/#faq" className="text-white/85 hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="font-display text-[11px] uppercase tracking-[0.3em] text-white/50">
              Rechtliches
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/impressum" className="text-white/85 hover:text-white">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-white/85 hover:text-white">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="text-white/85 hover:text-white">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} LAVIDRO. Alle Rechte vorbehalten.</p>
          <p>Textile Care Intelligence · Made in Paderborn</p>
        </div>
      </div>
    </footer>
  );
}
