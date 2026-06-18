## Welche Subprocessors / Drittdienste laufen aktuell auf der Seite?

Ich habe den Code geprüft (`package.json`, `__root.tsx`, Integrationen, alle Routen). Es laufen **keine** Tracker, Analytics-Tools, Stripe, Sentry, Hotjar oder ähnliches. Es gibt aber drei datenschutzrelevante Drittdienste/Subprocessors, die nach DSGVO Art. 13 in der Datenschutzerklärung genannt werden müssen:

### 1. Lovable Cloud (Backend / Datenbank / Hosting der API)
- **Verarbeiter:** Supabase, Inc., 970 Toa Payoh North #07-04, Singapore (mit EU-Hosting über Lovable)
- **Anbieter der Plattform:** Lovable AB, Stockholm, Schweden
- **Zweck:** Speicherung der Warteliste (`leads`) und Kontaktformular-Nachrichten (`contact_messages`); Bereitstellung der Backend-API.
- **Daten:** Name, E-Mail, ggf. Pain Point / Nachricht, Zeitstempel, IP-Metadaten bei API-Aufrufen.
- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Anbahnung) bzw. lit. a (Einwilligung) für die Warteliste, lit. f für das Kontaktformular.

### 2. Cloudflare (Hosting / CDN / Edge)
- **Verarbeiter:** Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA
- **Zweck:** Auslieferung der Website über das CDN von Lovable; bei jedem Aufruf wird die IP-Adresse verarbeitet.
- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (sichere und performante Bereitstellung).
- **Drittland:** USA, Übermittlung auf Basis Standardvertragsklauseln + EU-US Data Privacy Framework.

### 3. Google Fonts (in `__root.tsx` per `<link>` eingebunden)
- **Verarbeiter:** Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Irland (Mutter: Google LLC, USA)
- **Zweck:** Laden der Schriften „Montserrat" und „Inter" vom Google-CDN. Dabei wird die IP-Adresse an Google übertragen.
- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO. **Achtung:** Das LG München (Urteil v. 20.01.2022, Az. 3 O 17493/20) hat die Einbindung von Google Fonts vom Google-Server ohne Einwilligung als rechtswidrig eingestuft. Wer sicher gehen will, sollte Google Fonts **selbst hosten** (siehe optionaler Schritt unten).

### Was läuft NICHT (zur Klarstellung — muss nicht erwähnt werden)
- Keine Google Analytics, kein GTM, kein Meta Pixel, kein Hotjar/PostHog/Sentry, kein Stripe.
- Keine Cookies außer technisch notwendige (Supabase-Session-Storage nur bei eingeloggten Nutzern — derzeit gibt es keinen Login).

---

## Geplante Umsetzung

**Datei:** `src/routes/datenschutz.tsx` (oder wie das Pendant zu `impressum.tsx` heißt — ich prüfe das in Build-Mode und passe an).

Ich füge dort folgende Abschnitte hinzu bzw. ergänze sie, im selben Stil wie das Impressum (`<section>` mit `font-display`-Überschriften):

1. **Verantwortlicher** (Robin Zach, Jonah Blümel, Adresse, E-Mail — Übernahme aus Impressum)
2. **Hosting & Bereitstellung der Website** → Cloudflare + Lovable
3. **Datenbank & Backend** → Lovable Cloud / Supabase
4. **Warteliste** → Zweck, gespeicherte Felder (Name, E-Mail, Pain Point, Consent), Rechtsgrundlage Art. 6 (1) a + b DSGVO, Speicherdauer, Widerrufsrecht
5. **Kontaktformular** → Zweck, gespeicherte Felder (Name, E-Mail, Betreff, Nachricht), Rechtsgrundlage Art. 6 (1) b/f DSGVO
6. **Schriftarten (Google Fonts)** → Beschreibung + Hinweis auf Drittlandübermittlung
7. **Betroffenenrechte** (Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Beschwerde bei Aufsichtsbehörde — zuständig: LDI NRW, da Paderborn)
8. **SSL/TLS-Verschlüsselung**
9. **Aktualität der Erklärung**

## Optional (empfohlen, separate Entscheidung)

**Google Fonts selbst hosten**, um die Drittland-Übermittlung an Google zu vermeiden. Das hieße: `<link>` zu `fonts.googleapis.com` in `__root.tsx` entfernen, Schriftdateien in `src/assets/fonts/` ablegen und per `@font-face` in `src/styles.css` einbinden. Sag Bescheid, ob ich das mit erledigen soll — dann fliegt Punkt 6 oben fast komplett raus.

## Hinweis

Ich bin keine Rechtsberatung; der Text wird sachlich korrekt formuliert, aber für eine rechtssichere finale Version solltest du ihn ggf. von einem Anwalt prüfen lassen.
