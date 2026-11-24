# BOOKANDPLAY Turnierverwaltung · V3.7.0

Browserbasierter Demonstrationsprototyp. V3.7 ergänzt V3.6.20 um Budgetplanung, vorhandene Startgelder, weitere Einnahmen und Ausgaben, Beschaffung, Finanzabschluss und CSV-Export. Keine Zahlungsabwicklung oder steuerliche Buchhaltung.

## Start und Datenerhalt

`index.html` auf der bisherigen Website aktualisieren. Vorhandene Turniere liegen ausschließlich im lokalen Speicher des jeweiligen Browsers, **nicht im GitHub-Repository**. Gleiche Adresse (einschließlich Port), Browser und Profil beibehalten. Ein Wechsel der Adresse zeigt einen anderen lokalen Datenbestand.

Vor Updates unter **Meine Turniere → Alle Turniere sichern** eine JSON-Sicherung herunterladen. V3.7 verwendet unverändert `bap-tournament-demo-v25-collection`; der ältere Schlüssel `bap-tournament-demo-v1` bleibt erhalten. Finanzdaten entstehen erst bei der ersten Finanzänderung als zusätzliches Feld `finance` im aktiven Turnier. Es gibt weder einen Reset noch eine automatische Änderung von Teilnehmern, Begegnungen, Ergebnissen, bisherigen Gebühren oder Zahlungsereignissen. Die vorhandene vollständige JSON-Sicherung umfasst auch das Finanzmodul. Import fügt Turniere hinzu, statt vorhandene zu ersetzen.

## Finanzmodul

1. Turnier auswählen, **Finanzen → Budget & Abrechnung** öffnen. Erforderlich ist das bestehende Recht `payments`, jetzt „Startgelder & Finanzen verwalten“. Vereinsmanager und entsprechend berechtigte Turnierleiter können es nutzen; vorhandene Einzelrechte bleiben bestehen.
2. **Budgetplanung:** Zusätzliche geplante Einnahmen und Ausgaben erfassen. Das Startgeld-Soll wird aus bestätigten Anmeldungen und den vorhandenen Gebühren berechnet. Es ist kein Zahlungseingang. Beschaffungen bei Bedarf zusätzlich als Budgetposition aufnehmen.
3. **Startgelder:** Vorhandene Gebühren, Teilzahlungen und Erstattungen unverändert weiterverwenden. Nettozahlungen aus sämtlichen Zahlungsereignissen werden automatisch in den tatsächlichen Saldo eingerechnet, auch für ehemalige Teilnehmer. Startgelder nicht zusätzlich als Einnahme buchen.
4. **Einnahmen & Ausgaben:** Tatsächlich erfolgte zusätzliche Zahlung mit Datum, positivem Euro-Betrag und optionaler Belegnummer erfassen. Beträge werden in ganzen Cent gespeichert. Stornieren fügt eine Gegenbuchung hinzu; das Original bleibt erhalten. Keine Belegdateien oder sensiblen Zahlungsdaten hinterlegen.
5. **Beschaffung:** Artikel, Lieferant, ganze Menge und Einzelpreis erfassen. Abfolge: Geplant → Bestellt → Erhalten → Bezahlt. Bis zur Bezahlung als offene Beschaffung ausgewiesen. „Bezahlt“ dokumentiert eine bereits erfolgte Zahlung und erzeugt genau einmal eine Ausgabe. Diese nicht noch einmal manuell buchen. Unbezahlte Beschaffungen können storniert werden; bezahlte über die zugehörige Ausgabe gegenbuchen.
6. **Abrechnung:** Saldo = Startgelder netto + weitere Einnahmen − Ausgaben. Geplanter Saldo = Startgeld-Soll + geplante zusätzliche Einnahmen − geplante Ausgaben. Der Abschluss setzt voraus, dass keine Startgelder, Beschaffungen oder Guthaben ehemaliger Teilnehmer offen sind. Er speichert eine Momentaufnahme und sperrt Finanzänderungen und Startgeldbuchungen. Der Spielbetrieb bleibt unabhängig. Bei nachträglichen Teilnehmeränderungen wieder öffnen, prüfen und erneut abschließen. Frühere Abschlüsse bleiben erhalten.
7. **CSV / Druck:** „Finanzen als CSV“ exportiert Budget, Startgeldereignisse, Buchungen, Beschaffungen, Abschlusshistorie und Summen, mit UTF-8-BOM, Semikolon und Dezimalkomma. Die Bereiche enthalten verschiedene Sichtweisen auf dieselben Vorgänge und dürfen nicht zusammen addiert werden. Texte werden gegen Tabellenformeln geschützt. „Abrechnung drucken / PDF“ verwendet den Browserdruck. CSV ersetzt keine vollständige JSON-Sicherung.

Die integrierte Anleitung enthält dieselben Abläufe mit direkten Links. Änderungen werden im bestehenden lokalen Änderungsprotokoll erfasst. Das Modul prüft vor Finanzänderungen auf zwischenzeitliche Änderungen anderer Fenster und setzt bei fehlgeschlagener Speicherung die Änderung zurück. Browserlokale Rollen und Protokolle sind keine serverseitige Sicherheits- oder Revisionsgarantie.

## Prüfung

Ohne zusätzliche Pakete mit Node.js:

```sh
node application.test.cjs
node finance.test.cjs
```

Die Prüfungen verwenden separate Testdaten und testen die echte Anwendungslogik. Der Gesamttest deckt Sicherungsdaten, Anmeldung und Warteliste, Turnierformate, Sport-Zählweisen, Courts, Navigation, Störfälle, Ruhezeiten, Zeitplanung, Forderungspyramide, Rechte und alle Ansichten ab. Der Finanztest prüft zusätzlich, dass Bestandsdaten bis auf neue Finanzfelder identisch und andere Turniere unverändert bleiben, sowie Cent-Rechnung, Budget, Beschaffung, doppelte Zahlungssperre, Gegenbuchungen, Abschluss/Wiederöffnung, Speicherfehler, konkurrierende Fenster und CSV.
