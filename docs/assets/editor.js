const site = window.terraPathSite;
const progression = window.terraPathProgression;
const SAVE_KEY = "terrapath-editor-draft-v6";
const LOAD_KEYS = [SAVE_KEY, "terrapath-editor-draft-v5"];

const STEPS = [
  { title: { en: "Guide", ru: "Гайд" }, desc: { en: "Title, author, language, summary, required mods, class tags.", ru: "Название, автор, язык, описание, обязательные моды и класс." } },
  { title: { en: "Stages", ru: "Этапы" }, desc: { en: "Vertical accordion for stages, bosses, items, and notes.", ru: "Вертикальный accordion для этапов, боссов, предметов и заметок." } },
  { title: { en: "Export", ru: "Экспорт" }, desc: { en: "Preview the guide and export guide.json.", ru: "Проверьте гайд и выгрузите guide.json." } }
];

const MODS = [
  { value: "Terraria", label: "Terraria", desc: { en: "Vanilla pickers available.", ru: "Доступны vanilla-подборки." } },
  { value: "CalamityMod", label: "Calamity Mod", desc: { en: "Metadata only.", ru: "Пока только метаданные." } },
  { value: "ThoriumMod", label: "Thorium Mod", desc: { en: "Metadata only.", ru: "Пока только метаданные." } }
];

const CLASSES = [
  { value: "melee", en: "Melee", ru: "Воин" },
  { value: "ranged", en: "Ranged", ru: "Стрелок" },
  { value: "magic", en: "Magic", ru: "Маг" },
  { value: "summoner", en: "Summoner", ru: "Призыватель" },
  { value: "rogue", en: "Rogue", ru: "Разбойник" },
  { value: "bard", en: "Bard", ru: "Бард" },
  { value: "other", en: "Other", ru: "Другое" }
];

const GROUPS = [
  { key: "weapon", cats: ["weapon"], en: "Weapons", ru: "Оружие" },
  { key: "armor", cats: ["armor"], en: "Armor", ru: "Броня" },
  { key: "accessory", cats: ["accessory"], en: "Accessories", ru: "Аксессуары" },
  { key: "buff", cats: ["buff", "ammo"], en: "Buffs / Consumables", ru: "Баффы / Расходники" },
  { key: "material", cats: ["material", "ore"], en: "Materials / Ores", ru: "Материалы / Руды" },
  { key: "tool", cats: ["tool", "mount", "pet", "furniture"], en: "Tools / Utility", ru: "Инструменты / Утилити" },
  { key: "other", cats: ["other"], en: "Other", ru: "Другое" }
];

const COPY = {
  en: {
    previewHeading: "Preview",
    supportLoading: "Loading curated Terraria content...",
    supportLoaded: "Vanilla pickers ready: {items} item and ore entries, {bosses} boss entries.",
    supportFailed: "Curated Terraria data could not be loaded.",
    addBoss: "Add boss",
    chooseBoss: "Choose boss",
    noBosses: "No bosses added.",
    noItems: "No items added.",
    chooseItem: "Choose item",
    notePlaceholder: "Optional note",
    stage: "Stage",
    stageTitle: "Stage title",
    era: "Main era",
    description: "Description",
    descriptionPlaceholder: "Short description for this stage.",
    notes: "Notes",
    notesPlaceholder: "Optional reminders or route notes.",
    markers: "Mini-stage markers",
    bosses: "Bosses",
    items: "Items",
    itemCount: "{count} items",
    up: "Up",
    down: "Down",
    delete: "Delete",
    remove: "Remove",
    resetConfirm: "Reset the current draft?",
    copied: "guide.json copied.",
    selected: "Clipboard is unavailable. The JSON preview was selected.",
    issueOpened: "GitHub opened in a new tab.",
    repoUnknown: "Repository URL could not be detected here.",
    draftReset: "Draft reset.",
    noItemsPreview: "No item picks added for this stage."
  },
  ru: {
    previewHeading: "Предпросмотр",
    supportLoading: "Загрузка curated Terraria-контента...",
    supportLoaded: "Vanilla-подборки готовы: {items} записей предметов и руд, {bosses} записей боссов.",
    supportFailed: "Не удалось загрузить curated Terraria-данные.",
    addBoss: "Добавить босса",
    chooseBoss: "Выберите босса",
    noBosses: "Боссы не добавлены.",
    noItems: "Предметы не добавлены.",
    chooseItem: "Выберите предмет",
    notePlaceholder: "Необязательная заметка",
    stage: "Этап",
    stageTitle: "Название этапа",
    era: "Основной этап игры",
    description: "Описание",
    descriptionPlaceholder: "Короткое описание этого этапа.",
    notes: "Заметки",
    notesPlaceholder: "Необязательные подсказки и напоминания.",
    markers: "Мини-этапы",
    bosses: "Боссы",
    items: "Предметы",
    itemCount: "{count} предметов",
    up: "Выше",
    down: "Ниже",
    delete: "Удалить этап",
    remove: "Удалить",
    resetConfirm: "Сбросить текущий черновик?",
    copied: "guide.json скопирован.",
    selected: "Буфер обмена недоступен. JSON выделен для ручного копирования.",
    issueOpened: "GitHub открыт в новой вкладке.",
    repoUnknown: "Не удалось определить URL репозитория.",
    draftReset: "Черновик сброшен.",
    noItemsPreview: "Для этого этапа пока нет предметов."
  }
};

const $ = (selector) => document.querySelector(selector);
const refs = {
  support: $("#supportStatus"),
  steps: $("#wizardSteps"),
  eyebrow: $("#stepEyebrow"),
  title: $("#stepTitle"),
  desc: $("#stepDescription"),
  panels: [...document.querySelectorAll("[data-step-panel]")],
  titleInput: $("#titleInput"),
  authorInput: $("#authorInput"),
  language: $("#languageSelect"),
  summary: $("#summaryInput"),
  mods: $("#requiredModOptions"),
  classes: $("#classTagOptions"),
  addStage: $("#addStageButton"),
  accordion: $("#stageAccordion"),
  copy: $("#copyJsonButton"),
  download: $("#downloadButton"),
  issue: $("#openIssueButton"),
  reset: $("#resetDraftButton"),
  submission: $("#submissionStatus"),
  preview: $("#guidePreview"),
  json: $("#jsonPreview"),
  prev: $("#prevStepButton"),
  next: $("#nextStepButton"),
  autosave: $("#autosaveStatus")
};

let step = 0;
let openStage = 0;
let latestJson = "{}\n";
let lastSavedAt = null;
let supportState = "loading";
let support = { items: [], bosses: [], itemMap: new Map(), bossMap: new Map() };
let state = loadDraft() || sampleState();

function lang() { return site?.getLanguage?.() === "ru" ? "ru" : "en"; }
function s(key, vars = {}) { return String(COPY[lang()][key] || COPY.en[key] || key).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? "")); }
function t(key, vars = {}) { return site?.t?.(key, vars) ?? key; }
function esc(value) { return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#039;"); }
function uniq(values) { return [...new Set((values || []).filter(Boolean))]; }
function split(value) { return String(value || "").split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean); }
function slug(value) { return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "guide"; }
function today() { return new Date().toISOString().slice(0, 10); }
function timeLabel() { return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date()); }
function pickLabel(id, map) { return map.get(id)?.displayName || String(id || "").split("/").pop() || ""; }
function initials(value) { return String(value || "?").split(/\s+/).slice(0, 2).map((entry) => entry[0] || "").join("").toUpperCase(); }
function cls(value) { const entry = CLASSES.find((item) => item.value === value); return entry ? entry[lang()] : value; }
function group(value) { return GROUPS.find((entry) => entry.cats.includes(value)) || GROUPS[GROUPS.length - 1]; }
function groupLabel(key) { const entry = GROUPS.find((item) => item.key === key) || GROUPS[0]; return entry[lang()]; }
function classList(values) { return (values || []).map(cls).join(", "); }
function guideLang(value) { return site?.getGuideLanguageLabel?.(value) ?? value; }
function icon(entry, label, boss = false) { return entry?.icon ? `<img class="content-icon ${boss ? "content-icon--boss" : ""}" src="${esc(entry.icon)}" alt="${esc(label)}" loading="lazy">` : `<span class="content-token">${esc(initials(label))}</span>`; }

function item(seed = {}) { return { itemId: seed.itemId || "", category: seed.category || "weapon", note: seed.note || "" }; }
function stageModel(seed = {}) {
  return {
    title: seed.title || s("stage"),
    era: seed.era || "prehardmode",
    progressionMarkers: [...(seed.progressionMarkers || [])],
    description: seed.description || "",
    notesText: seed.notesText || ((seed.notes || []).join("\n")),
    bossRefs: [...(seed.bossRefs || [])],
    items: Array.isArray(seed.items) ? seed.items.map(item) : []
  };
}

function sampleState() {
  return {
    createdAt: today(),
    title: "Vanilla Melee Starter Path",
    author: "TerraPath Team",
    language: "en-US",
    requiredMods: ["Terraria"],
    classTags: ["melee"],
    guideTags: [],
    summary: "A simple vanilla melee progression guide.",
    stages: [
      stageModel({
        title: "First Night",
        era: "prehardmode",
        progressionMarkers: ["early-exploration", "pre-eye-of-cthulhu"],
        description: "Collect movement items, prepare a basic arena, and secure a reliable early weapon.",
        notes: ["This is an example draft."],
        bossRefs: ["Terraria/EyeofCthulhu"],
        items: [
          { itemId: "Terraria/EnchantedBoomerang", category: "weapon", note: "Safe early ranged melee option." },
          { itemId: "Terraria/CloudinaBottle", category: "accessory", note: "Early mobility matters." }
        ]
      })
    ]
  };
}

function normalize(raw) {
  if (!raw || typeof raw !== "object") return sampleState();
  return {
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : today(),
    title: String(raw.title || ""),
    author: String(raw.author || ""),
    language: String(raw.language || "en-US"),
    requiredMods: uniq(Array.isArray(raw.requiredMods) ? raw.requiredMods : ["Terraria"]),
    classTags: uniq(Array.isArray(raw.classTags) ? raw.classTags : ["other"]),
    guideTags: uniq(Array.isArray(raw.guideTags) ? raw.guideTags : []),
    summary: String(raw.summary || ""),
    stages: Array.isArray(raw.stages) && raw.stages.length ? raw.stages.map(stageModel) : [stageModel()]
  };
}

function loadDraft() {
  for (const key of LOAD_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return normalize(JSON.parse(raw));
    } catch {}
  }
  return null;
}

function saveDraft() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  lastSavedAt = timeLabel();
}

function renderStatus() {
  refs.support.textContent =
    supportState === "loaded"
      ? s("supportLoaded", { items: support.items.length, bosses: support.bosses.length })
      : supportState === "failed"
        ? s("supportFailed")
        : s("supportLoading");
}

function choiceCard(option, selected, groupName) {
  return `<label class="choice-card"><input type="checkbox" value="${esc(option.value)}" data-choice-group="${groupName}" ${selected.includes(option.value) ? "checked" : ""}><span class="choice-card__copy"><strong class="choice-card__title">${esc(option.label || option[lang()])}</strong>${option.desc ? `<span class="choice-card__description">${esc(option.desc[lang()] || option.desc.en)}</span>` : ""}</span></label>`;
}

function selectOptions(entries, value, placeholder) {
  let html = `<option value="">${esc(placeholder)}</option>`;
  const sorted = [...entries].sort((left, right) => left.displayName.localeCompare(right.displayName));
  if (value && !sorted.some((entry) => entry.id === value)) {
    html += `<option value="${esc(value)}" selected>${esc(value)}</option>`;
  }
  return html + sorted.map((entry) => `<option value="${esc(entry.id)}" ${entry.id === value ? "selected" : ""}>${esc(entry.displayName)}</option>`).join("");
}

function buildGuide() {
  const used = new Map();
  const stages = state.stages.map((stage, index) => {
    const title = stage.title.trim() || `${s("stage")} ${index + 1}`;
    const base = slug(title).slice(0, 40) || `stage-${index + 1}`;
    const count = used.get(base) || 0;
    used.set(base, count + 1);

    const output = {
      id: count ? `${base}-${count + 1}`.slice(0, 40) : base,
      title,
      era: stage.era || "prehardmode",
      items: (stage.items || [])
        .filter((itemEntry) => itemEntry.itemId)
        .map((itemEntry) => ({
          itemId: itemEntry.itemId,
          category: itemEntry.category || "other"
        }))
    };

    if (stage.description.trim()) output.description = stage.description.trim();
    const markers = uniq(stage.progressionMarkers || []);
    if (markers.length) output.progressionMarkers = markers;
    const bosses = uniq((stage.bossRefs || []).map((entry) => String(entry || "").trim()).filter(Boolean));
    if (bosses.length) output.bossRefs = bosses;
    return output;
  });

  const guide = {
    schemaVersion: 1,
    id: slug(`${state.requiredMods[0] || "guide"}-${state.classTags[0] || "path"}-${state.title}`),
    title: state.title.trim() || "Untitled Guide",
    author: state.author.trim() || "Unknown Author",
    language: state.language || "en-US",
    summary: state.summary.trim() || "",
    requiredMods: state.requiredMods.length ? state.requiredMods : ["Terraria"],
    classTags: state.classTags.length ? state.classTags : ["other"],
    createdAt: state.createdAt,
    updatedAt: today(),
    stages
  };

  if (state.guideTags.length) guide.guideTags = [...state.guideTags];
  return guide;
}

function ready(index) {
  if (index === 0) {
    return Boolean(state.title.trim() && state.author.trim() && state.summary.trim() && state.requiredMods.length && state.classTags.length);
  }
  if (index === 1) {
    return state.stages.some((entry) => entry.title.trim());
  }
  return ready(0) && ready(1);
}

function open(index) {
  step = Math.max(0, Math.min(STEPS.length - 1, index));
  renderAll();
}

function move(offset) {
  open(step + offset);
}

function previewGroups(items) {
  const blocks = GROUPS.map((entry) => {
    const rows = (items || []).filter((itemEntry) => entry.cats.includes(itemEntry.category || "other"));
    if (!rows.length) return "";

    return `<section class="category-block"><h4>${esc(entry[lang()])}</h4><div class="content-grid">${rows.map((itemEntry) => {
      const iconEntry = support.itemMap.get(itemEntry.itemId);
      const label = pickLabel(itemEntry.itemId, support.itemMap);
      return `<article class="content-card"><div class="content-card__head"><span class="content-card__media">${icon(iconEntry, label)}</span><div><strong>${esc(label)}</strong></div></div></article>`;
    }).join("")}</div></section>`;
  }).filter(Boolean);

  return blocks.join("") || `<p class="empty-state">${esc(s("noItemsPreview"))}</p>`;
}

function previewMarkers(stage) {
  if (!stage.progressionMarkers?.length) return "";
  return `<section class="preview-block"><h4>${esc(t("common.labelMarkers"))}</h4><div class="marker-preview-grid">${stage.progressionMarkers.map((id) => {
    const marker = progression?.getMarker?.(id);
    if (!marker) return "";
    return `<article class="marker-preview-card"><img class="content-icon" src="${esc(marker.icon)}" alt="${esc(marker.title?.[lang()] || marker.title?.en || id)}" loading="lazy"><div><strong>${esc(marker.title?.[lang()] || marker.title?.en || id)}</strong><p>${esc(marker.description?.[lang()] || marker.description?.en || "")}</p></div></article>`;
  }).join("")}</div></section>`;
}

function previewBosses(stage) {
  if (!stage.bossRefs?.length) return "";
  return `<section class="preview-block"><h4>${esc(t("common.labelBosses"))}</h4><div class="chip-row">${stage.bossRefs.map((id) => {
    const entry = support.bossMap.get(id);
    const label = pickLabel(id, support.bossMap);
    return `<div class="content-chip"><span class="content-chip__media">${icon(entry, label, true)}</span><span>${esc(label)}</span></div>`;
  }).join("")}</div></section>`;
}

function renderPreview() {
  const guide = buildGuide();
  latestJson = `${JSON.stringify(guide, null, 2)}\n`;
  refs.json.textContent = latestJson;
  refs.preview.innerHTML = `<header class="guide-preview__header"><h2 class="guide-title">${esc(guide.title)}</h2><p>${esc(guide.summary)}</p><div class="chip-row"><span class="meta-pill">${esc(`${t("common.labelClass")}: ${classList(guide.classTags)}`)}</span><span class="meta-pill">${esc(`${t("common.labelLanguage")}: ${guideLang(guide.language)}`)}</span><span class="meta-pill">${esc(`${t("common.labelMods")}: ${(guide.requiredMods || []).join(", ")}`)}</span><span class="meta-pill">${esc(`${guide.stages.length} ${t("common.labelStages").toLowerCase()}`)}</span></div></header><div class="guide-preview__stages">${guide.stages.map((stage) => `<article class="stage-preview"><div class="stage-preview__header"><h3>${esc(stage.title)}</h3><span class="meta-pill">${esc(s("itemCount", { count: (stage.items || []).length }))}</span></div><div class="chip-row"><span class="meta-pill">${esc(`${t("common.labelEra")}: ${progression?.eraLabel?.(stage.era, lang()) || stage.era}`)}</span></div>${stage.description ? `<p>${esc(stage.description)}</p>` : ""}${previewMarkers(stage)}${previewBosses(stage)}${previewGroups(stage.items)}</article>`).join("")}</div>`;
}

function bossRows(stage, stageIndex) {
  if (!stage.bossRefs.length) return `<p class="empty-state">${esc(s("noBosses"))}</p>`;
  return stage.bossRefs.map((id, bossIndex) => {
    const entry = support.bossMap.get(id);
    const label = pickLabel(id, support.bossMap);
    return `<div class="picker-row boss-row"><span class="picker-row__media">${icon(entry, label, true)}</span><select data-role="boss-id" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">${selectOptions(support.bosses, id, s("chooseBoss"))}</select><button class="button button--quiet button--tiny" type="button" data-action="remove-boss" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">${esc(s("remove"))}</button></div>`;
  }).join("");
}

function itemGroupRows(stage, stageIndex, groupEntry) {
  const rows = [];
  (stage.items || []).forEach((itemEntry, itemIndex) => {
    if (groupEntry.cats.includes(itemEntry.category || "other")) rows.push({ itemEntry, itemIndex });
  });
  const entries = support.items.filter((itemEntry) => groupEntry.cats.includes(itemEntry.category || "other") && !itemEntry.pickerHidden);

  return `<section class="item-group"><div class="item-group__header"><h4>${esc(groupEntry[lang()])}</h4><button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${stageIndex}" data-group-key="${esc(groupEntry.key)}">+</button></div>${rows.length ? rows.map(({ itemEntry, itemIndex }) => {
    const entry = support.itemMap.get(itemEntry.itemId);
    const label = pickLabel(itemEntry.itemId, support.itemMap);
    return `<div class="picker-row item-row"><span class="picker-row__media">${icon(entry, label)}</span><select data-role="item-id" data-stage-index="${stageIndex}" data-item-index="${itemIndex}" data-group-key="${esc(groupEntry.key)}">${selectOptions(entries, itemEntry.itemId, s("chooseItem"))}</select><button class="button button--quiet button--tiny" type="button" data-action="remove-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">${esc(s("remove"))}</button></div>`;
  }).join("") : `<p class="empty-state">${esc(s("noItems"))}</p>`}</section>`;
}

function stageBody(stage, stageIndex) {
  const markers = (progression?.markersForEra?.(stage.era || "prehardmode") || []).map((marker) => {
    const selected = (stage.progressionMarkers || []).includes(marker.id);
    return `<button class="marker-card ${selected ? "marker-card--selected" : ""}" type="button" data-action="toggle-marker" data-stage-index="${stageIndex}" data-marker-id="${esc(marker.id)}"><img class="content-icon" src="${esc(marker.icon)}" alt="${esc(marker.title?.[lang()] || marker.title?.en || marker.id)}" loading="lazy"><span class="marker-card__body"><strong>${esc(marker.title?.[lang()] || marker.title?.en || marker.id)}</strong><span>${esc(marker.description?.[lang()] || marker.description?.en || "")}</span></span></button>`;
  }).join("");

  return `<div class="field-grid"><label class="field"><span>${esc(s("stageTitle"))}</span><input data-role="stage-title" data-stage-index="${stageIndex}" value="${esc(stage.title)}"></label><label class="field"><span>${esc(s("era"))}</span><select data-role="stage-era" data-stage-index="${stageIndex}">${(progression?.eras || []).map((era) => `<option value="${esc(era.id)}" ${era.id === stage.era ? "selected" : ""}>${esc(era.label?.[lang()] || era.label?.en || era.id)}</option>`).join("")}</select></label></div><label class="field"><span>${esc(s("description"))}</span><textarea data-role="stage-description" data-stage-index="${stageIndex}" rows="3" placeholder="${esc(s("descriptionPlaceholder"))}">${esc(stage.description)}</textarea></label><section class="stage-section"><div class="section-heading"><h3>${esc(s("markers"))}</h3></div><div class="marker-grid">${markers}</div></section><section class="stage-section"><div class="section-heading section-heading--with-action"><h3>${esc(s("bosses"))}</h3><button class="button button--quiet button--tiny" type="button" data-action="add-boss" data-stage-index="${stageIndex}">${esc(s("addBoss"))}</button></div><div class="stage-stack">${bossRows(stage, stageIndex)}</div></section><section class="stage-section"><div class="section-heading"><h3>${esc(s("items"))}</h3></div><div class="item-group-list">${GROUPS.map((entry) => itemGroupRows(stage, stageIndex, entry)).join("")}</div></section>`;
}

function stageCard(stage, stageIndex) {
  const opened = stageIndex === openStage;
  const eraText = progression?.eraLabel?.(stage.era || "prehardmode", lang()) || stage.era || "";
  const count = (stage.items || []).filter((itemEntry) => itemEntry.itemId).length;
  return `<article class="stage-card ${opened ? "stage-card--open" : ""}"><div class="stage-card__header"><button class="stage-card__toggle" type="button" data-action="toggle-stage" data-stage-index="${stageIndex}"><span class="stage-card__title"><strong>${esc(stage.title || `${s("stage")} ${stageIndex + 1}`)}</strong><span class="muted">${esc(eraText)}</span></span><span class="meta-pill">${esc(s("itemCount", { count }))}</span></button><div class="stage-card__actions"><button class="button button--quiet button--tiny" type="button" data-action="move-stage-up" data-stage-index="${stageIndex}" ${stageIndex === 0 ? "disabled" : ""}>${esc(s("up"))}</button><button class="button button--quiet button--tiny" type="button" data-action="move-stage-down" data-stage-index="${stageIndex}" ${stageIndex === state.stages.length - 1 ? "disabled" : ""}>${esc(s("down"))}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-stage" data-stage-index="${stageIndex}" ${state.stages.length === 1 ? "disabled" : ""}>${esc(s("delete"))}</button></div></div><div class="stage-card__body" ${opened ? "" : "hidden"}>${stageBody(stage, stageIndex)}</div></article>`;
}

function renderSteps() {
  refs.steps.innerHTML = STEPS.map((entry, index) => {
    const stateText = index === step ? (lang() === "ru" ? "Текущий" : "Current") : ready(index) ? (lang() === "ru" ? "Готово" : "Ready") : (lang() === "ru" ? "Не заполнено" : "Pending");
    return `<li class="wizard-step ${index === step ? "wizard-step--current" : ""} ${ready(index) ? "wizard-step--complete" : ""}"><button class="wizard-step__button" type="button" data-step-target="${index}"><span class="wizard-step__count">${index + 1}</span><span class="wizard-step__body"><strong>${esc(entry.title[lang()])}</strong><span>${esc(entry.desc[lang()])}</span></span><span class="wizard-step__state">${esc(stateText)}</span></button></li>`;
  }).join("");
}

function renderMeta() {
  refs.eyebrow.textContent = lang() === "ru" ? `Шаг ${step + 1} из ${STEPS.length}` : `Step ${step + 1} of ${STEPS.length}`;
  refs.title.textContent = STEPS[step].title[lang()];
  refs.desc.textContent = STEPS[step].desc[lang()];
}

function renderPanels() {
  refs.panels.forEach((panel) => {
    panel.hidden = Number(panel.dataset.stepPanel) !== step;
  });
}

function renderEditorText() {
  const map = {
    guideTitleLabel: "editor.guideTitleLabel",
    authorLabel: "editor.authorLabel",
    languageLabel: "editor.guideLanguageLabel",
    summaryLabel: "editor.summaryLabel",
    requiredModsHeading: "editor.requiredModsTitle",
    classTagsHeading: "editor.classTagsTitle",
    addStage: "editor.addStage",
    copyJson: "editor.copyJson",
    downloadJson: "editor.downloadJson",
    openIssue: "editor.openIssue",
    resetDraft: "editor.resetDraft",
    back: "editor.back",
    nextStep: "editor.nextStep",
    autosave: "editor.autosave"
  };

  document.querySelectorAll("[data-editor-text]").forEach((element) => {
    const key = element.dataset.editorText;
    if (key === "previewHeading") {
      element.textContent = s("previewHeading");
    } else if (key === "submissionStatus") {
      element.textContent = t("editor.submissionStatus");
    } else {
      element.textContent = t(map[key]);
    }
  });
}

function renderGuideStep() {
  refs.titleInput.value = state.title;
  refs.authorInput.value = state.author;
  refs.summary.value = state.summary;
  refs.language.innerHTML = `<option value="en-US">${esc(t("common.languageEnglishUs"))}</option><option value="ru-RU">${esc(t("common.languageRussian"))}</option>`;
  refs.language.value = state.language;
  refs.titleInput.placeholder = lang() === "ru" ? "Название гайда" : "Guide title";
  refs.authorInput.placeholder = lang() === "ru" ? "Ваше имя" : "Your name";
  refs.summary.placeholder = lang() === "ru" ? "Короткое описание для списка руководств." : "Short description shown in the guide list.";
  refs.mods.innerHTML = MODS.map((entry) => choiceCard(entry, state.requiredMods, "mods")).join("");
  refs.classes.innerHTML = CLASSES.map((entry) => choiceCard(entry, state.classTags, "classes")).join("");
}

function renderFooter() {
  refs.prev.disabled = step === 0;
  refs.prev.textContent = t("editor.back");
  refs.next.disabled = step === STEPS.length - 1;
  refs.next.textContent = step === STEPS.length - 2 ? (lang() === "ru" ? "К экспорту" : "Go to export") : t("editor.nextStep");
  refs.autosave.textContent = lastSavedAt ? t("editor.autosavedAt", { time: lastSavedAt }) : t("editor.autosave");
}

function renderAll() {
  openStage = Math.max(0, Math.min(openStage, state.stages.length - 1));
  renderEditorText();
  renderStatus();
  renderGuideStep();
  renderSteps();
  renderMeta();
  renderPanels();
  refs.addStage.textContent = t("editor.addStage");
  refs.accordion.innerHTML = state.stages.map(stageCard).join("");
  renderPreview();
  renderFooter();
}

function saveAndRender(full = true) {
  saveDraft();
  if (full) {
    renderAll();
    return;
  }
  renderSteps();
  renderPreview();
  renderFooter();
}

function toggle(list, value) {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

function moveStage(fromIndex, toIndex) {
  const next = [...state.stages];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  state.stages = next;
}

function repoUrl() {
  const { hostname, pathname } = window.location;
  if (hostname.endsWith(".github.io")) {
    const owner = hostname.slice(0, hostname.indexOf(".github.io"));
    const repo = pathname.split("/").filter(Boolean)[0];
    if (owner && repo) return `https://github.com/${owner}/${repo}`;
  }
  if (hostname === "github.com") {
    const [owner, repo] = pathname.split("/").filter(Boolean);
    if (owner && repo) return `https://github.com/${owner}/${repo}`;
  }
  return null;
}

async function copyJson() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(latestJson);
      refs.submission.textContent = s("copied");
      return;
    }
  } catch {}

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(refs.json);
  selection.removeAllRanges();
  selection.addRange(range);
  refs.submission.textContent = s("selected");
}

function downloadJson() {
  const blob = new Blob([latestJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "guide.json";
  link.click();
  URL.revokeObjectURL(url);
}

function openIssue() {
  const url = repoUrl();
  if (!url) {
    refs.submission.textContent = s("repoUnknown");
    return;
  }
  window.open(`${url}/issues/new`, "_blank", "noopener");
  refs.submission.textContent = s("issueOpened");
}

function resetDraft() {
  if (!confirm(s("resetConfirm"))) return;
  LOAD_KEYS.forEach((key) => localStorage.removeItem(key));
  state = sampleState();
  step = 0;
  openStage = 0;
  lastSavedAt = null;
  refs.submission.textContent = s("draftReset");
  renderAll();
}

async function fetchJson(paths) {
  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (response.ok) return response.json();
    } catch {}
  }
  throw new Error("JSON load failed.");
}

async function loadSupport() {
  supportState = "loading";
  renderStatus();

  try {
    const [itemsData, oresData, bossesData] = await Promise.all([
      fetchJson(["supported/Terraria/items.json", "../supported/Terraria/items.json"]),
      fetchJson(["supported/Terraria/ores.json", "../supported/Terraria/ores.json"]),
      fetchJson(["supported/Terraria/bosses.json", "../supported/Terraria/bosses.json"])
    ]);

    support = {
      items: [...(itemsData.items || []), ...(oresData.ores || [])],
      bosses: bossesData.bosses || [],
      itemMap: new Map(),
      bossMap: new Map()
    };
    support.items.forEach((entry) => support.itemMap.set(entry.id, entry));
    support.bosses.forEach((entry) => support.bossMap.set(entry.id, entry));
    supportState = "loaded";
  } catch (error) {
    console.error(error);
    supportState = "failed";
  }

  renderAll();
}

refs.titleInput.addEventListener("input", () => {
  state.title = refs.titleInput.value;
  saveAndRender(false);
});

refs.authorInput.addEventListener("input", () => {
  state.author = refs.authorInput.value;
  saveAndRender(false);
});

refs.language.addEventListener("change", () => {
  state.language = refs.language.value;
  saveAndRender(false);
});

refs.summary.addEventListener("input", () => {
  state.summary = refs.summary.value;
  saveAndRender(false);
});

refs.mods.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  state.requiredMods = toggle(state.requiredMods, input.value);
  if (!state.requiredMods.length) state.requiredMods = ["Terraria"];
  saveAndRender();
});

refs.classes.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  state.classTags = toggle(state.classTags, input.value);
  if (!state.classTags.length) state.classTags = ["other"];
  saveAndRender();
});

refs.addStage.addEventListener("click", () => {
  state.stages.push(stageModel({ title: `${s("stage")} ${state.stages.length + 1}` }));
  openStage = state.stages.length - 1;
  saveAndRender();
});

refs.accordion.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const stageIndex = Number(button.dataset.stageIndex);
  const itemIndex = Number(button.dataset.itemIndex);
  const bossIndex = Number(button.dataset.bossIndex);
  const groupKey = button.dataset.groupKey;
  const stage = state.stages[stageIndex];

  if (action === "toggle-stage") {
    openStage = stageIndex;
    renderAll();
    return;
  }

  if (!stage) return;

  if (action === "move-stage-up" && stageIndex > 0) {
    moveStage(stageIndex, stageIndex - 1);
    openStage = stageIndex - 1;
    saveAndRender();
  }

  if (action === "move-stage-down" && stageIndex < state.stages.length - 1) {
    moveStage(stageIndex, stageIndex + 1);
    openStage = stageIndex + 1;
    saveAndRender();
  }

  if (action === "remove-stage" && state.stages.length > 1) {
    state.stages.splice(stageIndex, 1);
    openStage = Math.max(0, Math.min(openStage, state.stages.length - 1));
    saveAndRender();
  }

  if (action === "toggle-marker") {
    const next = new Set(stage.progressionMarkers || []);
    if (next.has(button.dataset.markerId)) next.delete(button.dataset.markerId);
    else next.add(button.dataset.markerId);
    stage.progressionMarkers = [...next];
    saveAndRender();
  }

  if (action === "add-boss") {
    stage.bossRefs.push("");
    saveAndRender();
  }

  if (action === "remove-boss") {
    stage.bossRefs.splice(bossIndex, 1);
    saveAndRender();
  }

  if (action === "add-item") {
    const entry = GROUPS.find((groupEntry) => groupEntry.key === groupKey) || GROUPS[0];
    stage.items.push(item({ category: entry.cats[0] }));
    saveAndRender();
  }

  if (action === "remove-item") {
    stage.items.splice(itemIndex, 1);
    saveAndRender();
  }
});

refs.accordion.addEventListener("input", (event) => {
  const target = event.target;
  const role = target.dataset.role;
  if (!role) return;

  const stage = state.stages[Number(target.dataset.stageIndex)];
  if (!stage) return;

  if (role === "stage-title") stage.title = target.value;
  if (role === "stage-description") stage.description = target.value;
  saveAndRender(false);
});

refs.accordion.addEventListener("change", (event) => {
  const target = event.target;
  const role = target.dataset.role;
  if (!role) return;

  const stage = state.stages[Number(target.dataset.stageIndex)];
  if (!stage) return;

  if (role === "stage-era") {
    stage.era = target.value;
    const allowed = new Set((progression?.markersForEra?.(stage.era) || []).map((entry) => entry.id));
    stage.progressionMarkers = (stage.progressionMarkers || []).filter((id) => allowed.has(id));
  }

  if (role === "boss-id") {
    stage.bossRefs[Number(target.dataset.bossIndex)] = target.value;
  }

  if (role === "item-id") {
    const itemEntry = stage.items[Number(target.dataset.itemIndex)];
    itemEntry.itemId = target.value;
    const supportEntry = support.itemMap.get(target.value);
    if (supportEntry?.category) itemEntry.category = supportEntry.category;
  }

  saveAndRender();
});

refs.steps.addEventListener("click", (event) => {
  const button = event.target.closest("[data-step-target]");
  if (button) open(Number(button.dataset.stepTarget));
});

refs.prev.addEventListener("click", () => move(-1));
refs.next.addEventListener("click", () => move(1));
refs.copy.addEventListener("click", copyJson);
refs.download.addEventListener("click", downloadJson);
refs.issue.addEventListener("click", openIssue);
refs.reset.addEventListener("click", resetDraft);
site?.onChange?.(() => renderAll());

renderAll();
loadSupport();
