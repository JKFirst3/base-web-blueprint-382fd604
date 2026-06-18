import { Link } from "@tanstack/react-router";
import { LogoHorizontal } from "./Logo";
import { Button } from "@/components/ui/button";

function scrollToWaitlist() {
  const el = document.getElementById("waitlist");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Lavidro Startseite" className="flex items-center">
          <LogoHorizontal className="h-18 w-auto sm:h-20" />
        </Link>
        <Button
          onClick={scrollToWaitlist}
          className="rounded-full px-5 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          Jetzt eintragen
        </Button>
      </div>
    </header>
  );
}
