import { Link } from "@tanstack/react-router";
import { LogoHorizontal } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <LogoHorizontal className="h-12 w-auto" />
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Lavidro. Alle Rechte vorbehalten.
        </p>
        <nav className="flex items-center gap-6 text-sm text-foreground/70">
          <Link to="/impressum" className="hover:text-foreground hover:underline underline-offset-4">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:text-foreground hover:underline underline-offset-4">
            Datenschutz
          </Link>
          <Link to="/kontakt" className="hover:text-foreground hover:underline underline-offset-4">
            Kontakt
          </Link>
        </nav>
      </div>
    </footer>
  );
}
