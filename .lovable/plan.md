## Lavidro Landing Page — Plan

A single-page, premium lead-gen landing page in German, built on the existing TanStack Start + Tailwind v4 + shadcn stack, using the warm Lavidro palette and the provided SVG logo assets.

### Sections (all on `/`)

1. **Header** — horizontal Lavidro logo (left), CTA button "Jetzt eintragen" (right) that smooth-scrolls to the form.
2. **Hero** — left: H1 with the long USP headline, subheading "Lavidro — Textile Care Intelligence.", primary CTA "Auf die Warteliste setzen" (scrolls to form). Right: abstract SVG of folded clothing (custom inline SVG, warm sand tones).
3. **Features** — two `#EAE4D5` cards: "Vollständig Autonom" + "Textilschonend & Sicher", with subtle sand-colored line icons.
4. **Lead capture** — centered card, fields: Name, E-Mail (required), optional Select "Was stört dich an deiner Wäsche am meisten?" (4 options), GDPR checkbox, submit "Jetzt eintragen". Success overlay on submit.
5. **Footer** — small logo icon, © Lavidro, links to `/impressum` and `/datenschutz` (stub routes with placeholder text).

### Design system

- Update `src/styles.css` tokens to brand palette:
  - `--background` `#F3F2EE`, `--foreground` `#323232`
  - `--card` `#EAE4D5`, `--border` / `--ring` / `--accent` `#CCC2AC`
  - `--primary` `#000000` / `--primary-foreground` `#FFFFFF` (hover inverts to sand)
- Load Montserrat (headings, uppercase wide tracking) + Inter (body) via `<link>` tags in `__root.tsx` head; register `--font-display` and `--font-sans` in `@theme`.
- Reusable `.font-display` for the wordmark/headings.

### Logo assets

Upload the three provided SVGs via `lovable-assets` and reference the horizontal logo in the header, the icon-only version in the footer.

### Lead storage

Enable **Lovable Cloud** to persist signups:
- Table `public.leads` (id, name, email, pain_point, consent, created_at) with proper GRANTs, RLS enabled, INSERT policy allowing `anon` (public waitlist), SELECT restricted to `service_role` only.
- Submit handler uses the browser Supabase client to insert; on success shows an animated overlay ("Danke! Wir melden uns.") and resets the form.

### Interactions

- Smooth scroll via `element.scrollIntoView({ behavior: "smooth" })` for both CTAs (anchor `#waitlist`).
- Section enter animations using a small `useInView` + `animate-fade-in` utility (already in animation set).
- Button hover: black ↔ sand transition; tactile scale-down on click.

### Responsiveness

Mobile-first: hero stacks single-column under `md`, feature cards stack, form card full-width with comfortable padding.

### Technical details

- Files to create:
  - `src/routes/index.tsx` (replace placeholder) — composes sections
  - `src/components/site/Header.tsx`, `Hero.tsx`, `Features.tsx`, `LeadForm.tsx`, `Footer.tsx`, `FoldedClothesArt.tsx`
  - `src/routes/impressum.tsx`, `src/routes/datenschutz.tsx` (minimal placeholders)
  - Asset pointers under `src/assets/lavidro-*.svg.asset.json`
- Files to edit:
  - `src/styles.css` — tokens + font registration
  - `src/routes/__root.tsx` — Google Fonts links, default `<html lang="de">`, base meta
- Cloud migration: create `leads` table + RLS + GRANTs.
- SEO: title "Lavidro — Textile Care Intelligence", meta description from USP, og tags, single H1.

### Out of scope

- Email notifications / double opt-in (can be added later via edge function + Resend).
- Admin dashboard for viewing leads (rows are accessible via Cloud backend view).
