# Factory33-Rechtstexte und begrenzte Anfrage-Analyse

## Ziel
- Impressum und Datenschutzerklärung im bestehenden, unveröffentlichten LAVIDRO-Entwurf auf Factory33 Ecosystem GmbH als Verantwortliche umstellen.
- Beim bereits vorhandenen Ereignis `purchase_interest_submitted` nur drei klar begrenzte, nicht frei auslesbare Zusatzangaben erfassen.
- Keine echten Formulare, E-Mails oder PostHog-Anfragen auslösen und nicht veröffentlichen.

## Umsetzung
1. **Impressum aktualisieren**
   - Bisherige LAVIDRO-Anbieterkennzeichnung und alle drei Gründer-Namen entfernen.
   - Offiziell geprüfte Angaben der Factory33 Ecosystem GmbH eintragen: Firma, genaue Anschrift, Sitz, Registergericht und -nummer, Umsatzsteuer-ID, Geschäftsführung und veröffentlichter Kontakt.
   - Nur passende allgemeine Hinweise der offiziellen Factory33-Vorlage übernehmen; fehlerhafte oder für LAVIDRO nicht zutreffende Aussagen nicht kopieren.

2. **Datenschutzerklärung abgleichen**
   - Factory33 Ecosystem GmbH als Verantwortliche mit denselben geprüften Kontaktdaten nennen.
   - Zutreffende allgemeine Pflichtinformationen vollständig erhalten bzw. ergänzen, insbesondere Zwecke und Rechtsgrundlagen, Speicherdauer, Empfänger, Widerruf/Widerspruch, Betroffenenrechte, Aufsichtsbehörde, Sicherheit und externe Links.
   - LAVIDRO-spezifisch und technisch überprüfbar beschreiben: Lovable-Hosting, unverbindliche Anfrage, freiwillige Haushalts-/Mehrwert-/Jobtitel-Angaben, 72-Stunden-Double-Opt-In, Marketing erst nach Bestätigung sowie optionale Weitergabe-Einwilligung im vorgegebenen exakten Wortlaut.
   - PostHog exakt nach dem aktuellen Code beschreiben: Laden erst nach Einwilligung, fünf Funnel-Schritte, `page_engagement` und separate DOI-Bestätigung, pseudonyme Kennungen, begrenzte demografische Kategorien, keine Namen/E-Mail/Freitexte, EU-Weiterleitung über die eigene Einwilligungsschranke ohne Weitergabe der Besucher-IP, Widerruf ohne Neuladen.
   - LinkedIn Insight Tag, Social-Media-Tracking und Privacy-Shield-Aussagen nicht übernehmen, da sie für lavidro.com nicht nachgewiesen sind. Drittland- und Auftragsverarbeitungsangaben nur vorsichtig und als noch vertraglich zu prüfende Tatsachen formulieren.

3. **Drei Analyse-Eigenschaften ergänzen**
   - Nach erfolgreicher Speicherung beim bestehenden Ereignis `purchase_interest_submitted` mitsenden:
     - `household_size`: nur `1`, `2`, `3-4`, `5+` oder bei keiner Auswahl weglassen.
     - `greatest_value`: nur eine der sechs vorgegebenen Kategorien; bei „Sonstige“ ausschließlich `Sonstige`, nie den Erläuterungstext.
     - `job_title_provided`: ausschließlich Boolean, niemals den Jobtitel.
   - Clientseitige Positivliste und Validierung erweitern.
   - Serverseitige Einwilligungsschranke unabhängig nochmals streng validieren; ungültige Werte und unbekannte Eigenschaften nicht an PostHog weitergeben.
   - Die vollständigen Formularangaben weiterhin unverändert in der Datenbank speichern.

4. **Prüfen**
   - Automatisierte Tests mit simuliertem PostHog für gültige Kategorien, unbekannte Werte, freie Texte, unbekannte Eigenschaften, fehlende Einwilligung und das Ereignis-spezifische Zulassen der drei Felder.
   - Sicherstellen, dass weiterhin exakt fünf Funnel-Schritte bestehen und `purchase_interest_email_confirmed` separat bleibt.
   - Impressum und Datenschutzseite im Browser auf Desktop und schmalem Bildschirm prüfen.
   - Typprüfung und automatischen Vorschau-Build prüfen; keine realen Übertragungen ausführen.

## Annahmen und offene Prüfung
- Die offiziellen Factory33-Seiten sind die verlangte inhaltliche Vorlage; ihre Angaben werden nicht ungeprüft auf LAVIDRO übertragen.
- Dieser Entwurf ersetzt keine Rechtsberatung. Unklare Vertrags-, Empfänger-, Aufbewahrungs- und Drittlanddetails werden am Ende ausdrücklich für die Rechtsabteilung aufgelistet statt behauptet.
