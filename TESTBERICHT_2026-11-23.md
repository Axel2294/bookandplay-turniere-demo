# Testbericht BOOKANDPLAY Turnierverwaltung

Datum: 23. November 2026  
Getestete Live-Version: V3.6.15 in Google Chrome  
Korrigierter Arbeitsstand: V3.6.16

## Schutz bestehender Daten

Das bestehende Turnier „Sommer-Doppelcup 2027 (wiederhergestellt)“ wurde ausschließlich lesend geprüft. Schreibtests fanden nur in neu angelegten oder separat importierten Testturnieren statt. Eine Sicherung des Sommer-Doppelcups wurde vor dem Platz-3-Test exportiert und als zusätzlicher Turniereintrag importiert.

## Ergebnisse

| Bereich | Ergebnis | Befund |
| --- | --- | --- |
| Court-Zuordnung im Abschlussbericht | Fehler in Altdaten bestätigt | Alle 15 beendeten Begegnungen des Sommer-Doppelcups zeigen keinen Court. Die Sicherung enthält für jedes Spiel `court: null`, keine veröffentlichten Spielzeiten und keine Benachrichtigungen mit Court-Angabe. Eine verlässliche Rekonstruktion ist deshalb nicht möglich. |
| Navigation nach Ergebniseingabe | Bestanden | Im Testturnier wurde ein Spiel auf Court 1 gestartet und 6:2, 6:3 beendet. Danach blieb die Ergebnisansicht mit einer eindeutigen Bestätigung und „Zurück zu Courts“ sichtbar; der Rücksprung funktionierte. |
| Court-Erhalt bei neuen Ergebnissen | Bestanden | Das neu beendete Spiel behielt Court 1. Der aktuelle Code löscht die Court-Zuordnung beim Abschluss nicht. |
| Spiel um Platz 3 | Bestanden | In einer separat importierten Kopie wurde „Müller / Schmidt – Peters / Neumann“ korrekt als geplantes Spiel um Platz 3 angezeigt. Der Abschlussbericht wechselte korrekt auf Zwischenstand und offenen dritten Platz. |
| Anmeldung | Bestanden | Zwei Testteams reservierten zwei verfügbare Startplätze. |
| Warteliste | Bestanden | Das dritte Testteam wurde bei voller Kapazität korrekt auf Wartelistenplatz 1 gesetzt. |
| Startgelder | Bestanden | 10,00 Euro je Team, 20,00 Euro Gesamtsoll. Eine manuelle Testzahlung wurde korrekt als bezahlt verbucht und mit Notiz protokolliert. Es fand keine echte Zahlung statt. |
| Forderungspyramide | Bestanden | Drei Testspieler, Rangliste initialisiert, Forderung C gegen B, Annahme und Ergebnis 6:2, 6:3. C stieg korrekt von Rang 3 auf Rang 2; Historie und Statistik wurden aktualisiert. |

## Korrektur in V3.6.16

Fehlende Court-Angaben historischer Spiele werden nicht länger nur als Gedankenstrich dargestellt. Der Bericht kennzeichnet sie als „Nicht gespeichert (Altdaten)“ und zeigt oberhalb der Begegnungen eine Warnung mit der Anzahl betroffener Spiele. Dabei werden keine Courts geraten und keine bestehenden Turnierdaten verändert. Neue und im Änderungsprotokoll noch belegte Court-Zuordnungen werden weiterhin angezeigt und beim Export übernommen.

## Testdaten im Browser

- `TEST – Anmeldung Warteliste Startgeld Navigation`
- `TEST – Forderungspyramide`
- `TEST – Sommer-Doppelcup Platz 3` (leere Vorlagenkopie)
- separat importierte Sommer-Doppelcup-Sicherung mit angelegtem Platz-3-Spiel

Diese Einträge sind eindeutig als Testdaten beziehungsweise wiederhergestellte Kopie erkennbar. Bestehende Turniere wurden nicht verändert.

## Übersichtliche Turnierliste in V3.6.17

Die Turnierübersicht wurde neu geordnet, ohne das Datenformat oder bestehende Turniere zu verändern:

- Das aktuell geöffnete Turnier steht hervorgehoben an erster Stelle.
- Weitere Turniere werden nach „In Vorbereitung“, „Laufende Turniere“ und „Abgeschlossen“ gruppiert.
- Abgeschlossene Turniere sind zunächst eingeklappt und können über das Archiv eingeblendet werden.
- Eine Suche nach Name, Sportart, Format oder Status ist vorhanden.
- Die Reihenfolge kann nach letzter Bearbeitung, Name oder Turnierbeginn sortiert werden.
- Die Darstellung passt sich auch schmalen Bildschirmen an.

Der lokale Funktionstest in Chrome war erfolgreich: V3.6.17 wurde vollständig geladen, die Suche lieferte bei einem nicht passenden Suchbegriff den korrekten Leerzustand und blieb anschließend weiter bedienbar. Die abschließende Prüfung mit mehreren Turnieren erfolgt nach der Veröffentlichung anhand der vorhandenen Browserdaten; diese Prüfung ist rein lesend.

## Vollständiger Wiederholungstest V3.6.44

Der aktuelle Gesamtstand wurde erneut in Google Chrome geprüft. Schreibtests fanden ausschließlich im neu angelegten Turnier `QA-Vereinsmeisterschaft 2027 · Mixed` statt. Die vier vorhandenen Turniere wurden nur lesend geöffnet. Sie sind weiterhin vollständig vorhanden.

Bestanden:

- Turnierassistent einschließlich Fragen, Rückkehr zur vorherigen Assistentenseite, Pflichtfeldprüfung und Zusammenfassung
- Anmeldung, Kapazitätsgrenze, Warteliste, automatisches Nachrücken, Check-in und Startgeldbuchung
- Auslosung, Gruppen, sportartspezifische Ergebniseingabe, Navigation zurück zu den Courts und Ergebniskorrektur mit Protokoll
- Verletzungsaufgabe, Wetterunterbrechung und Wiederaufnahme, Nichtantritt, kampfloser Sieg sowie nachträglicher Rückzug
- Spielorte, Court-Zuordnung, Turnierteam, Einsatzplanung und automatische Courtbelegung ohne Team-Doppelbelegung
- Zeitplanung, Vorreservierungs-/Festbuchungsvorschau, Terminfreigabe, Nachrichten und Verzögerungsprüfung
- Spieleransicht mit nächstem Spiel, Court, persönlichen Nachrichten, Ergebnisbestätigung, Beanstandung und persönlicher Absage; Rückmeldungen erscheinen beim Vereinsmanager
- Forderungspyramide, Padel-Ansicht, Auswertungen, Exporte, Rollenansicht, automatische Sicherungen und Wiederherstellungspunkte
- Abschlussbericht des Sommer-Doppelcups: fehlende Courts werden bei Altdaten korrekt und ehrlich gekennzeichnet; Platzierungen und optionale Anlage eines Spiels um Platz 3 werden korrekt angezeigt
- schmale Ansichten: Formulare, Tabellen, Turnierassistent und Demo-Benutzerauswahl besitzen responsive Umbruch- bzw. Scrollregeln; die zuvor abgeschnittene Benutzer-/Rollenauswahl ist korrigiert

Während dieses Tests behobene Fehler:

1. `Beispieldaten laden` ersetzte zuvor versehentlich Namen und Konfiguration eines neu angelegten Turniers. Ab V3.6.43 werden nur Teilnehmer und dynamische Wettbewerbsdaten zurückgesetzt; Identität und Einstellungen bleiben erhalten.
2. Eine Verzögerungsfortschreibung ohne tatsächlich betroffene Folgebegegnung meldete zwar korrekt „keine Änderung“, stellte freigegebene Zeiten in der laufenden Ansicht aber dennoch auf Entwurf. Ab V3.6.44 wird der vorherige Plan vor der Meldung vollständig wiederhergestellt.

Der zweite Fehler wurde nach der Korrektur erneut im Browser getestet: Die sechs freigegebenen Spielzeiten blieben unverändert als `Freigegeben · Festbuchung vorgesehen` erhalten.

Offene Produktivabhängigkeiten sind keine lokalen Programmfehler: echte Benutzeranmeldung und Rechteprüfung, Datenbank, geräteübergreifende Synchronisierung, echte E-Mail/SMS, Zahlungsanbieter sowie die reale BOOKANDPLAY-Platzreservierung müssen serverseitig angebunden werden.

Das QA-Testturnier bleibt bis zur ausdrücklich bestätigten Bereinigung als eindeutig gekennzeichneter Testdatensatz im Browser erhalten.
