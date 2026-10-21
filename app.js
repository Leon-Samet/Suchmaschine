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

function isBuildRequest(query) {
  return /\b(?:bau(?:en|e|st|t|anleitung|plan|projekt|weise|vorhaben)|gebaut|anfertig\w*|montier\w*|montage\w*|skizz\w*|zeichne\w*|zeichnung\w*|entwurf\w*|mach\w*|konstrukt\w*|entwerf\w*|plan(?:en|e|st|t|ung)|aufbau|zusammenbau)\b/i.test(query)
    || /\bbau\s+(?:eines|einer|ein|eine|einen)\b/i.test(query)
    || /\bherstell(?:en|e|st|te|ten)\b|\bhergestellt\w*|\bherstellung\w*/i.test(query)
    || /\bstell\w*\s+her\b/i.test(query);
}

function toCentimeters(value, unit) {
  const number = Number(value.replace(",", "."));
  if (!Number.isFinite(number) || number <= 0) return null;
  const normalizedUnit = unit?.toLowerCase() ?? "cm";
  if (normalizedUnit === "m" || normalizedUnit.startsWith("meter")) return number * 100;
  if (normalizedUnit === "mm" || normalizedUnit.startsWith("millimeter")) return number / 10;
  return number;
}

function parseDimensions(query) {
  const unitPattern = "(millimeter|millimeters|mm|zentimeter|zentimeters|cm|meter|meters|m)?";
  const tripletPattern = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${unitPattern}\\s*[x×]\\s*(\\d+(?:[.,]\\d+)?)\\s*${unitPattern}\\s*[x×]\\s*(\\d+(?:[.,]\\d+)?)\\s*${unitPattern}`, "i");
  const triplet = query.match(tripletPattern);
  if (triplet) {
    const sharedUnit = triplet[6] || triplet[4] || triplet[2] || "cm";
    const dimensions = {
      width: toCentimeters(triplet[1], triplet[2] || sharedUnit),
      depth: toCentimeters(triplet[3], triplet[4] || sharedUnit),
      height: toCentimeters(triplet[5], triplet[6] || sharedUnit),
    };
    if (Object.values(dimensions).every((value) => value !== null)) return { ...dimensions, complete: true };
  }

  const dimensions = {};
  const namedDimension = /(\d+(?:[.,]\d+)?)\s*(millimeters?|mm|zentimeters?|cm|meters?|m)?\s*(breit|breite|breiten|tief|tiefe|tiefen|hoch|höhe|höhen|lang|länge|längen)\b/gi;
  for (const match of query.matchAll(namedDimension)) {
    const label = match[3].toLowerCase();
    const key = label.startsWith("breit") || label.startsWith("läng") || label.startsWith("lang")
      ? "width"
      : label.startsWith("tief")
        ? "depth"
        : "height";
    const value = toCentimeters(match[1], match[2]);
    if (value !== null) dimensions[key] = value;
  }
  return Object.keys(dimensions).length ? { ...dimensions, complete: false } : {};
}

function formatDimension(value) {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toString().replace(".", ",")} cm`;
}

function createSketch(dimensions, query) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", "0 0 420 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Schematische Skizze zu ${query}`);

  const add = (tag, attributes, text) => {
    const node = document.createElementNS(namespace, tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
    if (text !== undefined) node.textContent = text;
    svg.append(node);
    return node;
  };
  const fallbackDimension = Math.max(dimensions.width ?? 0, dimensions.height ?? 0, dimensions.depth ?? 0) || 100;
  const widthValue = dimensions.width ?? fallbackDimension;
  const heightValue = dimensions.height ?? fallbackDimension;
  const depthValue = dimensions.depth ?? fallbackDimension;
  const largest = Math.max(widthValue, heightValue, depthValue);
  const width = Math.max(45, 160 * widthValue / largest);
  const height = Math.max(45, 125 * heightValue / largest);
  const depth = Math.max(16, 42 * depthValue / largest);
  const x = 105 + (190 - width) / 2;
  const y = 85 + (125 - height);
  const right = x + width;
  const bottom = y + height;
  const backX = x + depth;
  const backY = y - depth * 0.55;
  const stroke = "#19634c";
  const fill = "#eaf1e8";

  add("polygon", { points: `${x},${y} ${backX},${backY} ${backX + width},${backY} ${right},${y}`, fill: "#f4f7f1", stroke, "stroke-width": 2.5 });
  add("polygon", { points: `${right},${y} ${backX + width},${backY} ${backX + width},${backY + height} ${right},${bottom}`, fill: "#dce8dd", stroke, "stroke-width": 2.5 });
  add("rect", { x, y, width, height, fill, stroke, "stroke-width": 2.5, rx: 2 });

  add("line", { x1: x, y1: 242, x2: right, y2: 242, stroke: "#829087", "stroke-width": 1.5 });
  add("line", { x1: x, y1: 236, x2: x, y2: 248, stroke: "#829087", "stroke-width": 1.5 });
  add("line", { x1: right, y1: 236, x2: right, y2: 248, stroke: "#829087", "stroke-width": 1.5 });
  add("text", { x: (x + right) / 2, y: 263, fill: "#202623", "font-size": 13, "font-family": "DM Sans, sans-serif", "text-anchor": "middle" }, dimensions.width ? `Breite ${formatDimension(dimensions.width)}` : "Breite nicht angegeben");
  add("line", { x1: 77, y1: y, x2: 77, y2: bottom, stroke: "#829087", "stroke-width": 1.5 });
  add("line", { x1: 71, y1: y, x2: 83, y2: y, stroke: "#829087", "stroke-width": 1.5 });
  add("line", { x1: 71, y1: bottom, x2: 83, y2: bottom, stroke: "#829087", "stroke-width": 1.5 });
  add("text", { x: 62, y: (y + bottom) / 2, fill: "#202623", "font-size": 12, "font-family": "DM Sans, sans-serif", "text-anchor": "middle", transform: `rotate(-90 62 ${(y + bottom) / 2})` }, dimensions.height ? `Höhe ${formatDimension(dimensions.height)}` : "Höhe nicht angegeben");
  add("text", { x: backX + width / 2, y: backY - 8, fill: "#202623", "font-size": 12, "font-family": "DM Sans, sans-serif", "text-anchor": "middle" }, dimensions.depth ? `Tiefe ${formatDimension(dimensions.depth)}` : "Tiefe nicht angegeben");
  return svg;
}

function renderBuildHelp(query) {
  if (!isBuildRequest(query) && selectedSearchType !== "build") {
    buildHelp.hidden = true;
    return;
  }

  const parsed = parseDimensions(query);
  const knownDimensions = Object.keys(parsed).filter((key) => key !== "complete");
  buildSummary.textContent = `Schematische Skizze zu deiner Suche: „${query}“. Die Form ist allgemein und keine objektspezifische Konstruktion.`;
  buildDimensionNote.textContent = knownDimensions.length
    ? `Erkannte Maße: ${knownDimensions.map((key) => `${key === "width" ? "Breite" : key === "depth" ? "Tiefe" : "Höhe"} ${formatDimension(parsed[key])}`).join(" · ")}${parsed.complete ? "" : " · Nicht angegebene Maße bleiben offen"}.`
    : "Keine Maße erkannt. Die Skizze markiert fehlende Maße, statt Werte zu erfinden.";
  sketchContainer.replaceChildren(createSketch(parsed, query));
  buildStepsTitle.textContent = "Allgemeine nächste Schritte";
  buildSteps.replaceChildren();
  [
    "Zweck, Einsatzort und Belastung des Gegenstands genau festlegen.",
    "Fehlende Maße und gewünschte Materialien vor dem Bau ergänzen.",
    "Bauteile, Verbindungen und Befestigungen passend zum Einsatz planen.",
    "Vor der Nutzung Stabilität und Sicherheit prüfen; Vorschriften beachten.",
  ].forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    buildSteps.append(item);
  });
  buildMaterial.textContent = "Material und Verbindungsmittel lassen sich aus einer kurzen Suchanfrage nicht zuverlässig ableiten.";
  buildSummary.setAttribute("aria-label", `${query}. ${buildDimensionNote.textContent}`);
  buildHelp.hidden = false;
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