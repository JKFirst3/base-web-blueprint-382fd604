import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { LogoHorizontal } from "./Logo";
import { track } from "@/lib/track";

type NavItem = { label: string; href: string; anchor?: string };

const NAV: NavItem[] = [
  { label: "System", href: "/", anchor: "system" },
  { label: "Produkte", href: "/Konfigurator" },
  { label: "Module", href: "/", anchor: "module" },
  { label: "Qualität", href: "/", anchor: "qualitaet" },
  { label: "Über LAVIDRO", href: "/aboutLavidro" },
  { label: "FAQ", href: "/", anchor: "faq" },
];

export function Header() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToAnchor(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleNav(item: NavItem, e: React.MouseEvent) {
    setOpen(false);
    if (item.anchor) {
      e.preventDefault();
      if (pathname === "/") {
        scrollToAnchor(item.anchor);
      } else {
        navigate({ to: "/", hash: item.anchor }).then(() => {
          setTimeout(() => scrollToAnchor(item.anchor!), 60);
        });
      }
    }
  }

  function handleCta() {
    setOpen(false);
    track("cta_live_erleben_click", { source: "header" });
    if (pathname === "/") {
      document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate({ to: "/", hash: "waitlist" }).then(() => {
        setTimeout(() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }), 60);
      });
    }
  }

  const bar = scrolled
    ? "bg-white/85 backdrop-blur-md border-b border-[rgba(23,23,23,0.12)] text-foreground"
    : "bg-transparent border-b border-white/10 text-white";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${bar}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" aria-label="LAVIDRO Startseite" className="flex items-center">
          <LogoHorizontal
            className={`h-9 w-auto transition ${scrolled ? "" : "brightness-0 invert"}`}
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) =>
            item.anchor ? (
              <a
                key={item.label}
                href={`/#${item.anchor}`}
                onClick={(e) => handleNav(item, e)}
                className="text-[13px] font-medium tracking-wide transition-opacity hover:opacity-70"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                className="text-[13px] font-medium tracking-wide transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCta}
            className={`hidden rounded-full px-5 py-2 text-[13px] font-medium transition sm:inline-flex ${
              scrolled
                ? "bg-[#050505] text-white hover:opacity-90"
                : "bg-white text-[#050505] hover:bg-white/90"
            }`}
          >
            LAVIDRO live erleben
          </button>

          <button
            type="button"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border lg:hidden ${
              scrolled ? "border-[rgba(23,23,23,0.2)] text-foreground" : "border-white/40 text-white"
            }`}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[rgba(23,23,23,0.1)] bg-white/95 backdrop-blur-md text-foreground lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8">
            {NAV.map((item) =>
              item.anchor ? (
                <a
                  key={item.label}
                  href={`/#${item.anchor}`}
                  onClick={(e) => handleNav(item, e)}
                  className="rounded-md px-2 py-2 text-sm font-medium hover:bg-[rgba(23,23,23,0.05)]"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium hover:bg-[rgba(23,23,23,0.05)]"
                >
                  {item.label}
                </Link>
              ),
            )}
            <button
              type="button"
              onClick={handleCta}
              className="mt-2 rounded-full bg-[#050505] px-5 py-2 text-sm font-medium text-white"
            >
              LAVIDRO live erleben
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
