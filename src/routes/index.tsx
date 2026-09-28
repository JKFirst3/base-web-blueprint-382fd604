import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import homeHtml from "@/content/home.html?raw";
import { CodexMarkup, useCodexRuntime } from "@/components/site/CodexPage";
import { track } from "@/lib/track";
import { captureFunnel } from "@/lib/analytics";
import { propagateCampaignToProductLinks } from "@/lib/campaign";

const TITLE = "Lavidro — Wäsche. Einfach. Fertig.";
const DESCRIPTION =
  "Das erste System, das den vollständigen Wäscheprozess autonom und qualitätssicher übernimmt.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Welche Aufgaben übernimmt Lavidro?",
    a: "Lavidro ist als System für Sortieren, Beladen, Entladen und Bereitstellen von Wäsche gedacht.",
  },
  {
    q: "Ist Lavidro für private Haushalte vorgesehen?",
    a: "Ja. Die Bildsprache und Systemidee zielen auf hochwertige Hauswirtschaftsräume in privaten Haushalten.",
  },
  {
    q: "Wann wird Lavidro verfügbar?",
    a: "Mit Ihrer Anmeldung erfahren Sie zuerst von Entwicklungsfortschritten, Pilotphasen und Möglichkeiten, Lavidro live zu erleben.",
  },
  {
    q: "Benötigt Lavidro spezielle Waschmaschinen oder Trockner?",
    a: "Das System ist für die Zusammenarbeit mit vielen gängigen Frontladern geplant. Die konkrete Kompatibilität wird vor der Installation geprüft.",
  },
  {
    q: "Wie sicher ist das System im Haushalt?",
    a: "Sensoren überwachen Arbeitsbereich, Bewegung und Kontakt. Bei einer unerwarteten Situation stoppt das System automatisch.",
  },
  {
    q: "Wie behandelt Lavidro empfindliche Textilien?",
    a: "Pflegeprofile berücksichtigen Material, Griffstärke und Bewegungsablauf, damit sensible Kleidungsstücke besonders schonend gehandhabt werden.",
  },
  {
    q: "Kann Lavidro in einem bestehenden Hauswirtschaftsraum nachgerüstet werden?",
    a: "Eine Nachrüstung ist grundsätzlich vorgesehen. Platz, Anschlüsse und Bewegungsbereich werden vorab individuell geprüft.",
  },
  {
    q: "Welche Wartung ist erforderlich?",
    a: "Regelmäßige Systemdiagnosen laufen automatisch. Mechanische Komponenten werden im Rahmen eines planbaren Serviceintervalls geprüft.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://lavidro.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://lavidro.com/" },
      {
        rel: "preload",
        as: "image",
        href: "/assets/lavidro-hero-humanoid-v4-6k.png",
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  useCodexRuntime("/codex-runtime/home.js");

  // Smoke-test campaign: carry the exact constant tag to product links via URL only.
  useEffect(() => {
    propagateCampaignToProductLinks();
    const t = window.setTimeout(() => propagateCampaignToProductLinks(), 500);
    return () => window.clearTimeout(t);
  }, []);

  // Stage 2 (scroll): product teaser becomes visible. Deduped per visit in captureFunnel.
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let tries = 0;
    const attach = () => {
      const el = document.getElementById("produkt-teaser");
      if (!el) {
        if (tries++ < 40) timer = window.setTimeout(attach, 150);
        return;
      }
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            // No-op without consent; deduped per visit once sent.
            void captureFunnel("product_area_viewed", { entry_type: "scroll" });
          }
        },
        { threshold: 0.25 },
      );
      io.observe(el);
    };
    let timer = window.setTimeout(attach, 0);
    return () => {
      window.clearTimeout(timer);
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("[data-form]");
    const status = document.querySelector<HTMLElement>("[data-form-status]");
    if (!form || !status) return;

    let mode: "termin" | "interview" = "interview";
    const modeButtons = Array.from(form.querySelectorAll<HTMLButtonElement>("[data-mode]"));
    const modeFields = Array.from(form.querySelectorAll<HTMLElement>("[data-mode-field]"));

    const applyMode = () => {
      modeButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
      modeFields.forEach((f) => {
        const visible = f.dataset.modeField === mode;
        f.hidden = !visible;
      });
      const phone = form.querySelector<HTMLInputElement>('input[name="phone"]');
      if (phone) phone.required = false;
    };

    const onModeClick = (event: Event) => {
      const target = (event.currentTarget as HTMLButtonElement).dataset.mode;
      mode = target === "interview" ? "interview" : "termin";
      status.textContent = "";
      applyMode();
    };
    modeButtons.forEach((b) => b.addEventListener("click", onModeClick));
    applyMode();

    const onSubmit = async (event: SubmitEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const data = new FormData(form);
      const name = String(data.get("name") ?? "").trim();
      const email = String(data.get("email") ?? "").trim();
      const painPoint = String(data.get("pain") ?? "").trim();
      const phone = String(data.get("phone") ?? "").trim();
      const availability = String(data.get("availability") ?? "").trim();
      const consent =
        form.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked === true;
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

      if (!email || !email.includes("@")) {
        status.textContent = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
        return;
      }
      if (!consent) {
        status.textContent = "Bitte stimmen Sie der Zusendung von Updates zu.";
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = "Wird eingetragen …";
      }
      status.textContent = "";

      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10_000);
        const response = await fetch("/api/public/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name || null,
            email,
            pain_point: mode === "termin" ? painPoint || null : null,
            consent,
            request_type: mode,
            phone: mode === "interview" ? phone : null,
            availability: mode === "interview" ? availability || null : null,
          }),
          signal: controller.signal,
        }).finally(() => window.clearTimeout(timeout));

        if (!response.ok) throw new Error(`Lead request failed: ${response.status}`);

        form.reset();
        applyMode();
        status.textContent =
          mode === "interview"
            ? "Danke. Wir melden uns, um Ihre Lavidro-Produktvorstellung abzustimmen."
            : "Danke. Sie erhalten künftig Neuigkeiten von Lavidro.";
        track("live_experience_success");
      } catch (error) {
        console.error("[lead-form] Submission failed", error);
        status.textContent =
          "Die Eintragung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.";
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = "Jetzt eintragen";
        }
      }
    };

    form.addEventListener("submit", onSubmit, { capture: true });
    return () => {
      form.removeEventListener("submit", onSubmit, { capture: true });
      modeButtons.forEach((b) => b.removeEventListener("click", onModeClick));
    };
  }, []);

  return <CodexMarkup html={homeHtml} />;
}
