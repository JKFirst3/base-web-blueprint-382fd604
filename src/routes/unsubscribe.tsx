import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
  head: () => ({
    meta: [
      { title: "Newsletter abmelden – Lavidro" },
      { name: "description", content: "Melde dich von E-Mails von Lavidro ab." },
      { property: "og:title", content: "Newsletter abmelden – Lavidro" },
      { property: "og:description", content: "Melde dich von E-Mails von Lavidro ab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type State = "loading" | "valid" | "invalid" | "already" | "done" | "error";

function UnsubscribePage() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
    if (!t) {
      setState("invalid");
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return setState("invalid");
        if (data.valid) return setState("valid");
        setState(data.reason === "already_unsubscribed" ? "already" : "invalid");
      })
      .catch(() => setState("error"));
  }, []);

  const confirm = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) setState("done");
      else if (data.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-semibold">E-Mail-Abmeldung</h1>
        {state === "loading" && <p className="mt-4 text-muted-foreground">Einen Moment …</p>}
        {state === "valid" && (
          <>
            <p className="mt-4 text-muted-foreground">
              Möchtest du keine E-Mails mehr von Lavidro erhalten?
            </p>
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Wird abgemeldet …" : "Abmeldung bestätigen"}
            </button>
          </>
        )}
        {state === "done" && (
          <p className="mt-4 text-muted-foreground">
            Du wurdest erfolgreich abgemeldet. Du erhältst keine weiteren E-Mails von uns.
          </p>
        )}
        {state === "already" && (
          <p className="mt-4 text-muted-foreground">Du bist bereits abgemeldet.</p>
        )}
        {state === "invalid" && (
          <p className="mt-4 text-muted-foreground">
            Dieser Abmeldelink ist ungültig oder abgelaufen.
          </p>
        )}
        {state === "error" && (
          <p className="mt-4 text-muted-foreground">
            Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.
          </p>
        )}
        <a href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
          Zurück zur Startseite
        </a>
      </div>
    </main>
  );
}
