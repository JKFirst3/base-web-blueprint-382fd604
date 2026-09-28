import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import configuratorHtml from "@/content/configurator.html?raw";
import { CodexMarkup, useCodexRuntime } from "@/components/site/CodexPage";

import { track } from "@/lib/track";

type PreorderSelection = {
  productId: string;
  productName: string;
  family: string;
  tier: string;
  tierLabel: string;
  price: number;
  monthly: number;
  paymentType: "upfront" | "monthly";
};

type CatalogEntry = Omit<PreorderSelection, "paymentType">;

const preorderCatalog: Record<string, Record<string, CatalogEntry>> = {
  mobile: {
    basic: {
      productId: "mobile",
      productName: "Lavidro Mobile",
      family: "Mobiler Wäscheassistent",
      tier: "basic",
      tierLabel: "Basic",
      price: 9000,
      monthly: 270,
    },
    premium: {
      productId: "mobile",
      productName: "Lavidro Mobile",
      family: "Mobiler Wäscheassistent",
      tier: "premium",
      tierLabel: "Premium",
      price: 14000,
      monthly: 420,
    },
  },
  cabinet: {
    basic: {
      productId: "cabinet",
      productName: "Lavidro Cabinet",
      family: "Integrierter Wäscheschrank",
      tier: "basic",
      tierLabel: "Basic",
      price: 12500,
      monthly: 375,
    },
    premium: {
      productId: "cabinet",
      productName: "Lavidro Cabinet",
      family: "Integrierter Wäscheschrank",
      tier: "premium",
      tierLabel: "Premium",
      price: 21500,
      monthly: 645,
    },
  },
  one: {
    standard: {
      productId: "one",
      productName: "Lavidro One",
      family: "Einzelteilbehandlung im Schrank",
      tier: "standard",
      tierLabel: "Standard",
      price: 10000,
      monthly: 300,
    },
  },
};

function getCatalogSelection(selection: PreorderSelection): PreorderSelection | null {
  const entry = preorderCatalog[selection.productId]?.[selection.tier];
  if (!entry || !["upfront", "monthly"].includes(selection.paymentType)) return null;
  return { ...entry, paymentType: selection.paymentType };
}

const KONFIGURATOR_TITLE = "Produkt — Lavidro Wäschesysteme im Vergleich";
const KONFIGURATOR_DESCRIPTION =
  "Vergleiche die drei Lavidro Lösungen: Mobiler Wäscheassistent, Integrierter Wäscheschrank und Einzelteilbehandlung im Schrank — mit Ausstattungsstufen und unverbindlicher Vormerkung.";
export const Route = createFileRoute("/Konfigurator")({
  head: () => ({
    meta: [
      { title: KONFIGURATOR_TITLE },
      { name: "description", content: KONFIGURATOR_DESCRIPTION },
      { property: "og:title", content: KONFIGURATOR_TITLE },
      { property: "og:description", content: KONFIGURATOR_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lavidro.com/Konfigurator" },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/Konfigurator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: [
            {
              name: "Mobiler Wäscheassistent",
              description:
                "Mobiler Lavidro Wäscheassistent, der Wäsche im Haushalt sortiert, ein- und ausräumt.",
              price: 9000,
            },
            {
              name: "Integrierter Wäscheschrank",
              description:
                "In den Hauswirtschaftsraum integrierter Lavidro Wäscheschrank für einen automatisierten Wäscheprozess im Hintergrund.",
              price: 12500,
            },
            {
              name: "Einzelteilbehandlung im Schrank",
              description:
                "Lavidro One behandelt einzelne Kleidungsstücke mit einem Roboterarm im Schrank: gezielte Fleckenbehandlung und Auffrischen von Textilien.",
              price: 10000,
            },
          ].map((p, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: p.name,
              description: p.description,
              brand: { "@type": "Brand", name: "Lavidro" },
              offers: {
                "@type": "Offer",
                price: p.price,
                priceCurrency: "EUR",
                availability: "https://schema.org/PreOrder",
                url: "https://lavidro.com/Konfigurator",
              },
            },
          })),
        }),
      },
    ],
  }),

  component: ConfiguratorPage,
});

function ConfiguratorPage() {
  const [selection, setSelection] = useState<PreorderSelection | null>(null);
  useCodexRuntime("/codex-runtime/configurator.js");

  useEffect(() => {
    const requestedProduct = new URLSearchParams(window.location.search).get("product");
    const product = requestedProduct && requestedProduct in preorderCatalog ? requestedProduct : "mobile";
    track("configurator_open", { product_id: product });

    const onPreorder = (event: Event) => {
      const detail = (event as CustomEvent<PreorderSelection>).detail;
      const catalogSelection = getCatalogSelection(detail);
      if (!catalogSelection) {
        return;
      }
      setSelection(catalogSelection);
      track("preorder_open", {
        product_id: catalogSelection.productId,
        tier: catalogSelection.tier,
        payment_type: catalogSelection.paymentType,
      });
    };

    window.addEventListener("lavidro:preorder", onPreorder);
    return () => window.removeEventListener("lavidro:preorder", onPreorder);
  }, []);

  return (
    <>
      <CodexMarkup html={configuratorHtml} className="configurator-page" />
      {selection && <PreorderDialog selection={selection} onClose={() => setSelection(null)} />}
    </>
  );
}

function PreorderDialog({
  selection,
  onClose,
}: {
  selection: PreorderSelection;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setMessage("Bitte geben Sie Ihren Namen ein.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setMessage("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (!consent) {
      setMessage("Bitte stimmen Sie der Verarbeitung Ihrer Anfrage zu.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10_000);
      const response = await fetch("/api/public/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          solution_id: selection.productId,
          solution_name: selection.productName,
          tier: selection.tier,
          size: "Standard",
          payment_type: selection.paymentType,
          price_eur: selection.price,
          monthly_eur: selection.paymentType === "monthly" ? selection.monthly : null,
          consent,
           marketing_consent: marketingConsent,
          source: "configurator",
        }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeout));

      if (!response.ok) throw new Error(`Preorder request failed: ${response.status}`);

      track("preorder_success", {
        product_id: selection.productId,
        tier: selection.tier,
        payment_type: selection.paymentType,
      });
      setSuccess(true);
    } catch (error) {
      console.error("[preorder-form] Submission failed", error);
      setMessage("Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="preorder-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className="preorder-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preorder-title"
      >
        <button className="preorder-close" type="button" onClick={onClose} aria-label="Schließen">
          <X aria-hidden="true" />
        </button>

        {success ? (
          <div className="preorder-success">
            <span aria-hidden="true">✓</span>
            <p className="kicker">Vormerkung eingegangen</p>
            <h2 id="preorder-title">Ihre unverbindliche Vormerkung ist bei uns eingegangen.</h2>
            <p>In Entwicklung · Marktstart geplant 2027. Wir melden uns mit Neuigkeiten zum Entwicklungsstand.</p>
            <PreorderJourney confirmed />
            <button className="primary-button" type="button" onClick={onClose}>
              Schließen
            </button>
          </div>
        ) : (
          <>
            <p className="kicker">Unverbindliche Vormerkung</p>
            <h2 id="preorder-title">{selection.productName} vormerken</h2>
            <div className="preorder-summary">
              <span>
                {selection.family} · {selection.tierLabel}
              </span>
              <strong>
                {selection.paymentType === "monthly"
                  ? `${selection.monthly.toLocaleString("de-DE")} € / Monat`
                  : `${selection.price.toLocaleString("de-DE")} €`}
              </strong>
              <small>
                Unverbindliche Preisindikation, inkl. 19 % MwSt. und Versand. Der Preis kann sich bis
                zum verbindlichen Angebot ändern.
              </small>
            </div>

            <PreorderJourney />

            <form className="preorder-form" onSubmit={submit}>
              <label>
                <span>Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </label>
              <label>
                <span>E-Mail-Adresse</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  type="email"
                  maxLength={255}
                  required
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  required
                />
                <span>
                  Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> zur Kenntnis genommen
                  und weiß, dass meine Daten zur Bearbeitung der unverbindlichen Vormerkung verarbeitet
                  werden.
                </span>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(event) => setMarketingConsent(event.target.checked)}
                />
                <span>
                  Ich möchte zusätzlich per E-Mail über die Produktentwicklung, Verfügbarkeit und
                  Angebote von Lavidro informiert werden. Diese Einwilligung ist freiwillig und
                  jederzeit widerrufbar.
                </span>
              </label>
              <button className="primary-button" type="submit" disabled={submitting}>
                {submitting ? "Wird gespeichert …" : "Unverbindlich vormerken"}
              </button>
              <p className="form-status" role="status" aria-live="polite">
                {message}
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function PreorderJourney({ confirmed = false }: { confirmed?: boolean }) {
  return (
    <ol className="preorder-journey" aria-label="Ihr weiterer Weg mit Lavidro">
      <li>
        <span>Heute</span>
        <strong>{confirmed ? "Vormerkung eingegangen" : "Vormerkung absenden"}</strong>
        <small>
          {confirmed
            ? "Wir prüfen Ihre Angaben und melden uns persönlich."
            : "Ihre Vormerkung ist unverbindlich und löst keine Zahlungspflicht aus."}
        </small>
      </li>
      <li>
        <span>Während der Entwicklung</span>
        <strong>Weitere Produktinformationen</strong>
        <small>
          Wir teilen den aktuellen Entwicklungsstand und die nächsten Schritte mit Ihnen.
        </small>
      </li>
      <li>
        <span>Ausblick</span>
        <strong>Marktstart geplant 2027</strong>
        <small>Ein verbindliches Angebot oder ein Liefertermin ist damit nicht verbunden.</small>
      </li>
    </ol>
  );
}
