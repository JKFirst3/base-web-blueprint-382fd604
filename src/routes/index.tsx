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

    const onSubmit = async (event: SubmitEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const data = new FormData(form);
      const name = String(data.get("name") ?? "").trim();
      const email = String(data.get("email") ?? "").trim();
      const painPoint = String(data.get("pain") ?? "").trim();
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
            pain_point: painPoint || null,
            consent,
          }),
          signal: controller.signal,
        }).finally(() => window.clearTimeout(timeout));

        if (!response.ok) throw new Error(`Lead request failed: ${response.status}`);

        form.reset();
        status.textContent = "Danke. Wir melden uns, sobald Sie LAVIDRO live erleben können.";
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
    return () => form.removeEventListener("submit", onSubmit, { capture: true });
  }, []);

  return <CodexMarkup html={homeHtml} />;
}
