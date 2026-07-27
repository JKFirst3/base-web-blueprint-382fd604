import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import homeHtml from "@/content/home.html?raw";
import { CodexMarkup, useCodexRuntime } from "@/components/site/CodexPage";
import { track } from "@/lib/track";

const TITLE = "LAVIDRO — Wäsche. Einfach. Fertig.";
const DESCRIPTION =
  "Das erste System, das den vollständigen Wäscheprozess autonom und qualitätssicher übernimmt.";

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
    links: [{ rel: "canonical", href: "https://lavidro.com/" }],
  }),
  component: HomePage,
});

function HomePage() {
  useCodexRuntime("/codex-runtime/home.js");

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("[data-form]");
    const status = document.querySelector<HTMLElement>("[data-form-status]");
    if (!form || !status) return;

    let mode: "termin" | "interview" = "termin";
    const modeButtons = Array.from(form.querySelectorAll<HTMLButtonElement>("[data-mode]"));
    const modeFields = Array.from(form.querySelectorAll<HTMLElement>("[data-mode-field]"));

    const applyMode = () => {
      modeButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
      modeFields.forEach((f) => {
        const visible = f.dataset.modeField === mode;
        f.hidden = !visible;
      });
      const phone = form.querySelector<HTMLInputElement>('input[name="phone"]');
      if (phone) phone.required = mode === "interview";
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
      if (mode === "interview" && !phone) {
        status.textContent = "Bitte geben Sie eine Telefonnummer für das Interview an.";
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
            ? "Danke. Wir melden uns telefonisch für das Interview."
            : "Danke. Wir melden uns, sobald Sie LAVIDRO live erleben können.";
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
