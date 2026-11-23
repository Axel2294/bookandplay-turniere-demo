# BOOKANDPLAY Turnierverwaltung

Interaktiver, lokal getesteter Produktprototyp für die Übergabe an das BOOKANDPLAY-Entwicklungsteam.

**Aktueller Stand:** V3.6.46  
**Startdatei:** `index.html`  
**Technik des Prototyps:** eine lokale HTML-Datei mit Browser-Speicherung, ohne produktive Datenbank oder echte BOOKANDPLAY-Schnittstellen

## Schnellstart

1. Projektordner herunterladen oder klonen.
2. `index.html` über einen lokalen Webserver öffnen.
3. Ausschließlich Testdaten verwenden.
4. Über „Beispieldaten laden“ kann ein vollständiges Testturnier erzeugt werden.

## Was zuerst gelesen werden sollte

1. `ENTWICKLERUEBERGABE_GESAMT.md` – Gesamtumfang, Datenobjekte, Schnittstellen und Abnahmetests
2. `TESTBERICHT_2026-11-23.md` – geprüfte Abläufe und bekannte Grenzen
3. `Spieleransicht_Kontoanbindung.md` – produktive Benutzer- und Kontoanbindung
4. `Benachrichtigungen_Produktivanbindung.md` – Ereignisse, Vorlagen und Versand
5. `Spielorte_Turnierteam_Produktivanbindung.md` – Anlagen, Courts und Organisation
6. `Auswertungen_Produktivanbindung.md` – Kennzahlen und Exporte

## Wichtig für die Produktivumsetzung

Der Prototyp zeigt Fachabläufe und Bedienung. Nicht übernommen werden dürfen:

- lokale Speicherung als produktive Datenhaltung
- simulierte Rollen und Berechtigungen
- Testzahlungen und simulierte Benachrichtigungen
- lokale Courtreservierungen

Produktiv benötigt werden insbesondere zentrale Datenbank, serverseitige Rechte, BOOKANDPLAY-Konten, Reservierungs- und Zahlungsanbindung, Transaktionen, Auditprotokoll, Datenschutz, Monitoring und Backups.

## Browser und Geräte

Getestet wurden Chrome, Firefox und Safari sowie responsive Ansichten von 320 Pixel Smartphonebreite bis zu verschiedenen iPad-Größen im Hoch- und Querformat. Auf Touch-Geräten steht für die Courtplanung eine genaue Eingabe von Uhrzeit und Platz zur Verfügung.

Vor der Freigabe sind zusätzliche Tests auf realen iPhones, Android-Geräten und iPads erforderlich.

## Empfohlener Entwicklungsablauf

- Änderungen über eigene Branches entwickeln.
- Für jede Funktion einen Pull Request erstellen.
- Die Abnahmetests aus der Gesamtübergabe als Grundlage verwenden.
- Keine echten Vereins-, Spieler- oder Zahlungsdaten in den Prototyp eintragen.
