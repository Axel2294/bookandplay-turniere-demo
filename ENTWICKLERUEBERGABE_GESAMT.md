# BOOKANDPLAY Turnierverwaltung – Gesamtübergabe an die Entwicklung

Prototypstand: V3.6.46  
Ziel: Überführung des lokal getesteten Funktionsumfangs in die produktive BOOKANDPLAY-Plattform.

## 1. Produktvorteil und Zielbild

BOOKANDPLAY verfügt bereits über Vereine, Anlagen, Courts, Reservierungen und viele bestehende Kundenkonten. Die Turnierverwaltung soll diese Daten nicht parallel nachbauen, sondern direkt verwenden:

- Vereinsmanager startet aus seinem bestehenden Vereinszugang.
- Anlagen und Courts kommen aus der BOOKANDPLAY-Platzverwaltung.
- Teilnehmer melden sich mit ihrem vorhandenen BOOKANDPLAY-Konto an.
- Turnierfenster erzeugen Vorreservierungen; freigegebene Begegnungen wandeln sie in feste Buchungen um.
- Änderungen an Spielzeit oder Court aktualisieren Buchung, Spielplan und Benachrichtigungen gemeinsam.

## 2. Im lokalen Prototyp umgesetzter Umfang

- geführter Turnierassistent mit Fragefunktion und Rückkehr zur vorherigen Seite
- Tennis, Padel, Pickleball und Beachvolleyball
- Gruppen + K.-o., einfaches K.-o., Trostrunde, Doppel-K.-o., Jeder-gegen-jeden, Hin-/Rückrunde, Schweizer System und Forderungspyramide
- mehrere Konkurrenzen innerhalb einer Veranstaltung
- Setzpositionen und Lostöpfe
- Anmeldung, Kapazität, Warteliste, Nachrücken und Rückzug
- Startgeldkonfiguration und lokales Buchungsprotokoll
- Auslosung, Ergebnisprüfung, Tabellen, Turnierbaum und Spiel um Platz 3
- Nichtantritt, Verletzungsaufgabe, kampfloser Sieg, Ergebniskorrektur und Wetterunterbrechung
- grafische Court-/Zeitplanung, Drag-and-drop, Konflikte, Ruhezeiten und Verzögerungsfortschreibung
- Reservierungsablauf als lokale Vorschau
- Spieleransicht mit Spiel, Court, Uhrzeit, Nachrichten, Ergebnisbestätigung, Beanstandung und Absage
- lokale Nachrichtenvorlagen und automatische Auslöser
- mehrere Spielorte, Court-Zuordnungen, Turnierteam und Begegnungseinsätze
- Auswertungen zu Teilnehmern, Zahlungen, Spielen, Verzögerungen, Courts und Organisation
- CSV-Exporte und strukturiertes JSON-Entwicklerpaket
- Vereins-/Turnierfarben, kleines Logo und Sponsorenanzeige
- Rollenprototyp, Änderungsprotokoll, automatische lokale Sicherungen und Wiederherstellung
- responsive Darstellung für Smartphones und iPads; geprüft in Chrome, Firefox und Safari
- Touch-Alternative zur grafischen Courtplanung über genaue Uhrzeit- und Courtfelder

## 3. Zentrale Datenobjekte

### Verein und Benutzer

- `clubId`
- `userId`
- Vereinsrolle und turnierspezifische Berechtigungen
- Mitgliedschaftsstatus
- Anzeigename und bestätigte Kommunikationskanäle

### Veranstaltung, Konkurrenz und Turnier

- `eventId`, `eventName`
- `competitionId`, `competitionName`
- `tournamentId`, Name, Sportart, Format und Status
- Beginn/Ende des möglichen Veranstaltungszeitraums
- Regelprofil und sportartspezifische Ergebnisregeln
- Kapazität, Anmeldung, Anmeldeschluss und Teilnahmebedingungen
- Veröffentlichungsstatus und Zielgruppe

### Teilnehmer und Anmeldung

- `registrationId`, `tournamentId`, `userId` oder Team-ID
- Anmeldung, Bestätigung, Wartelistenposition, Nachrücken, Absage und Rückzug
- Check-in und Turniertagstatus
- Setzposition, Lostopf und optionale Verbandsdaten
- Gebühren-Soll, Zahlung und Rückerstattung als getrennte Referenzen

### Begegnung und Ergebnis

- `matchId`, Runde/Phase/Gruppe
- Teilnehmer A/B und Folgebegegnungen
- Status, Gewinner, Ergebnis und Ergebnisart
- geplanter, veröffentlichter und tatsächlicher Beginn
- tatsächliches Ende
- Court-, Anlagen- und Buchungs-ID
- Korrekturhistorie, Aufgabe, Nichtantritt oder kampfloser Sieg

### Courtplanung und Reservierung

- `bookandplayFacilityId`, `bookandplayCourtId`
- `bookingId`, Status `provisional`, `confirmed`, `moved`, `cancelled`
- Reservierungsbeginn und -ende
- Konflikt-, Ruhezeit- und Überschneidungsprüfung
- atomare Umwandlung einer Vorreservierung in eine Festbuchung

### Turnierteam

- `staffAssignmentId`, `bookandplayUserId`
- Grundrolle und konkrete Aufgabe
- Match-ID, Einsatzzeit und Bestätigungsstatus

### Branding und Sponsoren

- Vereins-/Turnierlogo als geprüfte Mediendatei
- Haupt- und Akzentfarbe
- Sponsor-ID, Name, Logo, Link, Anzeigeposition und Gültigkeitszeitraum

## 4. Rollen und Berechtigungen

| Funktion | Vereinsmanager | Turnierleiter | Trainer | Helfer | Zuschauer/Spieler |
|---|---:|---:|---:|---:|---:|
| Turnier anlegen/löschen | ja | optional | optional | nein | nein |
| Einstellungen/Veröffentlichung | ja | ja | optional | nein | nein |
| Teilnehmer/Warteliste | ja | ja | ja | optional | eigene Anmeldung |
| Startgelder | ja | optional | nein | nein | eigener Status |
| Auslosung | ja | ja | optional | nein | lesen |
| Courts/Zeitplan | ja | ja | ja | optional | lesen |
| Ergebnisse | ja | ja | ja | optional | bestätigen/beanstanden |
| Team/Sponsoren | ja | optional | nein | nein | lesen |
| Exporte/Audit | ja | optional | nein | nein | nein |

Alle Prüfungen müssen serverseitig erfolgen. UI-Sperren allein sind kein Zugriffsschutz.

## 5. Benötigte Schnittstellen

1. Vereine, Mitglieder, Rollen und Benutzerkonten lesen.
2. Anlagen, Courts, Öffnungszeiten und bestehende Reservierungen lesen.
3. Veranstaltungen, Konkurrenzen, Turniere und Regeln speichern.
4. Anmeldungen und Wartelisten transaktional verwalten.
5. Zahlungsabsichten, Zahlungseingänge und Rückerstattungen über den Zahlungsanbieter verarbeiten.
6. Auslosung und Matchabhängigkeiten versionssicher speichern.
7. Vorreservierungen erzeugen, verschieben, bestätigen und stornieren.
8. Ergebnisse mit Optimistic Locking und Korrekturhistorie speichern.
9. E-Mail, SMS, Push und BOOKANDPLAY-Postfach über eine Versandwarteschlange bedienen.
10. Logos und Sponsorengrafiken prüfen, skalieren und über eine Medienablage ausliefern.
11. Audit- und Statistikdaten für berechtigte Benutzer bereitstellen.
12. CSV/PDF/JSON-Exporte serverseitig erzeugen oder signiert bereitstellen.

## 6. Automatische Aktionen

- Anmeldung bestätigt oder auf Warteliste gesetzt
- freie Kapazität führt nach Regelprüfung zum Nachrücken
- Spielplanänderung prüft Court-, Spieler-, Ruhezeit- und Personalkonflikte
- veröffentlichte Begegnung wandelt Vorreservierung in Festbuchung um
- Verschiebung bestätigt zuerst die neue Buchung und gibt danach die alte frei
- Spielaufruf aktualisiert Matchstatus und Nachricht
- Ergebnis aktualisiert Tabelle, Turnierbaum, Folgebegegnung und Platzierung
- Störfall sperrt oder beendet betroffene Begegnungen nach bestätigter Turnierleiterentscheidung
- Wetterpause stoppt neue Spielaufrufe und protokolliert die Unterbrechung
- Zahlung, Erstattung, Nachrücken, Courtwechsel und Ergebnis erzeugen passende Nachrichtenereignisse
- jede fachliche Änderung erzeugt einen unveränderbaren Audit-Eintrag

## 7. Wichtige Fehlerfälle

- Court oder Spieler ist im Zeitraum bereits gebucht/eingeplant.
- Ruhezeit wird unterschritten.
- Vorreservierung ist zwischenzeitlich abgelaufen.
- neue Buchung gelingt, alte Buchung kann nicht freigegeben werden.
- Wartelistenplatz wurde parallel verändert.
- Ergebnis basiert auf einer veralteten Matchversion.
- Folgebegegnung läuft bereits und ein früherer Sieger soll geändert werden.
- Zahlung ist erfolgreich, lokale Bestätigung wird unterbrochen oder doppelt zugestellt.
- Benutzer verliert während der Bearbeitung seine Berechtigung.
- Logo ist zu groß, manipuliert oder hat einen nicht erlaubten Dateityp.
- Nachricht kann nicht zugestellt werden; erneuter Versand darf keine Doppelwirkung auslösen.

Fehler müssen verständlich anzeigen, was gespeichert wurde, was nicht gespeichert wurde und welche manuelle Klärung nötig ist.

## 8. Übergreifende Abnahmetests

1. Vereinsmanager legt ein Turnier vollständig über den Assistenten an und veröffentlicht es.
2. Spieler meldet sich auf Gerät A an und sieht denselben Status auf Gerät B.
3. Volles Turnier setzt weitere Anmeldung auf die korrekte Wartelistenposition.
4. Absage lässt genau einen berechtigten Wartenden transaktional nachrücken.
5. Zahlung und Rückerstattung erscheinen korrekt bei Spieler und Turnierleitung.
6. Auslosung verhindert ungültige Teilnehmerzahl und doppelte Begegnungen.
7. Zeitplanung verhindert Court-, Spieler- und Personaldoppelbelegungen.
8. Vorreservierung wird nach Paarungsfreigabe genau einmal zur Festbuchung.
9. Courtwechsel aktualisiert Buchung, Spieleransicht, Live-Plan und Benachrichtigung.
10. Nichtantritt, Aufgabe und kampfloser Sieg erzeugen korrekte Folgebegegnungen.
11. Ergebniskorrektur ist nach Beginn einer abhängigen Begegnung gesperrt oder erfordert einen dokumentierten Sonderprozess.
12. Wetterpause verhindert neue Spielaufrufe und erlaubt später eine kontrollierte Wiederaufnahme.
13. Spieler bestätigt oder beanstandet nur eigene Ergebnisse.
14. Rollen ohne Berechtigung können geschützte APIs auch bei direkten Requests nicht nutzen.
15. Auswertungen stimmen mit den zugrunde liegenden Anmeldungen, Zahlungen, Buchungen und Matches überein.
16. CSV-Export neutralisiert Formeln und berücksichtigt Datenschutzrechte.
17. Logo und Sponsoren erscheinen konsistent in Vereinsseite, Live-Ansicht und Berichten.
18. Auditdaten enthalten Benutzer, Zeit, Objekt, alte und neue Version.
19. Paralleländerungen erzeugen keinen stillen Datenverlust.
20. Backup und Wiederherstellung erhalten Beziehungen, IDs und Historien vollständig.

## 9. Ergänzende Detaildokumente

- `Spieleransicht_Kontoanbindung.md`
- `Benachrichtigungen_Produktivanbindung.md`
- `Spielorte_Turnierteam_Produktivanbindung.md`
- `Auswertungen_Produktivanbindung.md`

## 10. Nicht aus dem lokalen Prototyp übernehmen

`localStorage`, lokale Rollenauswahl, manuelle Testzahlungen, simulierte Zustellstatus und lokale Courtbuchungen sind ausschließlich Demonstrationshilfen. Produktiv erforderlich sind eine zentrale Datenbank, serverseitige Rechte, sichere Identitäten, Transaktionen, Hintergrundjobs, Medienprüfung, Monitoring, Datenschutz- und Löschprozesse sowie eine verlässliche Reservierungsintegration.
