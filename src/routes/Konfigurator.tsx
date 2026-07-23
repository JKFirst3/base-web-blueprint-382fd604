import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import configuratorHtml from "@/content/configurator.html?raw";
import { CodexMarkup, useCodexRuntime } from "@/components/site/CodexPage";
import { supabase } from "@/integrations/supabase/client";
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

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

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
    const product = new URLSearchParams(window.location.search).get("product") ?? "arm";
    track("configurator_view", { product });

    const onPreorder = (event: Event) => {
      const detail = (event as CustomEvent<PreorderSelection>).detail;
      setSelection(detail);
      track("preorder_open", {
        product: detail.productId,
        tier: detail.tier,
        payment_type: detail.paymentType,
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
    const preorder = {
      name: name.trim(),
      email: email.trim(),
      solution_id: selection.productId,
      solution_name: selection.productName,
      tier: selection.tier,
      size: "Standard",
      payment_type: selection.paymentType,
      price_eur: selection.price,
      monthly_eur: selection.paymentType === "monthly" ? selection.monthly : null,
    };

    let { error } = await supabase.from("preorders").insert({
      ...preorder,
      consent,
      source: "configurator",
    });

    if (
      error?.code === "PGRST204" &&
      (error.message.includes("consent") || error.message.includes("source"))
    ) {
      const legacyResult = await supabase.from("preorders").insert(preorder);
      error = legacyResult.error;
    }
    setSubmitting(false);

    if (error) {
      setMessage("Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.");
      track("preorder_error", { product: selection.productId, code: error.code });
      return;
    }

    track("preorder_success", {
      product: selection.productId,
      tier: selection.tier,
      payment_type: selection.paymentType,
      value: selection.price,
    });
    setSuccess(true);
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
            <p className="kicker">Anfrage gespeichert</p>
            <h2 id="preorder-title">Vielen Dank.</h2>
            <p>
              Wir melden uns persönlich bei Ihnen, sobald die nächsten Bestellschritte möglich sind.
            </p>
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
              <strong>
                {selection.paymentType === "monthly"
                  ? `${selection.monthly.toLocaleString("de-DE")} € / Monat`
                  : euro.format(selection.price)}
              </strong>
              <small>
                {selection.paymentType === "monthly"
                  ? `36 Monate · Gesamtpreis ${euro.format(selection.price)}`
                  : "Einmalzahlung"}
              </small>
            </div>

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
