# LAVIDRO Website

Die LAVIDRO Website verbindet das bestehende visuelle Konzept mit der
Lovable-Infrastruktur und Supabase als Backend.

## Lokal starten

Voraussetzungen:

- Node.js 24 oder neuer (Tests verwenden Nodes TypeScript- und Modul-Mocking-Unterstützung)
- npm oder Bun

```bash
npm install
cp .env.example .env
npm run dev
```

Die lokale Adresse wird anschließend im Terminal angezeigt.

## Umgebungsvariablen

Die benötigten Werte werden lokal in `.env` eingetragen:

```text
SUPABASE_PROJECT_ID=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
```

Die echte `.env` darf nicht in GitHub gespeichert werden. Für Lovable oder
andere Hosting-Dienste werden dieselben Werte in den jeweiligen
Projekteinstellungen hinterlegt.

## Datenbank

Die Supabase-Struktur liegt unter `supabase/migrations`. Neue Umgebungen
benötigen diese Migrationen, bevor Formulare und Vorbestellungen vollständig
gespeichert werden können.

Verwendete Tabellen:

- `leads` für die Warteliste
- `contact_messages` für Kontaktanfragen
- `preorders` für Konfigurationen und Vorbestellungen

## Prüfungen

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Projektstruktur

- `.lovable/` Lovable-Projektinformationen
- `public/` Bilder und browserseitige Laufzeitdateien
- `src/` Website, Routen und Supabase-Anbindung
- `supabase/` Datenbankkonfiguration und Migrationen

Die Tests ersetzen Datenbank, E-Mail-Versand und PostHog durch lokale Test-Doubles.
Sie laden keine `.env` und senden keine echten Anfragen oder E-Mails.
`npm run dev` lädt dagegen die lokale Umgebung: Formularübermittlungen dort
dürfen nur mit ausdrücklich freigegebenem Test-Backend erfolgen.
