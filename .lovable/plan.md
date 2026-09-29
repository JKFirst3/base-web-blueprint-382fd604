# Anfrage- und DOI-Ablauf härten

## Umsetzung
- Den Anfrage-Endpunkt wie die DOI-Bestätigung auf exakte Same-Origin-Prüfung umstellen. Fehlender oder abweichender `Origin` wird abgewiesen; für das freiwillige lokale Limit zählt ausschließlich `cf-connecting-ip`. Fehlt diese vertrauenswürdige Plattform-IP, wird kein gemeinsamer Ersatzschlüssel verwendet.
- Jede Formularöffnung erhält eine zufällige, nicht personenbezogene Anfrage-ID. Diese wird beim ersten Absenden wiederverwendet und in einer neuen optionalen, eindeutigen Datenbankspalte gespeichert. Die sechs bestehenden Datensätze bleiben wegen `NULL` unverändert.
- Der Server behandelt Wiederholungen derselben Anfrage-ID idempotent: genau ein Datensatz und ein DOI-Versandversuch. Ein erneuter Versuch nach Browser-Timeout liest nur den bereits gespeicherten Zustand zurück und erzeugt keine zweite Anfrage oder zweite Mail.
- Die Antwort unterscheidet „gespeichert und Mail versendet“, „gespeichert, Versand noch in Bearbeitung“ und `send_failed`. Das Formular zeigt den sicheren Eingang immer als Erfolg, behauptet bei `send_failed` aber nicht, eine E-Mail sei verschickt worden. Der vorhandene 10-Sekunden-Timeout bleibt als Schutz bestehen; nach Timeout erklärt die Meldung neutral, dass der Status unklar ist und ein erneuter Versuch dieselbe Anfrage fortsetzt.

## Tests
- Exakte Same-Origin akzeptieren; fehlenden und fremden Origin einschließlich fremder Lovable-Origin mit 403 ablehnen.
- Nur `cf-connecting-ip` für das Limit verwenden; ohne diese Angabe keine gemeinsame Begrenzung.
- Wiederholte und parallele Anfrage-ID erzeugt nur einen Datensatz und höchstens einen Mailversuch; bestehende Datensätze bleiben unberührt.
- Speicherfehler, Mailfehler, verzögerte Mail/Client-Timeout und Wiederholung abdecken; Erfolgstexte für `sent`, `processing` und `send_failed` prüfen.
- Ereignisnamen und Rechtstexte unverändert lassen; gezielte Tests sowie automatische Typ- und Build-Prüfung auswerten. Keine echten Formulare, Mails oder Veröffentlichung.

## Technische Details
- Die Idempotenz wird durch einen eindeutigen Datenbankindex auf der neuen Anfrage-ID erzwungen, nicht durch Prozessspeicher.
- Stufe 5 bleibt an den erfolgreichen Datenbankeintrag gekoppelt; DOI bleibt ein nachgelagerter Versandstatus.
- Es werden keine E-Mail-Adressen, Namen oder Tokens in Logs oder Antworten ergänzt.
