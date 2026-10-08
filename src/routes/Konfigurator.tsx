import { useEffect, useRef, useState } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import configuratorHtml from "@/content/configurator.html?raw";
import { CodexMarkup, useCodexRuntime } from "@/components/site/CodexPage";
import { Footer } from "@/components/site/Footer";

import { captureFunnel, toBusinessModel } from "@/lib/analytics";
import { requestPreorder } from "@/lib/preorder-client";
import { currentCampaign } from "@/lib/campaign";
import { salePrices } from "@/lib/sale-pricing";
import { z } from "zod";

const VALUE_OPTIONS = [
  "Weniger Zeit für Wäsche aufwenden",
  "Wiederkehrende Hausarbeit reduzieren",
  "Möglichst lange selbständig im eigenen Zuhause leben",
  "Weniger Abhängigkeit von Haushaltshilfen",
  "Schonender und zuverlässigere Textilpflege",
  "Sonstige",
] as const;

const answersSchema = z
  .object({
    household_size: z.enum(["1", "2", "3-4", "5+"]).nullable(),
    job_title: z.string().trim().max(100),
    greatest_value: z.enum(VALUE_OPTIONS).nullable(),
    greatest_value_other: z.string().trim().max(300),
  })
  .refine((value) => value.greatest_value !== "Sonstige" || value.greatest_value_other.length > 0);

type PreorderSelection = {
  productId: string;
  productName: string;
  family: string;
  tier: string;
  price: number;
  monthly: number;
  paymentType: "upfront" | "monthly";
};

type CatalogEntry = Omit<PreorderSelection, "paymentType">;

// Only currently offered configurations. Internal tier keys stay compatible with
// existing records and the database insert rule; they are never shown to visitors.
const preorderCatalog: Record<string, Record<string, CatalogEntry>> = {
  mobile: {
    premium: {
      productId: "mobile",
      productName: "Lavidro Mobile",
      family: "Mobiler Wäscheassistent",
      tier: "premium",
      price: 22990,
      monthly: 469,
    },
  },
  cabinet: {
    premium: {
      productId: "cabinet",
      productName: "Lavidro Cabinet",
      family: "Autonomer Wäscheschrank",
      tier: "premium",
      price: 20449,
      monthly: 390,
    },
  },
  one: {
    standard: {
      productId: "one",
      productName: "Lavidro One",
      family: "Einzelne Wäscheaufbereitung",
      tier: "standard",
      price: 8990,
      monthly: 199,
    },
  },
};

function getCatalogSelection(selection: PreorderSelection): PreorderSelection | null {
  const entry = preorderCatalog[selection.productId]?.[selection.tier];
  if (!entry || !["upfront", "monthly"].includes(selection.paymentType)) return null;
  return { ...entry, paymentType: selection.paymentType };
}

const KONFIGURATOR_TITLE = "Produkt | Lavidro Wäschesysteme im Vergleich";
const KONFIGURATOR_DESCRIPTION =
  "Vergleiche die drei Lavidro Lösungen: Mobiler Wäscheassistent, Autonomer Wäscheschrank und Einzelne Wäscheaufbereitung. Mit Preisindikation und unverbindlicher Anfrage.";
export const Route = createFileRoute("/Konfigurator")({
  head: () => ({
    meta: [
      { title: KONFIGURATOR_TITLE },
      { name: "description", content: KONFIGURATOR_DESCRIPTION },
      { property: "og:title", content: KONFIGURATOR_TITLE },
      { property: "og:description", content: KONFIGURATOR_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lavidro.com/Konfigurator" },
      { name: "twitter:card", content: "summary" },
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
              price: 22990,
            },
            {
              name: "Autonomer Wäscheschrank",
              description:
                "In den Hauswirtschaftsraum integrierter Lavidro Wäscheschrank für einen automatisierten Wäscheprozess im Hintergrund.",
              price: 20449,
            },
            {
              name: "Einzelne Wäscheaufbereitung",
              description:
                "Lavidro One behandelt einzelne Kleidungsstücke mit einem Roboterarm im Schrank: gezielte Fleckenbehandlung und Auffrischen von Textilien.",
              price: 8990,
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
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const [selection, setSelection] = useState<PreorderSelection | null>(null);
  useCodexRuntime("/codex-runtime/configurator.js", "20261007-all-benefit-notes");

  useEffect(() => {
    const requestedProduct = new URLSearchParams(window.location.search).get("product");
    const product =
      requestedProduct && requestedProduct in preorderCatalog ? requestedProduct : "mobile";
    void captureFunnel("product_area_viewed", { entry_type: "direct", product_id: product });

    const onPreorder = (event: Event) => {
      const detail = (event as CustomEvent<PreorderSelection>).detail;
      const catalogSelection = getCatalogSelection(detail);
      if (!catalogSelection) {
        return;
      }
      setSelection(catalogSelection);
      void captureFunnel("purchase_interest_started", {
        product_id: catalogSelection.productId,
      });
    };

    const onComparisonOpened = () => {
      void captureFunnel("product_comparison_opened", { product_id: product });
    };
    const onComparisonSelected = (event: Event) => {
      const target = (event as CustomEvent<{ productId?: string }>).detail?.productId;
      if (!target || !(target in preorderCatalog) || target === product) return;
      void captureFunnel("product_comparison_product_selected", {
        product_id: target,
        source_product_id: product,
      });
    };
    window.addEventListener("lavidro:comparison-opened", onComparisonOpened);
    window.addEventListener("lavidro:comparison-product-selected", onComparisonSelected);
    window.addEventListener("lavidro:preorder", onPreorder);
    return () => {
      window.removeEventListener("lavidro:preorder", onPreorder);
      window.removeEventListener("lavidro:comparison-opened", onComparisonOpened);
      window.removeEventListener("lavidro:comparison-product-selected", onComparisonSelected);
    };
  }, [searchStr]);

  return (
    <>
      <CodexMarkup html={configuratorHtml} className="configurator-page" />
      <div className="product-mobile-footer">
        <Footer />
      </div>
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
  const [paymentType, setPaymentType] = useState<"upfront" | "monthly" | "">("");
  const [campaign] = useState(() => currentCampaign());
  const offer = salePrices(selection.productId, campaign);
  const quotedPrice = offer?.price ?? selection.price;
  const quotedMonthly = offer?.monthly ?? selection.monthly;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [greatestValue, setGreatestValue] = useState("");
  const [greatestValueOther, setGreatestValueOther] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptStarted, setAttemptStarted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState<"sent" | "processing" | "send_failed">(
    "processing",
  );
  const submissionBusy = useRef(false);
  const [clientSubmissionId] = useState(() => crypto.randomUUID());

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
    if (submissionBusy.current || success) return;
    if (!paymentType) {
      setMessage("Bitte wählen Sie Kauf oder Abo aus.");
      return;
    }
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
    const answers = answersSchema.safeParse({
      household_size: householdSize || null,
      job_title: jobTitle,
      greatest_value: greatestValue || null,
      greatest_value_other: greatestValue === "Sonstige" ? greatestValueOther : "",
    });
    if (!answers.success) {
      setMessage("Bitte ergänzen oder kürzen Sie Ihre Angaben zu den Zusatzfragen.");
      return;
    }

    submissionBusy.current = true;
    setAttemptStarted(true);
    setSubmitting(true);
    setMessage("");
    try {
      const result = await requestPreorder({
        name: name.trim(),
        email: email.trim(),
        solution_id: selection.productId,
        solution_name: selection.productName,
        tier: selection.tier,
        size: "Standard",
        payment_type: paymentType,
        price_eur: quotedPrice,
        monthly_eur: paymentType === "monthly" ? quotedMonthly : null,
        consent,
        marketing_consent: marketingConsent,
        client_submission_id: clientSubmissionId,
        ...answers.data,
        source: campaign ?? "configurator",
      });

      void captureFunnel(
        "purchase_interest_submitted",
        {
          product_id: selection.productId,
          business_model: toBusinessModel(paymentType),
          household_size: answers.data.household_size,
          greatest_value: answers.data.greatest_value,
          job_title_provided: answers.data.job_title.length > 0,
        },
        clientSubmissionId,
      );
      setEmailStatus(result.email_status);
      setSuccess(true);
    } catch (error) {
      console.error("[preorder-form] Submission failed", error);
      setMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "Der Status der Anfrage ist noch unklar. Ihre Angaben bleiben für den Wiederholungsversuch unverändert. Klicken Sie erneut auf „Anfragen“; dadurch wird keine zweite Anfrage angelegt."
          : "Der Eingang Ihrer Anfrage konnte nicht bestätigt werden. Bitte klicken Sie mit den unveränderten Angaben erneut auf „Anfragen“.",
      );
    } finally {
      submissionBusy.current = false;
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
            <p className="kicker">Anfrage eingegangen</p>
            <h2 id="preorder-title">Ihre unverbindliche Anfrage ist bei uns eingegangen.</h2>
            <p>
              {emailStatus === "sent" &&
                "Wir haben Ihnen eine E-Mail geschickt. Bitte bestätigen Sie darin Ihre E-Mail-Adresse."}
              {emailStatus === "processing" &&
                "Ihre Anfrage wurde gespeichert. Der Versand der Bestätigungs-E-Mail wird noch verarbeitet. "}
              {emailStatus === "send_failed" &&
                "Ihre Anfrage wurde gespeichert, die Bestätigungs-E-Mail konnte jedoch nicht versendet werden. Wir kümmern uns um Ihre Anfrage. "}
            </p>
            <PreorderJourney confirmed />
            <button className="primary-button" type="button" onClick={onClose}>
              Schließen
            </button>
          </div>
        ) : (
          <>
            <p className="kicker">Unverbindliche Anfrage</p>
            <h2 id="preorder-title">{selection.productName} anfragen</h2>
            <p className="preorder-introduction">
              Lavidro befindet sich in einer frühen Entwicklungsphase. Weitere Details teilen wir
              gerne im persönlichen Austausch. Senden Sie uns eine unverbindliche Anfrage – wir
              setzen uns mit Ihnen in Verbindung.
            </p>

            {offer && (
              <div className="sale-offer-banner">
                <span className="sale-offer-label">Einführungsangebot</span>
                <strong>Mindestens 50 % Preisvorteil</strong>
                <p>Für frühe Anfragen über diese Aktion. Unverbindlich – keine Zahlungspflicht.</p>
              </div>
            )}
            <form className="preorder-form" onSubmit={submit}>
              <fieldset
                className={`preorder-payment-options${offer ? " sale-pricing" : ""}`}
                disabled={attemptStarted}
              >
                <legend>Voraussichtliche, unverbindliche Preisindikation</legend>
                {(["upfront", "monthly"] as const).map((model) => (
                  <label key={model}>
                    <input
                      type="radio"
                      name="payment-type"
                      value={model}
                      required
                      checked={paymentType === model}
                      onChange={() => {
                        setPaymentType(model);
                        void captureFunnel("purchase_model_selected", {
                          product_id: selection.productId,
                          business_model: toBusinessModel(model),
                        });
                      }}
                    />
                    <span>
                      <span>{model === "monthly" ? "Monatlicher Beitrag (Abo)" : "Kaufpreis"}</span>
                      {offer && (
                        <del className="sale-original-price">
                          <span className="sr-only">Bisherige Preisindikation: </span>
                          {model === "monthly"
                            ? `${selection.monthly.toLocaleString("de-DE")} € / Monat`
                            : `${selection.price.toLocaleString("de-DE")} €`}
                        </del>
                      )}
                      <strong>
                        {model === "monthly"
                          ? `${quotedMonthly.toLocaleString("de-DE")} € / Monat`
                          : `${quotedPrice.toLocaleString("de-DE")} €`}
                      </strong>
                    </span>
                  </label>
                ))}
                <small>
                  Inkl. 19 % MwSt. und Versand. Preise können sich bis zu einem späteren Angebot
                  ändern. Keine Zahlungspflicht durch die Anfrage.
                </small>
              </fieldset>
              <label>
                <span>Name</span>
                <input
                  disabled={attemptStarted}
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
                  disabled={attemptStarted}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  type="email"
                  maxLength={255}
                  required
                />
              </label>
              <label>
                <span>Wie sieht Ihr Haushalt aus? (freiwillig)</span>
                <select
                  disabled={attemptStarted}
                  value={householdSize}
                  onChange={(event) => setHouseholdSize(event.target.value)}
                >
                  <option value="">Bitte auswählen</option>
                  <option value="1">1 Person</option>
                  <option value="2">2 Personen</option>
                  <option value="3-4">3 bis 4 Personen</option>
                  <option value="5+">5 oder mehr Personen</option>
                </select>
              </label>
              <label>
                <span>Was wäre für Sie der größte Mehrwert von Lavidro? (freiwillig)</span>
                <select
                  disabled={attemptStarted}
                  value={greatestValue}
                  onChange={(event) => {
                    setGreatestValue(event.target.value);
                    setGreatestValueOther("");
                  }}
                >
                  <option value="">Bitte auswählen</option>
                  {VALUE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              {greatestValue === "Sonstige" && (
                <label>
                  <span>Sonstige: bitte erläutern</span>
                  <textarea
                    disabled={attemptStarted}
                    value={greatestValueOther}
                    onChange={(event) => setGreatestValueOther(event.target.value)}
                    maxLength={300}
                    required
                    rows={3}
                  />
                </label>
              )}
              <label>
                <span>Ihr Jobtitel (freiwillig)</span>
                <input
                  disabled={attemptStarted}
                  type="text"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  maxLength={100}
                  autoComplete="organization-title"
                />
              </label>
              <label className="checkbox">
                <input
                  disabled={attemptStarted}
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  required
                />
                <span>
                  Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> zur Kenntnis genommen
                  und weiß, dass meine Daten zur Bearbeitung der unverbindlichen Anfrage verarbeitet
                  werden.
                </span>
              </label>
              <label className="checkbox">
                <input
                  disabled={attemptStarted}
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
                {submitting ? "Wird gespeichert …" : "Anfragen"}
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
        <strong>{confirmed ? "Anfrage eingegangen" : "Anfrage absenden"}</strong>
        <small>
          {confirmed
            ? "Wir prüfen Ihre Angaben und melden uns persönlich."
            : "Ihre Anfrage ist unverbindlich und löst keine Zahlungspflicht aus."}
        </small>
      </li>
      <li>
        <span>Während der Entwicklung</span>
        <strong>Bearbeitung der Anfrage</strong>
        <small>Wir informieren Sie bei Bedarf über die nächsten Schritte Ihrer Anfrage.</small>
      </li>
      <li>
        <span>Ausblick</span>
        <strong>Marktstart geplant 2027</strong>
        <small>Ein verbindliches Angebot oder ein Liefertermin ist damit nicht verbunden.</small>
      </li>
    </ol>
  );
}
