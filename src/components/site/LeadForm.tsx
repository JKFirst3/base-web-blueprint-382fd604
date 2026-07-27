import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { track } from "@/lib/track";

const schema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein.").max(255),
  pain_point: z.string().max(100).optional(),
  consent: z.boolean().refine((v) => v === true, "Bitte stimme der Zusendung von Updates zu."),
  request_type: z.enum(["termin", "interview"]),
  phone: z.string().trim().max(40).optional(),
  availability: z.string().trim().max(500).optional(),
});

const meetingOptions = ["Digital", "Showroom Paderborn"];

export function LeadForm() {
  return (
    <section id="waitlist" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <LeadFormCard />
    </section>
  );
}

export function LeadFormCard({ intro }: { intro?: React.ReactNode } = {}) {
  const [mode, setMode] = useState<"termin" | "interview">("termin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pain, setPain] = useState<string | undefined>();
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      name,
      email,
      pain_point: mode === "termin" ? pain : undefined,
      consent,
      request_type: mode,
      phone,
      availability,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (mode === "interview" && !parsed.data.phone) {
      toast.error("Bitte gib eine Telefonnummer für das Interview an.");
      return;
    }
    setSubmitting(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10_000);
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name || null,
          email: parsed.data.email,
          pain_point: parsed.data.pain_point || null,
          consent: parsed.data.consent,
          request_type: parsed.data.request_type,
          phone: parsed.data.phone || null,
          availability: parsed.data.availability || null,
        }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeout));

      if (!response.ok) throw new Error(`Lead request failed: ${response.status}`);

      track("live_experience_success");
      setSuccess(true);
    } catch (error) {
      console.error("[lead-form] Submission failed", error);
      toast.error("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12">
      {success && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/95 backdrop-blur-sm animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
            <Check className="h-7 w-7" strokeWidth={2.2} />
          </div>
          <h3 className="mt-6 font-display text-2xl font-semibold">Willkommen an Bord.</h3>
          <p className="mt-2 max-w-sm text-center text-foreground/70">
            Danke! Wir melden uns mit exklusiven Einblicken, sobald es Neues von Lavidro gibt.
          </p>
        </div>
      )}

      {intro}

      <div className="text-center">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
          LAVIDRO live erleben
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Exklusiver Einblick
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-foreground/75">
          Vereinbare eine unverbindliche Produktvorstellung. Wir zeigen dir unsere automatisierte
          Wäschelösung und freuen uns auf dein Feedback.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
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
          <Label htmlFor="pain">Produktvorstellung (optional)</Label>
          <Select value={pain} onValueChange={setPain}>
            <SelectTrigger id="pain" className="h-11 bg-background">
              <SelectValue placeholder="Bitte auswählen" />
            </SelectTrigger>
            <SelectContent>
              {meetingOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-start gap-3 pt-1 text-sm text-foreground/80">
          <Checkbox
            checked={consent}
            onCheckedChange={(v) => setConsent(v === true)}
            className="mt-0.5"
          />
          <span>Ich stimme zu, Updates von LAVIDRO zu erhalten.</span>
        </label>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-full text-base transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
        >
          {submitting ? "Wird gesendet…" : "Jetzt eintragen"}
        </Button>
      </form>
    </div>
  );
}
