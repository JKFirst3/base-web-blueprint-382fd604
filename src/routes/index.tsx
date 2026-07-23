import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import homeHtml from "@/content/home.html?raw";
import { CodexMarkup, useCodexRuntime } from "@/components/site/CodexPage";
import { supabase } from "@/integrations/supabase/client";
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
      track("lead_form_submit_attempt", { channel: painPoint || "unspecified" });

      const { error } = await supabase.from("leads").insert({
        name: name || null,
        email,
        pain_point: painPoint || null,
        consent,
      });

      if (button) {
        button.disabled = false;
        button.textContent = "Jetzt eintragen";
      }

      if (error) {
        status.textContent =
          "Die Eintragung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.";
        track("lead_form_submit_error", { code: error.code });
        return;
      }

      form.reset();
      status.textContent = "Danke. Wir melden uns, sobald Sie LAVIDRO live erleben können.";
      track("lead_form_submit_success", { channel: painPoint || "unspecified" });
    };

    form.addEventListener("submit", onSubmit, { capture: true });
    return () => form.removeEventListener("submit", onSubmit, { capture: true });
  }, []);

  return <CodexMarkup html={homeHtml} />;
}
