# Produktionsdiagnose: Analytics und Formularzugriff

## Belegte Befunde

- **Der veröffentlichte Browser-Build hat keine nutzbare Client-Konfiguration für Lovable Cloud.** Auf `https://lavidro.com/` wurde nach gesetzter Analyse-Einwilligung reproduzierbar zweimal geloggt: `[Supabase] Missing ... SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY`. Ohne Einwilligung trat der Fehler beim Seitenaufruf nicht auf.
- **Der Fehler entsteht vor dem PostHog-Konfigurationsabruf.** `getPosthogConfig` ist eine öffentliche Server-Funktion. Global läuft davor jedoch `attachSupabaseAuth`, das im Browser immer `supabase.auth.getSession()` aufruft. Dieser Client erwartet `VITE_SUPABASE_URL` und `VITE_SUPABASE_PUBLISHABLE_KEY`; fehlen sie, bricht der Aufruf ab. `analytics.ts` fängt diesen Fehler still ab und liefert keinen PostHog-Client. Beim kontrollierten Live-Test gab es deshalb keinen Server-Funktionsaufruf und keinen PostHog-Netzwerkversuch.
- **Damit liefert `getPosthogConfig` im aktuellen produktiven Browserfluss faktisch keinen Token an PostHog.** Ob der Server selbst den richtigen Token für Projekt 286901 enthält, ist dadurch noch nicht bewiesen.
- **Die PostHog-Konfigurationsnamen sind im Projekt vorhanden:** `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID` und `POSTHOG_REGION`, verwaltet über die bestehende Verbindung. Die Werte sind verborgen. Das belegt weder die tatsächliche Übergabe an das derzeit veröffentlichte Deployment noch, dass Token und Projekt-ID zu Projekt 286901 gehören.
- **Der Code würde nur einen öffentlichen `phc_…`-Token akzeptieren und bei Region `eu` den EU-Endpunkt zurückgeben.** Die Projekt-ID wird von `getPosthogConfig` nicht gelesen oder abgeglichen.
- **Der öffentliche Vorbestell-Endpunkt ist erreichbar und seine Eingabeprüfung läuft.** Ein leerer POST auf `https://lavidro.com/api/public/preorders` ergab erwartungsgemäß `400 Invalid preorder`; es wurde kein Datensatz erzeugt und keine E-Mail angestoßen.
- **Datenbankzugriff des produktiven Vorbestell-Endpunkts ist noch nicht bewiesen.** Die Prüfung der Server-Konfiguration und der Schreibzugriff erfolgen erst nach vollständig gültigen Formulardaten. Ohne echten Eintrag oder einen separaten nicht schreibenden Diagnoseweg lässt sich dieser Teil nicht sicher auslösen. In den Produktionsprotokollen der letzten Stunde gab es keinen belegten erfolgreichen oder fehlgeschlagenen gültigen Vorbestell-Schreibversuch.
- **Lovable Cloud selbst ist aktiv und nicht pausiert.** Das beweist aber nicht, dass die vom veröffentlichten Endpunkt erwarteten Servervariablen in genau diesem Deployment verfügbar sind.

## Konkrete nächste Prüf- und Fixschritte

1. **Öffentliche PostHog-Konfiguration vom globalen Login-Anhänger entkoppeln** oder den Anhänger so absichern, dass öffentliche Server-Funktionen ohne vorhandene Browser-Konfiguration aufgerufen werden können. Alternativ muss die fehlende öffentliche Lovable-Cloud-Konfiguration korrekt in den Browser-Build injiziert werden.
2. **Danach neu veröffentlichen und ohne Eventversand prüfen:** `getPosthogConfig` muss in Produktion erfolgreich antworten; protokolliert werden nur `Token vorhanden: ja`, Präfix `phc_`, EU-Host und – separat über die Verbindungskonfiguration – die Zuordnung zu Projekt 286901, niemals der Token selbst.
3. **Dann einen kontrollierten Analytics-Test durchführen:** Einwilligung setzen, PostHog-Übertragung zunächst abfangen und Payload/Host prüfen; anschließend nur nach Freigabe genau ein gekennzeichnetes Testereignis wirklich senden und in Projekt 286901 bestätigen.
4. **Für `/api/public/preorders` einen nicht schreibenden Produktions-Healthcheck vorsehen** oder einen ausdrücklich freigegebenen, klar markierten Testdatensatz verwenden. Erst damit lassen sich Server-Konfiguration, Tabellenzugriff und Richtlinien Ende-zu-Ende belegen. Der bisherige 400-Test belegt nur Erreichbarkeit und Validierung.
5. **Produktionsprotokolle nach den exakten Meldungen prüfen:** `Backend configuration is unavailable`, `Insert failed` und Fehler des PostHog-Konfigurationsabrufs. Aktuell lagen dazu keine Treffer aus der letzten Stunde vor.

## Unverändert

Keine Code-, Datenbank- oder Deployment-Änderung; kein Publish; keine echte Formularübermittlung; kein PostHog-Ereignis gesendet. Beim Live-Test wurden mögliche PostHog-Anfragen zusätzlich blockiert.
