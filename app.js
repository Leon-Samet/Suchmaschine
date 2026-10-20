const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const queryCount = document.querySelector("#query-count");
const results = document.querySelector("#results");
const resultsSummary = document.querySelector("#results-summary");
const resultGrid = document.querySelector("#result-grid");
const tradeButtons = [...document.querySelectorAll(".trade-option")];
let selectedTrade = "";
let currentSearch = "";

const sources = [
  { name: "Hersteller & offizieller Service", detail: "Support, Serviceunterlagen und Hinweise vom Hersteller", icon: "01", query: (term, trade, brand) => brand ? `site:${brand} ${term} ${trade} Support Reparatur` : `${term} ${trade} Hersteller Kundendienst Support` },
  { name: "Anleitungen & Reparaturhilfen", detail: "Schritt-für-Schritt-Anleitungen und hilfreiche Fachbeiträge", icon: "02", query: (term, trade) => `${term} ${trade} Reparaturanleitung Anleitung` },
  { name: "Videos & Praxisbeispiele", detail: "Erklärvideos und praktische Vorführungen", icon: "▶", query: (term, trade) => `${term} ${trade} Anleitung Reparatur` , host: "youtube" },
  { name: "Ersatzteile & technische Infos", detail: "Ersatzteile, Explosionszeichnungen und technische Dokumente", icon: "04", query: (term, trade) => `${term} ${trade} Ersatzteile Explosionszeichnung technische Unterlagen` },
];

function findBrandDomain(query) {
  const brands = [
    [/\bmiele\b/i, "miele.de"],
    [/\bbosch\b/i, "bosch-home.com/de"],
    [/\bsiemens\b/i, "siemens-home.bsh-group.com/de"],
    [/\baeg\b/i, "aeg.de"],
    [/\bsamsung\b/i, "samsung.com/de"],
    [/\blg\b/i, "lg.com/de"],
    [/\bneff\b/i, "neff-home.com/de"],
    [/\bwhirlpool\b/i, "whirlpool.de"],
  ];
  return brands.find(([pattern]) => pattern.test(query))?.[1] ?? "";
}

function renderResults() {
  const rawQuery = queryInput.value.trim();
  if (!rawQuery) return;
  currentSearch = [rawQuery, selectedTrade].filter(Boolean).join(" ");
  const brandDomain = findBrandDomain(rawQuery);
  resultsSummary.textContent = `Suchanfrage: „${currentSearch}“ · Öffne eine Quelle, um aktuelle Treffer zu sehen.`;
  resultGrid.replaceChildren(...sources.map((source) => {
    const searchTerms = source.query(rawQuery, selectedTrade, brandDomain).trim().replace(/\s+/g, " ");
    const baseUrl = source.host === "youtube" ? "https://www.youtube.com/results" : "https://www.google.com/search";
    const url = `${baseUrl}?${source.host === "youtube" ? "search_query" : "q"}=${encodeURIComponent(searchTerms)}`;
    const link = document.createElement("a");
    link.className = "result-card";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${source.name} in neuem Tab öffnen`);
    link.innerHTML = `<span class="result-icon" aria-hidden="true">${source.icon}</span><span class="result-content"><h3>${source.name}</h3><p>${source.detail}</p><span class="result-action"><span>Externe Suche öffnen</span><span aria-hidden="true">↗</span></span></span>`;
    return link;
  }));
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderResults();
});

queryInput.addEventListener("input", () => {
  queryCount.textContent = `${queryInput.value.length} / 200`;
});

tradeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedTrade = button.dataset.trade;
    tradeButtons.forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
  });
  button.setAttribute("aria-pressed", String(button.classList.contains("is-selected")));
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