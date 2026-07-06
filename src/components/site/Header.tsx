import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { LogoHorizontal } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function Header() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  function handleWaitlistClick() {
    setOpen(false);
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

  const linkClass =
    "group relative rounded-full px-4 py-2 font-display text-[15px] font-semibold uppercase tracking-wide text-foreground transition-all hover:bg-accent hover:text-accent-foreground";
  const activeCls = { className: "bg-accent text-accent-foreground shadow-sm" };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Lavidro Startseite" className="flex items-center">
          <LogoHorizontal className="h-18 w-auto sm:h-20" />
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <Link to="/Konfigurator" className={linkClass} activeProps={activeCls}>
            Produkt
          </Link>
          <Link to="/aboutLavidro" className={linkClass} activeProps={activeCls}>
            Über Lavidro
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleWaitlistClick}
            className="rounded-full px-5 transition-all hover:bg-accent hover:text-accent-foreground"
          >
            LAVIDRO live erleben

          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menü öffnen"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="mt-8 flex flex-col gap-2">
                <Link
                  to="/Konfigurator"
                  onClick={() => setOpen(false)}
                  className={linkClass}
                  activeProps={activeCls}
                >
                  Produkt
                </Link>
                <Link
                  to="/aboutLavidro"
                  onClick={() => setOpen(false)}
                  className={linkClass}
                  activeProps={activeCls}
                >
                  Über Lavidro
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
