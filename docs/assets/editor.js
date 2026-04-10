const site = window.terraPathSite;
const progression = window.terraPathProgression;

const SAVE_KEY = "terrapath-editor-draft-v7";
const LOAD_KEYS = [SAVE_KEY, "terrapath-editor-draft-v6", "terrapath-editor-draft-v5"];

const MODS = [
  { value: "Terraria", label: "Terraria" },
  { value: "CalamityMod", label: "Calamity Mod" },
  { value: "ThoriumMod", label: "Thorium Mod" }
];

const CLASSES = [
  { value: "melee", en: "Melee", ru: "\u0412\u043e\u0438\u043d" },
  { value: "ranged", en: "Ranged", ru: "\u0421\u0442\u0440\u0435\u043b\u043e\u043a" },
  { value: "magic", en: "Magic", ru: "\u041c\u0430\u0433" },
  { value: "summoner", en: "Summoner", ru: "\u041f\u0440\u0438\u0437\u044b\u0432\u0430\u0442\u0435\u043b\u044c" },
  { value: "rogue", en: "Rogue", ru: "\u0420\u0430\u0437\u0431\u043e\u0439\u043d\u0438\u043a" },
  { value: "bard", en: "Bard", ru: "\u0411\u0430\u0440\u0434" },
  { value: "other", en: "Other", ru: "\u0414\u0440\u0443\u0433\u043e\u0435" }
];

const GROUPS = [
  { key: "weapon", cats: ["weapon"], en: "Weapons", ru: "\u041e\u0440\u0443\u0436\u0438\u0435" },
  { key: "armor", cats: ["armor"], en: "Armor", ru: "\u0411\u0440\u043e\u043d\u044f" },
  { key: "accessory", cats: ["accessory"], en: "Accessories", ru: "\u0410\u043a\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u044b" },
  { key: "buff", cats: ["buff", "ammo"], en: "Buffs / Consumables", ru: "\u0411\u0430\u0444\u0444\u044b / \u0420\u0430\u0441\u0445\u043e\u0434\u043d\u0438\u043a\u0438" }
];

const ALLOWED_ITEM_CATEGORIES = new Set(GROUPS.flatMap((group) => group.cats));

const STEP_COPY = {
  en: [
    { title: "Guide", desc: "Title, author, language, summary, required mods, and class." },
    { title: "Stages", desc: "Stages, mini-stages, boss references, and item loadouts." },
    { title: "Export", desc: "Preview the guide and export guide.json." }
  ],
  ru: [
    { title: "\u0413\u0430\u0439\u0434", desc: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435, \u0430\u0432\u0442\u043e\u0440, \u044f\u0437\u044b\u043a, \u043a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435, \u043c\u043e\u0434\u044b \u0438 \u043a\u043b\u0430\u0441\u0441." },
    { title: "\u042d\u0442\u0430\u043f\u044b", desc: "\u042d\u0442\u0430\u043f\u044b, \u043c\u0438\u043d\u0438-\u044d\u0442\u0430\u043f\u044b, \u0431\u043e\u0441\u0441\u044b \u0438 \u043f\u0430\u043d\u0435\u043b\u0438 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432." },
    { title: "\u042d\u043a\u0441\u043f\u043e\u0440\u0442", desc: "\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0432\u0438\u0434 \u0433\u0430\u0439\u0434\u0430 \u0438 \u0432\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u0435 guide.json." }
  ]
};

const COPY = {
  en: {
    current: "Current",
    ready: "Ready",
    pending: "Pending",
    stepCounter: "Step {current} of {total}",
    stage: "Stage",
    stageTitle: "Stage title",
    era: "Main era",
    description: "Description",
    descriptionPlaceholder: "Explain what this stage covers.",
    insertIcon: "Insert icon",
    markers: "Mini-stage markers",
    bosses: "Bosses",
    addBoss: "Add boss",
    chooseBoss: "Choose boss",
    noBosses: "No bosses added.",
    items: "Items",
    addItem: "Add item",
    chooseItem: "Choose item",
    noItems: "No items added.",
    remove: "Remove",
    moveUp: "Up",
    moveDown: "Down",
    delete: "Delete",
    itemCount: "{count} items",
    loadingSupport: "Loading Terraria support data...",
    supportLoaded: "Vanilla support ready: {items} searchable items, {bosses} bosses.",
    supportFailed: "Terraria support data could not be loaded.",
    pickerDescriptionTitle: "Insert icon into description",
    pickerItemTitle: "Search item",
    pickerSearch: "Search",
    pickerSearchPlaceholder: "Search items, bosses, ores",
    pickerClose: "Close",
    noPickerResults: "No results found.",
    previewHeading: "Preview",
    noItemsPreview: "No item picks added for this stage.",
    copied: "guide.json copied.",
    selected: "Clipboard is unavailable. The JSON preview was selected.",
    issueOpened: "GitHub opened in a new tab.",
    repoUnknown: "Repository URL could not be detected here.",
    resetConfirm: "Reset the current draft?",
    draftReset: "Draft reset."
  },
  ru: {
    current: "\u0422\u0435\u043a\u0443\u0449\u0438\u0439",
    ready: "\u0413\u043e\u0442\u043e\u0432\u043e",
    pending: "\u041d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u043e",
    stepCounter: "\u0428\u0430\u0433 {current} \u0438\u0437 {total}",
    stage: "\u042d\u0442\u0430\u043f",
    stageTitle: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u044d\u0442\u0430\u043f\u0430",
    era: "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439 \u044d\u0442\u0430\u043f \u0438\u0433\u0440\u044b",
    description: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
    descriptionPlaceholder: "\u041a\u0440\u0430\u0442\u043a\u043e \u043e\u043f\u0438\u0448\u0438\u0442\u0435, \u0447\u0442\u043e \u0434\u0430\u0435\u0442 \u044d\u0442\u043e\u0442 \u044d\u0442\u0430\u043f.",
    insertIcon: "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0438\u043a\u043e\u043d\u043a\u0443",
    markers: "\u041c\u0438\u043d\u0438-\u044d\u0442\u0430\u043f\u044b",
    bosses: "\u0411\u043e\u0441\u0441\u044b",
    addBoss: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0431\u043e\u0441\u0441\u0430",
    chooseBoss: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0431\u043e\u0441\u0441\u0430",
    noBosses: "\u0411\u043e\u0441\u0441\u044b \u043d\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u044b.",
    items: "\u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b",
    addItem: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u0440\u0435\u0434\u043c\u0435\u0442",
    chooseItem: "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442",
    noItems: "\u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b \u043d\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u044b.",
    remove: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
    moveUp: "\u0412\u044b\u0448\u0435",
    moveDown: "\u041d\u0438\u0436\u0435",
    delete: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
    itemCount: "{count} \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432",
    loadingSupport: "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 Terraria-\u0438\u043d\u0434\u0435\u043a\u0441\u0430...",
    supportLoaded: "Vanilla \u0433\u043e\u0442\u043e\u0432\u0430: {items} \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432 \u0434\u043b\u044f \u043f\u043e\u0438\u0441\u043a\u0430, {bosses} \u0431\u043e\u0441\u0441\u043e\u0432.",
    supportFailed: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c Terraria-\u0438\u043d\u0434\u0435\u043a\u0441.",
    pickerDescriptionTitle: "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0438\u043a\u043e\u043d\u043a\u0443 \u0432 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
    pickerItemTitle: "\u041f\u043e\u0438\u0441\u043a \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u0430",
    pickerSearch: "\u041f\u043e\u0438\u0441\u043a",
    pickerSearchPlaceholder: "\u0418\u0449\u0438\u0442\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b, \u0431\u043e\u0441\u0441\u043e\u0432, \u0440\u0443\u0434\u044b",
    pickerClose: "\u0417\u0430\u043a\u0440\u044b\u0442\u044c",
    noPickerResults: "\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e.",
    previewHeading: "\u041f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440",
    noItemsPreview: "\u0414\u043b\u044f \u044d\u0442\u043e\u0433\u043e \u044d\u0442\u0430\u043f\u0430 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432.",
    copied: "guide.json \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d.",
    selected: "\u0411\u0443\u0444\u0435\u0440 \u043e\u0431\u043c\u0435\u043d\u0430 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d. JSON \u0432\u044b\u0434\u0435\u043b\u0435\u043d \u0434\u043b\u044f \u0440\u0443\u0447\u043d\u043e\u0433\u043e \u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f.",
    issueOpened: "GitHub \u043e\u0442\u043a\u0440\u044b\u0442 \u0432 \u043d\u043e\u0432\u043e\u0439 \u0432\u043a\u043b\u0430\u0434\u043a\u0435.",
    repoUnknown: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u044c URL \u0440\u0435\u043f\u043e\u0437\u0438\u0442\u043e\u0440\u0438\u044f.",
    resetConfirm: "\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u0447\u0435\u0440\u043d\u043e\u0432\u0438\u043a?",
    draftReset: "\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a \u0441\u0431\u0440\u043e\u0448\u0435\u043d."
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
  autosave: $("#autosaveStatus"),
  picker: $("#contentPicker"),
  pickerTitle: $("#pickerTitle"),
  pickerSearchLabel: $("#pickerSearchLabel"),
  pickerSearchInput: $("#pickerSearchInput"),
  pickerFilters: $("#pickerFilters"),
  pickerResults: $("#pickerResults"),
  pickerClose: $("#pickerCloseButton")
};

let step = 0;
let openStage = 0;
let latestJson = "{}\n";
let lastSavedAt = null;
let submissionMessage = "";
let supportState = "loading";
let pickerState = null;
let support = { items: [], searchItems: [], bosses: [], itemMap: new Map(), bossMap: new Map() };
let state = loadDraft() || sampleState();

function lang() {
  return site?.getLanguage?.() === "ru" ? "ru" : "en";
}

function s(key, vars = {}) {
  return String(COPY[lang()][key] || COPY.en[key] || key).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
}

function t(key, vars = {}) {
  return site?.t?.(key, vars) ?? key;
}

function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function uniq(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function slug(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "guide";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function timeLabel() {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function initials(value) {
  return String(value || "?").split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function localizedDisplayName(entry) {
  if (!entry) return "";
  return lang() === "ru"
    ? (entry.displayNameRu || entry.displayName || entry.internalName || "")
    : (entry.displayName || entry.displayNameRu || entry.internalName || "");
}

function pickLabel(id, map) {
  const entry = map.get(id);
  return localizedDisplayName(entry) || String(id || "").split("/").pop() || "";
}

function iconMarkup(entry, label, boss = false) {
  if (entry?.icon) return `<img class="content-icon ${boss ? "content-icon--boss" : ""}" src="${esc(entry.icon)}" alt="${esc(label)}" loading="lazy">`;
  return `<span class="content-token">${esc(initials(label))}</span>`;
}

function classLabel(value) {
  const entry = CLASSES.find((item) => item.value === value);
  return entry ? entry[lang()] : value;
}

function classList(values) {
  return (values || []).map(classLabel).join(", ");
}

function guideLanguageLabel(value) {
  return site?.getGuideLanguageLabel?.(value) ?? value;
}

function groupLabel(key) {
  const entry = GROUPS.find((item) => item.key === key) || GROUPS[GROUPS.length - 1];
  return entry[lang()];
}

function visibleSearchItems() {
  return [...support.itemMap.values()].filter((entry) => !entry.pickerHidden);
}

function inferItemCategory(entry, groupKey) {
  if (entry?.category && entry.category !== "other") return entry.category;
  const group = GROUPS.find((item) => item.key === groupKey) || GROUPS[0];
  return group.cats[0];
}

function renderRichText(textValue) {
  const tokenPattern = /\{\{icon:([^}]+)\}\}/g;
  const source = String(textValue || "");
  const parts = [];
  let lastIndex = 0;

  for (const match of source.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    const contentId = match[1];
    if (index > lastIndex) parts.push(esc(source.slice(lastIndex, index)).replace(/\n/g, "<br>"));
    const itemEntry = support.itemMap.get(contentId);
    const bossEntry = support.bossMap.get(contentId);
    const entry = itemEntry || bossEntry;
    const label = pickLabel(contentId, itemEntry ? support.itemMap : support.bossMap);
    parts.push(`<span class="inline-icon-token">${iconMarkup(entry, label, Boolean(bossEntry))}<span>${esc(label)}</span></span>`);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < source.length) parts.push(esc(source.slice(lastIndex)).replace(/\n/g, "<br>"));
  return parts.join("");
}

function plainText(textValue) {
  return String(textValue || "").replace(/\{\{icon:[^}]+\}\}/g, " ").replace(/\s+/g, " ").trim();
}

function makeId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36).slice(-4)}`;
}

function itemTemplate(seed = {}) {
  return { itemId: seed.itemId || "", category: seed.category || "weapon", subgroupId: seed.subgroupId || "" };
}

function subStageTemplate(seed = {}) {
  return {
    id: seed.id || makeId("substage"),
    title: seed.title || "",
    description: seed.description || ""
  };
}

function stageTemplate(seed = {}) {
  const accessoryGroups = Array.isArray(seed.accessoryGroups)
    ? seed.accessoryGroups.map((group) => ({ id: group.id || makeId("accessory"), title: group.title || "" }))
    : [];
  const items = [];

  for (const rawItem of Array.isArray(seed.items) ? seed.items : []) {
    const nextItem = itemTemplate(rawItem);
    if (!ALLOWED_ITEM_CATEGORIES.has(nextItem.category)) continue;
    if ((nextItem.category || "weapon") === "accessory" && rawItem?.subgroup) {
      const title = String(rawItem.subgroup).trim();
      if (title) {
        let group = accessoryGroups.find((entry) => entry.title === title);
        if (!group) {
          group = { id: makeId("accessory"), title };
          accessoryGroups.push(group);
        }
        nextItem.subgroupId = group.id;
      }
    }
    items.push(nextItem);
  }

  const subStages = Array.isArray(seed.subStages)
    ? seed.subStages.map(subStageTemplate)
    : [];

  if (!subStages.length && Array.isArray(seed.progressionMarkers) && progression?.getMarker) {
    seed.progressionMarkers.forEach((markerId) => {
      const marker = progression.getMarker(markerId);
      if (marker) {
        subStages.push(subStageTemplate({
          title: marker.title?.[lang()] || marker.title?.en || markerId,
          description: marker.description?.[lang()] || marker.description?.en || ""
        }));
      }
    });
  }

  return {
    title: seed.title || s("stage"),
    era: seed.era || "prehardmode",
    subStages,
    description: seed.description || "",
    bossRefs: [...(seed.bossRefs || [])],
    accessoryGroups,
    items
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
      stageTemplate({
        title: "First Night",
        era: "prehardmode",
        description: "Collect movement items, prepare a basic arena, and secure a reliable early weapon.",
        bossRefs: ["Terraria/EyeofCthulhu"],
        subStages: [
          {
            title: "Before Eye of Cthulhu",
            description: "Build a simple arena and collect mobility before the first early boss."
          }
        ],
        accessoryGroups: [
          { title: "Mobility" }
        ],
        items: [
          { itemId: "Terraria/EnchantedBoomerang", category: "weapon" },
          { itemId: "Terraria/CloudinaBottle", category: "accessory", subgroup: "Mobility" }
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
    stages: Array.isArray(raw.stages) && raw.stages.length ? raw.stages.map(stageTemplate) : [stageTemplate()]
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

function saveAndRender(full = true) {
  saveDraft();
  if (full) {
    renderAll();
    return;
  }
  renderSteps();
  renderMeta();
  renderPreview();
  renderFooter();
}

function choiceCard(option, selected, groupName) {
  const description = option.value === "Terraria"
    ? (lang() === "ru" ? "Vanilla-\u043f\u043e\u0434\u0431\u043e\u0440\u043a\u0438 \u0438 \u043f\u043e\u0438\u0441\u043a \u0443\u0436\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b." : "Vanilla pickers and search are available.")
    : (lang() === "ru" ? "\u041f\u043e\u043a\u0430 \u0442\u043e\u043b\u044c\u043a\u043e \u043c\u0435\u0442\u0430\u0434\u0430\u043d\u043d\u044b\u0435." : "Metadata only for now.");
  const title = option.label || option[lang()];
  return `<label class="choice-card"><input type="checkbox" value="${esc(option.value)}" data-choice-group="${esc(groupName)}" ${selected.includes(option.value) ? "checked" : ""}><span class="choice-card__copy"><strong class="choice-card__title">${esc(title)}</strong><span class="choice-card__description">${esc(description)}</span></span></label>`;
}

function selectOptions(entries, value, placeholder) {
  const sorted = [...entries].sort((left, right) => localizedDisplayName(left).localeCompare(localizedDisplayName(right), undefined, { sensitivity: "base" }));
  let html = `<option value="">${esc(placeholder)}</option>`;
  if (value && !sorted.some((entry) => entry.id === value)) {
    html += `<option value="${esc(value)}" selected>${esc(value)}</option>`;
  }
  html += sorted.map((entry) => `<option value="${esc(entry.id)}" ${entry.id === value ? "selected" : ""}>${esc(localizedDisplayName(entry))}</option>`).join("");
  return html;
}

function buildGuide() {
  const used = new Map();
  const stages = state.stages.map((stage, index) => {
    const title = stage.title.trim() || `${s("stage")} ${index + 1}`;
    const base = slug(plainText(title)).slice(0, 40) || `stage-${index + 1}`;
    const count = used.get(base) || 0;
    used.set(base, count + 1);

    const output = {
      id: count ? `${base}-${count + 1}`.slice(0, 40) : base,
      title,
      era: stage.era || "prehardmode",
      items: (stage.items || []).filter((entry) => entry.itemId && ALLOWED_ITEM_CATEGORIES.has(entry.category || "")).map((entry) => ({
        itemId: entry.itemId,
        category: entry.category || "weapon"
      }))
    };
    const bosses = uniq((stage.bossRefs || []).map((entry) => String(entry || "").trim()).filter(Boolean));
    const subStages = (stage.subStages || [])
      .map((subStage) => ({
        title: String(subStage.title || "").trim(),
        description: String(subStage.description || "").trim()
      }))
      .filter((subStage) => subStage.title || subStage.description);

    output.items = output.items.map((item, itemIndex) => {
      const source = stage.items[itemIndex];
      if (item.category === "accessory" && source?.subgroupId) {
        const group = (stage.accessoryGroups || []).find((entry) => entry.id === source.subgroupId);
        const subgroup = String(group?.title || "").trim();
        if (subgroup) {
          return { ...item, subgroup };
        }
      }
      return item;
    });

    if (stage.description.trim()) output.description = stage.description.trim();
    if (subStages.length) output.subStages = subStages;
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
  if (index === 0) return Boolean(state.title.trim() && state.author.trim() && state.summary.trim() && state.requiredMods.length && state.classTags.length);
  if (index === 1) return state.stages.some((entry) => entry.title.trim());
  return ready(0) && ready(1);
}

function openStep(index) {
  step = Math.max(0, Math.min(STEP_COPY.en.length - 1, index));
  renderAll();
}

function moveStep(offset) {
  openStep(step + offset);
}

function renderSupportStatus() {
  if (supportState === "loaded") {
    refs.support.textContent = s("supportLoaded", { items: support.searchItems.length || support.items.length, bosses: support.bosses.length });
    return;
  }
  refs.support.textContent = supportState === "failed" ? s("supportFailed") : s("loadingSupport");
}

function renderSteps() {
  const steps = STEP_COPY[lang()] || STEP_COPY.en;
  refs.steps.innerHTML = steps.map((entry, index) => {
    const stateText = index === step ? s("current") : ready(index) ? s("ready") : s("pending");
    return `<li class="wizard-step ${index === step ? "wizard-step--current" : ""} ${ready(index) ? "wizard-step--complete" : ""}"><button class="wizard-step__button" type="button" data-step-target="${index}"><span class="wizard-step__count">${index + 1}</span><span class="wizard-step__body"><strong>${esc(entry.title)}</strong><span>${esc(entry.desc)}</span></span><span class="wizard-step__state">${esc(stateText)}</span></button></li>`;
  }).join("");
}

function renderMeta() {
  const steps = STEP_COPY[lang()] || STEP_COPY.en;
  refs.eyebrow.textContent = s("stepCounter", { current: step + 1, total: steps.length });
  refs.title.textContent = steps[step].title;
  refs.desc.textContent = steps[step].desc;
}

function renderPanels() {
  refs.panels.forEach((panel) => {
    panel.hidden = Number(panel.dataset.stepPanel) !== step;
  });
}

function renderGuideForm() {
  refs.titleInput.value = state.title;
  refs.authorInput.value = state.author;
  refs.summary.value = state.summary;
  refs.language.innerHTML = `<option value="en-US">${esc(t("common.languageEnglishUs"))}</option><option value="ru-RU">${esc(t("common.languageRussian"))}</option>`;
  refs.language.value = state.language;
  refs.mods.innerHTML = MODS.map((entry) => choiceCard(entry, state.requiredMods, "mods")).join("");
  refs.classes.innerHTML = CLASSES.map((entry) => choiceCard(entry, state.classTags, "classes")).join("");
  refs.titleInput.placeholder = lang() === "ru" ? "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0433\u0430\u0439\u0434\u0430" : "Guide title";
  refs.authorInput.placeholder = lang() === "ru" ? "\u0412\u0430\u0448\u0435 \u0438\u043c\u044f" : "Your name";
  refs.summary.placeholder = lang() === "ru" ? "\u041a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0434\u043b\u044f \u0441\u043f\u0438\u0441\u043a\u0430 \u0433\u0430\u0439\u0434\u043e\u0432." : "Short description shown in the guide list.";
}

function previewSubStages(stage) {
  if (!stage.subStages?.length) return "";
  return `<section class="preview-block"><h4>${esc(lang() === "ru" ? "\u041f\u043e\u0434\u044d\u0442\u0430\u043f\u044b" : "Sub-stages")}</h4><div class="substage-preview-list">${stage.subStages.map((subStage) => `<article class="substage-card"><strong>${renderRichText(subStage.title || "")}</strong>${subStage.description ? `<div class="stage-description">${renderRichText(subStage.description)}</div>` : ""}</article>`).join("")}</div></section>`;
}

function previewBosses(stage) {
  if (!stage.bossRefs?.length) return "";
  return `<section class="preview-block"><h4>${esc(t("common.labelBosses"))}</h4><div class="chip-row">${stage.bossRefs.map((id) => {
    const entry = support.bossMap.get(id);
    const label = pickLabel(id, support.bossMap);
    return `<div class="content-chip"><span class="content-chip__media">${iconMarkup(entry, label, true)}</span><span>${esc(label)}</span></div>`;
  }).join("")}</div></section>`;
}

function previewGroups(items) {
  const blocks = GROUPS.map((group) => {
    const rows = (items || []).filter((entry) => group.cats.includes(entry.category || "other"));
    if (!rows.length) return "";

    if (group.key === "accessory") {
      const subgroupOrder = [];
      rows.forEach((entry) => {
        const subgroup = String(entry.subgroup || "").trim();
        if (!subgroupOrder.includes(subgroup)) subgroupOrder.push(subgroup);
      });

      return `<section class="category-block"><h4>${esc(group[lang()])}</h4>${subgroupOrder.map((subgroup) => {
        const subgroupRows = rows.filter((entry) => String(entry.subgroup || "").trim() === subgroup);
        return `<div class="accessory-subgroup">${subgroup ? `<h5>${esc(subgroup)}</h5>` : ""}<div class="content-grid">${subgroupRows.map((itemEntry) => {
          const entry = support.itemMap.get(itemEntry.itemId);
          const label = pickLabel(itemEntry.itemId, support.itemMap);
          return `<article class="content-card"><div class="content-card__head"><span class="content-card__media">${iconMarkup(entry, label)}</span><div><strong>${esc(label)}</strong></div></div></article>`;
        }).join("")}</div></div>`;
      }).join("")}</section>`;
    }

    return `<section class="category-block"><h4>${esc(group[lang()])}</h4><div class="content-grid">${rows.map((itemEntry) => {
      const entry = support.itemMap.get(itemEntry.itemId);
      const label = pickLabel(itemEntry.itemId, support.itemMap);
      return `<article class="content-card"><div class="content-card__head"><span class="content-card__media">${iconMarkup(entry, label)}</span><div><strong>${esc(label)}</strong></div></div></article>`;
    }).join("")}</div></section>`;
  }).filter(Boolean);
  return blocks.join("") || `<p class="empty-state">${esc(s("noItemsPreview"))}</p>`;
}

function renderPreview() {
  const guide = buildGuide();
  latestJson = `${JSON.stringify(guide, null, 2)}\n`;
  refs.json.textContent = latestJson;
  refs.preview.innerHTML = `<header class="guide-preview__header"><h2 class="guide-title">${esc(guide.title)}</h2><p>${esc(guide.summary)}</p><div class="chip-row"><span class="meta-pill">${esc(`${t("common.labelClass")}: ${classList(guide.classTags)}`)}</span><span class="meta-pill">${esc(`${t("common.labelLanguage")}: ${guideLanguageLabel(guide.language)}`)}</span><span class="meta-pill">${esc(`${t("common.labelMods")}: ${(guide.requiredMods || []).join(", ")}`)}</span><span class="meta-pill">${esc(`${guide.stages.length} ${t("common.labelStages").toLowerCase()}`)}</span></div></header><div class="guide-preview__stages">${guide.stages.map((stage) => `<article class="stage-preview"><section class="stage-overview"><div class="stage-preview__header"><h3>${renderRichText(stage.title)}</h3><span class="meta-pill">${esc(s("itemCount", { count: (stage.items || []).length }))}</span></div><div class="chip-row"><span class="meta-pill">${esc(`${t("common.labelEra")}: ${progression?.eraLabel?.(stage.era || "prehardmode", lang()) || stage.era || ""}`)}</span></div>${stage.description ? `<div class="stage-description">${renderRichText(stage.description)}</div>` : ""}${previewSubStages(stage)}${previewBosses(stage)}</section><section class="stage-loadout">${previewGroups(stage.items)}</section></article>`).join("")}</div>`;
}

function bossRows(stage, stageIndex) {
  if (!stage.bossRefs.length) return `<p class="empty-state">${esc(s("noBosses"))}</p>`;
  return stage.bossRefs.map((id, bossIndex) => {
    const entry = support.bossMap.get(id);
    const label = pickLabel(id, support.bossMap);
    return `<div class="picker-row boss-row"><span class="picker-row__media">${iconMarkup(entry, label, true)}</span><button class="picker-select" type="button" data-action="change-boss" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">${esc(label || s("chooseBoss"))}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-boss" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">${esc(s("remove"))}</button></div>`;
  }).join("");
}

function accessoryGroupRows(stage, stageIndex) {
  const ungroupedItems = (stage.items || []).filter((itemEntry) => itemEntry.category === "accessory" && !itemEntry.subgroupId);
  const groups = stage.accessoryGroups || [];

  const renderAccessoryRow = (itemEntry, itemIndex, subgroupId = "") => {
    const entry = support.itemMap.get(itemEntry.itemId);
    const label = pickLabel(itemEntry.itemId, support.itemMap) || s("chooseItem");
    return `<div class="picker-row item-row"><span class="picker-row__media">${iconMarkup(entry, label)}</span><button class="picker-select" type="button" data-action="change-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}" data-group-key="accessory" data-subgroup-id="${esc(subgroupId)}">${esc(label)}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">${esc(s("remove"))}</button></div>`;
  };

  return `<section class="item-group"><div class="item-group__header"><h4>${esc(groupLabel("accessory"))}</h4><div class="item-group__actions"><button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${stageIndex}" data-group-key="accessory">${esc(s("addItem"))}</button><button class="button button--quiet button--tiny" type="button" data-action="add-accessory-group" data-stage-index="${stageIndex}">${esc(lang() === "ru" ? "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u0434\u0440\u0430\u0437\u0434\u0435\u043b" : "Add subgroup")}</button></div></div>${ungroupedItems.length ? `<div class="accessory-subgroup"><div class="content-grid content-grid--single">${ungroupedItems.map((itemEntry) => renderAccessoryRow(itemEntry, stage.items.indexOf(itemEntry))).join("")}</div></div>` : ""}${groups.map((group) => {
    const subgroupItems = stage.items.filter((itemEntry) => itemEntry.category === "accessory" && itemEntry.subgroupId === group.id);
    return `<section class="accessory-subgroup-editor"><div class="field-label-with-action"><input class="inline-input" data-role="accessory-group-title" data-stage-index="${stageIndex}" data-group-id="${esc(group.id)}" value="${esc(group.title)}" placeholder="${esc(lang() === "ru" ? "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043f\u043e\u0434\u0440\u0430\u0437\u0434\u0435\u043b\u0430" : "Subgroup title")}"><div class="item-group__actions"><button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${stageIndex}" data-group-key="accessory" data-subgroup-id="${esc(group.id)}">${esc(s("addItem"))}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-accessory-group" data-stage-index="${stageIndex}" data-group-id="${esc(group.id)}">${esc(s("remove"))}</button></div></div><div class="content-grid content-grid--single">${subgroupItems.length ? subgroupItems.map((itemEntry) => renderAccessoryRow(itemEntry, stage.items.indexOf(itemEntry), group.id)).join("") : `<p class="empty-state">${esc(s("noItems"))}</p>`}</div></section>`;
  }).join("") || ""}${!ungroupedItems.length && !groups.length ? `<p class="empty-state">${esc(s("noItems"))}</p>` : ""}</section>`;
}

function itemRows(stage, stageIndex, groupEntry) {
  const rows = [];
  (stage.items || []).forEach((itemEntry, itemIndex) => {
    if (groupEntry.cats.includes(itemEntry.category || "other")) rows.push({ itemEntry, itemIndex });
  });

  return `<section class="item-group"><div class="item-group__header"><h4>${esc(groupEntry[lang()])}</h4><button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${stageIndex}" data-group-key="${esc(groupEntry.key)}">${esc(s("addItem"))}</button></div>${rows.length ? rows.map(({ itemEntry, itemIndex }) => {
    const entry = support.itemMap.get(itemEntry.itemId);
    const label = pickLabel(itemEntry.itemId, support.itemMap) || s("chooseItem");
    return `<div class="picker-row item-row"><span class="picker-row__media">${iconMarkup(entry, label)}</span><button class="picker-select" type="button" data-action="change-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}" data-group-key="${esc(groupEntry.key)}">${esc(label)}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">${esc(s("remove"))}</button></div>`;
  }).join("") : `<p class="empty-state">${esc(s("noItems"))}</p>`}</section>`;
}

function stageBody(stage, stageIndex) {
  const subStages = stage.subStages || [];

  return `<section class="stage-overview-editor"><div class="field-grid"><label class="field"><span class="field-label-with-action"><span>${esc(s("stageTitle"))}</span><button class="button button--quiet button--tiny" type="button" data-action="open-title-picker" data-stage-index="${stageIndex}">${esc(s("insertIcon"))}</button></span><input data-role="stage-title" data-stage-index="${stageIndex}" value="${esc(stage.title)}"></label><label class="field"><span>${esc(s("era"))}</span><select data-role="stage-era" data-stage-index="${stageIndex}">${(progression?.eras || []).map((era) => `<option value="${esc(era.id)}" ${era.id === stage.era ? "selected" : ""}>${esc(era.label?.[lang()] || era.label?.en || era.id)}</option>`).join("")}</select></label></div><label class="field"><span class="field-label-with-action"><span>${esc(s("description"))}</span><button class="button button--quiet button--tiny" type="button" data-action="open-description-picker" data-stage-index="${stageIndex}">${esc(s("insertIcon"))}</button></span><textarea data-role="stage-description" data-stage-index="${stageIndex}" rows="5" placeholder="${esc(s("descriptionPlaceholder"))}">${esc(stage.description)}</textarea></label><section class="stage-section"><div class="section-heading section-heading--with-action"><h3>${esc(lang() === "ru" ? "\u041f\u043e\u0434\u044d\u0442\u0430\u043f\u044b" : "Sub-stages")}</h3><button class="button button--quiet button--tiny" type="button" data-action="add-substage" data-stage-index="${stageIndex}">${esc(lang() === "ru" ? "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u0434\u044d\u0442\u0430\u043f" : "Add sub-stage")}</button></div><div class="substage-editor-list">${subStages.length ? subStages.map((subStage, subStageIndex) => `<article class="substage-editor-card"><div class="field-grid"><label class="field"><span>${esc(lang() === "ru" ? "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435" : "Title")}</span><input data-role="substage-title" data-stage-index="${stageIndex}" data-substage-index="${subStageIndex}" value="${esc(subStage.title)}"></label><div class="stage-card__actions stage-card__actions--compact"><button class="button button--quiet button--tiny" type="button" data-action="remove-substage" data-stage-index="${stageIndex}" data-substage-index="${subStageIndex}">${esc(s("remove"))}</button></div></div><label class="field"><span class="field-label-with-action"><span>${esc(lang() === "ru" ? "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043f\u043e\u0434\u044d\u0442\u0430\u043f\u0430" : "Sub-stage description")}</span><button class="button button--quiet button--tiny" type="button" data-action="open-substage-description-picker" data-stage-index="${stageIndex}" data-substage-index="${subStageIndex}">${esc(s("insertIcon"))}</button></span><textarea data-role="substage-description" data-stage-index="${stageIndex}" data-substage-index="${subStageIndex}" rows="3">${esc(subStage.description)}</textarea></label></article>`).join("") : `<p class="empty-state">${esc(lang() === "ru" ? "\u041f\u043e\u0434\u044d\u0442\u0430\u043f\u044b \u043f\u043e\u043a\u0430 \u043d\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u044b." : "No sub-stages added.")}</p>`}</div></section><section class="stage-section"><div class="section-heading section-heading--with-action"><h3>${esc(s("bosses"))}</h3><button class="button button--quiet button--tiny" type="button" data-action="add-boss" data-stage-index="${stageIndex}">${esc(s("addBoss"))}</button></div><div class="stage-stack">${bossRows(stage, stageIndex)}</div></section></section><section class="stage-loadout-editor"><section class="stage-section"><div class="section-heading"><h3>${esc(s("items"))}</h3></div><div class="item-group-list">${GROUPS.map((group) => group.key === "accessory" ? accessoryGroupRows(stage, stageIndex) : itemRows(stage, stageIndex, group)).join("")}</div></section></section>`;
}

function stageCard(stage, stageIndex) {
  const opened = stageIndex === openStage;
  const eraText = progression?.eraLabel?.(stage.era || "prehardmode", lang()) || stage.era || "";
  const count = (stage.items || []).filter((entry) => entry.itemId).length;
  return `<article class="stage-card ${opened ? "stage-card--open" : ""}"><div class="stage-card__header"><button class="stage-card__toggle" type="button" data-action="toggle-stage" data-stage-index="${stageIndex}"><span class="stage-card__title"><strong>${renderRichText(stage.title || `${s("stage")} ${stageIndex + 1}`)}</strong><span class="muted">${esc(eraText)}</span></span><span class="meta-pill">${esc(s("itemCount", { count }))}</span></button><div class="stage-card__actions"><button class="button button--quiet button--tiny" type="button" data-action="move-stage-up" data-stage-index="${stageIndex}" ${stageIndex === 0 ? "disabled" : ""}>${esc(s("moveUp"))}</button><button class="button button--quiet button--tiny" type="button" data-action="move-stage-down" data-stage-index="${stageIndex}" ${stageIndex === state.stages.length - 1 ? "disabled" : ""}>${esc(s("moveDown"))}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-stage" data-stage-index="${stageIndex}" ${state.stages.length === 1 ? "disabled" : ""}>${esc(s("delete"))}</button></div></div><div class="stage-card__body" ${opened ? "" : "hidden"}>${stageBody(stage, stageIndex)}</div></article>`;
}

function renderAccordion() {
  refs.addStage.textContent = t("editor.addStage");
  refs.accordion.innerHTML = state.stages.map((stage, index) => stageCard(stage, index)).join("");
}

function renderFooter() {
  refs.prev.disabled = step === 0;
  refs.next.disabled = step === STEP_COPY.en.length - 1;
  refs.prev.textContent = t("editor.back");
  refs.next.textContent = step === STEP_COPY.en.length - 2 ? (lang() === "ru" ? "\u041a \u044d\u043a\u0441\u043f\u043e\u0440\u0442\u0443" : "Go to export") : t("editor.nextStep");
  refs.autosave.textContent = lastSavedAt ? t("editor.autosavedAt", { time: lastSavedAt }) : t("editor.autosave");
  refs.submission.textContent = submissionMessage || t("editor.submissionStatus");
}

function renderEditorText() {
  const mapping = {
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
      return;
    }
    if (key === "submissionStatus") {
      element.textContent = submissionMessage || t("editor.submissionStatus");
      return;
    }
    element.textContent = t(mapping[key]);
  });
}

function renderAll() {
  openStage = Math.max(0, Math.min(openStage, state.stages.length - 1));
  renderSupportStatus();
  renderEditorText();
  renderGuideForm();
  renderSteps();
  renderMeta();
  renderPanels();
  renderAccordion();
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
      submissionMessage = s("copied");
      renderFooter();
      return;
    }
  } catch {}

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(refs.json);
  selection.removeAllRanges();
  selection.addRange(range);
  submissionMessage = s("selected");
  renderFooter();
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
    submissionMessage = s("repoUnknown");
    renderFooter();
    return;
  }
  window.open(`${url}/issues/new`, "_blank", "noopener");
  submissionMessage = s("issueOpened");
  renderFooter();
}

function resetDraft() {
  if (!confirm(s("resetConfirm"))) return;
  LOAD_KEYS.forEach((key) => localStorage.removeItem(key));
  state = sampleState();
  step = 0;
  openStage = 0;
  lastSavedAt = null;
  submissionMessage = s("draftReset");
  renderAll();
}

function openPicker(mode, options = {}) {
  const filter = mode === "item"
    ? (options.groupKey || "other")
    : mode === "boss"
      ? "boss"
      : "all";
  pickerState = { mode, filter, ...options };
  refs.picker.hidden = false;
  refs.pickerTitle.textContent = mode === "description"
    ? s("pickerDescriptionTitle")
    : mode === "boss"
      ? s("chooseBoss")
      : s("pickerItemTitle");
  refs.pickerSearchLabel.textContent = s("pickerSearch");
  refs.pickerSearchInput.placeholder = s("pickerSearchPlaceholder");
  refs.pickerClose.textContent = s("pickerClose");
  refs.pickerSearchInput.value = "";
  renderPickerFilters();
  renderPickerResults();
  refs.pickerSearchInput.focus();
}

function closePicker() {
  pickerState = null;
  refs.picker.hidden = true;
}

function pickerFilterOptions() {
  if (!pickerState) return [];
  if (pickerState.mode === "description") {
    return [
      { key: "all", label: lang() === "ru" ? "\u0412\u0441\u0435" : "All" },
      { key: "item", label: lang() === "ru" ? "\u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b" : "Items" },
      { key: "boss", label: s("bosses") }
    ];
  }
  if (pickerState.mode === "boss") return [{ key: "boss", label: s("bosses") }];
  return [
    { key: pickerState.groupKey || "weapon", label: groupLabel(pickerState.groupKey || "weapon") },
    { key: "all-items", label: lang() === "ru" ? "\u0412\u0441\u0435 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u044b" : "All items" }
  ];
}

function renderPickerFilters() {
  const filters = pickerFilterOptions();
  refs.pickerFilters.innerHTML = filters.map((filter) => `<button class="picker-filter ${pickerState?.filter === filter.key ? "picker-filter--active" : ""}" type="button" data-picker-filter="${esc(filter.key)}" ${filters.length === 1 ? "disabled" : ""}>${esc(filter.label)}</button>`).join("");
}

function pickerEntries() {
  if (!pickerState) return [];
  if (pickerState.mode === "description") {
    return [...visibleSearchItems().map((entry) => ({ ...entry, pickerType: "item" })), ...support.bosses.map((entry) => ({ ...entry, pickerType: "boss" }))];
  }
  if (pickerState.mode === "boss") {
    return support.bosses.map((entry) => ({ ...entry, pickerType: "boss" }));
  }
  return visibleSearchItems().map((entry) => ({ ...entry, pickerType: "item" }));
}

function pickerSearchText(entry) {
  return [entry.displayName, entry.displayNameRu, entry.internalName, entry.id].filter(Boolean).join(" ").toLowerCase();
}

function renderPickerResults() {
  const query = refs.pickerSearchInput.value.trim().toLowerCase();
  const results = pickerEntries().filter((entry) => {
    if (pickerState?.mode === "item" && pickerState.filter !== "all-items") {
      const group = GROUPS.find((item) => item.key === (pickerState.groupKey || "weapon")) || GROUPS[0];
      return group.cats.includes(entry.category || "__unknown__");
    }
    if (pickerState?.mode === "description" && pickerState.filter && pickerState.filter !== "all") {
      if (pickerState.filter === "boss") return entry.pickerType === "boss";
      return entry.pickerType === "item";
    }
    return true;
  }).filter((entry) => !query || pickerSearchText(entry).includes(query)).slice(0, 200);
  refs.pickerResults.innerHTML = results.map((entry) => {
    const label = localizedDisplayName(entry) || String(entry.id || "").split("/").pop() || "";
    const boss = entry.pickerType === "boss";
    return `<button class="picker-result" type="button" data-picker-id="${esc(entry.id)}"><span class="picker-result__media">${iconMarkup(entry, label, boss)}</span><span class="picker-result__copy"><strong>${esc(label)}</strong><span>${esc(entry.id)}</span></span></button>`;
  }).join("") || `<p class="empty-state">${esc(s("noPickerResults"))}</p>`;
}

function insertAtCursor(textarea, value) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  textarea.value = `${textarea.value.slice(0, start)}${value}${textarea.value.slice(end)}`;
  const nextPosition = start + value.length;
  textarea.selectionStart = nextPosition;
  textarea.selectionEnd = nextPosition;
}

function handlePickerSelection(contentId) {
  if (!pickerState) return;

  if (pickerState.mode === "description") {
    const fieldRole = pickerState.fieldRole || "stage-description";
    const field = refs.accordion.querySelector(`[data-role="${fieldRole}"][data-stage-index="${pickerState.stageIndex}"]${Number.isInteger(pickerState.subStageIndex) ? `[data-substage-index="${pickerState.subStageIndex}"]` : ""}`);
    if (field) {
      insertAtCursor(field, `{{icon:${contentId}}}`);
      if (fieldRole === "stage-title") {
        state.stages[pickerState.stageIndex].title = field.value;
      } else if (fieldRole === "stage-description") {
        state.stages[pickerState.stageIndex].description = field.value;
      } else if (fieldRole === "substage-description" && Number.isInteger(pickerState.subStageIndex)) {
        state.stages[pickerState.stageIndex].subStages[pickerState.subStageIndex].description = field.value;
      }
      saveAndRender();
    }
    closePicker();
    return;
  }

  const stage = state.stages[pickerState.stageIndex];
  if (!stage) {
    closePicker();
    return;
  }

  if (pickerState.mode === "boss") {
    if (Number.isInteger(pickerState.bossIndex) && stage.bossRefs[pickerState.bossIndex] !== undefined) {
      stage.bossRefs[pickerState.bossIndex] = contentId;
    } else {
      stage.bossRefs.push(contentId);
    }
    saveAndRender();
    closePicker();
    return;
  }

  const entry = support.itemMap.get(contentId);
  if (Number.isInteger(pickerState.itemIndex) && stage.items[pickerState.itemIndex]) {
    stage.items[pickerState.itemIndex].itemId = contentId;
    stage.items[pickerState.itemIndex].category = inferItemCategory(entry, pickerState.groupKey);
    stage.items[pickerState.itemIndex].subgroupId = pickerState.groupKey === "accessory" ? (pickerState.subgroupId || "") : "";
  } else {
    stage.items.push(itemTemplate({ itemId: contentId, category: inferItemCategory(entry, pickerState.groupKey), subgroupId: pickerState.groupKey === "accessory" ? (pickerState.subgroupId || "") : "" }));
  }

  saveAndRender();
  closePicker();
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
  renderSupportStatus();

  try {
    const [itemsData, oresData, bossesData, searchItemsData] = await Promise.all([
      fetchJson(["supported/Terraria/items.json", "../supported/Terraria/items.json"]),
      fetchJson(["supported/Terraria/ores.json", "../supported/Terraria/ores.json"]),
      fetchJson(["supported/Terraria/bosses.json", "../supported/Terraria/bosses.json"]),
      fetchJson(["supported/Terraria/search-items.json", "../supported/Terraria/search-items.json"]).catch(() => ({ items: [] }))
    ]);

    support = { items: [...(itemsData.items || []), ...(oresData.ores || [])], searchItems: searchItemsData.items || [], bosses: bossesData.bosses || [], itemMap: new Map(), bossMap: new Map() };
    support.searchItems.forEach((entry) => support.itemMap.set(entry.id, entry));
    support.items.forEach((entry) => support.itemMap.set(entry.id, { ...support.itemMap.get(entry.id), ...entry }));
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
  state.stages.push(stageTemplate({ title: `${s("stage")} ${state.stages.length + 1}` }));
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
  const subStageIndex = Number(button.dataset.substageIndex);
  const groupKey = button.dataset.groupKey;
  const subgroupId = button.dataset.subgroupId || "";
  const groupId = button.dataset.groupId || "";
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
    return;
  }
  if (action === "move-stage-down" && stageIndex < state.stages.length - 1) {
    moveStage(stageIndex, stageIndex + 1);
    openStage = stageIndex + 1;
    saveAndRender();
    return;
  }
  if (action === "remove-stage" && state.stages.length > 1) {
    state.stages.splice(stageIndex, 1);
    openStage = Math.max(0, Math.min(openStage, state.stages.length - 1));
    saveAndRender();
    return;
  }
  if (action === "open-title-picker") return openPicker("description", { stageIndex, fieldRole: "stage-title" });
  if (action === "open-description-picker") return openPicker("description", { stageIndex, fieldRole: "stage-description" });
  if (action === "add-substage") {
    stage.subStages.push(subStageTemplate());
    saveAndRender();
    return;
  }
  if (action === "remove-substage") {
    stage.subStages.splice(subStageIndex, 1);
    saveAndRender();
    return;
  }
  if (action === "open-substage-description-picker") return openPicker("description", { stageIndex, subStageIndex, fieldRole: "substage-description" });
  if (action === "add-boss") {
    return openPicker("boss", { stageIndex });
  }
  if (action === "change-boss") return openPicker("boss", { stageIndex, bossIndex });
  if (action === "remove-boss") {
    stage.bossRefs.splice(bossIndex, 1);
    saveAndRender();
    return;
  }
  if (action === "add-accessory-group") {
    stage.accessoryGroups.push({ id: makeId("accessory"), title: "" });
    saveAndRender();
    return;
  }
  if (action === "remove-accessory-group") {
    stage.items.forEach((itemEntry) => {
      if (itemEntry.subgroupId === groupId) itemEntry.subgroupId = "";
    });
    stage.accessoryGroups = (stage.accessoryGroups || []).filter((entry) => entry.id !== groupId);
    saveAndRender();
    return;
  }
  if (action === "add-item") return openPicker("item", { stageIndex, groupKey, subgroupId });
  if (action === "change-item") return openPicker("item", { stageIndex, groupKey, itemIndex, subgroupId });
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
  if (role === "substage-title") stage.subStages[Number(target.dataset.substageIndex)].title = target.value;
  if (role === "substage-description") stage.subStages[Number(target.dataset.substageIndex)].description = target.value;
  if (role === "accessory-group-title") {
    const group = (stage.accessoryGroups || []).find((entry) => entry.id === target.dataset.groupId);
    if (group) group.title = target.value;
  }
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
    saveAndRender();
    return;
  }
});

refs.steps.addEventListener("click", (event) => {
  const button = event.target.closest("[data-step-target]");
  if (button) openStep(Number(button.dataset.stepTarget));
});
refs.prev.addEventListener("click", () => moveStep(-1));
refs.next.addEventListener("click", () => moveStep(1));
refs.copy.addEventListener("click", copyJson);
refs.download.addEventListener("click", downloadJson);
refs.issue.addEventListener("click", openIssue);
refs.reset.addEventListener("click", resetDraft);
refs.pickerClose.addEventListener("click", closePicker);
refs.picker.addEventListener("click", (event) => {
  if (event.target.closest("[data-picker-close]")) {
    closePicker();
    return;
  }
  const filterButton = event.target.closest("[data-picker-filter]");
  if (filterButton && pickerState) {
    pickerState.filter = filterButton.dataset.pickerFilter;
    renderPickerFilters();
    renderPickerResults();
    return;
  }
  const button = event.target.closest("[data-picker-id]");
  if (button) handlePickerSelection(button.dataset.pickerId);
});
refs.pickerSearchInput.addEventListener("input", renderPickerResults);
site?.onChange?.(() => renderAll());

renderAll();
loadSupport();
