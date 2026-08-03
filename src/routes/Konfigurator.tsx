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
      productName: "LAVIDRO Mobile",
      family: "Mobiler Wäscheassistent",
      tier: "basic",
      tierLabel: "Basic",
      price: 9000,
      monthly: 270,
    },
    premium: {
      productId: "mobile",
      productName: "LAVIDRO Mobile",
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
  humanoid: {
    pro: {
      productId: "humanoid",
      productName: "LAVIDRO One",
      family: "Humanoider Wäschroboter",
      tier: "pro",
      tierLabel: "Pro",
      price: 22500,
      monthly: 675,
    },
    ultimate: {
      productId: "humanoid",
      productName: "LAVIDRO One",
      family: "Humanoider Wäschroboter",
      tier: "ultimate",
      tierLabel: "Ultimate",
      price: 30000,
      monthly: 900,
    },
  },
};

function getCatalogSelection(selection: PreorderSelection): PreorderSelection | null {
  const entry = preorderCatalog[selection.productId]?.[selection.tier];
  if (!entry || !["upfront", "monthly"].includes(selection.paymentType)) return null;
  return { ...entry, paymentType: selection.paymentType };
}

export const Route = createFileRoute("/Konfigurator")({
  head: () => ({
    meta: [
      { title: "LAVIDRO Konfigurator" },
      {
        name: "description",
        content: "Konfigurieren und vergleichen Sie die LAVIDRO-Systeme.",
      },
      { property: "og:url", content: "https://lavidro.com/Konfigurator" },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/Konfigurator" }],
  }),
  component: ConfiguratorPage,
});

function ConfiguratorPage() {
  const [selection, setSelection] = useState<PreorderSelection | null>(null);
  useCodexRuntime("/codex-runtime/configurator.js");

  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get("product") ?? "mobile";
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
            <p className="kicker">Vorbestellung eingegangen</p>
            <h2 id="preorder-title">Heute ist Ihre Vorbestellung bei uns eingegangen.</h2>
            <p>Wir begleiten Sie transparent auf dem Weg zu Ihrem LAVIDRO System.</p>
            <PreorderJourney confirmed />
            <button className="primary-button" type="button" onClick={onClose}>
              Schließen
            </button>
          </div>
        ) : (
          <>
            <p className="kicker">Vorbestellung</p>
            <h2 id="preorder-title">{selection.productName} vormerken</h2>
            <div className="preorder-summary">
              <span>
                {selection.family} · {selection.tierLabel}
              </span>
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
                  Ich stimme der Verarbeitung meiner Anfrage gemäß der{" "}
                  <a href="/datenschutz">Datenschutzerklärung</a> zu.
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
    <ol className="preorder-journey" aria-label="Ihr weiterer Weg mit LAVIDRO">
      <li>
        <span>Heute</span>
        <strong>{confirmed ? "Vorbestellung bestätigt" : "Vorbestellung absenden"}</strong>
        <small>
          {confirmed
            ? "Wir prüfen Ihre Angaben und melden uns persönlich."
            : "Mit Ihren Angaben sichern Sie sich den aktuellen Vorbestellungsstatus."}
        </small>
      </li>
      <li>
        <span>In etwa 3 Monaten</span>
        <strong>Weitere Produktinformationen</strong>
        <small>
          Wir teilen den aktuellen Entwicklungsstand und die nächsten Schritte mit Ihnen.
        </small>
      </li>
      <li>
        <span>In etwa 6 Monaten</span>
        <strong>Auslieferung und Installation</strong>
        <small>Sie erhalten ein konkretes Update zum voraussichtlichen Liefertermin.</small>
      </li>
    </ol>
  );
}
