# Widerruf ohne Seiten-Neuladen: Same-Origin-Einwilligungsschranke für PostHog

## Ziel
- Nach dem Widerruf erreicht kein Ereignis mehr PostHog, auch keine erneuten Sendeversuche.
- Die Seite lädt nicht neu, halb ausgefüllte Formulare bleiben erhalten.
- Eine erneute Einwilligung funktioniert sofort.
- Keine Änderung am Aussehen der Seite, nichts wird veröffentlicht.

## Idee
Der Browser sendet Analyse-Ereignisse nicht mehr direkt an PostHog. Er sendet sie an eine eigene, eng begrenzte Adresse auf lavidro.com. Diese Adresse prüft bei **jeder** Anfrage, auch bei jedem erneuten Sendeversuch, das Einwilligungs-Cookie. Nur wenn die Einwilligung gilt und zum Ereignis passt, wird das bereinigte Ereignis an die feste PostHog-EU-Adresse weitergegeben. Sonst wird es still verworfen. Der Server antwortet dann mit „200", damit die Bibliothek den Versuch nicht wiederholt.

```text
Browser (posthog-js, api_host = /api/public/ph-ingest)
   │  POST /api/public/ph-ingest/e/   (gleiche Domain, Cookie lavidro_consent wird mitgesendet)
   ▼
Schranke:  Herkunft ok? · Größe ok? · Einwilligung = true? · consent_ts passt? · Token passt? · Ereignis und Felder erlaubt?
   │ ja                                            │ nein
   ▼                                               ▼
fester Aufruf https://eu.i.posthog.com/e/       200 {"status":1}, verworfen, kein Log des Inhalts
```

Warum das gleich sicher wie das Neuladen ist: Wiederholte Sendeversuche gehen zwangsläufig über die Schranke. Nach dem Widerruf steht im Cookie `analytics:false`, also wird jeder dieser Versuche serverseitig abgewiesen. Dafür wird weder in das Innenleben der Bibliothek noch in die Netzwerkfunktionen des Browsers eingegriffen.

## Kopplung an die Einwilligung (Schutz auch nach erneuter Einwilligung)
- Bei jeder Einwilligung setzt der Client die Eigenschaft `consent_ts` auf den Zeitstempel `ts` aus dem Cookie `lavidro_consent`.
- Die Schranke leitet ein Ereignis nur weiter, wenn gilt: `consent_ts` ist gleich `cookie.ts` **und** `cookie.analytics` ist true.
- Ein alter Sendeversuch aus der Zeit vor dem Widerruf trägt den alten Zeitstempel. Er wird deshalb auch nach einer erneuten Einwilligung verworfen.
- `consent_ts` wird vor der Weitergabe entfernt und gelangt nicht zu PostHog.

## Sicherheitsgrenzen der Schranke
- **Kein offener Proxy:**
  - Nur `POST` auf genau den Pfad `/e/` (optional `/batch/`, derzeit wegen `request_batching:false` nicht nötig).
  - Das Ziel ist fest im Code `https://eu.i.posthog.com` (EU). Pfad, Host oder Query des Clients werden nie übernommen.
  - Damit ist SSRF ausgeschlossen.
- **Herkunft / CSRF:**
  - Angenommen wird nur `Sec-Fetch-Site: same-origin`, oder bei älteren Browsern ein `Origin`, der genau zum eigenen Host passt.
  - Es gibt keine CORS-Header und keine OPTIONS-Freigabe.
  - Das Cookie ist `SameSite=Lax`, wird also bei Cross-Site-POST nicht mitgesendet und führt dann ohnehin zum Verwerfen.
- **Größe:** Maximal 32 KB Rohdaten, gezählt beim Einlesen (nicht nur am Content-Length). Maximal 20 Ereignisse pro Anfrage. Sonst Antwort 413 ohne Wiederholung.
- **Format:** Im Client wird `disable_compression: true` gesetzt. Akzeptiert werden nur JSON oder `data=`-Form (base64). Gzip wird nicht angenommen.
- **Positivliste auf dem Server (zweite Stufe neben `before_send`):**
  - Nur die fünf Funnel-Ereignisse und `page_engagement`.
  - Nur erlaubte Eigenschaften, `$set`/`$set_once` werden entfernt.
  - `$process_person_profile=false`, `$geoip_disable=true`, `$current_url` ohne Query.
  - Der Token muss dem eigenen `POSTHOG_API_KEY` entsprechen.
- **Keine IP-Weitergabe:**
  - Der Server ruft PostHog selbst auf und übernimmt keine Header des Browsers (kein `X-Forwarded-For`, kein `User-Agent`, keine Cookies).
  - PostHog sieht damit nur die Server-IP. Die GeoIP-Ermittlung ist ohnehin abgeschaltet.
- **Logs:** Keine Inhalte, keine IPs, kein Token. Höchstens eine knappe Meldung wie „upstream 5xx" oder „rejected: no_consent".
- **Antworten:**
  - Verworfen: 200 (verhindert neue Versuche).
  - Fehler bei PostHog: 502. Die Bibliothek darf dann erneut versuchen, jeder Versuch wird erneut an der Einwilligung geprüft.
  - Alle Antworten mit `Cache-Control: no-store`.
- `/api/public/posthog-config` liefert künftig als `host` die eigene Proxy-Adresse. Der Token wird weiterhin nur dort ausgegeben.

## Client-Änderungen (`src/lib/analytics.ts`)
- `api_host` wird auf `${origin}/api/public/ph-ingest` gesetzt, zusätzlich `disable_compression: true`.
- `consent_ts` wird per `register` gesetzt und bei erneuter Einwilligung neu gesetzt.
- Beim Widerruf laufen `opt_out_capturing`, `reset` und das Löschen der Speicherdaten wie bisher. `window.location.reload()` entfällt.
- Der Kommentar beschreibt nur die nachgewiesene Wirkung.

## Testplan (lokal, PostHog abgefangen, keine echten Sendungen, kein Formular)
1. **Schranke direkt testen:**
   - Ohne Cookie → verworfen.
   - Mit `analytics:false` → verworfen.
   - Mit falschem `consent_ts` → verworfen.
   - Fremder `Origin` / `Sec-Fetch-Site: cross-site` → 403.
   - Mehr als 32 KB → 413.
   - Unbekanntes Ereignis oder unerlaubtes Feld → entfernt.
   - Fremder Token → verworfen.
   - Pfad außer `/e/` → 404.
   - Der Aufruf an die EU-Adresse wird auf Serverseite nachgebildet und nicht wirklich ausgeführt.
2. **Ganzer Ablauf mit Verzögerung und Fehlern:** Die Weitergabe an PostHog wird 4 s festgehalten und endet dann mit 503. Ablauf: Einwilligung → `landing_page_viewed`, `product_area_viewed` → Widerruf während laufender Wiederholungen → 60 s beobachten. Erwartet: kein einziger Aufruf erreicht die (abgefangene) EU-Adresse, und es gab kein Neuladen der Seite.
3. **Formular bleibt erhalten:** Im Anfragefenster Testtext eintippen, nicht absenden → Widerruf → der Text ist noch da.
4. **Erneute Einwilligung:** Neue Ereignisse mit neuem `consent_ts` kommen an. Alte Wiederholungen mit altem `consent_ts` bleiben verworfen.
5. **Cookies und Speicher:** Nach dem Widerruf nur `lavidro_consent` und keine `ph_`-Einträge. Nach erneuter Einwilligung ist `ph_…` wieder da.
6. **Weitere Prüfungen:**
   - Keine Anfrage an eine `*.posthog.com`-Adresse direkt aus dem Browser.
   - Test-Browser mit normalem Chrome-Profil (sonst verwirft PostHog die Ereignisse).
   - Typprüfung und Build.

## Offene Punkte / Risiken
- **Zusätzliche Server-Anfragen:** Jede Analyse-Anfrage läuft jetzt über den eigenen Server. Das ist bei den geringen Mengen vertretbar.
- **Bibliotheks-Updates:** Künftige Versionen könnten andere Pfade (`/i/v0/e/`) nutzen. Die Schranke verwirft sie dann, es entsteht kein Datenleck. Die Version bleibt fest, und der Test prüft die Pfade.
- **Datenschutzerklärung:** Sie sollte später erwähnen, dass Ereignisse über den eigenen Server an PostHog EU weitergeleitet werden, ohne IP des Besuchers. Die juristische Prüfung und die DPA mit PostHog bleiben offen.
- **Anfragen schon unterwegs:** Eine Anfrage, die vor dem Widerruf den Server bereits passiert hat, kann noch ankommen.

## Schlüsselprüfung
Endet der konfigurierte POSTHOG_API_KEY auf „UPs7hV"? **Ja.** Belegt über den Namen des PostHog-Cookies, das im Test der Vorschau aus dem ausgelieferten Token entstanden ist. Für die veröffentlichte Version ist das nicht separat geprüft.
