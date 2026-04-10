const guidePage = document.querySelector("#guidePage");
const guidePageStatus = document.querySelector("#guidePageStatus");
const rawGuideLink = document.querySelector("#rawGuideLink");
const backToBrowse = document.querySelector("#backToBrowse");
const site = window.terraPathSite;
const progression = window.terraPathProgression;

const GROUPS = [
  { key: "weapon", cats: ["weapon"], en: "Weapons", ru: "\u041e\u0440\u0443\u0436\u0438\u0435" },
  { key: "armor", cats: ["armor"], en: "Armor sets", ru: "\u041a\u043e\u043c\u043f\u043b\u0435\u043a\u0442\u044b \u0431\u0440\u043e\u043d\u0438" },
  { key: "accessory", cats: ["accessory"], en: "Accessories", ru: "\u0410\u043a\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u044b" },
  { key: "buff", cats: ["buff", "ammo"], en: "Buffs / Consumables", ru: "\u0411\u0430\u0444\u0444\u044b / \u0420\u0430\u0441\u0445\u043e\u0434\u043d\u0438\u043a\u0438" }
];

const ERA_IDS = ["prehardmode", "hardmode", "postmoonlord"];

const ARMOR_SET_ALIASES = [
  { id: "Terraria/WoodHelmet", internalName: "WoodHelmet", displayName: "Wood armor set", displayNameRu: "\u0414\u0435\u0440\u0435\u0432\u044f\u043d\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/CopperHelmet", internalName: "CopperHelmet", displayName: "Copper armor set", displayNameRu: "\u041c\u0435\u0434\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/TinHelmet", internalName: "TinHelmet", displayName: "Tin armor set", displayNameRu: "\u041e\u043b\u043e\u0432\u044f\u043d\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/IronHelmet", internalName: "IronHelmet", displayName: "Iron armor set", displayNameRu: "\u0416\u0435\u043b\u0435\u0437\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/LeadHelmet", internalName: "LeadHelmet", displayName: "Lead armor set", displayNameRu: "\u0421\u0432\u0438\u043d\u0446\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/SilverHelmet", internalName: "SilverHelmet", displayName: "Silver armor set", displayNameRu: "\u0421\u0435\u0440\u0435\u0431\u0440\u044f\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/TungstenHelmet", internalName: "TungstenHelmet", displayName: "Tungsten armor set", displayNameRu: "\u0412\u043e\u043b\u044c\u0444\u0440\u0430\u043c\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/GoldHelmet", internalName: "GoldHelmet", displayName: "Gold armor set", displayNameRu: "\u0417\u043e\u043b\u043e\u0442\u043e\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/PlatinumHelmet", internalName: "PlatinumHelmet", displayName: "Platinum armor set", displayNameRu: "\u041f\u043b\u0430\u0442\u0438\u043d\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/CactusHelmet", internalName: "CactusHelmet", displayName: "Cactus armor set", displayNameRu: "\u041a\u0430\u043a\u0442\u0443\u0441\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/ShadowHelmet", internalName: "ShadowHelmet", displayName: "Shadow armor set", displayNameRu: "\u0422\u0435\u043d\u0435\u0432\u043e\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/CrimsonHelmet", internalName: "CrimsonHelmet", displayName: "Crimson armor set", displayNameRu: "\u041a\u0440\u0438\u043c\u0437\u043e\u043d\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/MeteorHelmet", internalName: "MeteorHelmet", displayName: "Meteor armor set", displayNameRu: "\u041c\u0435\u0442\u0435\u043e\u0440\u0438\u0442\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/MoltenHelmet", internalName: "MoltenHelmet", displayName: "Molten armor set", displayNameRu: "\u0420\u0430\u0441\u043f\u043b\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/NecroHelmet", internalName: "NecroHelmet", displayName: "Necro armor set", displayNameRu: "\u041d\u0435\u043a\u0440\u043e-\u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442" },
  { id: "Terraria/JungleHat", internalName: "JungleHat", displayName: "Jungle armor set", displayNameRu: "\u041a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0434\u0436\u0443\u043d\u0433\u043b\u0435\u0439" },
  { id: "Terraria/BeeHeadgear", internalName: "BeeHeadgear", displayName: "Bee armor set", displayNameRu: "\u041f\u0447\u0435\u043b\u0438\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/ObsidianHelm", internalName: "ObsidianHelm", displayName: "Obsidian armor set", displayNameRu: "\u041e\u0431\u0441\u0438\u0434\u0438\u0430\u043d\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/CobaltHelmet", internalName: "CobaltHelmet", displayName: "Cobalt armor set", displayNameRu: "\u041a\u043e\u0431\u0430\u043b\u044c\u0442\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/PalladiumHelmet", internalName: "PalladiumHelmet", displayName: "Palladium armor set", displayNameRu: "\u041f\u0430\u043b\u043b\u0430\u0434\u0438\u0435\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/MythrilHelmet", internalName: "MythrilHelmet", displayName: "Mythril armor set", displayNameRu: "\u041c\u0438\u0444\u0440\u0438\u043b\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/OrichalcumHelmet", internalName: "OrichalcumHelmet", displayName: "Orichalcum armor set", displayNameRu: "\u041e\u0440\u0438\u0445\u0430\u043b\u043a\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/AdamantiteHelmet", internalName: "AdamantiteHelmet", displayName: "Adamantite armor set", displayNameRu: "\u0410\u0434\u0430\u043c\u0430\u043d\u0442\u0438\u0442\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/TitaniumHelmet", internalName: "TitaniumHelmet", displayName: "Titanium armor set", displayNameRu: "\u0422\u0438\u0442\u0430\u043d\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/HallowedHelmet", internalName: "HallowedHelmet", displayName: "Hallowed armor set", displayNameRu: "\u0421\u0432\u044f\u0449\u0435\u043d\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/ChlorophyteHelmet", internalName: "ChlorophyteHelmet", displayName: "Chlorophyte armor set", displayNameRu: "\u0425\u043b\u043e\u0440\u043e\u0444\u0438\u0442\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/TurtleHelmet", internalName: "TurtleHelmet", displayName: "Turtle armor set", displayNameRu: "\u0427\u0435\u0440\u0435\u043f\u0430\u0448\u0438\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/BeetleHelmet", internalName: "BeetleHelmet", displayName: "Beetle armor set", displayNameRu: "\u0416\u0443\u043a\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/SpectreHood", internalName: "SpectreHood", displayName: "Spectre armor set", displayNameRu: "\u0421\u043f\u0435\u043a\u0442\u0440\u0430\u043b\u044c\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/ShroomiteHeadgear", internalName: "ShroomiteHeadgear", displayName: "Shroomite armor set", displayNameRu: "\u0428\u0440\u0443\u043c\u0438\u0442\u043e\u0432\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/TikiMask", internalName: "TikiMask", displayName: "Tiki armor set", displayNameRu: "\u0422\u0438\u043a\u0438-\u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442" },
  { id: "Terraria/SpookyHelmet", internalName: "SpookyHelmet", displayName: "Spooky armor set", displayNameRu: "\u041f\u0443\u0433\u0430\u044e\u0449\u0438\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/SolarFlareHelmet", internalName: "SolarFlareHelmet", displayName: "Solar Flare armor set", displayNameRu: "\u0421\u043e\u043b\u043d\u0435\u0447\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/VortexHelmet", internalName: "VortexHelmet", displayName: "Vortex armor set", displayNameRu: "\u0412\u0438\u0445\u0440\u0435\u0432\u043e\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/NebulaHelmet", internalName: "NebulaHelmet", displayName: "Nebula armor set", displayNameRu: "\u0422\u0443\u043c\u0430\u043d\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" },
  { id: "Terraria/StardustHelmet", internalName: "StardustHelmet", displayName: "Stardust armor set", displayNameRu: "\u0417\u0432\u0435\u0437\u0434\u043d\u044b\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0442 \u0431\u0440\u043e\u043d\u0438" }
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

function eraLabel(eraId) {
  return progression?.eraLabel?.(eraId, language()) || eraId;
}

function supportSearchIcon(internalName) {
  return `assets/icons/terraria/search-items/${String(internalName || "").toLowerCase()}.png`;
}

function applySupportEnhancements() {
  ARMOR_SET_ALIASES.forEach((alias) => {
    const previous = supportIndex.itemMap.get(alias.id) || {};
    supportIndex.itemMap.set(alias.id, {
      ...previous,
      ...alias,
      icon: previous.icon || alias.icon || supportSearchIcon(alias.internalName)
    });
  });
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

  if (modName === "Terraria") applySupportEnhancements();
}

function resolveName(contentId, map) {
  return localizedDisplayName(map.get(contentId)) || String(contentId || "").split("/").pop() || contentId;
}

function iconMarkup(entry, label, kind = "item") {
  if (entry?.icon) {
    return `<img class="${kind === "boss" ? "content-icon content-icon--boss" : "content-icon"}" src="${escapeHtml(entry.icon)}" alt="${escapeHtml(label)}" title="${escapeHtml(label)}" loading="lazy">`;
  }
  return `<span class="content-token">${escapeHtml(initials(label))}</span>`;
}

function inlineIconMarkup(entry, label, kind = "item") {
  if (entry?.icon) {
    return `<img class="inline-flow-icon ${kind === "boss" ? "inline-flow-icon--boss" : ""}" src="${escapeHtml(entry.icon)}" alt="${escapeHtml(label)}" title="${escapeHtml(label)}" loading="lazy">`;
  }
  return `<span class="inline-flow-token" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${escapeHtml(initials(label).slice(0, 1) || "?")}</span>`;
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
    parts.push(inlineIconMarkup(entry, label, bossEntry ? "boss" : "item"));
    lastIndex = index + match[0].length;
  }

  if (lastIndex < source.length) parts.push(escapeHtml(source.slice(lastIndex)).replace(/\n/g, "<br>"));
  return parts.join("");
}

function renderItemGroups(items) {
  if (!(items || []).length) return `<p class="empty-state">${escapeHtml(t("guide.noItems"))}</p>`;

  const denseItemList = (entries) => `<ul class="wiki-items">${entries.map((entry) => {
    const label = resolveName(entry.itemId, supportIndex.itemMap);
    const supportEntry = supportIndex.itemMap.get(entry.itemId);
    return `<li class="wiki-item"><span class="wiki-item__media">${iconMarkup(supportEntry, label)}</span><span class="wiki-item__label">${escapeHtml(label)}</span></li>`;
  }).join("")}</ul>`;

  return GROUPS.map((group) => {
    const entries = (items || []).filter((entry) => group.cats.includes(entry.category || "other"));
    if (!entries.length) return "";

    if (group.key === "accessory") {
      const subgroupOrder = [];
      entries.forEach((entry) => {
        const subgroup = String(entry.subgroup || "").trim();
        if (!subgroupOrder.includes(subgroup)) subgroupOrder.push(subgroup);
      });

      return `<section class="wiki-group"><h4>${escapeHtml(groupLabel(group.key))}</h4>${subgroupOrder.map((subgroup) => {
        const subgroupEntries = entries.filter((entry) => String(entry.subgroup || "").trim() === subgroup);
        return `<div class="wiki-subgroup">${subgroup ? `<h5>${escapeHtml(subgroup)}</h5>` : ""}${denseItemList(subgroupEntries)}</div>`;
      }).join("")}</section>`;
    }

    return `<section class="wiki-group"><h4>${escapeHtml(groupLabel(group.key))}</h4>${denseItemList(entries)}</section>`;
  }).join("");
}

function stagesByEra(stages) {
  const groups = new Map(ERA_IDS.map((eraId) => [eraId, []]));
  (stages || []).forEach((stage) => {
    const eraId = ERA_IDS.includes(stage.era) ? stage.era : "prehardmode";
    groups.get(eraId).push(stage);
  });
  return ERA_IDS.map((eraId) => ({ eraId, stages: groups.get(eraId) || [] })).filter((entry) => entry.stages.length);
}

function renderBosses(stage) {
  if (!(stage.bossRefs || []).length) return "";
  return `<section class="preview-block"><h4>${escapeHtml(t("common.labelBosses"))}</h4><div class="chip-row">${stage.bossRefs.map((bossRef) => {
    const entry = supportIndex.bossMap.get(bossRef);
    const label = resolveName(bossRef, supportIndex.bossMap);
    return `<div class="content-chip"><span class="content-chip__media">${iconMarkup(entry, label, "boss")}</span><span>${escapeHtml(label)}</span></div>`;
  }).join("")}</div></section>`;
}

function renderStageEntry(stage) {
  return `<article class="guide-substage"><section class="guide-substage__main"><div class="guide-substage__header"><h3>${renderRichText(stage.title)}</h3></div>${stage.description ? `<div class="stage-description">${renderRichText(stage.description)}</div>` : ""}${renderBosses(stage)}</section><section class="guide-substage__loadout">${renderItemGroups(stage.items)}</section></article>`;
}

function renderGuide(guide) {
  const metaPills = [
    `${t("common.labelClass")}: ${(guide.classTags || []).map(classLabel).join(", ")}`,
    `${t("common.labelLanguage")}: ${guideLanguageLabel(guide.language)}`,
    `${t("common.labelMods")}: ${(guide.requiredMods || []).join(", ")}`,
    `${(guide.stages || []).length} ${t("common.labelStages").toLowerCase()}`
  ];

  guidePage.innerHTML = `<header class="guide-reader__header"><h1 class="guide-title">${escapeHtml(guide.title)}</h1><p>${escapeHtml(guide.summary || "")}</p><div class="chip-row">${metaPills.map((pill) => `<span class="meta-pill">${escapeHtml(pill)}</span>`).join("")}</div></header><div class="guide-reader__eras">${stagesByEra(guide.stages).map((eraGroup) => `<section class="guide-era"><header class="guide-era__header"><h2>${escapeHtml(eraLabel(eraGroup.eraId))}</h2></header><div class="guide-era__list">${eraGroup.stages.map(renderStageEntry).join("")}</div></section>`).join("")}</div>`;
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
