import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";

const TITLE = "Kontakt — Lavidro";
const DESCRIPTION =
  "Nimm Kontakt mit dem Lavidro-Team auf. Wir freuen uns auf deine Nachricht.";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "https://lavidro.com/kontakt" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://lavidro.com/kontakt" }],
  }),
  component: KontaktPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Bitte gib deinen Namen ein.").max(100),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein.").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Bitte gib eine Nachricht ein.").max(2000),
});

function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, subject, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
            {success && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/95 backdrop-blur-sm animate-fade-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
                  <Check className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold">Nachricht gesendet.</h3>
                <p className="mt-2 max-w-sm text-center text-foreground/70">
                  Danke für deine Nachricht. Wir melden uns so bald wie möglich bei dir.
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Kontakt
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Schreib uns
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-foreground/75">
                Hast du Fragen, Anregungen oder möchtest mit uns zusammenarbeiten? Wir freuen uns
                auf deine Nachricht.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-foreground/50">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    autoComplete="name"
                    className="h-11 bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    E-Mail-Adresse <span className="text-foreground/50">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    autoComplete="email"
                    className="h-11 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Betreff</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  className="h-11 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Nachricht <span className="text-foreground/50">*</span>
                </Label>
                <Textarea
                  id="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={6}
                  className="bg-background"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-full text-base transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
              >
                {submitting ? "Wird gesendet…" : "Nachricht senden"}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
