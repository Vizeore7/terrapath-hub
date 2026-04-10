const list = document.querySelector("#guideList");
const search = document.querySelector("#searchInput");
const languageFilter = document.querySelector("#languageFilter");
const classFilter = document.querySelector("#classFilter");
const modFilter = document.querySelector("#modFilter");
const sortFilter = document.querySelector("#sortFilter");
const guideCountSummary = document.querySelector("#guideCountSummary");
const site = window.terraPathSite;

let guides = [];

function pageParams() {
  return new URLSearchParams(window.location.search);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function t(key, variables = {}) {
  return site?.t?.(key, variables) ?? key;
}

function guideLanguageLabel(code) {
  return site?.getGuideLanguageLabel?.(code) ?? code;
}

function classLabel(tag) {
  const labels = {
    melee: { en: "Melee", ru: "Воин" },
    ranged: { en: "Ranged", ru: "Стрелок" },
    magic: { en: "Magic", ru: "Маг" },
    summoner: { en: "Summoner", ru: "Призыватель" },
    rogue: { en: "Rogue", ru: "Разбойник" },
    bard: { en: "Bard", ru: "Бард" },
    other: { en: "Other", ru: "Другое" }
  };
  const language = site?.getLanguage?.() === "ru" ? "ru" : "en";
  return labels[tag]?.[language] || tag;
}

function guideToSearchText(guide) {
  return [
    guide.title,
    guide.author,
    guide.language,
    guide.summary,
    ...(guide.requiredMods || []),
    ...(guide.classTags || []),
    ...(guide.guideTags || [])
  ].join(" ").toLowerCase();
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function populateFilter(select, values, emptyLabel) {
  const current = select.value;
  select.innerHTML = [`<option value="">${emptyLabel}</option>`]
    .concat(values.map((value) => {
      const label = select === languageFilter
        ? guideLanguageLabel(value)
        : select === classFilter
          ? classLabel(value)
          : value;
      return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
    }))
    .join("");
  if (values.includes(current)) {
    select.value = current;
  }
}

function renderGuide(guide) {
  const card = document.createElement("article");
  card.className = "guide-card";
  card.innerHTML = `
    <div class="guide-card__head">
      <div>
        <h2><a class="guide-card__link" href="guide.html?id=${encodeURIComponent(guide.id)}">${escapeHtml(guide.title)}</a></h2>
        <p class="guide-card__summary">${escapeHtml(guide.summary)}</p>
      </div>
      <a class="button button--quiet button--tiny" href="guide.html?id=${encodeURIComponent(guide.id)}">${escapeHtml(t("browse.openGuide"))}</a>
    </div>
    <div class="guide-card__meta">
      <div class="guide-card__metric">
        <span>${escapeHtml(t("common.labelClass"))}</span>
        <strong>${escapeHtml((guide.classTags || []).map(classLabel).join(", "))}</strong>
      </div>
      <div class="guide-card__metric">
        <span>${escapeHtml(t("common.labelLanguage"))}</span>
        <strong>${escapeHtml(guideLanguageLabel(guide.language))}</strong>
      </div>
      <div class="guide-card__metric">
        <span>${escapeHtml(t("common.labelPopularity"))}</span>
        <strong>${Number(guide.popularity || 0)}</strong>
      </div>
      <div class="guide-card__metric">
        <span>${escapeHtml(t("common.labelStages"))}</span>
        <strong>${Number(guide.stageCount || 0)}</strong>
      </div>
      <div class="guide-card__metric">
        <span>${escapeHtml(t("common.labelMods"))}</span>
        <strong>${escapeHtml((guide.requiredMods || []).join(", "))}</strong>
      </div>
    </div>
  `;
  return card;
}

function compareGuides(left, right) {
  switch (sortFilter.value) {
    case "title":
      return left.title.localeCompare(right.title);
    case "updated":
      return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
    case "popularity":
    default:
      return Number(right.popularity || 0) - Number(left.popularity || 0) || left.title.localeCompare(right.title);
  }
}

function render() {
  const query = search.value.trim().toLowerCase();
  const filtered = guides
    .filter((guide) => !query || guideToSearchText(guide).includes(query))
    .filter((guide) => !languageFilter.value || guide.language === languageFilter.value)
    .filter((guide) => !classFilter.value || (guide.classTags || []).includes(classFilter.value))
    .filter((guide) => !modFilter.value || (guide.requiredMods || []).includes(modFilter.value))
    .sort(compareGuides);

  guideCountSummary.textContent = t("browse.countSummary", { shown: filtered.length, total: guides.length });
  list.replaceChildren(...filtered.map(renderGuide));
  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = t("browse.noGuides");
    list.append(empty);
  }
}

async function fetchCatalog() {
  const paths = ["catalog/index.json", "../catalog/index.json"];

  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (response.ok) {
        return response.json();
      }
    } catch {
      // Ignore and continue to fallback path.
    }
  }

  throw new Error("Catalog request failed.");
}

function applySelectedSearchFromPage() {
  const selected = pageParams().get("selected");
  const selectedGuide = guides.find((guide) => guide.id === selected);
  if (selectedGuide) {
    search.value = selectedGuide.title;
  }
}

function populateFilters() {
  populateFilter(languageFilter, uniqueSorted(guides.map((guide) => guide.language)), t("browse.allLanguages"));
  populateFilter(classFilter, uniqueSorted(guides.flatMap((guide) => guide.classTags || [])), t("browse.allClasses"));
  populateFilter(modFilter, uniqueSorted(guides.flatMap((guide) => guide.requiredMods || [])), t("browse.allMods"));
}

async function loadCatalog() {
  const catalog = await fetchCatalog();
  guides = catalog.guides || [];
  populateFilters();
  applySelectedSearchFromPage();
  render();
}

search.addEventListener("input", render);
languageFilter.addEventListener("change", render);
classFilter.addEventListener("change", render);
modFilter.addEventListener("change", render);
sortFilter.addEventListener("change", render);

loadCatalog().catch((error) => {
  list.textContent = error.message;
});

site?.onChange?.(() => {
  populateFilters();
  render();
});
