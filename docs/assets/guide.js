const guidePage = document.querySelector("#guidePage");
const guidePageStatus = document.querySelector("#guidePageStatus");
const rawGuideLink = document.querySelector("#rawGuideLink");
const backToBrowse = document.querySelector("#backToBrowse");
const site = window.terraPathSite;
const progression = window.terraPathProgression;

const GROUPS = [
  { key: "weapon", cats: ["weapon"], en: "Weapons", ru: "\u041e\u0440\u0443\u0436\u0438\u0435" },
  { key: "armor", cats: ["armor"], en: "Armor", ru: "\u0411\u0440\u043e\u043d\u044f" },
  { key: "accessory", cats: ["accessory"], en: "Accessories", ru: "\u0410\u043a\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u044b" },
  { key: "buff", cats: ["buff", "ammo"], en: "Buffs / Consumables", ru: "\u0411\u0430\u0444\u0444\u044b / \u0420\u0430\u0441\u0445\u043e\u0434\u043d\u0438\u043a\u0438" }
];

const supportIndex = { itemMap: new Map(), bossMap: new Map() };
let currentGuide = null;

function language() {
  return site?.getLanguage?.() === "ru" ? "ru" : "en";
}

function t(key, variables = {}) {
  return site?.t?.(key, variables) ?? key;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(value) {
  return String(value || "?").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function localizedDisplayName(entry) {
  if (!entry) return "";
  return language() === "ru"
    ? (entry.displayNameRu || entry.displayName || entry.internalName || "")
    : (entry.displayName || entry.displayNameRu || entry.internalName || "");
}

function guideLanguageLabel(code) {
  return site?.getGuideLanguageLabel?.(code) ?? code;
}

function classLabel(tag) {
  const labels = {
    melee: { en: "Melee", ru: "\u0412\u043e\u0438\u043d" },
    ranged: { en: "Ranged", ru: "\u0421\u0442\u0440\u0435\u043b\u043e\u043a" },
    magic: { en: "Magic", ru: "\u041c\u0430\u0433" },
    summoner: { en: "Summoner", ru: "\u041f\u0440\u0438\u0437\u044b\u0432\u0430\u0442\u0435\u043b\u044c" },
    rogue: { en: "Rogue", ru: "\u0420\u0430\u0437\u0431\u043e\u0439\u043d\u0438\u043a" },
    bard: { en: "Bard", ru: "\u0411\u0430\u0440\u0434" },
    other: { en: "Other", ru: "\u0414\u0440\u0443\u0433\u043e\u0435" }
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

async function fetchJson(path) {
  for (const attempt of [path, `../${path}`]) {
    try {
      const response = await fetch(attempt, { cache: "no-store" });
      if (response.ok) return response.json();
    } catch {}
  }
  throw new Error(`Could not load ${path}`);
}

async function loadCatalog() {
  return fetchJson("catalog/index.json");
}

async function tryLoadSupport(modName) {
  const files = [
    { path: `supported/${modName}/search-items.json`, key: "items", target: supportIndex.itemMap },
    { path: `supported/${modName}/items.json`, key: "items", target: supportIndex.itemMap },
    { path: `supported/${modName}/ores.json`, key: "ores", target: supportIndex.itemMap },
    { path: `supported/${modName}/bosses.json`, key: "bosses", target: supportIndex.bossMap }
  ];

  for (const file of files) {
    try {
      const data = await fetchJson(file.path);
      for (const entry of data[file.key] || []) {
        file.target.set(entry.id, { ...file.target.get(entry.id), ...entry });
      }
    } catch {}
  }
}

function resolveName(contentId, map) {
  return localizedDisplayName(map.get(contentId)) || String(contentId || "").split("/").pop() || contentId;
}

function iconMarkup(entry, label, kind = "item") {
  if (entry?.icon) {
    return `<img class="${kind === "boss" ? "content-icon content-icon--boss" : "content-icon"}" src="${escapeHtml(entry.icon)}" alt="${escapeHtml(label)}" loading="lazy">`;
  }
  return `<span class="content-token">${escapeHtml(initials(label))}</span>`;
}

function renderRichText(textValue) {
  const tokenPattern = /\{\{icon:([^}]+)\}\}/g;
  const source = String(textValue || "");
  const parts = [];
  let lastIndex = 0;

  for (const match of source.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    const contentId = match[1];
    if (index > lastIndex) parts.push(escapeHtml(source.slice(lastIndex, index)).replace(/\n/g, "<br>"));
    const itemEntry = supportIndex.itemMap.get(contentId);
    const bossEntry = supportIndex.bossMap.get(contentId);
    const entry = itemEntry || bossEntry;
    const label = resolveName(contentId, itemEntry ? supportIndex.itemMap : supportIndex.bossMap);
    parts.push(`<span class="inline-icon-token">${iconMarkup(entry, label, bossEntry ? "boss" : "item")}<span>${escapeHtml(label)}</span></span>`);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < source.length) parts.push(escapeHtml(source.slice(lastIndex)).replace(/\n/g, "<br>"));
  return parts.join("");
}

function renderItemGroups(items) {
  if (!(items || []).length) return `<p class="empty-state">${escapeHtml(t("guide.noItems"))}</p>`;

  return GROUPS.map((group) => {
    const entries = (items || []).filter((entry) => group.cats.includes(entry.category || "other"));
    if (!entries.length) return "";

    if (group.key === "accessory") {
      const subgroupOrder = [];
      entries.forEach((entry) => {
        const subgroup = String(entry.subgroup || "").trim();
        if (!subgroupOrder.includes(subgroup)) subgroupOrder.push(subgroup);
      });

      return `<section class="category-block"><h4>${escapeHtml(groupLabel(group.key))}</h4>${subgroupOrder.map((subgroup) => {
        const subgroupEntries = entries.filter((entry) => String(entry.subgroup || "").trim() === subgroup);
        return `<div class="accessory-subgroup">${subgroup ? `<h5>${escapeHtml(subgroup)}</h5>` : ""}<div class="content-grid">${subgroupEntries.map((entry) => {
          const label = resolveName(entry.itemId, supportIndex.itemMap);
          const supportEntry = supportIndex.itemMap.get(entry.itemId);
          return `<article class="content-card"><div class="content-card__head"><span class="content-card__media">${iconMarkup(supportEntry, label)}</span><div><strong>${escapeHtml(label)}</strong></div></div></article>`;
        }).join("")}</div></div>`;
      }).join("")}</section>`;
    }

    return `<section class="category-block"><h4>${escapeHtml(groupLabel(group.key))}</h4><div class="content-grid">${entries.map((entry) => {
      const label = resolveName(entry.itemId, supportIndex.itemMap);
      const supportEntry = supportIndex.itemMap.get(entry.itemId);
      return `<article class="content-card"><div class="content-card__head"><span class="content-card__media">${iconMarkup(supportEntry, label)}</span><div><strong>${escapeHtml(label)}</strong></div></div></article>`;
    }).join("")}</div></section>`;
  }).join("");
}

function renderSubStages(stage) {
  if (Array.isArray(stage.subStages) && stage.subStages.length) {
    return `<section class="preview-block"><h4>${escapeHtml(language() === "ru" ? "\u041f\u043e\u0434\u044d\u0442\u0430\u043f\u044b" : "Sub-stages")}</h4><div class="substage-preview-list">${stage.subStages.map((subStage) => `<article class="substage-card"><strong>${renderRichText(subStage.title || "")}</strong>${subStage.description ? `<div class="stage-description">${renderRichText(subStage.description)}</div>` : ""}</article>`).join("")}</div></section>`;
  }

  if (!(stage.progressionMarkers || []).length) return "";

  return `<section class="preview-block"><h4>${escapeHtml(t("common.labelMarkers"))}</h4><div class="marker-preview-grid">${stage.progressionMarkers.map((markerId) => {
    const marker = progression?.getMarker?.(markerId);
    if (!marker) return "";
    return `<article class="marker-preview-card"><img class="content-icon" src="${escapeHtml(marker.icon)}" alt="${escapeHtml(progression.markerTitle(markerId, language()))}" loading="lazy"><div><strong>${escapeHtml(progression.markerTitle(markerId, language()))}</strong><p>${escapeHtml(progression.markerDescription(markerId, language()))}</p></div></article>`;
  }).join("")}</div></section>`;
}

function renderBosses(stage) {
  if (!(stage.bossRefs || []).length) return "";
  return `<section class="preview-block"><h4>${escapeHtml(t("common.labelBosses"))}</h4><div class="chip-row">${stage.bossRefs.map((bossRef) => {
    const entry = supportIndex.bossMap.get(bossRef);
    const label = resolveName(bossRef, supportIndex.bossMap);
    return `<div class="content-chip"><span class="content-chip__media">${iconMarkup(entry, label, "boss")}</span><span>${escapeHtml(label)}</span></div>`;
  }).join("")}</div></section>`;
}

function renderGuide(guide) {
  const metaPills = [
    `${t("common.labelClass")}: ${(guide.classTags || []).map(classLabel).join(", ")}`,
    `${t("common.labelLanguage")}: ${guideLanguageLabel(guide.language)}`,
    `${t("common.labelMods")}: ${(guide.requiredMods || []).join(", ")}`,
    `${(guide.stages || []).length} ${t("common.labelStages").toLowerCase()}`
  ];

  guidePage.innerHTML = `<header class="guide-preview__header"><h1 class="guide-title">${escapeHtml(guide.title)}</h1><p>${escapeHtml(guide.summary || "")}</p><div class="chip-row">${metaPills.map((pill) => `<span class="meta-pill">${escapeHtml(pill)}</span>`).join("")}</div></header><div class="guide-preview__stages">${(guide.stages || []).map((stage) => `<article class="stage-preview"><section class="stage-overview"><div class="stage-preview__header"><h3>${renderRichText(stage.title)}</h3><span class="meta-pill">${escapeHtml(t("guide.itemPicks", { count: (stage.items || []).length }))}</span></div><div class="chip-row"><span class="meta-pill">${escapeHtml(t("common.labelEra"))}: ${escapeHtml(progression?.eraLabel?.(stage.era || "prehardmode", language()) || stage.era || "")}</span></div>${stage.description ? `<div class="stage-description">${renderRichText(stage.description)}</div>` : ""}${renderSubStages(stage)}${renderBosses(stage)}</section><section class="stage-loadout">${renderItemGroups(stage.items)}</section></article>`).join("")}</div>`;
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
  rawGuideLink.href = window.location.protocol === "file:" ? `../${catalogEntry.path}` : catalogEntry.path;
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
  if (currentGuide) renderGuide(currentGuide);
});
