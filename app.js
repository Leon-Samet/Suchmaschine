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
const sketchOptions = document.querySelector("#sketch-options");
const sketchContainer = document.querySelector("#sketch-container");
const buildStepsTitle = document.querySelector("#build-steps-title");
const buildSteps = document.querySelector("#build-steps");
const buildMaterial = document.querySelector("#build-material");
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

const sketchExamples = {
  regal: {
    label: "Regal",
    dimensions: { width: 80, depth: 30, height: 180 },
    materials: "Holzplatten oder geeignetes Konstruktionsholz; passende Schrauben und Winkel",
    steps: ["Standort und Belastung festlegen; Seiten, Böden und Rückwand planen.", "Bauteile anhand der Maße zuschneiden und Kanten prüfen.", "Böden rechtwinklig verbinden; Rückwand zur Aussteifung befestigen.", "Standfestigkeit prüfen und ein hohes Regal fachgerecht an der Wand sichern."],
  },
  pflanzkasten: {
    label: "Pflanzkasten",
    dimensions: { width: 80, depth: 30, height: 40 },
    materials: "Witterungsbeständiges Holz, geeignete Schrauben und eine passende Innenauskleidung",
    steps: ["Einsatzort und gewünschtes Volumen bestimmen; Wasserablauf mit einplanen.", "Bretter für Seiten und Boden ablängen und Kanten glätten.", "Seiten rechtwinklig verbinden und Boden mit Ablauföffnungen befestigen.", "Holz für den Außeneinsatz schützen und eine geeignete Innenauskleidung einsetzen."],
  },
  werkbank: {
    label: "Arbeitstisch",
    dimensions: { width: 120, depth: 60, height: 90 },
    materials: "Stabile Kanthölzer, eine belastbare Arbeitsplatte und passende Verbindungsmittel",
    steps: ["Arbeitshöhe, Platzbedarf und erwartete Belastung festlegen.", "Einen verwindungssteifen Rahmen mit gleich langen Beinen planen.", "Rahmen rechtwinklig montieren und die Arbeitsplatte sicher befestigen.", "Stand und Verbindungen prüfen; schwere oder bewegliche Nutzung gesondert absichern."],
  },
  allgemein: {
    label: "Allgemeine Idee",
    dimensions: { width: 100, depth: 60, height: 80 },
    materials: "Materialien und Verbindungen passend zum konkreten Gegenstand auswählen",
    steps: ["Den Zweck des Gegenstands und den späteren Einsatz festlegen.", "Maße, Bauteile und Verbindungen vor dem Bau in einer genaueren Zeichnung planen.", "Material passend zu Belastung, Umgebung und Verwendung auswählen.", "Schrittweise montieren und Stabilität sowie Sicherheit vor der Nutzung prüfen."],
  },
};

function detectSketchType(query) {
  if (/\b(regal|bücherregal|wandregal|schuhregal)\b/i.test(query)) return "regal";
  if (/\b(pflanzkasten|blumenkasten|hochbeet|pflanzbeet)\b/i.test(query)) return "pflanzkasten";
  if (/\b(werkbank|arbeitstisch|werktisch|tisch)\b/i.test(query)) return "werkbank";
  return "allgemein";
}

function isBuildRequest(query) {
  return /\b(?:bau(?:en|e|st|t|anleitung|plan|projekt|weise|vorhaben)|anfertig\w*|montier\w*|montage\w*|skizz\w*|zeichne\w*|zeichnung\w*|entwurf\w*|mach\w*|konstrukt\w*|entwerf\w*|plan(?:en|e|st|t|ung)|aufbau|zusammenbau)\b/i.test(query)
    || /\bbau\s+(?:eines|einer|ein|eine|einen)\b/i.test(query)
    || /\bherstell(?:en|e|st|te|ten)\b|\bhergestellt\w*|\bherstellung\w*/i.test(query)
    || /\bstell\w*\s+her\b/i.test(query);
}

function toCentimeters(value, unit) {
  const number = Number(value.replace(",", "."));
  if (!Number.isFinite(number) || number <= 0) return null;
  if (unit?.toLowerCase() === "m") return number * 100;
  if (unit?.toLowerCase() === "mm") return number / 10;
  return number;
}

function parseDimensions(query) {
  const triplet = query.match(/(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?/i);
  if (triplet) {
    const sharedUnit = triplet[6] || triplet[4] || triplet[2] || "cm";
    return {
      width: toCentimeters(triplet[1], triplet[2] || sharedUnit),
      depth: toCentimeters(triplet[3], triplet[4] || sharedUnit),
      height: toCentimeters(triplet[5], triplet[6] || sharedUnit),
      complete: true,
    };
  }

  const dimensions = {};
  const namedDimension = /(\d+(?:[.,]\d+)?)\s*(mm|cm|m)?\s*(?:cm\s*)?(breit|breite|tief|tiefe|hoch|höhe|lang|länge)\b/gi;
  for (const match of query.matchAll(namedDimension)) {
    const label = match[3].toLowerCase();
    const key = label.startsWith("breit") ? "width" : label.startsWith("tief") ? "depth" : label.startsWith("hoch") || label.startsWith("höh") ? "height" : "width";
    dimensions[key] = toCentimeters(match[1], match[2] || "cm");
  }
  return Object.keys(dimensions).length ? { ...dimensions, complete: false } : null;
}

function formatDimension(value) {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toString().replace(".", ",")} cm`;
}

function createSketch(type, dimensions) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", "0 0 420 280");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${sketchExamples[type].label}, schematische Vorderansicht mit Maßangaben`);

  const add = (tag, attributes, text) => {
    const node = document.createElementNS(namespace, tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
    if (text) node.textContent = text;
    svg.append(node);
    return node;
  };
  const width = Math.max(120, Math.min(230, dimensions.width / Math.max(dimensions.width, dimensions.height) * 230));
  const height = Math.max(100, Math.min(175, dimensions.height / Math.max(dimensions.width, dimensions.height) * 175));
  const x = 100 + (220 - width) / 2;
  const y = 42 + (175 - height);
  const right = x + width;
  const bottom = y + height;
  const stroke = "#19634c";
  const fill = "#eaf1e8";
  const common = { stroke, "stroke-width": 3, fill };

  add("rect", { x, y, width, height, ...common, rx: 2 });
  if (type === "regal") {
    [0.33, 0.66].forEach((fraction) => {
      const shelfY = y + height * fraction;
      add("line", { x1: x + 3, y1: shelfY, x2: right - 3, y2: shelfY, stroke, "stroke-width": 4 });
    });
    add("line", { x1: x + 7, y1: y + 4, x2: x + 7, y2: bottom - 4, stroke, "stroke-width": 2 });
  } else if (type === "pflanzkasten") {
    add("line", { x1: x + 4, y1: y + height * 0.35, x2: right - 4, y2: y + height * 0.35, stroke: "#8b7546", "stroke-width": 2, "stroke-dasharray": "5 4" });
    add("line", { x1: x + width * 0.35, y1: bottom, x2: x + width * 0.35, y2: bottom + 12, stroke, "stroke-width": 3 });
    add("line", { x1: x + width * 0.65, y1: bottom, x2: x + width * 0.65, y2: bottom + 12, stroke, "stroke-width": 3 });
  } else if (type === "werkbank") {
    add("rect", { x: x - 8, y: y - 10, width: width + 16, height: 12, ...common, rx: 1 });
    [x + width * 0.12, x + width * 0.78].forEach((legX) => {
      add("rect", { x: legX, y: y + 2, width: width * 0.1, height: height - 2, fill: "#d8e4d9", stroke, "stroke-width": 2 });
    });
  } else {
    add("line", { x1: x + width * 0.5, y1: y + 4, x2: x + width * 0.5, y2: bottom - 4, stroke: "#829087", "stroke-width": 1.5, "stroke-dasharray": "5 4" });
    add("line", { x1: x + 4, y1: y + height * 0.5, x2: right - 4, y2: y + height * 0.5, stroke: "#829087", "stroke-width": 1.5, "stroke-dasharray": "5 4" });
  }

  add("line", { x1: x, y1: 238, x2: right, y2: 238, stroke: "#829087", "stroke-width": 1.5 });
  add("line", { x1: x, y1: 231, x2: x, y2: 245, stroke: "#829087", "stroke-width": 1.5 });
  add("line", { x1: right, y1: 231, x2: right, y2: 245, stroke: "#829087", "stroke-width": 1.5 });
  add("text", { x: (x + right) / 2, y: 258, fill: "#202623", "font-size": 14, "font-family": "DM Sans, sans-serif", "text-anchor": "middle" }, `Breite ${formatDimension(dimensions.width)}`);
  add("line", { x1: 75, y1: y, x2: 75, y2: bottom, stroke: "#829087", "stroke-width": 1.5 });
  add("line", { x1: 68, y1: y, x2: 82, y2: y, stroke: "#829087", "stroke-width": 1.5 });
  add("line", { x1: 68, y1: bottom, x2: 82, y2: bottom, stroke: "#829087", "stroke-width": 1.5 });
  add("text", { x: 60, y: (y + bottom) / 2, fill: "#202623", "font-size": 13, "font-family": "DM Sans, sans-serif", "text-anchor": "middle", transform: `rotate(-90 60 ${(y + bottom) / 2})` }, `Höhe ${formatDimension(dimensions.height)}`);
  add("text", { x: 210, y: 26, fill: "#707771", "font-size": 12, "font-family": "DM Sans, sans-serif", "text-anchor": "middle" }, `Tiefe ${formatDimension(dimensions.depth)} (nicht dargestellt)`);
  return svg;
}

function renderBuildHelp(query) {
  if (!isBuildRequest(query) && selectedSearchType !== "build") {
    buildHelp.hidden = true;
    return;
  }

  const detectedType = detectSketchType(query);
  const example = sketchExamples[detectedType];
  const parsed = parseDimensions(query);
  const dimensions = { ...example.dimensions, ...(parsed ?? {}) };
  delete dimensions.complete;

  buildSummary.textContent = parsed
    ? `Entwurf für „${query}“ mit ${parsed.complete ? "deinen angegebenen" : "teilweise erkannten"} Maßen. Das Produktmodell oder weitere Suchbegriffe ändern die externe Suche, nicht die schematische Skizze.`
    : `Entwurf für „${query}“. Da keine Maße erkannt wurden, zeigt die Skizze Beispielmaße. Wähle bei Bedarf ein anderes Beispiel.`;
  sketchOptions.replaceChildren();
  Object.entries(sketchExamples).forEach(([type, option]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `sketch-option${type === detectedType ? " is-selected" : ""}`;
    button.setAttribute("aria-pressed", String(type === detectedType));
    button.textContent = `${option.label} · ${formatDimension(option.dimensions.width)} × ${formatDimension(option.dimensions.depth)} × ${formatDimension(option.dimensions.height)}`;
    button.addEventListener("click", () => {
      sketchOptions.querySelectorAll(".sketch-option").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderSelectedSketch(type, option.dimensions, query, false);
    });
    sketchOptions.append(button);
  });
  renderSelectedSketch(detectedType, dimensions, query, Boolean(parsed));
  buildHelp.hidden = false;
}

function renderSelectedSketch(type, dimensions, query, hasUserDimensions) {
  sketchContainer.replaceChildren(createSketch(type, dimensions));
  const example = sketchExamples[type];
  buildStepsTitle.textContent = `Erste Schritte: ${example.label}`;
  buildSteps.replaceChildren();
  example.steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    buildSteps.append(item);
  });
  buildMaterial.textContent = `Materialidee: ${example.materials}.`;
  buildDimensionNote.textContent = hasUserDimensions
    ? "Maße aus deiner Eingabe (unvollständige Maße wurden mit Beispielwerten ergänzt)."
    : `Beispielmaße für ${example.label}: Breite × Tiefe × Höhe.`;
  buildSummary.setAttribute("aria-label", `${query}. ${buildDimensionNote.textContent}`);
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