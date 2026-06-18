## Datenschutzerklärung — vollständige Neufassung im „Sie"-Format

Ich übernehme die Generator-Vorlage **wortwörtlich** für die Standard-DSGVO-Bausteine und schreibe alle bestehenden projektspezifischen Abschnitte von „du" auf „Sie" um. Widerspruchsrecht Art. 21 DSGVO in normaler Schreibung (nicht in Großbuchstaben). Newsletter-Block entfällt (kein Newsletter im Einsatz).

### Finale Struktur von `src/routes/datenschutz.tsx`

```
1. Datenschutz auf einen Blick                       [NEU – Vorlage 1:1]
   - Allgemeine Hinweise
   - Wer ist verantwortlich
   - Wie erfassen wir Ihre Daten
   - Wofür nutzen wir Ihre Daten
   - Welche Rechte haben Sie

2. Hosting                                            [projektspezifisch, „Sie"]
   → Cloudflare + Lovable

3. Allgemeine Hinweise und Pflichtinformationen
   - Datenschutz                                      [NEU – Vorlage 1:1]
   - Hinweis zur verantwortlichen Stelle              [vorhanden]
   - Speicherdauer                                    [NEU – Vorlage 1:1]
   - Allgemeine Hinweise zu den Rechtsgrundlagen      [NEU – Vorlage 1:1]
   - Empfänger von personenbezogenen Daten            [NEU – Vorlage 1:1]
   - Widerruf Ihrer Einwilligung                      [NEU – Vorlage 1:1]
   - Widerspruchsrecht Art. 21 DSGVO                  [NEU – normale Schreibung, sonst 1:1]
   - Beschwerderecht bei der Aufsichtsbehörde         [bestehend, auf „Sie" umgestellt]
   - Recht auf Datenübertragbarkeit                   [Vorlage 1:1]
   - Auskunft, Berichtigung und Löschung              [Vorlage 1:1]
   - Recht auf Einschränkung der Verarbeitung         [Vorlage 1:1]
   - SSL- bzw. TLS-Verschlüsselung                    [Vorlage 1:1]

4. Datenerfassung auf dieser Website
   - Kontaktformular                                  [Vorlage 1:1]
   - Warteliste                                       [projektspezifisch, „Sie"]
   - Datenbank und Backend (Lovable Cloud)            [projektspezifisch, „Sie"]
   - Schriftarten (Google Fonts)                      [projektspezifisch, „Sie"]

5. Aktualität dieser Erklärung                        [bestehend, auf „Sie" umgestellt]
```

### Umsetzung

- Datei: `src/routes/datenschutz.tsx` — komplett neu geschrieben.
- Stil unverändert: `font-display`-Überschriften, `mt-10`-Spacing, `<h2>` für Hauptabschnitte, `<h3>` für Unterpunkte im Sammelblock, `<address>` für Adressen, `mailto:`-Links.
- Stand-Datum: Juni 2026 (wie bisher).

### Hinweis

Keine Rechtsberatung. Für die finale Version empfehle ich Anwalts-Review.
