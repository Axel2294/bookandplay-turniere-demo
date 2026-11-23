# Produktivanbindung: Spielorte und Turnierteam

Stand des lokalen Prototyps: V3.6.39

## Ziel

Ein Turnier kann mehrere BOOKANDPLAY-Anlagen nutzen. Courts werden einem Spielort zugeordnet. Schiedsrichter, Courtmanager, Turnierbüro, Helfer und Ergebnisdienst können einzelnen Begegnungen zugeteilt werden. Bei zeitlich überlappenden Einsätzen derselben Person erscheint eine Warnung.

## Bereits im Prototyp umgesetzt

- mehrere Spielorte je Turnier
- optionale Adresse je Spielort
- Zuordnung jedes Courts zu einem Spielort
- Turnierteam mit Grundaufgabe
- mehrere konkrete Einsätze je Begegnung
- Warnung bei zeitgleichen Einsätzen derselben Person
- Anzeige des Spielorts in freigegebenen Spielzeiten und lokalen Benachrichtigungen
- Rollenprüfung über die bestehende Berechtigung `courts`
- Änderungsprotokoll und automatische lokale Sicherung
- sichere Beispielbefüllung, die nur noch leere Bereiche ergänzt

## Benötigte dauerhafte Daten

### Spielort

- `id`: interne Turnier-Spielort-ID
- `tournamentId`: Turnier-ID
- `bookandplayFacilityId`: bestehende Anlagen-ID aus BOOKANDPLAY
- `name`: Anzeigename
- `address`: optionale Anzeigeadresse

### Court-Zuordnung

- `tournamentId`
- `courtNumber` oder besser `bookandplayCourtId`
- `venueId`
- Gültigkeitszeitraum, falls die Zuordnung während eines Turniers wechseln darf

### Mitglied des Turnierteams

- `id`: interne Einsatzplanungs-ID
- `tournamentId`
- `bookandplayUserId`: Benutzer- oder Mitarbeiter-ID
- `displayName`
- `defaultRole`: `referee`, `court`, `desk`, `helper` oder `results`
- optionaler Einladungs- und Bestätigungsstatus

### Einsatz

- `id`
- `tournamentId`
- `matchId`
- `staffId`
- `task`
- `createdBy`, `createdAt`, `updatedAt`

## Erforderliche Schnittstellen

1. Anlagen und Courts des angemeldeten Vereins lesen.
2. Berechtigte Vereinsmitarbeiter oder eingeladene Helfer suchen und zuordnen.
3. Spielorte, Court-Zuordnungen, Teammitglieder und Einsätze laden und speichern.
4. Bei Änderungen an Matchzeit oder Court alle Einsatzkonflikte serverseitig neu prüfen.
5. Optional Benachrichtigung auslösen, wenn sich Einsatz, Zeit oder Spielort ändert.
6. Bestehende Reservierungslogik verwenden, um `bookandplayCourtId`, Anlage und feste Matchbuchung konsistent zu halten.

## Serverseitige Regeln

- Nur berechtigte Vereinsmanager oder Turnierleiter dürfen die Einsatzplanung ändern.
- IDs müssen zum Verein und zum Turnier gehören; übermittelte Namen allein sind nicht vertrauenswürdig.
- Eine Person darf nicht gleichzeitig für verschiedene Begegnungen eingeplant werden.
- Gelöschte oder gesperrte Konten dürfen keine neuen Einsätze erhalten.
- Ein Spielort darf erst entfernt werden, wenn keine Court-Zuordnung oder Reservierung mehr darauf verweist.
- Änderungen müssen mit Benutzer, Zeit und altem/neuem Wert protokolliert werden.

## Abnahmetests

1. Zwei Vereinsanlagen werden geladen und unterschiedlichen Courts desselben Turniers zugeordnet.
2. Freigegebene Spielzeiten zeigen Court und korrekten Spielort.
3. Ein berechtigter Benutzer teilt einen Schiedsrichter einer Begegnung zu; ein Zuschauer kann dies nicht.
4. Zwei gleichzeitig angesetzte Begegnungen mit derselben Person erzeugen einen Konflikt.
5. Nach Verschieben einer Begegnung verschwindet ein nicht mehr bestehender Konflikt automatisch.
6. Ein Teammitglied mit vorhandenem Einsatz kann nicht unbeabsichtigt gelöscht werden.
7. Ein Courtwechsel aktualisiert Reservierung, Spielplan, Einsatzansicht und Benachrichtigung gemeinsam.
8. Änderungen sind nach Neuanmeldung und auf einem zweiten Gerät identisch sichtbar.

## Nicht lokal vortäuschen

Der Prototyp erzeugt keine echten Anlagen-, Benutzer- oder Reservierungskennungen. Anmeldung, Zugriffsschutz, geräteübergreifende Speicherung, Benachrichtigungsversand und feste Courtbuchung müssen durch das BOOKANDPLAY-Backend erfolgen.
