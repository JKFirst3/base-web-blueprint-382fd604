import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/site/CookieBanner";
import { propagateCampaignToSiteLinks } from "@/lib/campaign";
import { captureFunnel, initAnalytics } from "@/lib/analytics";
import { LanguageProvider, LanguageSlot } from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-display">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Seite nicht gefunden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Diese Seite konnte nicht geladen werden
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Etwas ist schiefgelaufen. Bitte versuche es erneut.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Erneut versuchen
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#F3F2EE" },
      { property: "og:site_name", content: "Lavidro" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Lavidro — Wäsche. Einfach. Fertig." },
      { property: "og:title", content: "Lavidro — Wäsche. Einfach. Fertig." },
      { name: "twitter:title", content: "Lavidro — Wäsche. Einfach. Fertig." },
      {
        name: "description",
        content:
          "Lavidro automatisiert den kompletten Wäscheprozess im Haushalt: sortieren, waschen, trocknen und zusammenlegen — vollständig und qualitätssicher.",
      },
      {
        property: "og:description",
        content:
          "Lavidro automatisiert den kompletten Wäscheprozess im Haushalt: sortieren, waschen, trocknen und zusammenlegen — vollständig und qualitätssicher.",
      },
      {
        name: "twitter:description",
        content:
          "Lavidro automatisiert den kompletten Wäscheprozess im Haushalt: sortieren, waschen, trocknen und zusammenlegen — vollständig und qualitätssicher.",
      },
      {
        property: "og:image",
        content: "https://lavidro.com/assets/lavidro-hero-humanoid-v4.png",
      },
      {
        name: "twitter:image",
        content: "https://lavidro.com/assets/lavidro-hero-humanoid-v4.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Lavidro",
              url: "https://lavidro.com/",
              logo: "https://lavidro.com/assets/lavidro-icon.svg",
              description:
                "Lavidro entwickelt Systeme, die den vollständigen Wäscheprozess im privaten Haushalt automatisieren.",
              parentOrganization: {
                "@type": "Organization",
                name: "Factory33 Ecosystem GmbH",
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Ausblick 1",
                postalCode: "33100",
                addressLocality: "Paderborn",
                addressCountry: "DE",
              },
              email: "hello@factory33.de",
            },
            {
              "@type": "WebSite",
              name: "Lavidro",
              url: "https://lavidro.com/",
              inLanguage: "de-DE",
            },
          ],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!pathname.startsWith("/admin")) initAnalytics();
  }, [pathname]);

  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  useEffect(() => propagateCampaignToSiteLinks(), [pathname, searchStr]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    void captureFunnel("website_visited");
    if (pathname === "/") void captureFunnel("landing_page_viewed");
  }, [pathname, searchStr]);

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <LanguageSlot key={pathname} />
        <Toaster />
        {!pathname.startsWith("/admin") && <CookieBanner />}
      </QueryClientProvider>
    </LanguageProvider>
  );
}
