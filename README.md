# WerkFinder

Statischer Suchprototyp für Handwerk und Servicetechnik. Nutzer beschreiben ein Problem in freier Sprache und öffnen passende Suchen für Hersteller-Support, Reparaturanleitungen, Videos und Ersatzteilinformationen.

## Lokal starten

Keine Build-Schritte erforderlich. Für die CAD-Ansicht die Seite über einen lokalen Webserver öffnen, zum Beispiel `python3 -m http.server 8000`, und dann `http://localhost:8000` aufrufen. Die 3D-Ansicht lädt Three.js und OrbitControls von jsDelivr; dafür werden eine Internetverbindung und WebGL benötigt. Ohne CDN oder WebGL bleibt die technische SVG-Zeichnung als Fallback verfügbar.

## Vercel

Das Repository kann als statische Website direkt mit Vercel verbunden werden. Framework-Preset auf **Other** stellen; Build Command und Output Directory leer lassen. Die `index.html` liegt im Projektverzeichnis.

## Aktueller Umfang

Die App leitet Suchanfragen an Google und YouTube weiter. Sucharten für Produktinformationen, Ersatzteile und Bau-/Montageanleitungen sowie ein optionales Produkt-/Modellnummernfeld präzisieren die Suche. Erkannte Bauideen erhalten ein interaktives Three.js-Modell mit Kanten, Orbit/Zoom/Pan und orthografischen Top-, Front- und Seitenansichten; die 2D-Blueprint-Ansicht bleibt als skalierbare SVG und als CDN/WebGL-Fallback verfügbar. Unterstützt werden unter anderem Dachstuhl, Carport, Treppe, Tisch, Regal, Schrank, Stuhl, Wand, Bett, Gartenhaus, Zaun und Balken. Maße können als Dreiergruppe (zum Beispiel `120 x 60 x 80 cm`), mit Benennung (zum Beispiel `Breite 80 cm`, `2,50 m hoch`) und bei Treppen als `15 Stufen` eingegeben werden. Für Treppen wird die Schrittmaß-Orientierung `2 × Steigung + Auftritt = 63 cm` angezeigt; Reparaturbegriffe wie tropfende Wasserhähne oder klemmende Lichtschalter erhalten eine gesonderte Anleitung mit Sicherheitswarnung und Werkzeughinweisen. Richtmaße und Normverweise dienen ausschließlich der Orientierung: Die Anwendung ist kein normgeprüftes CAD-, Statik- oder Planungssystem. Bauteilquerschnitte, Anschlüsse, Lasten, Fundamente, Nutzungsanforderungen und Vorschriften müssen von qualifizierten Fachleuten projektbezogen geprüft werden. Die App ruft keine eigene KI, Datenbank oder Hersteller-API auf und kann keine bestimmten Treffer oder Herstellerseiten garantieren. Es werden keine `site:`-Suchoperatoren verwendet. Vor Arbeiten sind Herstellerangaben und Sicherheitsregeln maßgeblich. Über die Design-Auswahl kann zwischen Werkstatt, Blaupause und Abend gewechselt werden; das grüne WF-Icon auf weißem Hintergrund liegt in `favicon.svg`.

## Temporäre Passwort-Abfrage

Beim Öffnen der Seite wird ein Passwort abgefragt. Diese Abfrage läuft ausschließlich im Browser und ist nur eine einfache Zugangshürde für den Entwurf: Das Passwort ist im JavaScript der statischen Website sichtbar und bietet keinen echten Zugriffsschutz. Für vertrauliche Inhalte muss ein serverseitiger Schutz beim Hosting-Anbieter eingerichtet werden. Zum späteren Entfernen müssen die Passwort-Abfrage in `index.html`, die Prüfung in `app.js`, die zugehörigen Regeln in `styles.css` und dieser Abschnitt entfernt werden.