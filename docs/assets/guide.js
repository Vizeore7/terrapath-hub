const guidePage = document.querySelector("#guidePage");
const guidePageStatus = document.querySelector("#guidePageStatus");
const rawGuideLink = document.querySelector("#rawGuideLink");
const backToBrowse = document.querySelector("#backToBrowse");
const site = window.terraPathSite;
const progression = window.terraPathProgression;

const GROUPS = [
  { key: "weapon", en: "Weapons", ru: "Оружие", cats: ["weapon"] },
  { key: "armor", en: "Armor", ru: "Броня", cats: ["armor"] },
  { key: "accessory", en: "Accessories", ru: "Аксессуары", cats: ["accessory"] },
  { key: "buff", en: "Buffs / Consumables", ru: "Баффы / Расходники", cats: ["buff", "ammo"] },
  { key: "material", en: "Materials / Ores", ru: "Материалы / Руды", cats: ["material", "ore"] },
  { key: "tool", en: "Tools / Utility", ru: "Инструменты / Утилити", cats: ["tool", "mount", "pet", "furniture"] },
  { key: "other", en: "Other", ru: "Другое", cats: ["other"] }
];

const supportIndex = { itemMap: new Map(), bossMap: new Map() };
let currentGuide = null;

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(label) {
  return String(label || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function language() {
  return site?.getLanguage?.() === "ru" ? "ru" : "en";
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
  return labels[tag]?.[language()] || tag;
}

function groupLabel(category) {
  const group = GROUPS.find((entry) => entry.key === category) || GROUPS.find((entry) => entry.cats.includes(category));
  return group?.[language()] || group?.en || category;
}

function params() {
  return new URLSearchParams(window.location.search);
}

function repoAwarePaths(path) {
  return [path, `../${path}`];
}

function preferredPath(path) {
  return window.location.protocol === "file:" ? `../${path}` : path;
}

async function fetchJson(path) {
  for (const attempt of repoAwarePaths(path)) {
    try {
      const response = await fetch(attempt, { cache: "no-store" });
      if (response.ok) {
        return response.json();
      }
    } catch {}
  }
  throw new Error(`Could not load ${path}`);
}

async function loadCatalog() {
  return fetchJson("catalog/index.json");
}

async function tryLoadSupport(modName) {
  const files = [
    { path: `supported/${modName}/items.json`, key: "items", target: supportIndex.itemMap },
    { path: `supported/${modName}/ores.json`, key: "ores", target: supportIndex.itemMap },
    { path: `supported/${modName}/bosses.json`, key: "bosses", target: supportIndex.bossMap }
  ];

  for (const file of files) {
    try {
      const data = await fetchJson(file.path);
      for (const entry of data[file.key] || []) {
        file.target.set(entry.id, entry);
      }
    } catch {}
  }
}

function resolveName(contentId, map) {
  const entry = map.get(contentId);
  if (entry?.displayName) {
    return entry.displayName;
  }
  return String(contentId || "").split("/").pop() || contentId;
}

function iconMarkup(entry, label, kind = "item") {
  if (entry?.icon) {
    const className = kind === "boss" ? "content-icon content-icon--boss" : "content-icon";
    return `<img class="${className}" src="${escapeHtml(entry.icon)}" alt="${escapeHtml(label)}" loading="lazy">`;
  }
  return `<span class="content-token">${escapeHtml(initials(label))}</span>`;
}

function chip(contentId, map) {
  const entry = map.get(contentId);
  const label = resolveName(contentId, map);
  return `<div class="content-chip"><span class="content-chip__media">${iconMarkup(entry, label, "boss")}</span><span>${escapeHtml(label)}</span></div>`;
}

function renderItemGroups(items) {
  if (!(items || []).length) {
    return `<p class="empty-state">${escapeHtml(t("guide.noItems"))}</p>`;
  }

  return GROUPS.map((group) => {
    const entries = (items || []).filter((entry) => group.cats.includes(entry.category || "other"));
    if (!entries.length) {
      return "";
    }

    return `
      <section class="category-block">
        <h4>${escapeHtml(groupLabel(group.key))}</h4>
        <div class="content-grid">
          ${entries.map((entry) => {
            const label = resolveName(entry.itemId, supportIndex.itemMap);
            const supportEntry = supportIndex.itemMap.get(entry.itemId);
            return `
              <article class="content-card">
                <div class="content-card__head">
                  <span class="content-card__media">${iconMarkup(supportEntry, label)}</span>
                  <div>
                    <strong>${escapeHtml(label)}</strong>
                  </div>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderProgressionMarkers(stage) {
  const markerIds = stage.progressionMarkers || [];
  if (!markerIds.length) {
    return "";
  }

  return `
    <section class="preview-block">
      <h4>${escapeHtml(t("common.labelMarkers"))}</h4>
      <div class="marker-preview-grid">
        ${markerIds.map((markerId) => {
          const marker = progression?.getMarker?.(markerId);
          if (!marker) {
            return "";
          }
          return `
            <article class="marker-preview-card">
              <img class="content-icon" src="${escapeHtml(marker.icon)}" alt="${escapeHtml(progression.markerTitle(markerId, language()))}" loading="lazy">
              <div>
                <strong>${escapeHtml(progression.markerTitle(markerId, language()))}</strong>
                <p>${escapeHtml(progression.markerDescription(markerId, language()))}</p>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderGuide(guide) {
  const metaPills = [
    `${t("common.labelClass")}: ${(guide.classTags || []).map(classLabel).join(", ")}`,
    `${t("common.labelLanguage")}: ${guideLanguageLabel(guide.language)}`,
    `${t("common.labelMods")}: ${(guide.requiredMods || []).join(", ")}`,
    `${(guide.stages || []).length} ${t("common.labelStages").toLowerCase()}`
  ];

  guidePage.innerHTML = `
    <header class="guide-preview__header">
      <h1 class="guide-title">${escapeHtml(guide.title)}</h1>
      <p>${escapeHtml(guide.summary || "")}</p>
      <div class="chip-row">
        ${metaPills.map((pill) => `<span class="meta-pill">${escapeHtml(pill)}</span>`).join("")}
      </div>
    </header>
    <div class="guide-preview__stages">
      ${(guide.stages || []).map((stage) => `
        <article class="stage-preview">
          <div class="stage-preview__header">
            <h3>${escapeHtml(stage.title)}</h3>
            <span class="meta-pill">${escapeHtml(t("guide.itemPicks", { count: (stage.items || []).length }))}</span>
          </div>
          <div class="chip-row">
            <span class="meta-pill">${escapeHtml(t("common.labelEra"))}: ${escapeHtml(progression?.eraLabel?.(stage.era || "prehardmode", language()) || stage.era || "")}</span>
          </div>
          ${stage.description ? `<p>${escapeHtml(stage.description)}</p>` : ""}
          ${renderProgressionMarkers(stage)}
          ${stage.bossRefs?.length ? `
            <section class="preview-block">
              <h4>${escapeHtml(t("common.labelBosses"))}</h4>
              <div class="chip-row">
                ${stage.bossRefs.map((bossRef) => chip(bossRef, supportIndex.bossMap)).join("")}
              </div>
            </section>
          ` : ""}
          ${renderItemGroups(stage.items)}
        </article>
      `).join("")}
    </div>
  `;
}

async function init() {
  const id = params().get("id");
  const catalog = await loadCatalog();
  const catalogEntry = (catalog.guides || []).find((guide) => guide.id === id) || catalog.guides?.[0];

  if (!catalogEntry) {
    guidePageStatus.textContent = t("guide.noGuides");
    rawGuideLink.hidden = true;
    return;
  }

  for (const modName of catalogEntry.requiredMods || []) {
    await tryLoadSupport(modName);
  }

  const guide = await fetchJson(catalogEntry.path);
  currentGuide = guide;
  rawGuideLink.href = preferredPath(catalogEntry.path);
  backToBrowse.href = id ? `browse.html?selected=${encodeURIComponent(id)}` : "browse.html";
  guidePageStatus.textContent = "";
  renderGuide(guide);
}

init().catch((error) => {
  guidePageStatus.textContent = error.message;
  rawGuideLink.hidden = true;
  console.error(error);
});

site?.onChange?.(() => {
  if (currentGuide) {
    renderGuide(currentGuide);
  }
});
