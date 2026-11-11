# La Vidro – Website

Dieses Repository enthält den Quellcode der [La Vidro-Website](https://lavidro.com). Die Website stellt die Wäscheautomatisierungskonzepte La Vidro One, Mobile und Cabinet vor. Besucher können die Produkte vergleichen, den Konfigurator nutzen und eine unverbindliche Produktanfrage stellen.

Die Website nutzt React, TypeScript und TanStack Start mit Vite. Supabase speichert Einträge für die Warteliste und Produktanfragen. Lovable versendet die Bestätigungsmails für das Double-Opt-in. PostHog erfasst ausgewählte Ereignisse nach Einwilligung.

## Lokal starten

Für die automatisierten Tests wird Node.js 24 oder neuer benötigt. Mit Bun und der mitgelieferten `bun.lock` lassen sich die festgeschriebenen Paketversionen installieren.

```bash
bun install --frozen-lockfile
cp .env.example .env
npm run dev
```

Vite zeigt die lokale Adresse im Terminal an. Für die Formularabläufe ein separates Supabase-Testprojekt verwenden, die Migrationen aus [`supabase/migrations/`](supabase/migrations/) darauf anwenden und die Werte in `.env` eintragen.

## Konfiguration

Die [`.env.example`](.env.example) enthält leere Platzhalter für die benötigten Variablen.

| Variablen | Zweck |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Serverseitige Verbindung zu Supabase für öffentliche Formular- und Authentifizierungsabläufe |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Projekt-URL und veröffentlichbarer Schlüssel für den Browser |
| `SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PROJECT_ID` | Projektkennung für Lovable und die MCP-Integration |
| `SUPABASE_SERVICE_ROLE_KEY` | Serverseitiger Schlüssel für das Speichern von Produktanfragen und die Double-Opt-in-Bestätigung |
| `LOVABLE_API_KEY`, `LOVABLE_SEND_URL` | Zugang zum E-Mail-Versand und bei Bedarf eine abweichende Versand-URL |
| `POSTHOG_API_KEY` | Optionaler PostHog-Projektschlüssel mit Präfix `phc_` |

`VITE_`-Variablen können im Browser-Bundle stehen. Zugangsdaten wie `SUPABASE_SERVICE_ROLE_KEY` und `LOVABLE_API_KEY` gehören in die lokale `.env` oder in die Serverumgebung des Hostings. Die Datenbankmigrationen legen das Schema an. Inhalte eines bestehenden Supabase-Projekts werden beim lokalen Setup nicht übernommen.

## Projektstruktur

| Pfad | Inhalt |
| --- | --- |
| [`src/routes/`](src/routes/) | Website-Seiten und API-Routen |
| [`src/components/`](src/components/) und [`src/content/`](src/content/) | UI-Komponenten und Seiteninhalte |
| [`src/lib/`](src/lib/) | Logik für Produktanfragen, Double-Opt-in und Einwilligung |
| [`public/`](public/) | Bilder, Logos und statische Dateien |
| [`supabase/`](supabase/) | Datenbankkonfiguration und Migrationen |
| [`scripts/`](scripts/) | Hilfsdateien für Tests |

## Prüfungen

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Die automatisierten Tests simulieren Supabase, E-Mail-Versand und PostHog. Sie brauchen keine Zugangsdaten und senden keine echten Anfragen oder E-Mails. Beim manuellen Testen von Formularen und Bestätigungsmails die Testumgebung verwenden.

Für eine Bereitstellung muss der Host die Server-Routen von TanStack Start ausführen können. Das Build-Setup nutzt Nitro mit Cloudflare als Standardziel.
