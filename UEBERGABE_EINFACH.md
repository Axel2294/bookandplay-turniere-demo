# Einfache GitHub-Übergabe

## Einmalig einrichten

1. Auf GitHub ein **privates** Repository mit dem Namen `bookandplay-turnierverwaltung` anlegen.
2. Den Inhalt dieses Projektordners in das Repository übertragen.
3. Unter **Settings → Collaborators → Add people** die Entwickler über GitHub-Namen oder E-Mail-Adresse einladen.
4. Den Entwicklern mitteilen, dass sie mit `README.md` und danach `ENTWICKLERUEBERGABE_GESAMT.md` beginnen sollen.

## Empfohlene Arbeitsweise

- Das Repository bleibt privat.
- Entwickler ändern nicht direkt den Hauptstand, sondern arbeiten in eigenen Branches.
- Fertige Änderungen werden über Pull Requests geprüft und zusammengeführt.
- Fragen und Aufgaben werden als GitHub Issues erfasst, damit nichts in E-Mails verloren geht.
- Niemals Passwörter, Zugangsschlüssel, echte Zahlungsdaten oder personenbezogene Testdaten in GitHub speichern.

## Was die Entwickler als Erstes erledigen sollten

1. Produktive Zielarchitektur und Datenbankmodell festlegen.
2. Bestehende BOOKANDPLAY-Konten, Vereine, Anlagen und Courts anbinden.
3. Serverseitige Rollen und Berechtigungen umsetzen.
4. Turnier-, Anmelde-, Wartelisten- und Ergebnisdaten zentral speichern.
5. Reservierungen transaktional anbinden.
6. Benachrichtigungen und Zahlungen anbinden.
7. Die 20 Abnahmetests aus `ENTWICKLERUEBERGABE_GESAMT.md` automatisieren.

## Deine Aufgabe als Auftraggeber

- Entscheiden, wer Zugriff erhält.
- Fachliche Fragen und Prioritäten beantworten.
- Funktionen anhand der Abnahmetests freigeben.
- Keine technische Installation oder Programmierung selbst übernehmen.
