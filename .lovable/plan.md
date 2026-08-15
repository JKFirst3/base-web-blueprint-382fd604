# Partnerbereich wieder einblenden

## Ziel
Der Bereich „Gemeinsam bringen wir Lavidro voran." (Miele, Garage33, Factory33) soll auf der Startseite und auf „Über Lavidro" wieder sichtbar sein.

## Aktueller Stand
- `src/content/home.html`: Partnerblock existiert **zweimal** (Zeile 301 vor dem Prozessbereich, Zeile 499 nach dem Live-erleben-Formular), beide mit `hidden`. Beide nutzen dieselbe Überschrift-ID `home-partners-title` — doppelte ID ist ungültig.
- `src/content/about.html` (Zeile 107): Partnerblock ebenfalls mit `hidden`.

## Umsetzung
1. `src/content/home.html`: den oberen, duplizierten Block (Zeile 301–325) entfernen; beim unteren Block (zwischen „Lavidro live erleben" und FAQ) das `hidden`-Attribut entfernen.
2. `src/content/about.html`: `hidden` am Partnerblock entfernen.
3. Beide Seiten in der Vorschau prüfen: Logos laden, Abstände und mobile Darstellung stimmen.

Keine Änderungen an Logik, Styles oder Daten nötig.
