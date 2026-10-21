const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#site-password");
const passwordError = document.querySelector("#password-error");
const passwordGate = document.querySelector(".password-gate");
const siteContent = document.querySelector("#site-content");

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value === "4741L") {
    passwordGate.hidden = true;
    siteContent.hidden = false;
    return;
  }
  passwordError.hidden = false;
  passwordInput.select();
});

passwordInput.addEventListener("input", () => {
  passwordError.hidden = true;
});

const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const queryCount = document.querySelector("#query-count");
const results = document.querySelector("#results");
const resultsSummary = document.querySelector("#results-summary");
const resultGrid = document.querySelector("#result-grid");
const searchTypeButtons = [...document.querySelectorAll(".search-type")];
const themeButtons = [...document.querySelectorAll(".theme-option")];
const layoutToggle = document.querySelector("#layout-toggle");
const productModelInput = document.querySelector("#product-model");
const buildHelp = document.querySelector("#build-help");
const buildSummary = document.querySelector("#build-summary");
const buildDimensionNote = document.querySelector("#build-dimension-note");
const sketchContainer = document.querySelector("#sketch-container");
const buildStepsTitle = document.querySelector("#build-steps-title");
const buildSteps = document.querySelector("#build-steps");
const buildParts = document.querySelector("#build-parts");
const buildMaterials = document.querySelector("#build-materials");
const buildTools = document.querySelector("#build-tools");
const buildSafety = document.querySelector("#build-safety");
const sketchBadge = document.querySelector("#sketch-badge");
const buildPartsTitle = document.querySelector("#build-parts-title");
const buildMaterialsTitle = document.querySelector("#build-materials-title");
const buildToolsTitle = document.querySelector("#build-tools-title");
const buildNote = document.querySelector("#build-note");
let selectedSearchType = "all";
let currentSearch = "";

const searchSources = {
  all: [
    { name: "Produkt & passende Seiten", detail: "Produktinformationen, technische Daten und passende Ergebnisse", icon: "01", terms: (query) => `${query} Produkt technische Daten` },
    { name: "Hersteller & offizieller Service", detail: "Hersteller-Support, Service und offizielle Hinweise", icon: "02", terms: (query) => `${query} Hersteller Support Service` },
    { name: "Anleitungen & Reparaturhilfen", detail: "Bedienungs-, Montage- und Reparaturanleitungen", icon: "03", terms: (query) => `${query} Bedienungsanleitung Montage Reparatur` },
    { name: "Ersatzteile & technische Infos", detail: "Ersatzteile, Explosionszeichnungen und Teilenummern", icon: "04", terms: (query) => `${query} Ersatzteile Explosionszeichnung Teilenummer` },
    { name: "Bau- & Montageanleitungen", detail: "Schritt-für-Schritt-Anleitungen und Materialhinweise", icon: "05", terms: (query) => `${query} Bauanleitung Montageanleitung Materialliste` },
    { name: "Videos & Praxisbeispiele", detail: "Erklärvideos und praktische Vorführungen", icon: "▶", terms: (query) => `${query} Anleitung Montage Reparatur`, host: "youtube" },
  ],
  product: [
    { name: "Produktseiten & technische Daten", detail: "Produktdetails, Spezifikationen und passende Seiten finden", icon: "01", terms: (query) => `${query} Produkt technische Daten` },
    { name: "Hersteller-Support", detail: "Offizielle Hilfe und Serviceinformationen zum Produkt", icon: "02", terms: (query) => `${query} Hersteller Support Service` },
    { name: "Bedienungs- & Montageanleitungen", detail: "Handbücher, Anleitungen und technische Dokumente", icon: "03", terms: (query) => `${query} Bedienungsanleitung Montageanleitung PDF` },
    { name: "Videos zum Produkt", detail: "Vorführungen, Einrichtung und Reparatur", icon: "▶", terms: (query) => `${query} Produkt Anleitung`, host: "youtube" },
  ],
  parts: [
    { name: "Ersatzteile für dieses Produkt", detail: "Teile und kompatible Angebote zum Produkt oder Modell suchen", icon: "01", terms: (query) => `${query} Ersatzteile kaufen` },
    { name: "Hersteller-Ersatzteilservice", detail: "Offizielle Ersatzteile und Serviceinformationen finden", icon: "02", terms: (query) => `${query} Hersteller Ersatzteilservice Original Ersatzteile` },
    { name: "Explosionszeichnungen & Teilenummern", detail: "Bauteile, Ersatzteilnummern und technische Zeichnungen", icon: "03", terms: (query) => `${query} Explosionszeichnung Ersatzteilnummer` },
    { name: "Einbau- & Reparaturhilfe", detail: "Anleitungen zum passenden Ersatzteil und Einbau", icon: "04", terms: (query) => `${query} Ersatzteil wechseln Reparaturanleitung`, host: "youtube" },
  ],
  build: [
    { name: "Bau- & Montageanleitungen", detail: "Schritt-für-Schritt-Anleitungen zum Bauvorhaben", icon: "01", terms: (query) => `${query} Bauanleitung Schritt für Schritt` },
    { name: "Materialliste & Planung", detail: "Material, Maße, Werkzeug und Planungshilfen", icon: "02", terms: (query) => `${query} Materialliste Maße Werkzeug Planung` },
    { name: "Montage- & Aufbauvideos", detail: "Praktische Videos und Vorführungen", icon: "▶", terms: (query) => `${query} Bauanleitung Montage Aufbau`, host: "youtube" },
    { name: "Technische Zeichnungen", detail: "Skizzen, Pläne und Konstruktionshinweise", icon: "04", terms: (query) => `${query} Bauplan technische Zeichnung` },
  ],
};

function detectTradeType(query) {
  if (/\b(lichtschalter|ausschalter|wechselschalter|wechselschaltung|steckdose|schaltplan|verteilerkasten|elektrik|elektroinstallation|sicherung\w*|fi[- ]?schalter|ls[- ]?schalter|rcd)\b/i.test(query)) return "electrical";
  if (/(?:^|[^\p{L}\p{N}_])(?:auto|kfz|fahrzeug|brems\w*|bremsscheib\w*|radlager\w*|ölwechsel|oelwechsel|obd\w*|zündkerz\w*|zuendkerz\w*|keilriem\w*|kupplung\w*)(?=$|[^\p{L}\p{N}_])/iu.test(query)) return "vehicle";
  return null;
}

function detectVehicleTask(query) {
  if (/(?:^|[^\p{L}\p{N}_])(?:ölwechsel|oelwechsel|motoröl|motoroel|ölfilter|oelfilter)(?=$|[^\p{L}\p{N}_])/iu.test(query)) return "oil";
  if (/\b(zündkerz\w*|zuendkerz\w*|keilriem\w*|obd\w*)\b/i.test(query)) return "engine";
  return "brake";
}

function portalSearch(query, domain) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${query} site:${domain}`)}`;
}

function renderResults() {
  const rawQuery = queryInput.value.trim();
  if (!rawQuery) return;
  const productModel = productModelInput.value.trim();
  currentSearch = [rawQuery, productModel].filter(Boolean).join(" ");
  resultsSummary.textContent = `Suchanfrage: „${currentSearch}“ · Öffne einen Suchweg für aktuelle Treffer.`;
  const tradeType = detectTradeType(rawQuery);
  const sources = tradeType === "electrical"
    ? [
      { name: "Technischer Schaltplan", detail: "Schematische DIN-/IEC-Symbolik und sichere Fachhinweise", icon: "⌁", terms: (query) => `${query} Schaltplan DIN EN 60617` },
      { name: "VDE · Fachinformationen", detail: "Normen, Schutzmaßnahmen und Informationen zur Elektroinstallation", icon: "VDE", terms: (query) => `${query} VDE Fachinformation` },
      { name: "Herstellerunterlagen", detail: "Datenblätter und Anschlussinformationen des konkreten Geräts", icon: "↗", terms: (query) => `${query} Hersteller Anschlussplan Datenblatt` },
    ]
    : tradeType === "vehicle"
      ? [
        { name: "AUTODOC · Ersatzteilsuche", detail: "Bauteile nach Fahrzeug, Marke und Modell suchen", icon: "01", url: (query) => portalSearch(query, "autodoc.de") },
        { name: "Motointegrator · Ersatzteile", detail: "Fahrzeugbezogene Teile und Angebote recherchieren", icon: "02", url: (query) => portalSearch(query, "motointegrator.de") },
        { name: "autodaten · Reparaturinformationen", detail: "Fahrzeugbezogene Wartungs- und Reparaturdaten suchen", icon: "03", url: (query) => portalSearch(query, "autodaten.net") },
        { name: "Leebmann24 · Teilekatalog", detail: "Originalteile und Herstellerkataloge recherchieren", icon: "04", url: (query) => portalSearch(query, "leebmann24.com") },
        { name: "Reparaturanleitungen", detail: "Wartungs- und Reparaturhinweise für Fahrzeug und Bauteil", icon: "05", terms: (query) => `${query} Reparaturanleitung` },
      ]
      : searchSources[selectedSearchType] ?? searchSources.all;
  resultGrid.replaceChildren(...sources.map((source) => {
    const searchTerms = source.terms?.(currentSearch).trim().replace(/\s+/g, " ");
    const baseUrl = source.host === "youtube" ? "https://www.youtube.com/results" : "https://www.google.com/search";
    const url = source.url?.(currentSearch)
      ?? `${baseUrl}?${source.host === "youtube" ? "search_query" : "q"}=${encodeURIComponent(searchTerms)}`;
    const link = document.createElement("a");
    link.className = "result-card";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${source.name} in neuem Tab öffnen`);
    const icon = document.createElement("span");
    icon.className = "result-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = source.icon;
    const content = document.createElement("span");
    content.className = "result-content";
    const title = document.createElement("h3");
    title.textContent = source.name;
    const detail = document.createElement("p");
    detail.textContent = source.detail;
    const action = document.createElement("span");
    action.className = "result-action";
    action.innerHTML = "<span>Suchergebnisse öffnen</span><span aria-hidden=\"true\">↗</span>";
    content.append(title, detail, action);
    link.append(icon, content);
    return link;
  }));
  results.hidden = false;
  try {
    renderBuildHelp(rawQuery);
  } catch (error) {
    console.error("Bau- oder Reparaturansicht konnte nicht erstellt werden.", error);
    buildHelp.hidden = true;
  }
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

const sketchTypes = [
  {
    id: "electrical",
    pattern: /\b(lichtschalter|ausschalter|wechselschalter|wechselschaltung|steckdose|schaltplan|verteilerkasten|elektrik|elektroinstallation|sicherung\w*|ls[- ]?schalter|fi[- ]?schalter|rcd)\b/i,
    title: "Technischer Schaltplan · schematische Übersicht",
    defaults: { width: 120, depth: 12, height: 80 },
    components: ["Leitungsschutz (LS)", "Schalter / Wechselschaltung", "Leuchte", "Steckdose", "L / N / PE"],
    steps: ["Diese Darstellung ist ein Funktionsschema, kein Installations- oder Ausführungsplan.", "Fest installierte elektrische Anlagen ausschließlich durch eine Elektrofachkraft planen, prüfen und bearbeiten lassen.", "Aderfarben und Symbole anhand der geltenden Normen, Anlagenbedingungen und Herstellerunterlagen verifizieren."],
    isElectrical: true,
  },
  {
    id: "vehicle",
    pattern: /(?:^|[^\p{L}\p{N}_])(?:auto|kfz|fahrzeug|brems\w*|bremsscheib\w*|radlager\w*|ölwechsel|oelwechsel|obd\w*|zündkerz\w*|zuendkerz\w*|keilriem\w*|kupplung\w*)(?=$|[^\p{L}\p{N}_])/iu,
    title: "KFZ-Bauteil · schematische Explosionsskizze",
    defaults: { width: 80, depth: 45, height: 55 },
    components: ["Bremsscheibe (Beispiel)", "Bremsbeläge", "Bremssattel", "Radnabe / Befestigung"],
    steps: ["Bauteilzuordnung ausschließlich anhand Fahrzeug-Identnummer, Motorisierung und Herstellerunterlagen prüfen.", "Fahrzeug gegen Wegrollen sichern und Arbeiten nur mit geeigneter Hebe- und Abstützausrüstung durchführen.", "Sicherheitsrelevante Arbeiten an Bremse, Lenkung und Fahrwerk einer qualifizierten Werkstatt überlassen.", "Anzugsdrehmomente sind fahrzeug- und verbindungsspezifisch; ausschließlich Herstellerwerte verwenden."],
    isVehicle: true,
  },
  {
    id: "kitchen",
    pattern: /\b(küche|küchenzeile|küchenblock|küchenunterschrank|küchenmöbel)\b/i,
    title: "Küchenzeile · Front- und Schnittansicht",
    defaults: { width: 240, depth: 60, height: 220 },
    components: ["Sockel / Unterschränke im 60-cm-Raster", "Arbeitsplatte · OKFF ca. 91 cm", "Spülbecken und Armatur", "Kochfeld", "Oberschränke / Nische"],
    steps: ["Wand, Anschlüsse, Gerätebreiten und Wandunebenheiten vor Ort aufnehmen; Raster und Fugen anhand der tatsächlichen Produkte prüfen.", "Unterschränke ausrichten und untereinander verbinden; Arbeitsplatte und Wandanschluss nach Herstellerangabe montieren.", "Ausschnitte, Wasser- und Elektroanschlüsse ausschließlich fachgerecht und passend zu den Geräten ausführen lassen.", "Oberschränke in geeigneter tragfähiger Wand befestigen und gegen Kippen sichern."],
  },
  {
    id: "bath",
    pattern: /\b(bad|badezimmer|waschtisch|dusche|duschwanne|badmöbel)\b/i,
    title: "Bad · Waschtisch und Dusche",
    defaults: { width: 240, depth: 180, height: 220 },
    components: ["Waschtisch / Unterschrank", "Waschbecken und Armatur", "Duschfläche", "Duschabtrennung", "Wand- und Bodenanschluss"],
    steps: ["Leitungsführung, Abdichtung und Gefälle durch Fachplanung auf Bestand und geltende Regeln abstimmen.", "Sanitärobjekte anhand Herstellermaße und tatsächlicher Einbausituation positionieren.", "Abdichtung und Durchdringungen systemgerecht ausführen und dokumentieren.", "Wasseranschlüsse durch einen Installationsfachbetrieb prüfen lassen."],
    isStructural: true,
  },
  {
    id: "wardrobe",
    pattern: /\b(schrankwand|einbauschrank|kleiderschrank|garderobenschrank)\b/i,
    title: "Schrankwand · Frontansicht",
    defaults: { width: 300, depth: 60, height: 240 },
    components: ["Korpusmodule", "Einlegeböden", "Kleiderstange", "Fronten / Türen", "Wand- und Kippsicherung"],
    steps: ["Wandbreite, Raumhöhe, Sockel, Deckenverlauf und Türöffnungen exakt aufnehmen.", "Korpusse lot- und fluchtgerecht ausrichten, verbinden und gemäß Wandaufbau sichern.", "Beschläge und Fronten nach Herstellerangaben einstellen; Kippsicherung vor Nutzung prüfen."],
  },
  {
    id: "roof",
    pattern: /\b(dachstuhl|satteldach|dach|dachsparren|firstpfette|kehlbalken)\b/i,
    title: "Satteldach · konzeptioneller Schnitt",
    defaults: { width: 800, depth: 600, height: 460, pitch: 35 },
    components: ["Sparren (Dachfläche)", "Firstpfette (First)", "Mittelpfetten", "Kehlbalken", "Fußpfette / Auflager", "Stützen und Wandauflager"],
    steps: ["Spannweite, Dachform, Nutzung und örtliche Einwirkungen durch Fachplanung festlegen.", "Querschnitte, Verbindungsmittel, Aussteifung und Auflager statisch bemessen lassen.", "Dachstuhl nur nach geprüfter Werk- und Montageplanung fertigen und errichten."],
    isStructural: true,
  },
  {
    id: "carport",
    pattern: /\b(carport|stellplatzüberdachung)\b/i,
    title: "Carport · schematische Ansicht",
    defaults: { width: 300, depth: 500, height: 230 },
    components: ["Dachfläche", "Querträger", "Pfosten", "Fußpunkte / Fundamente"],
    steps: ["Standort, Entwässerung, Zufahrt und örtliche Genehmigungspflichten prüfen.", "Fundamente, Aussteifung und alle tragenden Bauteile statisch planen lassen.", "Abstände zu Grundstücksgrenzen und Leitungen vor Baubeginn klären."],
    isStructural: true,
  },
  {
    id: "stairs",
    pattern: /\b(treppe|treppen|stufen|treppenlauf)\b/i,
    title: "Treppe · schematischer Seitenriss",
    defaults: { width: 100, depth: 420, height: 280 },
    components: ["Stufen", "Setzstufen (optional)", "Wangen", "An- und Austritt"],
    steps: ["Geschosshöhe, verfügbare Lauflänge und Nutzung exakt aufnehmen.", "Steigung, Auftritt, Laufbreite, Geländer und Kopfhöhe nach geltenden Regeln planen.", "Tragwerk und Anschlüsse vor Fertigung fachlich prüfen lassen."],
    isStructural: true,
  },
  {
    id: "table",
    pattern: /\b(tisch|esstisch|schreibtisch|arbeitstisch|werkbank|werktisch)\b/i,
    title: "Tisch · schematische Ansicht",
    defaults: { width: 140, depth: 70, height: 75 },
    components: ["Tischplatte", "Zargen / Rahmen", "Beine", "Verbindungen"],
    steps: ["Plattenmaß, Überstand und Nutzung festlegen.", "Rahmen rechtwinklig aufbauen und Beine gleichmäßig ausrichten.", "Platte so befestigen, dass Materialbewegungen berücksichtigt werden.", "Standfestigkeit und Kanten vor der Nutzung prüfen."],
  },
  {
    id: "shelf",
    pattern: /\b(regal|bücherregal|wandregal|schuhregal)\b/i,
    title: "Regal · schematische Vorderansicht",
    defaults: { width: 100, depth: 35, height: 180 },
    components: ["Seitenteile", "Fachböden", "Rückwand / Aussteifung", "Wandbefestigung"],
    steps: ["Fachhöhen, Tiefe und erwartete Lasten festlegen.", "Seitenteile und Böden rechtwinklig verbinden.", "Rückwand oder geeignete Aussteifung vorsehen.", "Hohes Regal mit zum Wandaufbau passenden Befestigungen sichern."],
  },
  {
    id: "cabinet",
    pattern: /\b(schrank|kommode|spind|unterschrank)\b/i,
    title: "Schrank · schematische Vorderansicht",
    defaults: { width: 100, depth: 55, height: 200 },
    components: ["Korpus", "Böden", "Türen", "Rückwand / Aussteifung"],
    steps: ["Korpusmaße, Innenaufteilung und Türanschläge planen.", "Korpus rechtwinklig montieren und Rückwand zur Aussteifung befestigen.", "Böden einsetzen und Türen mit geeigneten Beschlägen ausrichten.", "Schrank kippsicher aufstellen und bei Bedarf fachgerecht an der Wand befestigen."],
  },
  {
    id: "chair",
    pattern: /\b(stuhl|hocker|sitzbank)\b/i,
    title: "Sitzmöbel · schematische Seitenansicht",
    defaults: { width: 45, depth: 50, height: 85 },
    components: ["Sitzfläche", "Beine", "Rückenlehne", "Querstreben"],
    steps: ["Sitzhöhe, Sitzfläche und Nutzung ergonomisch festlegen.", "Beine und Querstreben paarweise ausrichten.", "Sitzfläche und Rückenlehne mit geeigneten Verbindungen montieren.", "Alle Verbindungen und die Kippsicherheit vor Belastung sorgfältig prüfen."],
  },
  {
    id: "wall",
    pattern: /\b(wand|trennwand|ständerwand|trockenbauwand)\b/i,
    title: "Wand · schematische Ansicht",
    defaults: { width: 400, depth: 12, height: 250 },
    components: ["Beplankung", "Ständer (schematisch)", "Riegel", "Boden- und Deckenanschluss"],
    steps: ["Vorhandene Leitungen, Untergrund und Anforderungen an die Wand prüfen.", "Aufbau, Ständerabstände, Dämmung und Beplankung projektspezifisch festlegen.", "Anschlüsse und Befestigung passend zum vorhandenen Bauteil planen.", "Bei tragender, brand- oder schallschutzrelevanter Wand Fachplanung einholen."],
    isStructural: true,
  },
  {
    id: "bed",
    pattern: /\b(bett|bettgestell|doppelbett|einzelbett)\b/i,
    title: "Bettgestell · schematische Konstruktion",
    defaults: { width: 160, depth: 200, height: 45 },
    components: ["Seitenteile", "Kopf- und Fußteil", "Mittelträger", "Lattenrostauflage"],
    steps: ["Matratzenmaß und gewünschte Einlegetiefe aufnehmen.", "Rahmen rechtwinklig verbinden und den Mittelträger passend abstützen.", "Auflageleisten gleichmäßig befestigen und Kanten entgraten.", "Verbindungen und Belastbarkeit vor der Nutzung prüfen."],
  },
  {
    id: "gardenhouse",
    pattern: /\b(gartenhaus|gerätehaus|gartenhütte|schuppen)\b/i,
    title: "Gartenhaus · schematische Konstruktion",
    defaults: { width: 300, depth: 250, height: 230, pitch: 25 },
    components: ["Wandrahmen", "Eckpfosten", "Dachtragwerk", "Türöffnung", "Boden / Fundament"],
    steps: ["Baugrund, Entwässerung, Windbeanspruchung und Genehmigungspflichten prüfen.", "Gründung, Aussteifung und Dachaufbau projektbezogen planen lassen.", "Wandrahmen lot- und winkelgerecht montieren.", "Dachdeckung, Anschlüsse und Holzschutz fachgerecht ausführen."],
    isStructural: true,
  },
  {
    id: "fence",
    pattern: /\b(zaun|sichtschutz|gartenzaun|lattenzaun)\b/i,
    title: "Zaunfeld · schematische Konstruktion",
    defaults: { width: 200, depth: 10, height: 120 },
    components: ["Zaunlatten / Füllung", "Querholme", "Zaunpfosten", "Pfostenfundamente"],
    steps: ["Grenzverlauf, Grundstücksregeln und Leitungen im Boden klären.", "Pfostenabstände und Fundamentierung an Höhe und Windlast anpassen.", "Holme fluchtgerecht befestigen und Füllung gleichmäßig montieren.", "Holzschutz und sichere Kanten prüfen."],
    isStructural: true,
  },
  {
    id: "beam",
    pattern: /\b(balken|kantholz|träger|holzträger)\b/i,
    title: "Balken · schematische Darstellung",
    defaults: { width: 300, depth: 12, height: 20 },
    components: ["Balkenkörper", "Auflager links", "Auflager rechts", "Verbindung / Befestigung"],
    steps: ["Spannweite, Lasten, Holzqualität und Auflagerbedingungen erfassen.", "Querschnitt und Anschlüsse bei tragender Verwendung statisch bemessen lassen.", "Bauteil vor Einbau auf Schäden und passende Lagerung prüfen."],
    isStructural: true,
  },
  {
    id: "generic",
    pattern: /\b(bau\w*|herstell\w*|anfertig\w*|montier\w*|montage|skizz\w*|zeichn\w*|entwurf|konstrukt\w*|aufbau|zusammenbau|planen|bauteil|werkstück)\b/i,
    title: "Werkstück · schematische Ansicht",
    defaults: { width: 100, depth: 60, height: 80 },
    components: ["Grundform", "Bauteile", "Verbindungen", "Auflager / Befestigung"],
    steps: ["Zweck, Einsatzort und Belastung des Gegenstands genau festlegen.", "Fehlende Maße und gewünschte Materialien vor dem Bau ergänzen.", "Bauteile, Verbindungen und Befestigungen passend zum Einsatz planen.", "Vor der Nutzung Stabilität und Sicherheit prüfen; Vorschriften beachten."],
  },
];

function detectSketchType(query) {
  return sketchTypes.find((type) => type.pattern.test(query)) ?? null;
}

function isBuildRequest(query) {
  return detectSketchType(query) !== null
    || /\b(?:bau\w*|gebaut|herstell\w*|anfertig\w*|montier\w*|montage|skizz\w*|zeichn\w*|entwurf\w*|mach\w*|konstrukt\w*|entwerf\w*|plan\w*|aufbau|zusammenbau)\b/i.test(query)
    || /\bstell\w*\s+her\b/i.test(query);
}

function detectRepairRequest(query) {
  return /\b(reparier\w*|reparatur|tropft|undicht|klemm\w*|verstopft|defekt|funktioniert nicht|austausch\w*|wechsel\w*|spülkasten|wasserhahn|lichtschalter|steckdose|sicherung|heizung entlüften|verputz\w*|putz\w*)\b/i.test(query);
}

function toCentimeters(value, unit) {
  const number = Number(value.replace(",", "."));
  if (!Number.isFinite(number) || number <= 0) return null;
  const normalizedUnit = unit?.toLowerCase().replaceAll(" ", "") ?? "cm";
  if (normalizedUnit === "m" || normalizedUnit.startsWith("meter")) return number * 100;
  if (normalizedUnit === "mm" || normalizedUnit.startsWith("millimeter")) return number / 10;
  return number;
}

function parseDimensions(query) {
  const unitPattern = "(millimeter(?:n)?|mm|zentimeter(?:n)?|cm|meter(?:n)?|m)?";
  const tripletPattern = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${unitPattern}\\s*[x×]\\s*(\\d+(?:[.,]\\d+)?)\\s*${unitPattern}\\s*[x×]\\s*(\\d+(?:[.,]\\d+)?)\\s*${unitPattern}`, "i");
  const triplet = query.match(tripletPattern);
  const dimensions = {};
  if (triplet) {
    const sharedUnit = triplet[6] || triplet[4] || triplet[2] || "cm";
    const values = {
      width: toCentimeters(triplet[1], triplet[2] || sharedUnit),
      depth: toCentimeters(triplet[3], triplet[4] || sharedUnit),
      height: toCentimeters(triplet[5], triplet[6] || sharedUnit),
    };
    if (Object.values(values).every((value) => value !== null)) Object.assign(dimensions, values);
  }

  const labels = "(?:gross|groß|breit|breite|breiten|tief|tiefe|tiefen|hoch|höhe|höhen|geschosshöhe|geschosshöhen|lang|länge|längen|spannweite|firsthöhe|auftritt(?:stiefe)?|steigung(?:shöhe)?|sparrenabstand|plattenstärke)";
  const unit = "(?:millimeter(?:n)?|mm|zentimeter(?:n)?|cm|meter(?:n)?|m)";
  const namedDimension = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${unit})?\\s*(${labels})\\b|\\b(${labels})\\s*(?:von|:|=)?\\s*(\\d+(?:[.,]\\d+)?)\\s*(${unit})?`, "gi");
  for (const match of query.matchAll(namedDimension)) {
    const label = (match[3] ?? match[4]).toLowerCase();
    const key = label.startsWith("auftritt")
      ? "treadDepth"
      : label.startsWith("steigung")
        ? "riserHeight"
        : label === "sparrenabstand"
          ? "rafterSpacing"
          : label === "plattenstärke"
            ? "panelThickness"
            : label.startsWith("tief") || label.startsWith("läng") || label.startsWith("lang")
      ? "depth"
      : label.startsWith("breit") || label === "spannweite"
        ? "width"
        : "height";
    const value = toCentimeters(match[1] ?? match[5], match[2] ?? match[6]);
    if (value !== null) dimensions[key] = value;
  }
  const stepCount = query.match(/\b(\d{1,2})\s*(?:stufen|steigungen)\b|\b(?:stufen|steigungen)\s*(?:anzahl|von|:)?\s*(\d{1,2})\b/i);
  if (stepCount) {
    const count = Number(stepCount[1] ?? stepCount[2]);
    if (count >= 2 && count <= 40) dimensions.stepCount = count;
  }
  const pitch = query.match(/(\d+(?:[.,]\d+)?)\s*(?:°|grad)/i);
  if (pitch) {
    const angle = Number(pitch[1].replace(",", "."));
    if (angle > 0 && angle < 90) dimensions.pitch = angle;
  }
  const namedPitch = query.match(/(?:dachneigung|neigung)\s*(?:von|:)?\s*(\d+(?:[.,]\d+)?)\s*(?:°|grad)?/i);
  if (namedPitch) {
    const angle = Number(namedPitch[1].replace(",", "."));
    if (angle > 0 && angle < 90) dimensions.pitch = angle;
  }
  return dimensions;
}

function formatDimension(value, roof = false) {
  if (roof && value >= 100) return `${(value / 100).toFixed(2).replace(".", ",")} m`;
  const precision = value < 10 ? 2 : 1;
  const rounded = Number(value.toFixed(precision));
  return `${rounded.toString().replace(".", ",")} cm`;
}

function createSvgBuilder(query, type) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 800 470");
  svg.setAttribute("role", "img");
  svg.setAttribute("class", "technical-sketch");
  svg.setAttribute("aria-label", `${type.title}, technische Konzeptskizze zu ${query}`);

  const add = (tag, attributes = {}, text) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
    if (text !== undefined) node.textContent = text;
    svg.append(node);
    return node;
  };

  const defs = add("defs");
  const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
  pattern.setAttribute("id", "sketch-hatch");
  pattern.setAttribute("width", "8");
  pattern.setAttribute("height", "8");
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  const hatch = document.createElementNS("http://www.w3.org/2000/svg", "path");
  hatch.setAttribute("d", "M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6");
  hatch.setAttribute("class", "sketch-hatch-line");
  pattern.append(hatch);
  defs.append(pattern);
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "sketch-arrow");
  marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "5");
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerWidth", "5");
  marker.setAttribute("markerHeight", "5");
  marker.setAttribute("orient", "auto-start-reverse");
  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
  arrow.setAttribute("class", "sketch-arrow");
  marker.append(arrow);
  defs.append(marker);

  const line = (x1, y1, x2, y2, className = "sketch-structure", extra = {}) =>
    add("line", { x1, y1, x2, y2, class: className, ...extra });
  const rect = (x, y, width, height, className = "sketch-structure", extra = {}) =>
    add("rect", { x, y, width, height, class: className, ...extra });
  const polygon = (points, className = "sketch-structure") =>
    add("polygon", { points, class: className });
  const label = (x, y, text, className = "sketch-part-label", extra = {}) =>
    add("text", { x, y, class: className, ...extra }, text);
  const callout = (number, text, x1, y1, y2) => {
    line(x1, y1, 510, y2, "sketch-leader");
    add("circle", { cx: 530, cy: y2, r: 12, class: "sketch-number" });
    label(530, y2 + 4, number, "sketch-number-text", { "text-anchor": "middle" });
    label(552, y2 + 5, text);
  };
  const dimension = (x1, y1, x2, y2, text, vertical = false) => {
    if (vertical) {
      line(x1 - 7, y1, x1 + 7, y1, "sketch-dimension-extension");
      line(x2 - 7, y2, x2 + 7, y2, "sketch-dimension-extension");
    } else {
      line(x1, y1 - 7, x1, y1 + 7, "sketch-dimension-extension");
      line(x2, y2 - 7, x2, y2 + 7, "sketch-dimension-extension");
    }
    line(x1, y1, x2, y2, "sketch-dimension", {
      "marker-start": "url(#sketch-arrow)",
      "marker-end": "url(#sketch-arrow)",
    });
    label(vertical ? x1 - 10 : (x1 + x2) / 2, vertical ? (y1 + y2) / 2 : y1 - 8, text, "sketch-dimension-text", {
      "text-anchor": vertical ? "end" : "middle",
      ...(vertical ? { transform: `rotate(-90 ${x1 - 10} ${(y1 + y2) / 2})` } : {}),
    });
  };

  return { svg, add, line, rect, polygon, label, callout, dimension };
}

function drawRoofSketch(builder, dimensions) {
  const { add, line, rect, polygon, label, callout, dimension } = builder;
  const center = 285;
  const scale = Math.min(360 / dimensions.width, 220 / dimensions.height);
  const halfSpan = dimensions.width * scale / 2;
  const riseCm = dimensions.width / 2 * Math.tan(dimensions.pitch * Math.PI / 180);
  const rise = riseCm * scale;
  const ridgeY = 390 - dimensions.height * scale;
  const eaveY = ridgeY + rise;
  const left = center - halfSpan;
  const right = center + halfSpan;

  label(105, 32, "QUERSCHNITT · KONZEPTDARSTELLUNG", "sketch-kicker");
  polygon(`${left},${eaveY} ${center},${ridgeY} ${right},${eaveY}`, "sketch-roof-fill");
  line(left, eaveY, center, ridgeY, "sketch-rafter");
  line(center, ridgeY, right, eaveY, "sketch-rafter");
  line(left + 8, eaveY + 7, center + 8, ridgeY + 7, "sketch-rafter-secondary");
  line(center - 8, ridgeY + 7, right - 8, eaveY + 7, "sketch-rafter-secondary");

  rect(center - 25, ridgeY - 9, 50, 22, "sketch-timber");
  rect(left - 12, eaveY - 5, 36, 16, "sketch-timber");
  rect(right - 24, eaveY - 5, 36, 16, "sketch-timber");
  line(195, 168, 225, 181, "sketch-timber-line");
  line(345, 181, 375, 168, "sketch-timber-line");
  line(left + 6, eaveY + 20, right - 6, eaveY + 20, "sketch-timber-line");
  line(left + halfSpan * 0.58, ridgeY + 30, left + halfSpan * 0.66, eaveY + 17, "sketch-structure");
  line(right - halfSpan * 0.58, ridgeY + 30, right - halfSpan * 0.66, eaveY + 17, "sketch-structure");
  line(center - halfSpan * 0.24, ridgeY + 34, center + halfSpan * 0.24, ridgeY + 34, "sketch-timber-line");
  line(left + 24, eaveY + 13, left + 24, 370, "sketch-structure");
  line(right - 24, eaveY + 13, right - 24, 370, "sketch-structure");
  rect(left - 20, 370, 76, 18, "sketch-hatched");
  rect(right - 56, 370, 76, 18, "sketch-hatched");
  line(left - 30, 390, right + 30, 390, "sketch-ground");

  callout("1", "Sparren", 175, 195, 95);
  callout("2", "Firstpfette", center + 20, ridgeY - 2, 132);
  callout("3", "Mittelpfette", 365, 172, 169);
  callout("4", "Kehlbalken", 370, 180, 206);
  callout("5", "Fußpfette / Auflager", right - 2, eaveY + 4, 243);
  callout("6", "Stütze / Wandauflager", right - 24, 325, 280);
  dimension(left, 426, right, 426, `Spannweite ${formatDimension(dimensions.width, true)}${dimensions.isExample.width ? " (B)" : ""}`);
  dimension(66, ridgeY, 66, 390, `Firsthöhe ${formatDimension(dimensions.height, true)}${dimensions.isExample.height ? " (B)" : ""}`, true);
  label(518, 435, `Gebäudetiefe ${formatDimension(dimensions.depth, true)}${dimensions.isExample.depth ? " (B)" : ""}`, "sketch-dimension-text");
  const pitch = dimensions.pitch;
  label(left + 39, 234, `α ${pitch}°${dimensions.isExample.pitch ? " (B)" : ""}`, "sketch-dimension-text");
  line(left + 15, eaveY - 3, left + 70, eaveY - 3, "sketch-angle");
  line(left + 15, eaveY - 3, left + 55, eaveY - 45, "sketch-angle");
}

function drawKitchenSketch(builder, dimensions) {
  const { add, line, rect, label, dimension } = builder;
  label(55, 34, "KÜCHENZEILE · FRONTANSICHT", "sketch-kicker");
  label(505, 34, "SCHNITT · SCHEMA", "sketch-kicker");
  const left = 65;
  const right = 430;
  const floor = 345;
  const scale = (floor - 85) / dimensions.height;
  const counterY = floor - 91 * scale;
  const upperBottom = counterY - 55 * scale;
  const upperTop = upperBottom - 72 * scale;
  const baseWidth = right - left;
  const moduleCount = Math.max(2, Math.min(6, Math.round(dimensions.width / 60)));
  const moduleWidth = baseWidth / moduleCount;
  line(left - 12, floor, right + 10, floor, "sketch-ground");
  rect(left, counterY + 4, baseWidth, floor - counterY - 4, "sketch-fill");
  rect(left, floor - 16, baseWidth, 16, "sketch-timber");
  rect(left - 5, counterY - 5, baseWidth + 10, 9, "sketch-kitchen-counter");
  for (let index = 0; index < moduleCount; index += 1) {
    const x = left + index * moduleWidth;
    line(x, counterY + 8, x, floor - 16, "sketch-structure");
    line(x + 7, counterY + 35, x + moduleWidth - 7, counterY + 35, "sketch-muted-line");
    line(x + 7, counterY + 63, x + moduleWidth - 7, counterY + 63, "sketch-muted-line");
    add("circle", { cx: x + moduleWidth / 2, cy: counterY + 49, r: 2.5, class: "sketch-hardware" });
  }
  const sinkX = left + moduleWidth * 0.6;
  add("path", { d: `M${sinkX} ${counterY - 4} v11 q0 18 20 18 q20 0 20 -18 v-11`, class: "sketch-plumbing" });
  add("path", { d: `M${sinkX + 29} ${counterY - 7} v-15 q0 -10 11 -10 h8`, class: "sketch-plumbing" });
  const hobX = left + moduleWidth * Math.min(2.5, moduleCount - 1);
  rect(hobX, counterY - 7, moduleWidth * 0.85, 4, "sketch-hob");
  [0.22, 0.7].forEach((fraction) => {
    add("circle", { cx: hobX + moduleWidth * fraction, cy: counterY - 11, r: 8, class: "sketch-hob-ring" });
    add("circle", { cx: hobX + moduleWidth * fraction, cy: counterY - 11, r: 3, class: "sketch-hob-ring" });
  });
  const upperWidth = moduleCount * moduleWidth * 0.8;
  const upperLeft = left + (baseWidth - upperWidth) / 2;
  rect(upperLeft, upperTop, upperWidth, upperBottom - upperTop, "sketch-upper-cabinet");
  for (let index = 1; index < 3; index += 1) {
    const x = upperLeft + upperWidth * index / 3;
    line(x, upperTop, x, upperBottom, "sketch-structure");
    add("circle", { cx: x - upperWidth / 30, cy: (upperTop + upperBottom) / 2, r: 2, class: "sketch-hardware" });
  }
  label(left, 74, "Oberschränke", "sketch-part-label");
  label(left, upperBottom + 20, `Nische ca. ${formatDimension((upperBottom - counterY) / scale)}`, "sketch-dimension-text");
  label(left, floor + 23, "Sockel", "sketch-dimension-text");
  dimension(left, 405, right, 405, `Gesamtbreite ${formatDimension(dimensions.width)}`);
  dimension(38, counterY, 38, floor, "OKFF 91 cm", true);

  const sectionX = 530;
  const sectionRight = 735;
  const sectionFloor = 345;
  const sectionScale = (sectionFloor - 85) / dimensions.height;
  const sectionCounter = sectionFloor - 91 * sectionScale;
  const sectionCabinetDepth = dimensions.depth * sectionScale * 0.42;
  line(sectionX - 12, sectionFloor, sectionRight, sectionFloor, "sketch-ground");
  rect(sectionX + 35, sectionCounter + 5, sectionCabinetDepth, sectionFloor - sectionCounter - 21, "sketch-fill");
  rect(sectionX + 28, sectionCounter - 5, sectionCabinetDepth + 14, 9, "sketch-kitchen-counter");
  rect(sectionX + 35, sectionCounter - 16, sectionCabinetDepth, 11, "sketch-timber");
  const sectionTop = sectionCounter - 55 * sectionScale - 72 * sectionScale;
  rect(sectionX + 35, sectionTop, sectionCabinetDepth * 0.86, 72 * sectionScale, "sketch-upper-cabinet");
  line(sectionX + 35, sectionTop + 36 * sectionScale, sectionX + 35 + sectionCabinetDepth * 0.86, sectionTop + 36 * sectionScale, "sketch-structure");
  label(sectionX, 74, `Tiefe ${formatDimension(dimensions.depth)}`, "sketch-dimension-text");
  label(sectionX + 52, sectionCounter - 25, "Arbeitsplatte", "sketch-part-label");
  label(sectionX + 52, sectionCounter - 55 * sectionScale - 6, "Oberschrank", "sketch-part-label");
  dimension(sectionRight - 10, sectionFloor, sectionRight - 10, sectionCounter, "91 cm", true);
  dimension(sectionRight - 33, sectionCounter, sectionRight - 33, sectionTop + 72 * sectionScale, "Nische 55 cm", true);
  label(55, 450, "Rastermaß 60 cm · individuelle Geräte-, Anschluss- und Korpusmaße vor Ort prüfen", "sketch-dimension-text");
}

function drawElectricalSketch(builder) {
  const { add, line, rect, label } = builder;
  label(48, 34, "FUNKTIONSPLAN · SYMBOLSCHEMA (NICHT AUSFÜHRUNGSREIF)", "sketch-kicker");
  const yLive = 118;
  const yNeutral = 210;
  const yEarth = 282;
  line(75, yLive, 165, yLive, "sketch-wire-live");
  line(75, yNeutral, 650, yNeutral, "sketch-wire-neutral");
  line(75, yEarth, 650, yEarth, "sketch-wire-earth");
  line(75, yEarth, 650, yEarth, "sketch-wire-earth-yellow");
  label(40, yLive + 4, "L", "sketch-wire-label");
  label(40, yNeutral + 4, "N", "sketch-wire-label");
  label(40, yEarth + 4, "PE", "sketch-wire-label");

  rect(165, 93, 58, 50, "sketch-electrical-device");
  label(174, 88, "LS / RCD", "sketch-part-label");
  line(177, 118, 190, 118, "sketch-electrical-symbol");
  add("path", { d: "M190 118 l18 -14", class: "sketch-electrical-symbol" });
  line(208, 118, 223, 118, "sketch-electrical-symbol");
  line(223, yLive, 308, yLive, "sketch-wire-live");
  add("circle", { cx: 328, cy: yLive, r: 3, class: "sketch-electrical-node" });
  line(308, yLive, 328, yLive, "sketch-wire-live");
  add("path", { d: `M328 ${yLive} v20 m0 0 l37 -20`, class: "sketch-electrical-symbol" });
  line(365, yLive, 420, yLive, "sketch-wire-live");
  add("circle", { cx: 447, cy: yLive, r: 22, class: "sketch-lamp-symbol" });
  add("path", { d: "M432 103 l30 30 M462 103 l-30 30", class: "sketch-electrical-symbol" });
  line(469, yLive, 515, yLive, "sketch-wire-live");
  line(515, yLive, 515, yNeutral, "sketch-wire-neutral");
  label(301, 169, "Ausschalter", "sketch-part-label");
  label(430, 169, "Leuchte", "sketch-part-label");
  label(156, 171, "Schutzorgan", "sketch-part-label");

  line(223, yLive, 223, 327, "sketch-wire-live");
  line(223, 327, 285, 327, "sketch-wire-live");
  add("circle", { cx: 306, cy: 327, r: 20, class: "sketch-socket-symbol" });
  line(297, 320, 297, 334, "sketch-electrical-symbol");
  line(315, 320, 315, 334, "sketch-electrical-symbol");
  line(326, 327, 390, 327, "sketch-wire-earth");
  line(326, 327, 390, 327, "sketch-wire-earth-yellow");
  label(274, 370, "Steckdose · schematisch", "sketch-part-label");
  label(80, 390, "Aderkennzeichnung: L = braun/schwarz · N = blau · PE = grün-gelb", "sketch-dimension-text");
  label(80, 418, "Symbolik orientiert an DIN EN 60617; Ausführung/Zuordnung nur durch Elektrofachkraft prüfen.", "sketch-dimension-text");
}

function drawVehicleSketch(builder, dimensions, task) {
  const { add, line, rect, label } = builder;
  if (task === "oil") {
    label(46, 34, "MOTORSCHMIERUNG · SCHEMATISCHE BAUTEILÜBERSICHT", "sketch-kicker");
    rect(145, 180, 300, 112, "sketch-fill");
    rect(175, 285, 240, 45, "sketch-caliper");
    add("path", { d: "M225 292 q70 45 140 0", class: "sketch-brake-disc" });
    add("rect", { x: 460, y: 192, width: 54, height: 112, rx: 12, class: "sketch-upper-cabinet" });
    line(487, 304, 487, 324, "sketch-wire-live");
    add("path", { d: "M470 216 h34 M470 229 h34 M470 242 h34 M470 255 h34", class: "sketch-electrical-symbol" });
    add("circle", { cx: 335, cy: 348, r: 17, class: "sketch-fastener" });
    line(335, 330, 335, 316, "sketch-leader");
    label(148, 160, "Motorblock (schematisch)", "sketch-part-label");
    label(184, 357, "Ölwanne", "sketch-part-label");
    label(529, 221, "Ölfilter", "sketch-part-label");
    label(362, 348, "Ablassschraube + Dichtung", "sketch-part-label");
    label(500, 293, "Bauteilvariante nach Motorcode", "sketch-dimension-text");
    label(50, 430, "Ölsorte, Füllmenge, Filter und Wechselverfahren immer nach Fahrzeughersteller bestimmen.", "sketch-dimension-text");
    return;
  }
  if (task === "engine") {
    label(46, 34, "MOTOR · SCHEMATISCHE ZÜND-/RIEMENTRIEB-ÜBERSICHT", "sketch-kicker");
    rect(140, 155, 335, 190, "sketch-fill");
    for (let index = 0; index < 4; index += 1) {
      const x = 200 + index * 65;
      add("path", { d: `M${x} 110 v48 l-12 14 h24 l-12 -14`, class: "sketch-kitchen-counter" });
      label(x, 94, `Z${index + 1}`, "sketch-dimension-text", { "text-anchor": "middle" });
      line(x, 174, x, 238, "sketch-structure");
    }
    add("ellipse", { cx: 310, cy: 253, rx: 94, ry: 58, class: "sketch-brake-disc" });
    add("ellipse", { cx: 310, cy: 253, rx: 66, ry: 38, class: "sketch-brake-disc-inner" });
    label(515, 174, "Zündkerzen", "sketch-part-label");
    label(515, 255, "Keilrippenriemen", "sketch-part-label");
    label(50, 430, "Zündfolge, Motorkennbuchstabe und Riemenführung fahrzeugspezifisch aus Unterlagen prüfen.", "sketch-dimension-text");
    return;
  }
  label(46, 34, "BREMSANLAGE · SCHEMATISCHE EXPLOSIONSANSICHT", "sketch-kicker");
  const cx = 270;
  const cy = 228;
  add("circle", { cx, cy, r: 103, class: "sketch-brake-disc" });
  add("circle", { cx, cy, r: 72, class: "sketch-brake-disc-inner" });
  add("circle", { cx, cy, r: 27, class: "sketch-brake-hub" });
  for (let index = 0; index < 8; index += 1) {
    const angle = index * Math.PI / 4;
    const x1 = cx + Math.cos(angle) * 78;
    const y1 = cy + Math.sin(angle) * 78;
    const x2 = cx + Math.cos(angle) * 95;
    const y2 = cy + Math.sin(angle) * 95;
    line(x1, y1, x2, y2, "sketch-disc-vent");
  }
  for (let index = 0; index < 5; index += 1) {
    const angle = index * Math.PI * 2 / 5;
    add("circle", { cx: cx + Math.cos(angle) * 42, cy: cy + Math.sin(angle) * 42, r: 5, class: "sketch-fastener" });
  }
  rect(368, 174, 62, 108, "sketch-caliper");
  rect(352, 185, 10, 86, "sketch-brake-pad");
  rect(438, 185, 10, 86, "sketch-brake-pad");
  line(398, 164, 486, 113, "sketch-leader");
  label(494, 112, "Bremssattel", "sketch-part-label");
  line(356, 191, 494, 163, "sketch-leader");
  label(501, 165, "Bremsbeläge", "sketch-part-label");
  line(cx + 5, cy - 100, 464, 279, "sketch-leader");
  label(472, 284, "innenbelüftete Scheibe", "sketch-part-label");
  label(493, 313, "Belüftungskanäle", "sketch-dimension-text");
  label(493, 354, "Nabe / Befestigung", "sketch-dimension-text");
  label(493, 380, "Rotorgröße fahrzeugspezifisch", "sketch-dimension-text");
  label(50, 430, "Explosionsschema nicht maßstäblich · Teilenummer und Drehmoment ausschließlich nach Fahrzeughersteller.", "sketch-dimension-text");
}

function drawBathSketch(builder, dimensions) {
  const { add, line, rect, label, dimension } = builder;
  label(65, 34, "BAD · WASCHTISCH- UND DUSCHZONE", "sketch-kicker");
  const floor = 365;
  line(70, floor, 730, floor, "sketch-ground");
  rect(105, 145, 255, 180, "sketch-fill");
  rect(115, 300, 235, 25, "sketch-timber");
  add("ellipse", { cx: 230, cy: 245, rx: 70, ry: 22, class: "sketch-plumbing" });
  add("path", { d: "M230 210 v-22 q0 -18 20 -18 h8", class: "sketch-plumbing" });
  rect(455, 115, 220, 240, "sketch-shower");
  line(455, 115, 675, 115, "sketch-structure");
  line(565, 115, 565, 355, "sketch-structure");
  add("path", { d: "M485 305 l160 0 M490 310 l20 12 M520 310 l20 12 M550 310 l20 12 M580 310 l20 12 M610 310 l20 12", class: "sketch-plumbing" });
  add("circle", { cx: 630, cy: 160, r: 22, class: "sketch-shower" });
  label(145, 130, "Waschtisch + Armatur", "sketch-part-label");
  label(488, 96, "Duschabtrennung", "sketch-part-label");
  label(480, 345, "Ablauf / Gefälle fachlich planen", "sketch-dimension-text");
  dimension(105, 405, 675, 405, `Breite ${formatDimension(dimensions.width)}`);
  label(80, 438, "Abdichtung und Anschlüsse nach Systemvorgabe; keine Ausführungsplanung.", "sketch-dimension-text");
}

function drawCarportSketch(builder, dimensions) {
  const { line, rect, label, dimension } = builder;
  label(52, 34, "CARPORT · SEITENANSICHT MIT ENTWÄSSERUNGSGEFÄLLE", "sketch-kicker");
  const left = 120;
  const right = 670;
  const high = 132;
  const low = 151;
  const ground = 358;
  line(left - 30, ground, right + 26, ground, "sketch-ground");
  line(left, high, right, low, "sketch-rafter");
  line(left, high + 12, right, low + 12, "sketch-structure");
  rect(left + 15, high + 12, 17, ground - high - 12, "sketch-timber");
  rect(right - 32, low + 12, 17, ground - low - 12, "sketch-timber");
  line(left + 24, high + 45, left + 85, high + 45, "sketch-timber-line");
  line(right - 24, low + 45, right - 85, low + 45, "sketch-timber-line");
  line(left + 40, high - 18, right - 15, low - 18, "sketch-angle", { "marker-end": "url(#sketch-arrow)" });
  label(310, 105, "Gefälle / Entwässerung", "sketch-dimension-text");
  label(left - 10, 387, "hohe Seite", "sketch-dimension-text");
  label(right - 68, 387, "tiefe Seite / Rinne", "sketch-dimension-text");
  dimension(left, 420, right, 420, `Länge ${formatDimension(dimensions.depth)}`);
  dimension(75, high, 75, ground, `Höhe ${formatDimension(dimensions.height)}`, true);
  label(125, 449, `Breite ${formatDimension(dimensions.width)} · Gefälle projektbezogen für Dachdeckung/Entwässerung festlegen`, "sketch-dimension-text");
}

function drawGeneralSketch(builder, type, dimensions) {
  const { add, line, rect, polygon, label, callout, dimension } = builder;
  const largest = Math.max(dimensions.width, dimensions.height);
  const w = Math.max(150, 330 * dimensions.width / largest);
  const h = Math.max(100, 230 * dimensions.height / largest);
  const x = 95 + (330 - w) / 2;
  const y = 105 + (230 - h);
  label(x, 50, "SCHEMATISCHE ANSICHT", "sketch-kicker");
  const anchors = [];

  if (type.id === "wardrobe") {
    rect(x + 32, y + 15, w - 64, h - 20, "sketch-fill");
    const modules = Math.max(2, Math.min(5, Math.round(dimensions.width / 60)));
    for (let index = 1; index < modules; index += 1) {
      const moduleX = x + 32 + (w - 64) * index / modules;
      line(moduleX, y + 15, moduleX, y + h - 5, "sketch-structure");
    }
    line(x + 40, y + h * 0.57, x + w - 40, y + h * 0.57, "sketch-timber-line");
    line(x + 40, y + h * 0.31, x + w - 40, y + h * 0.31, "sketch-muted-line");
    anchors.push([x + 50, y + 30], [x + w * 0.45, y + h * 0.56], [x + w * 0.7, y + h * 0.31], [x + w - 45, y + h - 20]);
  } else if (type.id === "table") {
    rect(x + 15, y + 42, w - 30, 32, "sketch-timber");
    rect(x + 42, y + 74, 28, h - 74, "sketch-timber");
    rect(x + w - 70, y + 74, 28, h - 74, "sketch-timber");
    line(x + 70, y + 155, x + w - 70, y + 155, "sketch-structure");
    anchors.push([x + 180, y + 55], [x + 180, y + 155], [x + 55, y + 180], [x + w - 55, y + 90]);
  } else if (type.id === "shelf" || type.id === "cabinet") {
    rect(x + 38, y + 10, w - 76, h - 10, "sketch-hatched");
    line(x + 45, y + 15, x + 45, y + h - 4);
    line(x + w - 45, y + 15, x + w - 45, y + h - 4);
    [0.32, 0.58, 0.8].forEach((fraction) => line(x + 45, y + h * fraction, x + w - 45, y + h * fraction, "sketch-timber-line"));
    if (type.id === "cabinet") {
      line(x + w / 2, y + 12, x + w / 2, y + h - 12, "sketch-structure");
      add("circle", { cx: x + w / 2 - 10, cy: y + h * 0.45, r: 3, class: "sketch-hardware" });
      add("circle", { cx: x + w / 2 + 10, cy: y + h * 0.45, r: 3, class: "sketch-hardware" });
    }
    anchors.push([x + 80, y + 30], [x + 150, y + h * 0.58], [x + w / 2, y + 120], [x + w - 48, y + h - 18]);
  } else if (type.id === "chair") {
    rect(x + 75, y + 120, 190, 24, "sketch-timber");
    rect(x + 82, y + 144, 22, 92, "sketch-timber");
    rect(x + 235, y + 144, 22, 92, "sketch-timber");
    rect(x + 245, y + 24, 24, 96, "sketch-timber");
    line(x + 102, y + 178, x + 235, y + 178, "sketch-structure");
    anchors.push([x + 165, y + 130], [x + 94, y + 205], [x + 256, y + 55], [x + 170, y + 178]);
  } else if (type.id === "wall") {
    rect(x + 20, y + 25, w - 40, h - 35, "sketch-hatched");
    [0.2, 0.4, 0.6, 0.8].forEach((fraction) => line(x + w * fraction, y + 25, x + w * fraction, y + h - 10, "sketch-structure"));
    line(x + 20, y + h * 0.55, x + w - 20, y + h * 0.55, "sketch-structure");
    anchors.push([x + 20, y + 105], [x + 140, y + 150], [x + 230, y + 215], [x + w - 25, y + 245]);
  } else if (type.id === "stairs") {
    const risers = Math.max(2, dimensions.stepCount ?? 16);
    const treads = risers - 1;
    const run = 224 / treads;
    const rise = (h - 38) / risers;
    const startX = x + 28;
    const baseY = y + h - 14;
    const points = [`${startX},${baseY}`];
    for (let index = 0; index < treads; index += 1) {
      const stepX = startX + run * (index + 1);
      const stepY = baseY - rise * index;
      points.push(`${stepX},${stepY}`, `${stepX},${stepY - rise}`);
    }
    points.push(`${startX + 224},${baseY - rise * risers}`);
    add("polyline", { points: points.join(" "), class: "sketch-stair" });
    line(startX - 6, baseY + 4, startX + 230, baseY - rise * risers + 8, "sketch-rafter");
    const railPoints = [];
    for (let index = 0; index < treads; index += 1) {
      const px = startX + run * (index + 0.55);
      const py = baseY - rise * (index + 0.45);
      line(px, py, px, py - 37, "sketch-structure");
      railPoints.push(`${px},${py - 37}`);
    }
    line(startX + 8, baseY - 35, startX + 230, baseY - rise * risers - 28, "sketch-timber-line");
    dimension(startX + 224, baseY, startX + 224, baseY - rise * risers, `Geschosshöhe ${formatDimension(dimensions.height)}`, true);
    dimension(startX, 421, startX + 224, 421, `Lauflänge ${formatDimension(dimensions.stairLength)}`);
    label(startX + 22, baseY - 48, `s ${formatDimension(dimensions.riserHeight)} · a ${formatDimension(dimensions.treadDepth)}`, "sketch-dimension-text");
    anchors.push([startX + 85, baseY - rise * 4], [startX + 110, baseY - rise * 6], [startX + 168, baseY - rise * 11], [startX + 42, baseY - rise * 2]);
  } else if (type.id === "carport") {
    polygon(`${x + 20},${y + 65} ${x + w - 12},${y + 38} ${x + w - 2},${y + 58} ${x + 25},${y + 88}`, "sketch-roof-fill");
    line(x + 68, y + 83, x + 68, y + h, "sketch-structure");
    line(x + w - 52, y + 59, x + w - 52, y + h, "sketch-structure");
    line(x + 45, y + 170, x + w - 30, y + 170, "sketch-timber-line");
    rect(x + 45, y + h, 65, 15, "sketch-hatched");
    rect(x + w - 84, y + h, 65, 15, "sketch-hatched");
    anchors.push([x + 180, y + 57], [x + 180, y + 165], [x + 72, y + 175], [x + w - 50, y + h + 5]);
  } else if (type.id === "bed") {
    rect(x + 40, y + 25, w - 80, h - 45, "sketch-fill");
    rect(x + 40, y + 25, w - 80, 24, "sketch-timber");
    line(x + w / 2, y + 50, x + w / 2, y + h - 20, "sketch-timber-line");
    [0.35, 0.48, 0.61, 0.74, 0.87].forEach((fraction) => line(x + 48, y + h * fraction, x + w - 48, y + h * fraction, "sketch-structure"));
    anchors.push([x + 65, y + 38], [x + w / 2, y + h * 0.55], [x + w / 2, y + h * 0.72], [x + w - 52, y + h - 25]);
  } else if (type.id === "gardenhouse") {
    polygon(`${x + 25},${y + 92} ${x + w / 2},${y + 20} ${x + w - 25},${y + 92} ${x + w - 25},${y + h - 5} ${x + 25},${y + h - 5}`, "sketch-roof-fill");
    rect(x + 45, y + 95, w - 90, h - 105, "sketch-hatched");
    rect(x + w / 2 - 27, y + h - 102, 54, 97, "sketch-timber");
    line(x + w / 2, y + 20, x + w / 2, y + 91, "sketch-rafter-secondary");
    anchors.push(
      [x + w / 2, y + 55],
      [x + 65, y + 135],
      [x + w - 55, y + h - 35],
      [x + w / 2, y + h - 55],
      [x + 70, y + h - 5],
    );
  } else if (type.id === "fence") {
    const left = x + 35;
    const right = x + w - 35;
    line(left, y + 45, right, y + 45, "sketch-timber-line");
    line(left, y + h - 45, right, y + h - 45, "sketch-timber-line");
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach((fraction) => {
      const postX = left + fraction * (right - left);
      rect(postX - 5, y + 25, 10, h - 50, "sketch-timber");
    });
    for (let index = 1; index < 12; index += 1) {
      const slatX = left + index * ((right - left) / 12);
      line(slatX, y + 50, slatX, y + h - 50, "sketch-structure");
    }
    anchors.push([x + w / 2, y + 80], [x + w / 2, y + h - 45], [left, y + h / 2], [right, y + h - 25]);
  } else if (type.id === "beam") {
    rect(x + 45, y + 95, w - 90, 58, "sketch-hatched");
    rect(x + 68, y + 153, 42, 63, "sketch-timber");
    rect(x + w - 110, y + 153, 42, 63, "sketch-timber");
    line(x + 68, y + 216, x + w - 68, y + 216, "sketch-muted-line");
    anchors.push([x + w / 2, y + 120], [x + 88, y + 180], [x + w - 88, y + 180], [x + w / 2, y + 215]);
  } else {
    const left = x + 68;
    const right = x + w - 78;
    const top = y + 38;
    const bottom = y + h - 55;
    const offset = Math.max(22, Math.min(45, w * 0.14));
    polygon(`${left},${bottom} ${right},${bottom} ${right + offset},${bottom - 20} ${left + offset},${bottom - 20}`, "sketch-hatched");
    line(left, top, right, top, "sketch-structure");
    line(left, top, left, bottom, "sketch-structure");
    line(right, top, right, bottom, "sketch-structure");
    line(left, top, left + offset, top - 20, "sketch-structure");
    line(right, top, right + offset, top - 20, "sketch-structure");
    line(left + offset, top - 20, right + offset, top - 20, "sketch-structure");
    line(left + offset, top - 20, left + offset, bottom - 20, "sketch-structure");
    line(right + offset, top - 20, right + offset, bottom - 20, "sketch-structure");
    line(left, bottom - 20, right, top + 15, "sketch-timber-line");
    line(left + offset, bottom - 38, right + offset, top - 2, "sketch-muted-line");
    anchors.push([left + offset / 2, top], [right, top + 35], [left + offset, bottom - 40], [right + offset, bottom - 35]);
  }

  type.components.forEach((part, index) => {
    const anchor = anchors[index] ?? anchors[anchors.length - 1];
    const calloutY = 115 + index * 48;
    callout(String(index + 1), part, anchor[0], anchor[1], calloutY);
  });
  if (type.id !== "stairs") {
    dimension(x + 35, 405, x + w - 35, 405, `Breite ${formatDimension(dimensions.width)}${dimensions.isExample.width ? " (B)" : ""}`);
    dimension(65, y + 24, 65, y + h - 12, `Höhe ${formatDimension(dimensions.height)}${dimensions.isExample.height ? " (B)" : ""}`, true);
  }
  label(95, 450, type.id === "stairs"
    ? `Schrittmaß: 2 × ${formatDimension(dimensions.riserHeight)} + ${formatDimension(dimensions.treadDepth)} = ${formatDimension(2 * dimensions.riserHeight + dimensions.treadDepth)} · DIN-Orientierung 59–65 cm`
    : `Tiefe ${formatDimension(dimensions.depth)}${dimensions.isExample.depth ? " (B)" : ""} · schematisch nicht perspektivisch bemaßt`, "sketch-dimension-text");
}

function createSketch(type, dimensions, query) {
  const builder = createSvgBuilder(query, type);
  if (type.id === "kitchen") drawKitchenSketch(builder, dimensions);
  else if (type.id === "electrical") drawElectricalSketch(builder);
  else if (type.id === "vehicle") drawVehicleSketch(builder, dimensions, detectVehicleTask(query));
  else if (type.id === "bath") drawBathSketch(builder, dimensions);
  else if (type.id === "carport") drawCarportSketch(builder, dimensions);
  else if (type.id === "generic") {
    builder.label(400, 180, "Noch kein spezifischer Objekttyp erkannt", "sketch-kicker", { "text-anchor": "middle" });
    builder.label(400, 220, "Beschreibe das konkrete Bauteil oder Gewerk genauer.", "sketch-part-label", { "text-anchor": "middle" });
    builder.label(400, 260, "Beispiele: Küchenzeile · Schaltplan · Bremsscheibe · Treppe", "sketch-dimension-text", { "text-anchor": "middle" });
  }
  else if (type.id === "roof") drawRoofSketch(builder, dimensions);
  else drawGeneralSketch(builder, type, dimensions);
  return builder.svg;
}

function dimensionLine(key, labelText, dimension, defaultValue) {
  const value = dimension[key] ?? defaultValue;
  const isExample = dimension[key] === undefined;
  dimension[key] = value;
  dimension.isExample[key] = isExample;
  return `${labelText}: ${isExample ? "ca. " : ""}${formatDimension(value, dimension.roof)}${isExample ? " (Beispiel)" : ""}`;
}

function materialGuidance(type, dimensions) {
  const guidance = {
    roof: [
      "KVH/BSH · Sparren beispielhaft 8 × 18 cm; statisch nachweisen",
      "BSH · Firstpfette; Querschnitt statisch bemessen",
      "KVH/BSH · Mittelpfetten; Querschnitt statisch bemessen",
      "KVH · Kehlbalken; Anschlüsse nachweisen",
      "KVH/BSH · Fußpfetten; Auflager und Feuchteschutz planen",
      "Holzstützen/Wandauflager · Lastabtragung und Verbindungen nachweisen",
    ],
    carport: [
      "Dachdeckung passend zum System · Entwässerungsgefälle projektbezogen planen",
      "BSH/KVH · Querschnitt nach Spannweite und Last bemessen",
      "BSH/KVH · Pfosten beispielhaft 12 × 12 cm; Statik prüfen",
      "Betonfundamente und zugelassene Pfostenträger; Bemessung erforderlich",
    ],
    stairs: [
      "Massivholz · Auftritt als Rechenrichtwert",
      "Holz/Plattenwerkstoff · Setzstufen passend zur berechneten Steigung",
      "Konstruktionsholz · Wangenquerschnitt statisch und geometrisch bemessen",
      "Holz/Metall · Handlauf und Geländer nach Nutzung und Bauanforderung",
    ],
    table: [
      "Massivholz/Plattenwerkstoff · Platte ca. 2,5–4 cm",
      "Massivholz · Zargen passend zu Plattenstärke und Spannweite",
      "Massivholz · Beine beispielhaft ca. 6 × 6 cm",
      "Schrauben/Dübel/Beschläge passend zu Holzart und Verbindung",
    ],
    shelf: [
      "Massivholz/Plattenwerkstoff · Seitenteile nach Höhe und Nutzlast",
      "Plattenwerkstoff · Böden beispielhaft 18–25 mm; Durchbiegung prüfen",
      "Plattenwerkstoff · Rückwand oder konstruktive Aussteifung",
      "Wandanker passend zu Wandbaustoff und Last",
    ],
    cabinet: [
      "Massivholz/Plattenwerkstoff · Korpusplatten passend zu Nutzung",
      "Plattenwerkstoff · Böden nach Spannweite und Nutzlast bemessen",
      "Massivholz/Plattenwerkstoff · Türen mit passenden Topfbändern",
      "Plattenwerkstoff · Rückwand konstruktiv befestigen",
    ],
    chair: [
      "Massivholz/Multiplex · Sitzfläche nach Belastung dimensionieren",
      "Massivholz · Beine und Verbindungen auf dynamische Last auslegen",
      "Massivholz/Multiplex · Rückenlehne sicher mit Rahmen verbinden",
      "Massivholz · Querstreben gegen seitliches Wackeln",
    ],
    wall: [
      "Beplankung nach Brandschutz-, Schall- und Feuchteanforderung auswählen",
      "Konstruktionsholz/Metallständer · Profil und Abstand projektbezogen",
      "Riegel passend zu Öffnungen und Lasten",
      "Befestigung passend zu Boden- und Deckenuntergrund",
    ],
    bed: [
      "Massivholz/Plattenwerkstoff · Seitenteile nach Bettmaß",
      "Massivholz · Kopf- und Fußteil konstruktiv verbinden",
      "Konstruktionsholz · Mittelträger mit ausreichender Stützung",
      "Massivholz · Auflageleisten gleichmäßig befestigen",
    ],
    gardenhouse: [
      "Holzschalung / Plattenwerkstoff · Witterungsschutz berücksichtigen",
      "KVH · Pfosten und Wandrahmen statisch nachweisen",
      "KVH/BSH · Dachtragwerk und Dachdeckung projektspezifisch",
      "Holz / Beschläge · Türöffnung konstruktiv aussteifen",
      "Fundament entsprechend Boden und Lasten planen",
    ],
    fence: [
      "Witterungsbeständiges Holz / Metall · Füllung mit sicheren Kanten",
      "KVH · Querholme nach Feldbreite bemessen",
      "KVH/Metall · Pfosten nach Höhe und Windbeanspruchung",
      "Beton / zugelassene Pfostenträger · Untergrund prüfen",
    ],
    beam: [
      "KVH/BSH · Querschnitt und Holzsortierung statisch bemessen",
      "Auflager passend zu Last, Untergrund und Anschluss",
      "Auflager passend zu Last, Untergrund und Anschluss",
      "Zugelassene Verbindungsmittel · Randabstände und Herstellerangaben beachten",
    ],
  };
  const materials = guidance[type.id];
  if (type.id === "kitchen") {
    return [
      "Sockelblende und Unterschränke · nivellierbare Füße passend zum Möbelsystem",
      "Arbeitsplatte · OKFF ca. 91 cm als Ergonomie-Richtwert, tatsächliche Arbeitshöhe anpassen",
      "Spüle und Armatur · Ausschnitt, Wasseranschluss und Abdichtung herstellerabhängig",
      "Kochfeld · Geräteabstände, Ausschnitt und Anschlussdaten des Herstellers beachten",
      "Oberschränke · beispielhafte Nische ca. 55 cm; Wandtragfähigkeit und Befestigung prüfen",
    ];
  }
  if (type.id === "electrical") {
    return [
      "Leitungsschutzschalter (LS) / FI-RCD · Auslegung durch Elektrofachkraft",
      "Schalter- und Leuchtenanschluss · nur Funktionssymbolik",
      "Leuchte · Anschlusswerte und Schutzart projektspezifisch",
      "Steckdose · Stromkreis/Schutzmaßnahmen fachlich prüfen",
      "Leiterfarben: L braun/schwarz · N blau · PE grün-gelb (Bestandsanlage prüfen)",
    ];
  }
  if (type.id === "vehicle") {
    return [
      "Bremsscheibe · Abmessung und Teilenummer fahrzeugabhängig",
      "Bremsbeläge · Achse, Belagform und Verschleißsensor prüfen",
      "Bremssattel · Bauart und Rückstellverfahren herstellerabhängig",
      "Radnabe / Befestigung · Anzugsmoment ausschließlich aus Fahrzeugdaten",
    ];
  }
  if (type.id === "stairs") {
    return [
      `Massivholz · Auftritt ca. ${formatDimension(dimensions.treadDepth)} als Rechenrichtwert`,
      `Holz/Plattenwerkstoff · Setzstufen passend zur Steigung ${formatDimension(dimensions.riserHeight)}`,
      ...materials.slice(2),
    ];
  }
  return materials ?? type.components.map(() => (
    "Material und Dimensionierung passend zu Nutzung und Belastung fachlich festlegen"
  ));
}

function toolGuidance(type) {
  const recommendations = {
    kitchen: ["Bandmaß / Laser", "Wasserwaage", "Montagewerkzeug passend zum System", "Leitungsdetektor vor Bohrungen", "Persönliche Schutzausrüstung"],
    bath: ["Bandmaß", "Wasserwaage", "Hersteller-Montagewerkzeug", "Abdichtungssystem nach Vorgabe", "Schutzbrille und Handschuhe"],
    wardrobe: ["Bandmaß / Laser", "Wasserwaage", "Schrauber", "Wanddetektor", "Wandbaustoffgeeignete Befestigung"],
    electrical: ["Herstellerunterlagen", "Fachgerechte Messausrüstung (Elektrofachkraft)", "Keine Arbeiten an aktiven Anlagen"],
    vehicle: ["Fahrzeug-spezifische Reparaturunterlagen", "Drehmomentschlüssel mit passendem Messbereich", "Fahrzeuggeeignete Hebe- und Abstützausrüstung", "Schutzbrille und Handschuhe"],
    roof: ["Bandmaß und Winkel", "Kappsäge", "Bohrmaschine/Schrauber", "Gerüst und Absturzsicherung", "Persönliche Schutzausrüstung"],
    carport: ["Bandmaß und Schnurgerüst", "Wasserwaage / Laser", "Kappsäge", "Schrauber", "Gerüst und Absturzsicherung"],
    stairs: ["Bandmaß und Treppenwinkel", "Wasserwaage", "Kappsäge", "Schrauber", "Schutzbrille und Gehörschutz"],
    table: ["Bandmaß und Winkel", "Kappsäge oder Formatkreissäge", "Schleifgerät", "Schraubzwingen", "Schrauber"],
    shelf: ["Bandmaß und Winkel", "Säge", "Bohrmaschine/Schrauber", "Wasserwaage", "Wanddetektor für Befestigungspunkte"],
    cabinet: ["Bandmaß und Winkel", "Säge", "Bohrmaschine/Schrauber", "Schraubzwingen", "Beschlagbohrer"],
    chair: ["Bandmaß und Winkel", "Säge", "Schraubzwingen", "Schleifgerät", "Schrauber"],
    wall: ["Leitungsdetektor", "Bandmaß und Wasserwaage", "Blechschere oder Kappsäge passend zum System", "Schrauber", "Schutzbrille und Atemschutz nach Material"],
    bed: ["Bandmaß und Winkel", "Säge", "Bohrmaschine/Schrauber", "Schraubzwingen", "Schleifgerät"],
    gardenhouse: ["Bandmaß und Schnurgerüst", "Wasserwaage / Laser", "Kappsäge", "Schrauber", "Gerüst und Absturzsicherung"],
    fence: ["Bandmaß und Richtschnur", "Erdbohrer", "Wasserwaage", "Säge", "Schrauber"],
    beam: ["Bandmaß und Winkel", "Kappsäge", "Hebezeug passend zur Last", "Schutzbrille und Gehörschutz"],
  };
  return recommendations[type.id] ?? ["Bandmaß", "Wasserwaage", "Winkel", "passendes Montagewerkzeug", "Persönliche Schutzausrüstung"];
}

function renderBuildHelp(query) {
  const sketchType = detectSketchType(query);
  const repairRequest = detectRepairRequest(query) && !["electrical", "vehicle"].includes(sketchType?.id);
  if (!isBuildRequest(query) && selectedSearchType !== "build" && !repairRequest) {
    buildHelp.hidden = true;
    return;
  }

  const type = sketchType ?? sketchTypes.find((item) => item.id === "generic");
  const genericType = type.id === "generic";
  const vehicleTask = type.isVehicle ? detectVehicleTask(query) : null;
  const components = !type.isVehicle
    ? type.components
    : vehicleTask === "oil"
      ? ["Motor / Ölwanne", "Ölfilter", "Ablassschraube mit Dichtung", "Ölspezifikation und Füllmenge"]
      : vehicleTask === "engine"
        ? ["Motorbauteil", "Zündkerzen / Zündanlage", "Keilrippenriemen / Spanner", "OBD-Diagnoseanschluss"]
        : type.components;
  document.querySelector("#build-title").textContent = type.isElectrical
    ? "Technischer Schaltplan"
    : type.isVehicle
      ? "KFZ-Bauteilansicht"
      : type.id === "kitchen"
        ? "Küchenzeile & CAD"
        : "Bauidee & Skizze";
  const parsed = parseDimensions(query);
  const dimensions = {
    ...parsed,
    isExample: {},
    roof: type.id === "roof",
  };
  const notes = [
    dimensionLine("width", type.id === "roof" ? "Spannweite" : "Breite", dimensions, type.defaults.width),
    dimensionLine("height", type.id === "roof" ? "Firsthöhe" : type.id === "stairs" ? "Geschosshöhe" : "Höhe", dimensions, type.defaults.height),
    dimensionLine("depth", type.id === "roof" ? "Gebäudetiefe" : "Tiefe", dimensions, type.defaults.depth),
  ];
  if (type.id === "stairs") {
    const requestedHeight = dimensions.height;
    const riserCount = dimensions.stepCount ?? Math.max(2, Math.round((parsed.height ?? requestedHeight) / 17.5));
    const calculatedRise = requestedHeight / riserCount;
    const rise = parsed.height === undefined && dimensions.riserHeight !== undefined
      ? dimensions.riserHeight
      : calculatedRise;
    const tread = dimensions.treadDepth ?? Math.max(0, 63 - 2 * rise);
    if (parsed.height === undefined) {
      dimensions.height = rise * riserCount;
      notes[1] = `Geschosshöhe: ${formatDimension(dimensions.height)}${dimensions.isExample.height ? " (Beispiel)" : ""}`;
    } else if (dimensions.riserHeight !== undefined && Math.abs(dimensions.riserHeight - calculatedRise) > 0.1) {
      notes.push(`Hinweis: angegebene Steigung ${formatDimension(dimensions.riserHeight)} weicht von der aus Geschosshöhe/Stufenzahl berechneten Steigung ab.`);
    }
    dimensions.stepCount = riserCount;
    dimensions.riserHeight = rise;
    dimensions.treadDepth = tread;
    dimensions.stairLength = tread * (riserCount - 1);
    if (parsed.depth === undefined) dimensions.depth = dimensions.stairLength;
    notes[2] = `Lauflänge: ${formatDimension(dimensions.stairLength)} (${riserCount - 1} Auftritte)`;
    notes.push(`Treppenrichtwert: ${riserCount} Steigungen à ${formatDimension(rise)} · Auftritt ${formatDimension(tread)} · Schrittmaß 2s + a = ${formatDimension(2 * rise + tread)}${2 * rise + tread < 59 || 2 * rise + tread > 65 ? " (außerhalb des üblichen Orientierungsbereichs 59–65 cm)" : ""}`);
  }
  if (type.id === "kitchen") {
    notes.push("Korpus-Raster: 60 cm (Entwurfsannahme) · Arbeitshöhe OKFF: ca. 91 cm · Nische: ca. 55 cm");
  }
  if (type.id === "roof" && dimensions.rafterSpacing === undefined) {
    dimensions.rafterSpacing = 70;
    dimensions.isExample.rafterSpacing = true;
    notes.push("Sparrenabstand: ca. 70 cm (Richtwert)");
  } else if (dimensions.rafterSpacing !== undefined) {
    notes.push(`Sparrenabstand: ${formatDimension(dimensions.rafterSpacing)}`);
  }
  if (type.id === "table" && dimensions.panelThickness === undefined) {
    dimensions.panelThickness = 3;
    dimensions.isExample.panelThickness = true;
    notes.push("Plattenstärke: ca. 3 cm (Richtwert)");
  } else if (type.id === "table" && dimensions.panelThickness !== undefined) {
    notes.push(`Plattenstärke: ${formatDimension(dimensions.panelThickness)}`);
  }
  if (type.id === "roof") {
    const pitchIsExample = dimensions.pitch === undefined;
    let pitchDerived = false;
    if (pitchIsExample && (parsed.width || parsed.height)) {
      dimensions.pitch = Math.round(Math.atan(Math.max(1, dimensions.height - 250) / (dimensions.width / 2)) * 180 / Math.PI);
      dimensions.isExample.pitch = false;
      pitchDerived = true;
    } else {
      dimensions.pitch ??= type.defaults.pitch;
      dimensions.isExample.pitch = pitchIsExample;
    }
    const maxGeometricPitch = Math.atan(Math.max(0, dimensions.height - 50) / (dimensions.width / 2)) * 180 / Math.PI;
    const supportedPitch = Math.max(1, Math.min(80, maxGeometricPitch));
    let pitchLimited = false;
    if (dimensions.pitch > supportedPitch) {
      dimensions.pitch = supportedPitch;
      pitchLimited = true;
    }
    const pitchDescription = pitchDerived
      ? `ca. ${dimensions.pitch}° (aus den angegebenen Maßen abgeleitet)`
      : `${pitchIsExample ? "ca. " : ""}${dimensions.pitch}°${pitchIsExample ? " (Beispiel)" : ""}`;
    notes.push(`Dachneigung: ${pitchDescription}${pitchLimited ? ` · für die Firsthöhe auf ${dimensions.pitch.toFixed(1).replace(".", ",")}° begrenzt` : ""}`);
    notes.push("Holztragwerk nach DIN EN 1995-1-1/NA fachplanerisch nachweisen lassen");
  } else if (type.id === "carport") {
    notes.push("Dachgefälle und Entwässerung nach Dachsystem festlegen · Tragwerk nach DIN EN 1995-1-1/NA prüfen lassen");
  }
  const repairGuides = [
    {
      pattern: /\b(verputz\w*|putz\w*)\b/i,
      tools: ["Maurerkelle", "Glättkelle", "Rührwerk mit geeignetem Rührquirl", "Abdeckfolie", "Schutzbrille und Handschuhe"],
      safety: "Putzart und Untergrund müssen zusammenpassen. Staub vermeiden, gut lüften und Produkt-Sicherheitsdatenblatt beachten. Bei Schimmel, Schadstoffen, losen tragenden Schichten oder unbekanntem Altputz Arbeit unterbrechen und Fachberatung einholen.",
      steps: ["Untergrund auf Festigkeit, Sauberkeit, Feuchte und Verträglichkeit prüfen; lose Teile nur sicher entfernen.", "Flächen und angrenzende Bauteile schützen; Grundierung und Putzsystem nach Herstellerangaben wählen.", "Putz exakt nach Sackangabe anmischen und in geeigneter Schichtdicke auftragen.", "Oberfläche im vorgeschriebenen Zeitfenster bearbeiten und nach Herstellerangabe trocknen lassen."],
    },
    {
      pattern: /\b(spülkasten|toilette|wc|wasserhahn|armatur|wasserrohr|undicht|tropft)\b/i,
      tools: ["Taschenlampe", "Handschuhe", "passender Schraubendreher", "Tuch und Auffangbehälter"],
      safety: "Wasserzufuhr am Eckventil schließen, Druck ablassen und austretendes Wasser auffangen. Bei unklarer Absperrung, verdecktem Leck oder anhaltendem Wasseraustritt Installationsfachbetrieb rufen.",
      steps: ["Fehlerbild und betroffene Armatur lokalisieren; nichts unter Druck öffnen.", "Wasserzufuhr absperren und Dichtheit der Absperrung kontrollieren.", "Nur zugängliche, eindeutig identifizierte Verschleißteile nach Herstelleranleitung prüfen.", "Nach Arbeiten langsam öffnen und alle Verbindungen auf Dichtheit kontrollieren; bei Leck sofort wieder absperren."],
    },
    {
      pattern: /\b(lichtschalter|steckdose|sicherung|elektr\w*|strom|kabel)\b/i,
      tools: ["Zweipoliger Spannungsprüfer (nur durch unterwiesene Personen)", "isoliertes Werkzeug (nur Elektrofachkraft)", "Herstellerunterlagen"],
      safety: "Elektrische Arbeiten können lebensgefährlich sein. Stromkreis freischalten, gegen Wiedereinschalten sichern und Spannungsfreiheit fachgerecht feststellen lassen. Fest installierte elektrische Anlagen nur durch eine Elektrofachkraft bearbeiten lassen.",
      steps: ["Bei Klemmen, Wärme, Geruch oder Funken den Stromkreis nicht weiter benutzen und freischalten lassen.", "Keine Abdeckung öffnen und keine Leiter berühren, wenn Qualifikation oder Spannungsfreiheit unklar sind.", "Fehlerbild, betroffenen Stromkreis und vorhandene Kennzeichnungen notieren.", "Elektrofachkraft mit Prüfung und Reparatur beauftragen; nach der Reparatur Schutzfunktion prüfen lassen."],
    },
    {
      pattern: /.*/,
      tools: ["Herstellerunterlagen", "Taschenlampe", "passendes Handwerkzeug", "Schutzhandschuhe"],
      safety: "Vor Reparatur Energiequellen sicher trennen (Strom, Wasser, Gas oder Druck je nach Gerät). Bei Gasgeruch, Brandgefahr, unklarer Ursache oder tragenden Bauteilen Arbeit abbrechen und Fachbetrieb verständigen.",
      steps: ["Fehlerbild und Produkt-/Modellnummer erfassen; Herstellerhinweise und Garantiebedingungen prüfen.", "Anlage sichern und passende Energiezufuhr abstellen, bevor Abdeckungen oder Bauteile geöffnet werden.", "Nur eindeutig identifizierte und für Laien freigegebene Prüfschritte ausführen.", "Nach dem Eingriff Funktion und Dichtheit prüfen; bei Unsicherheit oder erneutem Fehler Fachbetrieb beauftragen."],
    },
  ];
  const repairGuide = repairRequest ? repairGuides.find((guide) => guide.pattern.test(query)) : null;
  buildSummary.textContent = repairGuide
    ? "Reparatur-Orientierung für die Suche. Die Schritte sind allgemeine Hinweise und keine Diagnose des konkreten Produkts."
    : genericType
      ? "Für diese Anfrage wurde noch kein konkreter Bauteiltyp erkannt. Es wird bewusst kein generisches Holzgestell oder Dummy-Modell angezeigt."
      : type.isVehicle
        ? `${vehicleTask === "oil" ? "Ölwechsel" : vehicleTask === "engine" ? "Motor-/Zündungsbauteile" : "Bremsanlage"} · schematische Darstellung; Fahrzeugdaten sind maßgeblich.`
        : `${type.title}. Maße sind illustrative Richtwerte und ersetzen keine Fachplanung.`;
  const electricalSafety = "5 Sicherheitsregeln (Elektrotechnik): 1. Freischalten. 2. Gegen Wiedereinschalten sichern. 3. Spannungsfreiheit allpolig feststellen. 4. Erden und kurzschließen. 5. Benachbarte, unter Spannung stehende Teile abdecken oder abschranken. Arbeiten an elektrischen Anlagen ausschließlich durch Elektrofachkräfte; dieses Funktionsschema ist kein Installationsplan.";
  const vehicleSafety = "Sicherheits- und Drehmoment-Hinweis: Bremsen und Fahrwerk sind sicherheitsrelevant. Fahrzeug nach Herstellervorgaben sichern und Reparaturen qualifiziert ausführen lassen. Immer fahrzeug-/verbindungsspezifische Hersteller-Anzugsmomente in Nm verwenden; es gibt keinen verlässlichen Universalwert. Drehmomentschlüssel verwenden.";
  const safetyMessage = repairGuide?.safety ?? (type.isElectrical
    ? electricalSafety
    : type.isVehicle
      ? vehicleSafety
      : type.isStructural
        ? "Tragende Bauteile, Verbindungen, Auflager, Lasten und Fundamente sind nicht statisch geprüft. Vor Ausführung projektbezogen durch qualifizierte Fachleute bemessen lassen."
        : "");
  buildSafety.hidden = !safetyMessage;
  buildSafety.textContent = safetyMessage;
  buildTools.replaceChildren();
  (repairGuide?.tools ?? toolGuidance(type)).forEach((tool) => {
    const item = document.createElement("li");
    item.textContent = tool;
    buildTools.append(item);
  });
  const materialNotes = type.isVehicle && vehicleTask === "oil"
    ? ["Motorcode, Ölspezifikation und Füllmenge aus Herstellerunterlagen", "Filtereinsatz und Dichtung passend zur Fahrzeug-Identnummer", "Schraube und Einwegdichtung nach Herstellervorgabe", "Ölstand nach Herstellerverfahren kontrollieren"]
    : type.isVehicle && vehicleTask === "engine"
      ? ["Motorkennbuchstabe und Bauraum anhand Fahrzeugdaten prüfen", "Zündkerzentyp und Elektrodenabstand fahrzeugspezifisch", "Riemenführung und Spannvorrichtung nach Herstellerschema", "Fehlercode mit fahrzeugspezifischer Diagnose interpretieren"]
      : materialGuidance(type, dimensions);
  buildMaterials.replaceChildren();
  components.forEach((part, index) => {
    const item = document.createElement("li");
    item.textContent = `${part} — ${materialNotes[index] ?? "Material/Querschnitt projektspezifisch festlegen"}`;
    buildMaterials.append(item);
  });
  sketchBadge.textContent = repairGuide
    ? "REPARATUR-ORIENTIERUNG · PRODUKTHANDBUCH BEACHTEN"
    : type.isElectrical
      ? "FUNKTIONSPLAN · DIN-/IEC-SCHEMA · NICHT AUSFÜHRUNGSREIF"
      : type.isVehicle
        ? "KFZ-SCHEMA · FAHRZEUGDATEN / HERSTELLERWERTE PRÜFEN"
        : type.id === "kitchen"
          ? "KÜCHENRASTER · RICHTMASSE VOR ORT PRÜFEN"
    : type.id === "stairs"
      ? "SCHRITTMASS-ORIENTIERUNG · DIN 18065"
      : type.id === "roof" || type.id === "carport"
        ? "HOLZBAU-RICHTMASS · DIN EN 1995-1-1 · STATIK PRÜFEN"
        : "RICHTMASS · NICHT STATISCH GEPRÜFT";
  document.querySelector(".cad-toolbar").hidden = Boolean(repairGuide) || type.isElectrical || genericType;
  document.querySelector("#viewer-shell").hidden = Boolean(repairGuide);
  document.querySelector(".sketch-caption").hidden = Boolean(repairGuide);
  document.querySelector("#three-viewport").hidden = Boolean(type.isElectrical) || genericType;
  sketchContainer.hidden = false;
  buildPartsTitle.textContent = repairGuide ? "Prüf- und Arbeitsschritte" : "Bauteile in der Skizze";
  buildMaterialsTitle.textContent = repairGuide ? "Werkzeugübersicht" : "Material- / Bauteilübersicht";
  buildMaterialsTitle.hidden = Boolean(repairGuide);
  buildMaterials.hidden = Boolean(repairGuide);
  buildToolsTitle.hidden = false;
  buildTools.hidden = false;
  buildPartsTitle.hidden = Boolean(repairGuide) || genericType;
  buildParts.hidden = Boolean(repairGuide) || genericType;
  buildMaterialsTitle.hidden = Boolean(repairGuide) || genericType;
  buildMaterials.hidden = Boolean(repairGuide) || genericType;
  buildToolsTitle.hidden = genericType;
  buildTools.hidden = genericType;
  buildStepsTitle.textContent = repairGuide ? "Sichere Prüfschritte" : genericType ? "Objekt genauer beschreiben" : type.isElectrical ? "Sicherheit & Normhinweis" : type.isVehicle ? "Fahrzeugbezogene Hinweise" : type.isStructural ? "Planungshinweise" : "Konstruktionshinweise";
  buildDimensionNote.textContent = repairGuide
    ? "Vor Arbeitsbeginn passende Energiezufuhr absperren; Hersteller- und Fachhinweise haben Vorrang."
    : genericType
      ? "Ergänze Bauteil/Gewerk und wenn möglich Maße, Fahrzeugmodell oder Gerätetyp."
      : type.isElectrical
        ? "Funktionsschema; Leiterkennzeichnungen und Schutzmaßnahmen durch Elektrofachkraft an der konkreten Anlage verifizieren."
        : type.isVehicle
          ? "Bauteilskizze nicht maßstäblich · Hersteller-Teilenummern und Anzugsmomente in Nm fahrzeugbezogen prüfen."
          : `${notes.join(" · ")} · (B) = Standard-Richtwert (Beispielmaß).`;
  if (!repairGuide) sketchContainer.replaceChildren(createSketch(type, dimensions, query));
  buildSteps.replaceChildren();
  (repairGuide?.steps ?? (genericType
    ? ["Nenne das konkrete Bauteil oder Gewerk, zum Beispiel „Küchenzeile“, „Wechselschaltung“ oder „Bremsscheibe“.","Ergänze verfügbare Maße, Modellnummer oder Fahrzeugdaten für eine passende Darstellung und Suche."]
    : type.isVehicle && vehicleTask === "oil"
      ? ["Fahrzeug-Identnummer, Motorcode und Herstellervorgaben zu Öl, Menge und Filter heranziehen.", "Öl und Filter nur nach fahrzeugspezifischem Wartungsplan auswählen; Altöl fachgerecht entsorgen.", "Dichtheit und Ölstand nach Herstellerverfahren prüfen; bei Unsicherheit Werkstatt beauftragen."]
      : type.isVehicle && vehicleTask === "engine"
        ? ["Motorkennbuchstabe und Diagnosecode eindeutig ermitteln; Code nicht ohne Diagnose als Bauteilfehler werten.", "Zündkerzen- und Riemenvarianten ausschließlich anhand Fahrzeugdaten identifizieren.", "Drehmomente und Einbauverfahren der Herstellerunterlagen verwenden; Arbeiten bei Unsicherheit fachlich ausführen lassen."]
    : type.steps ?? [])).forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    buildSteps.append(item);
  });
  buildParts.replaceChildren();
  (repairGuide ? repairGuide.steps : components).forEach((part) => {
    const item = document.createElement("li");
    item.textContent = part;
    buildParts.append(item);
  });
  buildSummary.setAttribute("aria-label", `${query}. ${buildDimensionNote.textContent}`);
  buildNote.textContent = repairGuide
    ? "Allgemeine Orientierung, keine Produktdiagnose. Bei elektrischen Arbeiten, Gas, verdeckten Lecks oder Unsicherheit Fachbetrieb beauftragen."
    : type.isElectrical
      ? "Symbolische Übersicht, kein normgeprüfter Schalt- oder Installationsplan. DIN EN 60617 und DIN VDE 0100 sind projektbezogen durch Elektrofachkräfte anzuwenden."
      : type.isVehicle
        ? "Schematische Darstellung, keine Reparaturanweisung. Fahrzeugdaten, Herstellerunterlagen und Werkstatthandbuch haben Vorrang; keine pauschalen Drehmomentangaben."
    : "Konzeptskizze, kein Werk- oder Statikplan. Beispielmaße und Bauteilvorschläge sind nicht ausführungsreif. Tragende Bauteile, Verbindungen, Fundamente, Lasten und Genehmigungen müssen qualifizierte Fachleute projektbezogen prüfen.";
  buildHelp.hidden = false;
  if (!repairGuide && !genericType && !type.isElectrical) {
    const cadModel = {
      type: type.id,
      title: type.title,
      width: dimensions.width,
      height: dimensions.height,
      depth: dimensions.depth,
      pitch: dimensions.pitch ?? type.defaults.pitch ?? 0,
      stepCount: dimensions.stepCount,
      riserHeight: dimensions.riserHeight,
      treadDepth: dimensions.treadDepth,
      stairLength: dimensions.stairLength,
      rafterSpacing: dimensions.rafterSpacing,
      panelThickness: dimensions.panelThickness,
      vehicleTask,
      components,
    };
    window.werkfinderCadModel = cadModel;
    window.dispatchEvent(new CustomEvent("werkfinder:cad-model", { detail: cadModel }));
  } else if (genericType || type.isElectrical) {
    window.werkfinderCadModel = undefined;
    if (type.isElectrical) {
      window.dispatchEvent(new CustomEvent("werkfinder:cad-blueprint"));
    }
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderResults();
});

queryInput.addEventListener("input", () => {
  queryCount.textContent = `${queryInput.value.length} / 200`;
});

searchTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedSearchType = button.dataset.searchType;
    searchTypeButtons.forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    if (!results.hidden) renderResults();
  });
});

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.themeChoice;
    document.body.dataset.theme = theme;
    themeButtons.forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
  });
});

layoutToggle.addEventListener("click", () => {
  const mobileEnabled = document.body.classList.toggle("mobile-layout-mode");
  layoutToggle.setAttribute("aria-pressed", String(mobileEnabled));
  layoutToggle.textContent = mobileEnabled ? "💻 Desktop-Layout" : "📱 Mobil-Layout";
});

document.querySelectorAll(".example-chip").forEach((button) => {
  button.addEventListener("click", () => {
    queryInput.value = button.dataset.query;
    queryCount.textContent = `${queryInput.value.length} / 200`;
    queryInput.focus();
  });
});

document.querySelector("#copy-query").addEventListener("click", async (event) => {
  try {
    await navigator.clipboard.writeText(currentSearch);
    event.currentTarget.innerHTML = '<span aria-hidden="true">✓</span> Kopiert';
    window.setTimeout(() => {
      event.currentTarget.innerHTML = '<span aria-hidden="true">▢</span> Anfrage kopieren';
    }, 1600);
  } catch (error) {
    console.error("Suchanfrage konnte nicht in die Zwischenablage kopiert werden.", error);
    resultsSummary.textContent = `Suchanfrage: „${currentSearch}“ · Kopieren ist in diesem Browser nicht verfügbar.`;
  }
});