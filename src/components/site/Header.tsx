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
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/Konfigurator"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-foreground" }}
          >
            Konfigurator
          </Link>
          <Link
            to="/aboutLavidro"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-foreground" }}
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
