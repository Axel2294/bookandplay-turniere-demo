# BOOKANDPLAY · Teilnehmernachrichten

Die Turnierdemo V3.6.37 erzeugt Nachrichten lokal und zeigt sie im Menü **Nachrichten** pro Teilnehmer beziehungsweise Team als Vorschau für BOOKANDPLAY-Konto, E-Mail oder SMS. Sie verwendet die Namen der Testanmeldungen und benötigt keine Kontaktangaben. Sobald die Turnierleitung unter **Turnierplan → Spielzeiten für Nachrichten freigeben** einen geprüften Spielplan freigibt, enthalten die Zeitnachrichten Datum, Uhrzeit, Gegner und Platz. Bei neuer Freigabe werden geänderte Zeiten als Aktualisierung erfasst.

## Vollständige lokale Auslöser in V3.6.37

- Anmeldung bestätigt, Warteliste, geänderter Wartelistenplatz, Nachrücken und Abmeldung
- offenes oder geändertes Startgeld, dokumentierte Zahlung und dokumentierte Rückerstattung
- Ansetzung, freigegebene oder geänderte Spielzeit beziehungsweise neuer Court und Spielaufruf
- Ergebnis, Aufgabe, kampfloser Sieg, Korrektur, Ausscheiden und abschließende Platzierung
- Nichtantritt, Rückzug, Wetterunterbrechung und Wiederaufnahme
- Forderung erstellt, erhalten, angenommen, abgelehnt, verfallen und beendet
- Bearbeitung einer persönlichen Absage oder Ergebnisbeanstandung

Jede Nachricht trägt in der Demo ausdrücklich den Zustellstatus **Lokale Vorschau**. Dieser Status darf im Produktivsystem erst nach der erfolgreichen Übergabe an den jeweiligen Kanal ersetzt werden.

## Anbindung für den Produktivbetrieb

- **Empfänger** – Eine Turnieranmeldung eindeutig mit den BOOKANDPLAY-Spielerkonten verknüpfen. Bei Doppel und Mixed erhalten beide registrierten Spieler ihre eigene Nachricht. Für Gastanmeldungen die verifizierte Kontaktadresse oder Mobilnummer aus dem freigegebenen Buchungsablauf verwenden.
- **Kanal** – Das BOOKANDPLAY-Postfach als zentralen Verlauf verwenden. E-Mail und SMS entsprechend den bestätigten Kontaktdaten und gewählten Benachrichtigungskanälen zustellen. Ein fehlender oder nicht verifizierter Kontakt lässt den Kontokanal verfügbar, sofern ein Konto verknüpft ist.
- **Auslöser** – Startplatz bestätigt, Warteliste, Nachrücken, Abmeldung, neue Paarung, Terminfreigabe, Terminänderung, Spielaufruf, Ausscheiden und Abschluss. Eine Terminmeldung enthält Veranstaltungsdatum, Ortszeit, Platz, Gegner und einen Link zum Turnier. Vorläufige Zeiten bleiben in der Planung. Beim Ausscheiden ein mögliches Platzierungsspiel berücksichtigen.
- **Zustellung** – Turnieränderung und Nachricht in derselben Datenbanktransaktion speichern. Der Versand läuft im Hintergrund über den BOOKANDPLAY-Posteingang und die angebundenen E-Mail- und SMS-Dienste. Ein stabiler Schlüssel pro Empfänger, Ereignis, Kanal und Terminversion verhindert Doppelsendungen. Temporäre Fehler werden erneut versucht und Zustellstatus für die Turnierleitung angezeigt.
- **Berechtigungen** – Spieler sehen nur eigene Nachrichten. Die Turnierleitung kann den Zustellstatus der eigenen Turniere prüfen. Absender, Anbieterzugänge und Zustellprotokolle gehören auf den Server.

Für die Freigabe im Produktivsystem mit überprüften Testempfängern testen, ob Buchung, Nachrücken, Terminänderung und Ausscheiden über jeden aktivierten Kanal ankommen. Zusätzlich eine Wiederholung nach Anbieterfehler und den Zugriffsschutz des Posteingangs prüfen.

## Terminänderungen am Turniertag

V3.6.14 ergänzt die Änderung eines freigegebenen Termins vor dem Spielaufruf. Die Demo prüft Platz und Teams innerhalb des aktiven Turniers anhand der geplanten Spieldauer und des Wechselpuffers. Laufende Spiele gehen mit der erfassten Startzeit und einer geschätzten Endzeit ein. Der manuell geänderte Termin bleibt bei erneuter Freigabe gesetzt. In der lokalen Vorschau sind alter und neuer Termin nachvollziehbar.

Im BOOKANDPLAY-Backend müssen beim Speichern die Belegung der Anlage über alle Turniere und Einzelbuchungen, die beteiligten Spielerkonten sowie der aktuelle Stand der Begegnung geprüft werden. Die Änderung von Termin und Platzreservierung, der Protokolleintrag und das Benachrichtigungsereignis gehören in denselben konsistenten Speichervorgang. Das Ereignis referenziert Begegnung, Terminversion, alten und neuen Startzeitpunkt, alte und neue Platz-ID sowie die betroffenen Anmeldungen. Spieleransicht, Vereinsmonitor und Nachrichtenkanäle beziehen dieselbe freigegebene Terminversion aus dem Backend.
