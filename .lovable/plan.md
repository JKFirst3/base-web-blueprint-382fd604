# DOI-Sicherheitsnachbesserung

## Umsetzung
- Auf der Bestätigungsseite ausschließlich `#token=...` lesen; Query-Parameter entfernen, ohne automatisch zu bestätigen.
- Den Bestätigungs-POST nur akzeptieren, wenn der `Origin` exakt der Origin der angefragten URL entspricht.
- Das bestehende Limit nur anwenden, wenn die vertrauenswürdige Plattform-IP `cf-connecting-ip` vorhanden und plausibel ist; ohne diese IP nicht alle Besucher unter einem gemeinsamen Schlüssel bündeln und keine anderen IP-Header verwenden.
- Schlägt das Speichern des Pending-Tokens fehl, bestmöglich `send_failed` setzen und dabei keinen Mailversand starten.

## Prüfung
- Automatisiert prüfen: Query-Link liefert keinen nutzbaren Token; Fragment-Link bleibt nutzbar; Same-Origin wird akzeptiert; fremde Lovable-Origin wird mit 403 abgewiesen; fehlende Plattform-IP erzeugt kein gemeinsames Limit; `setPending`-Fehler versucht `send_failed`.
- Bestehende DOI-Tests sowie Typprüfung und Vorschau-Build prüfen.
- Keine echten Formularsendungen, E-Mails oder Veröffentlichung.
