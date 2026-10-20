# WerkFinder

Statischer Suchprototyp für Handwerk und Servicetechnik. Nutzer beschreiben ein Problem in freier Sprache, wählen optional ein Gewerk und öffnen passende Suchen für Hersteller-Support, Reparaturanleitungen, Videos und Ersatzteilinformationen.

## Lokal starten

`index.html` kann direkt im Browser geöffnet werden. Es gibt keine Build-Schritte oder zusätzlichen Abhängigkeiten.

## Vercel

Das Repository kann als statische Website direkt mit Vercel verbunden werden. Framework-Preset auf **Other** stellen; Build Command und Output Directory leer lassen. Die `index.html` liegt im Projektverzeichnis.

## Aktueller Umfang

Die App leitet Suchanfragen an Google und YouTube weiter. Sie ruft noch keine eigene KI, Datenbank oder Hersteller-API auf und zeigt keine selbst verifizierten Treffer an. Vor Arbeiten an Geräten oder Installationen sind Herstellerangaben und Sicherheitsregeln maßgeblich.