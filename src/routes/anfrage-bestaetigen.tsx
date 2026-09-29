import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { captureEmailConfirmed } from "@/lib/analytics";

export const Route = createFileRoute("/anfrage-bestaetigen")({
  headers: () => ({ "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" }),
  head: () => ({
    meta: [
      { title: "Anfrage bestätigen | Lavidro" },
      { name: "description", content: "Bestätigen Sie Ihre E-Mail-Adresse für Ihre unverbindliche Lavidro-Anfrage." },
      { name: "referrer", content: "no-referrer" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Anfrage bestätigen | Lavidro" },
      { property: "og:description", content: "E-Mail-Adresse für Ihre Lavidro-Anfrage bestätigen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfirmPage,
});

type State = "ready" | "missing" | "sending" | "confirmed" | "already_confirmed" | "expired" | "invalid" | "error";

const TEXT: Record<Exclude<State, "ready" | "sending">, { title: string; body: string }> = {
  confirmed: { title: "Vielen Dank, Ihre E-Mail-Adresse ist bestätigt.", body: "Ihre Anfrage ist vollständig. Wir melden uns zu den nächsten Schritten." },
  already_confirmed: { title: "Diese Anfrage ist bereits bestätigt.", body: "Sie müssen nichts weiter tun." },
  expired: { title: "Dieser Bestätigungslink ist nicht mehr gültig.", body: "Ihre Anfrage bleibt trotzdem gespeichert. Wenn Sie die Bestätigung nachholen möchten, schreiben Sie uns gern über die Kontaktseite." },
  invalid: { title: "Dieser Link konnte nicht verwendet werden.", body: "Bitte öffnen Sie den Link direkt aus der E-Mail. Falls es weiterhin nicht klappt, schreiben Sie uns über die Kontaktseite." },
  missing: { title: "Kein Bestätigungslink gefunden.", body: "Bitte öffnen Sie den Link direkt aus der E-Mail." },
  error: { title: "Das hat gerade nicht geklappt.", body: "Bitte versuchen Sie es in einem Moment noch einmal." },
};

function ConfirmPage() {
  const token = useRef<string | null>(null);
  const [state, setState] = useState<State>("ready");

  useEffect(() => {
    // Read once, then remove the token from the address bar and history immediately.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    token.current = hash.get("token") ?? query.get("token");
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (!token.current) setState("missing");
  }, []);

  async function confirm() {
    if (!token.current) return setState("missing");
    setState("sending");
    try {
      const res = await fetch("/api/public/preorder-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.current }),
        referrerPolicy: "no-referrer",
      });
      const data = (await res.json().catch(() => ({}))) as { status?: string };
      const s = data.status;
      if (s === "confirmed" || s === "already_confirmed" || s === "expired" || s === "invalid") {
        token.current = null;
        setState(s);
        if (s === "confirmed") void captureEmailConfirmed();
      } else setState("error");
    } catch {
      setState("error");
    }
  }

  const done = state !== "ready" && state !== "sending";
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-20 text-center">
      <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">Unverbindliche Anfrage</p>
      {done ? (
        <>
          <h1 className="mt-4 font-display text-3xl font-semibold">{TEXT[state].title}</h1>
          <p className="mt-4 text-foreground/75">{TEXT[state].body}</p>
          <Link to="/" className="mt-8 inline-block underline">Zur Startseite</Link>
        </>
      ) : (
        <>
          <h1 className="mt-4 font-display text-3xl font-semibold">E-Mail-Adresse bestätigen</h1>
          <p className="mt-4 text-foreground/75">Bitte bestätigen Sie mit einem Klick, dass diese Anfrage von Ihnen stammt.</p>
          <button
            type="button"
            onClick={confirm}
            disabled={state === "sending"}
            className="mx-auto mt-8 rounded-full bg-foreground px-8 py-3 text-background transition hover:bg-accent hover:text-accent-foreground"
          >
            {state === "sending" ? "Wird bestätigt …" : "Jetzt bestätigen"}
          </button>
        </>
      )}
    </main>
  );
}
