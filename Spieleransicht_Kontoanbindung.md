# BOOKANDPLAY · Mein Turnier
## Erster Meilenstein und Anschluss an das Hauptsystem

In der Demo V3.6.11 öffnet **Mein Turnier (Demo)** die Spieleransicht. Turnier und Testanmeldung werden ausgewählt. Die Seite zeigt Startplatz, Warteliste oder Abmeldung, aktuelle oder anstehende Spiele, freigegebene Termine, Ergebnisse und die Nachrichten dieser Anmeldung. Aufruf und Ergebnis verwenden den tatsächlichen Platz. Ein gespeicherter Entwurf aus der Turnierplanung erscheint erst nach Freigabe als Termin. Bei einer Forderung zeigt die Spieleransicht die Spielfrist. Die Auswahl verändert das aktive Verwaltungsturnier nicht.

## Schnittstelle für das BOOKANDPLAY-Konto

Die vorgeschlagenen Endpunkte sind mit dem Kernsystem abzugleichen. Im Produktivbetrieb leitet der Server Benutzer-ID und Zugriffsrechte aus der bestehenden BOOKANDPLAY-Sitzung ab. Der Testteilnehmer-Selektor entfällt. Für Doppel und Mixed sehen beide verknüpften Konten dieselbe Teamanmeldung und jeweils nur ihren eigenen Posteingang. Mehrere Vereine stehen in der Liste, sofern das Konto dort eigene Anmeldungen hat. Ein direkt aufgerufenes Turnier muss dieselbe Berechtigungsprüfung durchlaufen.

| Vorgeschlagener Endpunkt | Antwort |
| --- | --- |
| `GET /me/tournaments` | Eigene Anmeldungen mit Turnier-ID, Vereinsname, Konkurrenz, Status und Kurzinfo zum nächsten Spiel |
| `GET /me/tournaments/{tournamentId}` | Berechtigte Anmeldungen des Kontos für dieses Turnier, aktuelle und geplante Spiele, Ergebnisse und Status der Teilnahme |
| `GET /me/tournaments/{tournamentId}/messages` | Nachrichten mit Zeitpunkt, Typ und Status eines ersetzten bzw. aufgehobenen Termins |

Je Begegnung empfiehlt sich ein stabiler Schlüssel, Runde, eigener Startplatz, Gegnername, Status und Ergebnis. Für ein geplantes Spiel sendet der Server nur einen freigegebenen Termin. Bei einem Aufruf liefert er tatsächliche Aufrufzeit und Court, während der vorherige Termin im Verlauf markiert bleibt. Absolute Zeitstempel und die Zeitzone der Anlage getrennt übertragen. Zahlungsdaten, fremde Kontaktdaten und interne Notizen bleiben außerhalb dieser Antwort.

## Zentrale Speicherung

Die Ansicht liest aus demselben serverseitigen Turnierbestand wie die Turnierleitung. Zu den ersten persistenten Entitäten gehören Turnier, Anmeldung, Zuordnung der Anmeldung zu einem oder mehreren BOOKANDPLAY-Konten, Begegnung, freigegebener Termin, Ergebnis und Nachrichtenereignis. Bei einer Ergebnis- oder Terminänderung die fachliche Änderung und das zugehörige Nachrichtenereignis gemeinsam speichern. Für produktive Daten gehören Mandantenbezug, Zugriffskontrolle, Ergebnisversionierung und Sicherung in den bestehenden BOOKANDPLAY-Betrieb. Die statische Demo kann die produktive Anbindung vorbereiten, sobald Repository, Datenmodell und Testumgebung des Hauptsystems verfügbar sind.

## Abnahmeszenarien

- Berechtigter Spieler und Turnierleitung sehen nach Freigabe dieselbe Uhrzeit und denselben Court auf zwei Geräten.
- Eine Änderung ersetzt die alte Anzeige im aktuellen Spiel und kennzeichnet die alte Meldung im Verlauf.
- Ein Spieler auf der Warteliste sieht seine Position und erhält nach dem Nachrücken den bestätigten Startplatz.
- Ein fremdes Konto erhält weder per Liste noch per direkter Turnier-, Begegnungs- oder Nachrichten-ID Zugriff.
- Beide Mitglieder eines Doppels sehen ihre gemeinsame Paarung. Jede Person erhält und liest ausschließlich ihre eigenen Nachrichten.

## Live-Spielplan auf der Vereinsseite

V3.6.12 ergänzt unter **Spieleransicht → Live-Spielplan** eine lesende Anzeige. Aus der Vereinsseite führt der Link direkt zu einem veröffentlichten Turnier. Die Monitoransicht vergrößert die Lesefläche. Änderungen aus anderen Tabs derselben Browser-Sitzung erscheinen automatisch. Die URL kann die Turnierauswahl und Monitoransicht speichern. Für den Einsatz auf unterschiedlichen Geräten muss die Seite dieselben Phasen und Spielstände aus dem zentralen BOOKANDPLAY-Turnierbestand beziehen.

Für den Produktivbetrieb eignet sich ein serverseitiger Lese-Endpunkt für das veröffentlichte Turnier, beispielsweise `GET /clubs/{clubId}/tournaments/{tournamentId}/live`. Das Backend prüft Verein, Veröffentlichung und Sichtbarkeit bei jeder Anfrage. Die Antwort enthält nur Runde, für die Anzeige freigegebene Namen, Spielstatus, Spielzeit, Court und Ergebnis. Geplante Begegnungen erscheinen erst nach Terminfreigabe. Der Spielaufruf liefert den tatsächlichen Court. Bei Ergebniseingabe oder Entzug der Freigabe aktualisiert die Ansicht die Daten per Polling oder bestehendem BOOKANDPLAY-Eventkanal. Private Nachrichten, Kontaktdaten, Zahlungen und Planungsentwürfe bleiben in den zugriffsgeschützten Ansichten.
