# WerkFinder

Statischer Suchprototyp für Handwerk und Servicetechnik. Nutzer beschreiben ein Problem in freier Sprache und öffnen passende Suchen für Hersteller-Support, Reparaturanleitungen, Videos und Ersatzteilinformationen.

## Lokal starten

`index.html` kann direkt im Browser geöffnet werden. Es gibt keine Build-Schritte oder zusätzlichen Abhängigkeiten.

## Vercel

Das Repository kann als statische Website direkt mit Vercel verbunden werden. Framework-Preset auf **Other** stellen; Build Command und Output Directory leer lassen. Die `index.html` liegt im Projektverzeichnis.

## Aktueller Umfang

Die App leitet Suchanfragen an Google und YouTube weiter. Sucharten für Produktinformationen, Ersatzteile und Bau-/Montageanleitungen sowie ein optionales Produkt-/Modellnummernfeld helfen, die Suchanfrage zu präzisieren. Für erkannte Objekte (unter anderem Dachstuhl, Carport, Treppe, Tisch, Regal, Schrank, Stuhl und Wand) zeigt die Seite objektspezifische SVG-Konzeptzeichnungen, Bauteilbeschriftungen, Maßketten und eine Bauteilliste. Maße können als drei Werte mit `x` (zum Beispiel `120 x 60 x 80 cm`) oder als benannte Maße (zum Beispiel `4 m breit`, `200 cm hoch`, `Dachneigung 45°`) eingegeben werden. Nicht angegebene Werte werden als deutlich markierte Standard-Richtwerte (Beispielmaße) angezeigt. Die Dachstuhlzeichnung ist ein illustrativer Schnitt und keine ausführungsreife Statik- oder Werkplanung. Querschnitte, Verbindungen, Lasten, Fundamente und Genehmigungen müssen für ein echtes Vorhaben von qualifizierten Fachleuten geprüft werden. Die Vorschläge auf der Startseite sind Suchanfragen, keine Skizzen-Beispiele. Die App ruft keine eigene KI, Datenbank oder Hersteller-API auf und kann daher keine bestimmten Treffer oder Herstellerseiten garantieren. Es werden keine `site:`-Suchoperatoren verwendet. Für beste Ergebnisse Produktname und Modellnummer eingeben. Vor Arbeiten an Geräten oder Installationen sind Herstellerangaben und Sicherheitsregeln maßgeblich. Über die Design-Auswahl kann zwischen Werkstatt, Blaupause und Abend gewechselt werden. Das grüne WF-Icon auf weißem Hintergrund liegt in `favicon.svg`.

## Temporäre Passwort-Abfrage

Beim Öffnen der Seite wird ein Passwort abgefragt. Diese Abfrage läuft ausschließlich im Browser und ist nur eine einfache Zugangshürde für den Entwurf: Das Passwort ist im JavaScript der statischen Website sichtbar und bietet keinen echten Zugriffsschutz. Für vertrauliche Inhalte muss ein serverseitiger Schutz beim Hosting-Anbieter eingerichtet werden. Zum späteren Entfernen müssen die Passwort-Abfrage in `index.html`, die Prüfung in `app.js`, die zugehörigen Regeln in `styles.css` und dieser Abschnitt entfernt werden.