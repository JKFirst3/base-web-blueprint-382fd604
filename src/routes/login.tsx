import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "",
  }),
  head: () => ({
    meta: [
      { title: "Anmelden — Lavidro" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Interner Zugang für das Lavidro Team: Anmeldung für Verwaltung und Agenten-Integrationen.",
      },
      { property: "og:title", content: "Anmelden — Lavidro" },
      {
        property: "og:description",
        content: "Interner Zugang für das Lavidro Team.",
      },
    ],
  }),
  component: LoginPage,
});

function safeNext(next: string): string {
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setNotice("Konto angelegt. Bitte bestätige zuerst die E-Mail und melde dich danach an.");
        setMode("signin");
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (signInError) {
        setError("Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.");
        return;
      }
    }
    const target = safeNext(next);
    if (target.startsWith("/.lovable/")) {
      window.location.href = target;
      return;
    }
    void navigate({ to: target });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-foreground">
          {mode === "signup" ? "Konto anlegen" : "Anmelden"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Interner Zugang für das Lavidro Team.
        </p>

        <label className="mt-6 block text-sm font-medium text-foreground" htmlFor="email">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />

        <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="password">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          {busy ? "Anmelden…" : "Anmelden"}
        </button>
      </form>
    </main>
  );
}
