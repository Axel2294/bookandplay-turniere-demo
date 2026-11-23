# Produktivanbindung: Turnierauswertungen

Stand des lokalen Prototyps: V3.6.40

## Bereits umgesetzt

Die lokale, schreibgeschützte Auswertung zeigt:

- belegte Startplätze, Kapazität, Warteliste und Abmeldungen
- Check-in, Nichtantritt und Rückzüge
- geplante, laufende und beendete Begegnungen
- tatsächliche Spieldauer und Startverzögerungen, soweit Zeitstempel vorhanden sind
- Gesamtsoll, lokal erfasste Zahlungen und offene Startgelder
- Begegnungen und belegte Minuten je Court und Spielort
- Anzahl lokaler Nachrichten, Teammitglieder und Begegnungseinsätze
- gesonderte Statusauswertung für Forderungswettbewerbe
- druckbare PDF-Ansicht über den Browser

## Benötigte Produktivdaten

- Turnier-, Konkurrenz- und Vereins-ID
- Anmeldestatus mit Zeitstempeln
- Zahlungsstatus aus dem Zahlungsanbieter
- Matchstatus, geplanter Beginn, tatsächlicher Beginn und tatsächliches Ende
- BOOKANDPLAY-Anlagen- und Court-ID
- Reservierungsbeginn, Reservierungsende und Stornierungsstatus
- Nachrichtenkanal, Versandstatus und Zustellzeit
- Turnierteam und Begegnungseinsätze

## Serverseitige Anforderungen

1. Kennzahlen müssen aus den für den angemeldeten Verein freigegebenen Datensätzen berechnet werden.
2. Geldbeträge werden in kleinster Währungseinheit aggregiert; Rückerstattungen werden getrennt ausgewiesen.
3. Startverzögerung ist `max(0, actualStart - publishedStart)`.
4. Court-Auslastung soll echte Reservierungsminuten und tatsächliche Spielminuten getrennt anbieten.
5. Stornierte und gelöschte Datensätze dürfen historische Berichte nicht unbemerkt verändern.
6. Saison- und vereinsweite Auswertungen benötigen Filter für Zeitraum, Sportart, Anlage und Konkurrenz.
7. Personenbezogene Exporte benötigen Berechtigungsprüfung, Zweckbindung und Löschkonzept.

## Abnahmetests

1. Die Anzahl bestätigter Startplätze entspricht der Anmeldeliste.
2. Warteliste, Abmeldungen, Nichtantritte und Rückzüge werden getrennt gezählt.
3. Ein verschobenes Spiel verwendet die zuletzt veröffentlichte Zeit als Verzögerungsbasis.
4. Court- und Anlagenfilter liefern dieselben Summen wie die zugrunde liegenden Reservierungen.
5. Zahlung, Teilzahlung und Rückerstattung werden korrekt im Soll-, Netto- und Offenbetrag berücksichtigt.
6. Ein Forderungswettbewerb zeigt Forderungsstatus statt klassischer Matchstatistik.
7. Benutzer ohne Auswertungsrecht erhält keine vereinsweiten oder personenbezogenen Daten.
8. Die gleichen Filter liefern auf unterschiedlichen Geräten dieselben Werte.

## Nicht lokal vortäuschen

Vereinsweite Zeitreihen, echte Reservierungsminuten, Zahlungsumsätze, Zustellquoten und geräteübergreifende Kennzahlen benötigen die BOOKANDPLAY-Datenbank und serverseitige Berechtigungen.
