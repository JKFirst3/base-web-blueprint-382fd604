import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogoHorizontal } from "./Logo";
import { Button } from "@/components/ui/button";

export function Header() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function handleWaitlistClick() {
    if (pathname === "/") {
      document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate({ to: "/", hash: "waitlist" }).then(() => {
        setTimeout(() => {
          document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      });
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Lavidro Startseite" className="flex items-center">
          <LogoHorizontal className="h-18 w-auto sm:h-20" />
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <Link
            to="/Konfigurator"
            className="group relative rounded-full px-4 py-2 font-display text-[15px] font-semibold uppercase tracking-wide text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "bg-accent text-accent-foreground shadow-sm" }}
          >
            Konfigurator
          </Link>
          <Link
            to="/aboutLavidro"
            className="group relative rounded-full px-4 py-2 font-display text-[15px] font-semibold uppercase tracking-wide text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "bg-accent text-accent-foreground shadow-sm" }}
          >
            Über Lavidro
          </Link>
        </nav>
        <Button
          onClick={handleWaitlistClick}
          className="rounded-full px-5 transition-all hover:bg-accent hover:text-accent-foreground"
        >
          Jetzt eintragen
        </Button>
      </div>
    </header>
  );
}
