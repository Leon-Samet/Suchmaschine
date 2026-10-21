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

function renderResults() {
  const rawQuery = queryInput.value.trim();
  if (!rawQuery) return;
  const productModel = productModelInput.value.trim();
  currentSearch = [rawQuery, productModel].filter(Boolean).join(" ");
  resultsSummary.textContent = `Suchanfrage: „${currentSearch}“ · Öffne einen Suchweg für aktuelle Treffer.`;
  resultGrid.replaceChildren(...searchSources[selectedSearchType].map((source) => {
    const searchTerms = source.terms(currentSearch).trim().replace(/\s+/g, " ");
    const baseUrl = source.host === "youtube" ? "https://www.youtube.com/results" : "https://www.google.com/search";
    const url = `${baseUrl}?${source.host === "youtube" ? "search_query" : "q"}=${encodeURIComponent(searchTerms)}`;
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
  renderBuildHelp(rawQuery);
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

const sketchTypes = [
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

  const labels = "(?:gross|groß|breit|breite|breiten|tief|tiefe|tiefen|hoch|höhe|höhen|geschosshöhe|geschosshöhen|lang|länge|längen|spannweite|firsthöhe)";
  const unit = "(?:millimeter(?:n)?|mm|zentimeter(?:n)?|cm|meter(?:n)?|m)";
  const namedDimension = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${unit})?\\s*(${labels})\\b|\\b(${labels})\\s*(?:von|:|=)?\\s*(\\d+(?:[.,]\\d+)?)\\s*(${unit})?`, "gi");
  for (const match of query.matchAll(namedDimension)) {
    const label = (match[3] ?? match[4]).toLowerCase();
    const key = label.startsWith("tief") || label.startsWith("läng") || label.startsWith("lang")
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
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toString().replace(".", ",")} cm`;
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

function drawGeneralSketch(builder, type, dimensions) {
  const { add, line, rect, polygon, label, callout, dimension } = builder;
  const largest = Math.max(dimensions.width, dimensions.height);
  const w = Math.max(150, 330 * dimensions.width / largest);
  const h = Math.max(100, 230 * dimensions.height / largest);
  const x = 95 + (330 - w) / 2;
  const y = 105 + (230 - h);
  label(x, 50, "SCHEMATISCHE ANSICHT", "sketch-kicker");
  const anchors = [];

  if (type.id === "table") {
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
    anchors.push([x + w / 2, y + 55], [x + 65, y + 135], [x + w - 55, y + h - 35], [x + w / 2, y + h - 55]);
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
  if (type.id === "roof") drawRoofSketch(builder, dimensions);
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
      `Massivholz · Auftritt ca. ${formatDimension(dimensions.treadDepth)} als Rechenrichtwert`,
      `Holz/Plattenwerkstoff · Setzstufen passend zur Steigung ${formatDimension(dimensions.riserHeight)}`,
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
  return guidance[type.id] ?? type.components.map(() => (
    "Material und Dimensionierung passend zu Nutzung und Belastung fachlich festlegen"
  ));
}

function renderBuildHelp(query) {
  const sketchType = detectSketchType(query);
  const repairRequest = detectRepairRequest(query);
  if (!isBuildRequest(query) && selectedSearchType !== "build" && !repairRequest) {
    buildHelp.hidden = true;
    return;
  }

  const type = sketchType ?? sketchTypes.find((item) => item.id === "generic");
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
    const riserCount = dimensions.stepCount ?? Math.max(2, Math.round(requestedHeight / 17.5));
    const rise = requestedHeight / riserCount;
    const tread = Math.max(0, 63 - 2 * rise);
    dimensions.stepCount = riserCount;
    dimensions.riserHeight = rise;
    dimensions.treadDepth = tread;
    dimensions.stairLength = tread * (riserCount - 1);
    if (parsed.depth === undefined) dimensions.depth = dimensions.stairLength;
    notes[2] = `Lauflänge: ${formatDimension(dimensions.stairLength)} (${riserCount - 1} Auftritte)`;
    notes.push(`Treppenrichtwert: ${riserCount} Steigungen à ${formatDimension(rise)} · Auftritt ${formatDimension(tread)} · Schrittmaß 2s + a = ${formatDimension(2 * rise + tread)}${2 * rise + tread < 59 || 2 * rise + tread > 65 ? " (außerhalb des üblichen Orientierungsbereichs 59–65 cm)" : ""}`);
  }
  if (type.id === "roof") {
    const pitchIsExample = dimensions.pitch === undefined;
    if (pitchIsExample && (parsed.width || parsed.height)) {
      dimensions.pitch = Math.round(Math.atan(Math.max(1, dimensions.height - 250) / (dimensions.width / 2)) * 180 / Math.PI);
      dimensions.isExample.pitch = false;
      notes.push(`Dachneigung: ca. ${dimensions.pitch}° (aus den angegebenen Maßen abgeleitet)`);
    } else {
      dimensions.pitch ??= type.defaults.pitch;
      dimensions.isExample.pitch = pitchIsExample;
      notes.push(`Dachneigung: ${pitchIsExample ? "ca. " : ""}${dimensions.pitch}°${pitchIsExample ? " (Beispiel)" : ""}`);
    }
    if (dimensions.pitch < 5 || dimensions.pitch > 80) {
      notes.push("Hinweis: Dachneigung außerhalb des dargestellten Modellbereichs (5–80°); fachlich prüfen.");
      dimensions.pitch = Math.max(5, Math.min(80, dimensions.pitch));
    }
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
    : `${type.title}. Maße sind illustrative Richtwerte und ersetzen keine Fachplanung.`;
  const safetyMessage = repairGuide?.safety ?? (type.isStructural
    ? "Tragende Bauteile, Verbindungen, Auflager, Lasten und Fundamente sind nicht statisch geprüft. Vor Ausführung projektbezogen durch qualifizierte Fachleute bemessen lassen."
    : "");
  buildSafety.hidden = !safetyMessage;
  buildSafety.textContent = safetyMessage;
  buildTools.replaceChildren();
  (repairGuide?.tools ?? (type.id === "stairs"
    ? ["Bandmaß und Winkel", "Wasserwaage", "Kappsäge", "Bohrmaschine / Schrauber", "Persönliche Schutzausrüstung"]
    : ["Bandmaß", "Wasserwaage", "Winkel", "passendes Säge- und Montagewerkzeug", "Persönliche Schutzausrüstung"])).forEach((tool) => {
    const item = document.createElement("li");
    item.textContent = tool;
    buildTools.append(item);
  });
  const materialNotes = materialGuidance(type, dimensions);
  buildMaterials.replaceChildren();
  type.components.forEach((part, index) => {
    const item = document.createElement("li");
    item.textContent = `${part} — ${materialNotes[index] ?? "Material/Querschnitt projektspezifisch festlegen"}`;
    buildMaterials.append(item);
  });
  sketchBadge.textContent = repairGuide
    ? "REPARATUR-ORIENTIERUNG · PRODUKTHANDBUCH BEACHTEN"
    : type.id === "stairs"
      ? "SCHRITTMASS-ORIENTIERUNG · DIN 18065"
      : type.id === "roof" || type.id === "carport"
        ? "HOLZBAU-RICHTMASS · STATIK PROJEKTBEZOGEN PRÜFEN"
        : "RICHTMASS · NICHT STATISCH GEPRÜFT";
  document.querySelector(".cad-toolbar").hidden = Boolean(repairGuide);
  document.querySelector("#viewer-shell").hidden = Boolean(repairGuide);
  document.querySelector(".sketch-caption").hidden = Boolean(repairGuide);
  buildPartsTitle.textContent = repairGuide ? "Prüf- und Arbeitsschritte" : "Bauteile in der Skizze";
  buildMaterialsTitle.textContent = repairGuide ? "Werkzeugübersicht" : "Material- / Bauteilübersicht";
  buildMaterialsTitle.hidden = Boolean(repairGuide);
  buildMaterials.hidden = Boolean(repairGuide);
  buildToolsTitle.hidden = false;
  buildTools.hidden = false;
  buildPartsTitle.hidden = Boolean(repairGuide);
  buildParts.hidden = Boolean(repairGuide);
  buildStepsTitle.textContent = repairGuide ? "Sichere Prüfschritte" : type.isStructural ? "Planungshinweise" : "Konstruktionshinweise";
  buildDimensionNote.textContent = repairGuide
    ? "Vor Arbeitsbeginn passende Energiezufuhr absperren; Hersteller- und Fachhinweise haben Vorrang."
    : `${notes.join(" · ")} · (B) = Standard-Richtwert (Beispielmaß).`;
  if (!repairGuide) sketchContainer.replaceChildren(createSketch(type, dimensions, query));
  buildSteps.replaceChildren();
  (repairGuide?.steps ?? type.steps ?? []).forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    buildSteps.append(item);
  });
  buildParts.replaceChildren();
  (repairGuide ? repairGuide.steps : type.components).forEach((part) => {
    const item = document.createElement("li");
    item.textContent = part;
    buildParts.append(item);
  });
  buildSummary.setAttribute("aria-label", `${query}. ${buildDimensionNote.textContent}`);
  buildNote.textContent = repairGuide
    ? "Allgemeine Orientierung, keine Produktdiagnose. Bei elektrischen Arbeiten, Gas, verdeckten Lecks oder Unsicherheit Fachbetrieb beauftragen."
    : "Konzeptskizze, kein Werk- oder Statikplan. Beispielmaße und Bauteilvorschläge sind nicht ausführungsreif. Tragende Bauteile, Verbindungen, Fundamente, Lasten und Genehmigungen müssen qualifizierte Fachleute projektbezogen prüfen.";
  buildHelp.hidden = false;
  if (!repairGuide) {
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
      components: type.components,
    };
    window.werkfinderCadModel = cadModel;
    window.dispatchEvent(new CustomEvent("werkfinder:cad-model", { detail: cadModel }));
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
  } catch {
    resultsSummary.textContent = `Suchanfrage: „${currentSearch}“ · Kopieren ist in diesem Browser nicht verfügbar.`;
  }
});