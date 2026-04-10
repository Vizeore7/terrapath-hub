const STORAGE_KEY = "terrapath-editor-draft-v5";
const site = window.terraPathSite;
const progression = window.terraPathProgression;

const STEP_DEFINITIONS = [
  { titleKey: "editor.basicsTitle", descriptionKey: "editor.basicsDesc" },
  { titleKey: "editor.scopeTitle", descriptionKey: "editor.scopeDesc" },
  { titleKey: "editor.stagesTitle", descriptionKey: "editor.stagesDesc" },
  { titleKey: "editor.reviewTitle", descriptionKey: "editor.reviewDesc" }
];

const LANGUAGE_OPTIONS = [
  { value: "en-US", labelKey: "common.languageEnglishUs" },
  { value: "ru-RU", labelKey: "common.languageRussian" }
];

const SUPPORTED_MOD_OPTIONS = [
  {
    value: "Terraria",
    label: "Terraria",
    description: {
      en: "Ready now with curated item, ore, and boss pickers.",
      ru: "Уже доступен с готовыми списками предметов, руд и боссов."
    }
  },
  {
    value: "CalamityMod",
    label: "Calamity Mod",
    description: {
      en: "Metadata can already mention Calamity. Curated item support comes later.",
      ru: "Метаданные уже могут ссылаться на Calamity. Полная подборка предметов появится позже."
    }
  },
  {
    value: "ThoriumMod",
    label: "Thorium Mod",
    description: {
      en: "Metadata can already mention Thorium. Curated item support comes later.",
      ru: "Метаданные уже могут ссылаться на Thorium. Полная подборка предметов появится позже."
    }
  }
];

const CLASS_TAG_OPTIONS = [
  { value: "melee", label: { en: "Melee", ru: "Воин" } },
  { value: "ranged", label: { en: "Ranged", ru: "Стрелок" } },
  { value: "magic", label: { en: "Magic", ru: "Маг" } },
  { value: "summoner", label: { en: "Summoner", ru: "Призыватель" } },
  { value: "rogue", label: { en: "Rogue", ru: "Разбойник" } },
  { value: "bard", label: { en: "Bard", ru: "Бард" } },
  { value: "other", label: { en: "Other", ru: "Другое" } }
];

const GUIDE_TAG_OPTIONS = [
  { value: "starter", label: { en: "Starter", ru: "Старт" } },
  { value: "prehardmode", label: { en: "Pre-Hardmode", ru: "До хардмода" } },
  { value: "hardmode", label: { en: "Hardmode", ru: "Хардмод" } },
  { value: "bossing", label: { en: "Bossing", ru: "Боссы" } },
  { value: "progression", label: { en: "Progression", ru: "Прогрессия" } },
  { value: "vanilla", label: { en: "Vanilla", ru: "Ванилла" } },
  { value: "calamity", label: { en: "Calamity", ru: "Calamity" } },
  { value: "thorium", label: { en: "Thorium", ru: "Thorium" } },
  { value: "draft", label: { en: "Draft", ru: "Черновик" } }
];

const CATEGORY_LABELS = {
  en: {
    weapon: "Weapons",
    armor: "Armor",
    accessory: "Accessories",
    ammo: "Ammo",
    tool: "Tools",
    mount: "Mounts",
    pet: "Pets",
    buff: "Buffs",
    material: "Materials",
    ore: "Ores",
    furniture: "Furniture",
    other: "Other"
  },
  ru: {
    weapon: "Оружие",
    armor: "Броня",
    accessory: "Аксессуары",
    ammo: "Боеприпасы",
    tool: "Инструменты",
    mount: "Маунты",
    pet: "Питомцы",
    buff: "Баффы",
    material: "Материалы",
    ore: "Руды",
    furniture: "Мебель",
    other: "Другое"
  }
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS.en);

const wizardSteps = document.querySelector("#wizardSteps");
const supportStatus = document.querySelector("#supportStatus");
const guideSnapshot = document.querySelector("#guideSnapshot");
const stepEyebrow = document.querySelector("#stepEyebrow");
const stepTitle = document.querySelector("#stepTitle");
const stepDescription = document.querySelector("#stepDescription");
const stepPanels = Array.from(document.querySelectorAll("[data-step-panel]"));
const prevStepButton = document.querySelector("#prevStepButton");
const nextStepButton = document.querySelector("#nextStepButton");
const autosaveStatus = document.querySelector("#autosaveStatus");

const titleInput = document.querySelector("#titleInput");
const authorInput = document.querySelector("#authorInput");
const languageSelect = document.querySelector("#languageSelect");
const summaryInput = document.querySelector("#summaryInput");

const requiredModOptions = document.querySelector("#requiredModOptions");
const classTagOptions = document.querySelector("#classTagOptions");
const guideTagOptions = document.querySelector("#guideTagOptions");

const addStageButton = document.querySelector("#addStageButton");
const stageNav = document.querySelector("#stageNav");
const stageEditor = document.querySelector("#stageEditor");

const copyJsonButton = document.querySelector("#copyJsonButton");
const downloadButton = document.querySelector("#downloadButton");
const openIssueButton = document.querySelector("#openIssueButton");
const resetDraftButton = document.querySelector("#resetDraftButton");
const submissionStatus = document.querySelector("#submissionStatus");
const guidePreview = document.querySelector("#guidePreview");
const jsonPreview = document.querySelector("#jsonPreview");

let currentStep = 0;
let selectedStageIndex = 0;
let latestJson = "{}\n";
let lastSavedAt = null;

let supportIndex = {
  items: [],
  bosses: [],
  itemMap: new Map(),
  bossMap: new Map()
};

let state = loadDraft() || createDefaultState();

function uiLanguage() {
  return site?.getLanguage?.() === "ru" ? "ru" : "en";
}

function t(key, variables = {}) {
  return site?.t?.(key, variables) ?? key;
}

function localText(en, ru) {
  return uiLanguage() === "ru" ? ru : en;
}

function localized(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[uiLanguage()] ?? value.en ?? "";
  }
  return String(value || "");
}

function guideLanguageLabel(code) {
  return site?.getGuideLanguageLabel?.(code) ?? code;
}

function categoryLabel(category) {
  return CATEGORY_LABELS[uiLanguage()]?.[category] || CATEGORY_LABELS.en[category] || category;
}

function classLabel(tag) {
  return localized(CLASS_TAG_OPTIONS.find((option) => option.value === tag)?.label || tag);
}

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

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "new-guide";
}

function splitLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeLabel() {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function createItem(seed = {}) {
  return {
    itemId: seed.itemId || "",
    category: seed.category || "weapon",
    priority: Number.isFinite(seed.priority) ? seed.priority : 50,
    note: seed.note || ""
  };
}

function createStage(seed = {}) {
  return {
    title: seed.title || localText("New Stage", "Новый этап"),
    era: seed.era || "prehardmode",
    progressionMarkers: Array.isArray(seed.progressionMarkers) ? [...seed.progressionMarkers] : [],
    description: seed.description || "",
    goalsText: seed.goalsText || "",
    notesText: seed.notesText || "",
    bossRefs: Array.isArray(seed.bossRefs) ? [...seed.bossRefs] : [],
    items: Array.isArray(seed.items) && seed.items.length
      ? seed.items.map((item) => createItem(item))
      : [createItem()]
  };
}

function createDefaultState() {
  return {
    createdAt: today(),
    title: "Vanilla Melee Starter Path",
    author: "TerraPath Team",
    language: "en-US",
    requiredMods: ["Terraria"],
    classTags: ["melee"],
    guideTags: ["starter", "progression", "vanilla", "draft"],
    summary: "A structured melee progression path that shows how TerraPath guides can be authored and reviewed.",
    stages: [
      createStage({
        title: "First Night",
        era: "prehardmode",
        progressionMarkers: ["early-exploration", "pre-eye-of-cthulhu"],
        description: "Collect movement accessories, build a simple arena, and prepare a reliable early melee option.",
        goalsText: "Find a mobility accessory\nPrepare a simple wooden arena\nCraft or loot a stronger melee option",
        notesText: "This is still an example draft.",
        bossRefs: ["Terraria/EyeofCthulhu"],
        items: [
          {
            itemId: "Terraria/CloudinaBottle",
            category: "accessory",
            priority: 85,
            note: "Early movement is almost always worth prioritizing."
          },
          {
            itemId: "Terraria/EnchantedBoomerang",
            category: "weapon",
            priority: 70,
            note: "A safe ranged melee option for early exploration."
          }
        ]
      })
    ]
  };
}

function normalizeState(raw) {
  if (!raw || typeof raw !== "object") {
    return createDefaultState();
  }

  return {
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : today(),
    title: String(raw.title || ""),
    author: String(raw.author || ""),
    language: String(raw.language || "en-US"),
    requiredMods: uniqueValues(Array.isArray(raw.requiredMods) ? raw.requiredMods : ["Terraria"]),
    classTags: uniqueValues(Array.isArray(raw.classTags) ? raw.classTags : ["other"]),
    guideTags: uniqueValues(Array.isArray(raw.guideTags) ? raw.guideTags : ["draft"]),
    summary: String(raw.summary || ""),
    stages: Array.isArray(raw.stages) && raw.stages.length
      ? raw.stages.map((stage) => createStage(stage))
      : [createStage()]
  };
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  lastSavedAt = nowTimeLabel();
}

function resolveEntry(contentId, map) {
  return map.get(contentId) || null;
}

function resolveEntryName(contentId, map) {
  const entry = resolveEntry(contentId, map);
  if (entry?.displayName) {
    return entry.displayName;
  }
  return String(contentId || "").split("/").pop() || localText("Unknown entry", "Неизвестная запись");
}

function iconMarkup(entry, label) {
  if (entry?.icon) {
    return `<img class="content-icon" src="${escapeHtml(entry.icon)}" alt="${escapeHtml(label)}" loading="lazy">`;
  }
  return `<span class="content-token">${escapeHtml(initials(label))}</span>`;
}

function buildSelectOptions(entries, selectedValue, placeholderLabel) {
  const sortedEntries = [...entries].sort((left, right) => left.displayName.localeCompare(right.displayName));
  let markup = `<option value="">${escapeHtml(placeholderLabel)}</option>`;

  if (selectedValue && !entries.some((entry) => entry.id === selectedValue)) {
    markup += `<option value="${escapeHtml(selectedValue)}" selected>${escapeHtml(selectedValue)}</option>`;
  }

  const byMod = new Map();
  for (const entry of sortedEntries) {
    const modName = String(entry.id || "").split("/")[0] || "Other";
    const bucket = byMod.get(modName) || [];
    bucket.push(entry);
    byMod.set(modName, bucket);
  }

  for (const [modName, modEntries] of byMod) {
    markup += `
      <optgroup label="${escapeHtml(modName)}">
        ${modEntries.map((entry) => `
          <option value="${escapeHtml(entry.id)}" ${entry.id === selectedValue ? "selected" : ""}>
            ${escapeHtml(entry.displayName)}
          </option>
        `).join("")}
      </optgroup>
    `;
  }

  return markup;
}

function buildGuide() {
  const usedStageIds = new Map();
  const stages = state.stages.map((stage, index) => {
    const title = stage.title.trim() || `${localText("Stage", "Этап")} ${index + 1}`;
    const baseId = slugify(title).slice(0, 40) || `stage-${index + 1}`;
    const usedCount = usedStageIds.get(baseId) || 0;
    const stageId = usedCount ? `${baseId}-${usedCount + 1}`.slice(0, 40) : baseId;
    usedStageIds.set(baseId, usedCount + 1);

    const output = {
      id: stageId,
      title,
      era: stage.era || "prehardmode",
      items: stage.items
        .map((item) => ({
          itemId: String(item.itemId || "").trim(),
          category: item.category || "other",
          priority: Number.isFinite(item.priority) ? item.priority : 50,
          note: String(item.note || "").trim()
        }))
        .filter((item) => item.itemId)
        .map((item) => {
          const next = { itemId: item.itemId, category: item.category };
          if (item.priority !== 50) {
            next.priority = item.priority;
          }
          if (item.note) {
            next.note = item.note;
          }
          return next;
        })
    };

    const markerIds = uniqueValues(stage.progressionMarkers || []);
    const bossRefs = uniqueValues((stage.bossRefs || []).map((value) => String(value || "").trim()).filter(Boolean));
    const goals = splitLines(stage.goalsText);
    const notes = splitLines(stage.notesText);

    if (stage.description.trim()) {
      output.description = stage.description.trim();
    }
    if (markerIds.length) {
      output.progressionMarkers = markerIds;
    }
    if (bossRefs.length) {
      output.bossRefs = bossRefs;
    }
    if (goals.length) {
      output.goals = goals;
    }
    if (notes.length) {
      output.notes = notes;
    }

    return output;
  });

  const guide = {
    schemaVersion: 1,
    id: slugify(`${state.requiredMods[0] || "guide"}-${state.classTags[0] || "path"}-${state.title}`),
    title: state.title.trim() || localText("Untitled Guide", "Руководство без названия"),
    author: state.author.trim() || localText("Unknown Author", "Неизвестный автор"),
    language: state.language || "en-US",
    summary: state.summary.trim() || localText("Draft guide.", "Черновик руководства."),
    requiredMods: state.requiredMods.length ? state.requiredMods : ["Terraria"],
    classTags: state.classTags.length ? state.classTags : ["other"],
    createdAt: state.createdAt,
    updatedAt: today(),
    stages
  };

  if (state.guideTags.length) {
    guide.guideTags = [...state.guideTags];
  }

  return guide;
}

function completionForStep(stepIndex) {
  switch (stepIndex) {
    case 0:
      return Boolean(state.title.trim() && state.author.trim() && state.summary.trim());
    case 1:
      return Boolean(state.requiredMods.length && state.classTags.length);
    case 2:
      return state.stages.some((stage) => stage.title.trim() && stage.items.some((item) => item.itemId));
    default:
      return false;
  }
}

function renderWizardSteps() {
  wizardSteps.innerHTML = STEP_DEFINITIONS.map((step, index) => {
    const isCurrent = index === currentStep;
    const isReady = completionForStep(index);
    const stateLabel = isCurrent
      ? t("editor.current")
      : isReady
        ? t("editor.ready")
        : t("editor.pending");

    return `
      <li class="wizard-step ${isCurrent ? "wizard-step--current" : ""} ${isReady ? "wizard-step--complete" : ""}">
        <button class="wizard-step__button" type="button" data-step-target="${index}">
          <span class="wizard-step__count">${index + 1}</span>
          <span class="wizard-step__body">
            <strong>${escapeHtml(t(step.titleKey))}</strong>
            <span>${escapeHtml(t(step.descriptionKey))}</span>
          </span>
          <span class="wizard-step__state">${escapeHtml(stateLabel)}</span>
        </button>
      </li>
    `;
  }).join("");
}

function renderSnapshot() {
  const itemCount = state.stages.reduce((count, stage) => count + stage.items.filter((item) => item.itemId).length, 0);

  guideSnapshot.innerHTML = `
    <article class="snapshot-metric">
      <span class="snapshot-metric__label">${escapeHtml(t("editor.stageSnapshotTitle"))}</span>
      <strong>${escapeHtml(state.title || localText("Untitled guide", "Руководство без названия"))}</strong>
    </article>
    <article class="snapshot-metric">
      <span class="snapshot-metric__label">${escapeHtml(t("editor.stageSnapshotAuthor"))}</span>
      <strong>${escapeHtml(state.author || localText("Unknown author", "Неизвестный автор"))}</strong>
    </article>
    <article class="snapshot-metric">
      <span class="snapshot-metric__label">${escapeHtml(t("editor.stageSnapshotLanguage"))}</span>
      <strong>${escapeHtml(guideLanguageLabel(state.language))}</strong>
    </article>
    <article class="snapshot-metric">
      <span class="snapshot-metric__label">${escapeHtml(t("editor.stageSnapshotStages"))}</span>
      <strong>${state.stages.length}</strong>
    </article>
    <article class="snapshot-metric">
      <span class="snapshot-metric__label">${escapeHtml(t("editor.stageSnapshotItems"))}</span>
      <strong>${itemCount}</strong>
    </article>
    <article class="snapshot-metric">
      <span class="snapshot-metric__label">${escapeHtml(t("editor.stageSnapshotClasses"))}</span>
      <strong>${escapeHtml((state.classTags || []).map(classLabel).join(", ") || localText("Other", "Другое"))}</strong>
    </article>
  `;
}

function renderLanguageOptions() {
  languageSelect.innerHTML = LANGUAGE_OPTIONS.map((option) => `
    <option value="${option.value}">${escapeHtml(t(option.labelKey))}</option>
  `).join("");
}

function buildChoiceMarkup(option, groupName, selectedValues) {
  const checked = selectedValues.includes(option.value) ? "checked" : "";
  const title = option.label ? localized(option.label) : t(option.labelKey);
  const description = localized(option.description || "");

  return `
    <label class="choice-card">
      <input type="checkbox" value="${escapeHtml(option.value)}" data-choice-group="${groupName}" ${checked}>
      <span class="choice-card__copy">
        <span class="choice-card__title">${escapeHtml(title)}</span>
        <span class="choice-card__description">${escapeHtml(description)}</span>
      </span>
    </label>
  `;
}

function renderChoiceGroups() {
  requiredModOptions.innerHTML = SUPPORTED_MOD_OPTIONS.map((option) => buildChoiceMarkup(option, "required-mods", state.requiredMods)).join("");
  classTagOptions.innerHTML = CLASS_TAG_OPTIONS.map((option) => buildChoiceMarkup(option, "class-tags", state.classTags)).join("");
  guideTagOptions.innerHTML = GUIDE_TAG_OPTIONS.map((option) => buildChoiceMarkup(option, "guide-tags", state.guideTags)).join("");
}

function syncMetadataInputs() {
  titleInput.value = state.title;
  authorInput.value = state.author;
  languageSelect.value = state.language;
  summaryInput.value = state.summary;
}

function eraOptionsMarkup(selectedEra) {
  return (progression?.eras || []).map((era) => `
    <option value="${era.id}" ${era.id === selectedEra ? "selected" : ""}>
      ${escapeHtml(progression.eraLabel(era.id, uiLanguage()))}
    </option>
  `).join("");
}

function renderProgressionMarkerSelector(stage, stageIndex) {
  const markers = progression?.markersForEra?.(stage.era || "prehardmode") || [];
  if (!markers.length) {
    return `<p class="empty-state">${escapeHtml(localText("No detailed markers are available for this era yet.", "Для этого периода игры пока нет подробных мини-этапов."))}</p>`;
  }

  return `
    <div class="marker-grid">
      ${markers.map((marker) => {
        const selected = (stage.progressionMarkers || []).includes(marker.id);
        return `
          <button class="marker-card ${selected ? "marker-card--selected" : ""}" type="button" data-action="toggle-marker" data-stage-index="${stageIndex}" data-marker-id="${marker.id}">
            <span class="pick-card__media">
              <img class="content-icon" src="${escapeHtml(marker.icon)}" alt="${escapeHtml(progression.markerTitle(marker.id, uiLanguage()))}" loading="lazy">
            </span>
            <span class="marker-card__body">
              <strong>${escapeHtml(progression.markerTitle(marker.id, uiLanguage()))}</strong>
              <span>${escapeHtml(progression.markerDescription(marker.id, uiLanguage()))}</span>
            </span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderSelectedMarkers(stage) {
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
              <img class="content-icon" src="${escapeHtml(marker.icon)}" alt="${escapeHtml(progression.markerTitle(markerId, uiLanguage()))}" loading="lazy">
              <div>
                <strong>${escapeHtml(progression.markerTitle(markerId, uiLanguage()))}</strong>
                <p>${escapeHtml(progression.markerDescription(markerId, uiLanguage()))}</p>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderStageNav() {
  const upLabel = localText("Up", "Вверх");
  const downLabel = localText("Down", "Вниз");
  const deleteLabel = localText("Delete", "Удалить");

  stageNav.innerHTML = state.stages.map((stage, index) => {
    const selected = index === selectedStageIndex;
    const stageItemCount = stage.items.filter((item) => item.itemId).length;
    const eraLabel = progression?.eraLabel?.(stage.era || "prehardmode", uiLanguage()) || stage.era || "";
    const summary = `${eraLabel} / ${t("editor.stageItemPicks", { count: stageItemCount })}`;

    return `
      <article class="stage-tab ${selected ? "stage-tab--selected" : ""}">
        <button class="stage-tab__select" type="button" data-action="select-stage" data-stage-index="${index}">
          <span class="stage-tab__index">${escapeHtml(t("editor.stageCounter", { index: index + 1 }))}</span>
          <strong>${escapeHtml(stage.title || `${localText("Stage", "Этап")} ${index + 1}`)}</strong>
          <span>${escapeHtml(summary)}</span>
        </button>
        <div class="stage-tab__actions">
          <button class="button button--quiet button--tiny" type="button" data-action="move-stage-up" data-stage-index="${index}" title="${escapeHtml(upLabel)}" ${index === 0 ? "disabled" : ""}>${escapeHtml(upLabel)}</button>
          <button class="button button--quiet button--tiny" type="button" data-action="move-stage-down" data-stage-index="${index}" title="${escapeHtml(downLabel)}" ${index === state.stages.length - 1 ? "disabled" : ""}>${escapeHtml(downLabel)}</button>
          <button class="button button--quiet button--tiny" type="button" data-action="remove-stage" data-stage-index="${index}" title="${escapeHtml(deleteLabel)}" ${state.stages.length === 1 ? "disabled" : ""}>${escapeHtml(deleteLabel)}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderBossEditors(stage, stageIndex) {
  if (!stage.bossRefs.length) {
    return `<p class="empty-state">${escapeHtml(t("editor.noBossMilestones"))}</p>`;
  }

  return stage.bossRefs.map((bossRef, bossIndex) => {
    const entry = resolveEntry(bossRef, supportIndex.bossMap);
    const label = resolveEntryName(bossRef, supportIndex.bossMap);

    return `
      <article class="pick-card">
        <div class="pick-card__head">
          <span class="pick-card__media">${iconMarkup(entry, label)}</span>
          <div class="pick-card__copy">
            <strong>${escapeHtml(label)}</strong>
            <label class="field">
              <span>${escapeHtml(t("editor.bossMilestoneLabel"))}</span>
              <select data-role="boss-id" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">
                ${buildSelectOptions(supportIndex.bosses, bossRef, t("editor.chooseBoss"))}
              </select>
            </label>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="remove-boss" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">
            ${escapeHtml(t("editor.remove"))}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function renderItemEditors(stage, stageIndex) {
  if (!stage.items.length) {
    return `<p class="empty-state">${escapeHtml(t("editor.noItemPicks"))}</p>`;
  }

  return stage.items.map((item, itemIndex) => {
    const entry = resolveEntry(item.itemId, supportIndex.itemMap);
    const label = resolveEntryName(item.itemId, supportIndex.itemMap);

    return `
      <article class="pick-card">
        <div class="pick-card__head">
          <span class="pick-card__media">${iconMarkup(entry, label)}</span>
          <div class="pick-card__copy">
            <strong>${escapeHtml(label)}</strong>
            <label class="field">
              <span>${escapeHtml(t("editor.itemLabel"))}</span>
              <select data-role="item-id" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">
                ${buildSelectOptions(supportIndex.items, item.itemId, t("editor.chooseItem"))}
              </select>
            </label>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="remove-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">
            ${escapeHtml(t("editor.remove"))}
          </button>
        </div>
        <div class="pick-card__grid">
          <label class="field">
            <span>${escapeHtml(t("editor.categoryLabel"))}</span>
            <select data-role="item-category" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">
              ${CATEGORY_OPTIONS.map((category) => `
                <option value="${category}" ${category === item.category ? "selected" : ""}>${escapeHtml(categoryLabel(category))}</option>
              `).join("")}
            </select>
          </label>
          <label class="field">
            <span>${escapeHtml(t("editor.priorityLabel"))}</span>
            <input data-role="item-priority" data-stage-index="${stageIndex}" data-item-index="${itemIndex}" type="number" min="0" max="100" value="${Number(item.priority)}">
          </label>
        </div>
        <label class="field">
          <span>${escapeHtml(t("editor.itemNoteLabel"))}</span>
          <textarea data-role="item-note" data-stage-index="${stageIndex}" data-item-index="${itemIndex}" rows="3" placeholder="${escapeHtml(t("editor.itemNotePlaceholder"))}">${escapeHtml(item.note)}</textarea>
        </label>
      </article>
    `;
  }).join("");
}

function renderStageEditor() {
  const stage = state.stages[selectedStageIndex];
  if (!stage) {
    stageEditor.innerHTML = `<p class="empty-state">${escapeHtml(t("editor.noSelectedStage"))}</p>`;
    return;
  }

  stageEditor.innerHTML = `
    <section class="stage-panel">
      <div class="section-copy">
        <h3>${escapeHtml(stage.title || `${localText("Stage", "Этап")} ${selectedStageIndex + 1}`)}</h3>
        <p class="muted">${escapeHtml(t("editor.stageIntro"))}</p>
      </div>

      <div class="form-layout">
        <label class="field">
          <span>${escapeHtml(t("editor.stageTitleLabel"))}</span>
          <input data-role="stage-title" data-stage-index="${selectedStageIndex}" value="${escapeHtml(stage.title)}" placeholder="${escapeHtml(localText("Early gear setup", "Подготовка стартового снаряжения"))}">
        </label>

        <label class="field">
          <span>${escapeHtml(t("editor.stageEraLabel"))}</span>
          <select data-role="stage-era" data-stage-index="${selectedStageIndex}">
            ${eraOptionsMarkup(stage.era || "prehardmode")}
          </select>
        </label>

        <label class="field field--wide">
          <span>${escapeHtml(t("editor.stageDescriptionLabel"))}</span>
          <textarea data-role="stage-description" data-stage-index="${selectedStageIndex}" rows="4" placeholder="${escapeHtml(t("editor.stageDescriptionPlaceholder"))}">${escapeHtml(stage.description)}</textarea>
        </label>

        <label class="field field--wide">
          <span>${escapeHtml(t("editor.stageGoalsLabel"))}</span>
          <textarea data-role="stage-goals" data-stage-index="${selectedStageIndex}" rows="4" placeholder="${escapeHtml(t("editor.stageGoalsPlaceholder"))}">${escapeHtml(stage.goalsText)}</textarea>
        </label>

        <label class="field field--wide">
          <span>${escapeHtml(t("editor.stageNotesLabel"))}</span>
          <textarea data-role="stage-notes" data-stage-index="${selectedStageIndex}" rows="4" placeholder="${escapeHtml(t("editor.stageNotesPlaceholder"))}">${escapeHtml(stage.notesText)}</textarea>
        </label>
      </div>

      <section class="subpanel">
        <div class="subpanel__header">
          <div class="section-copy">
            <h4>${escapeHtml(t("editor.stageMarkersTitle"))}</h4>
            <p class="muted">${escapeHtml(t("editor.stageMarkersBody"))}</p>
          </div>
        </div>
        ${renderProgressionMarkerSelector(stage, selectedStageIndex)}
      </section>

      <section class="subpanel">
        <div class="subpanel__header">
          <div class="section-copy">
            <h4>${escapeHtml(t("editor.bossMilestonesTitle"))}</h4>
            <p class="muted">${escapeHtml(t("editor.bossMilestonesBody"))}</p>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="add-boss" data-stage-index="${selectedStageIndex}">
            ${escapeHtml(t("editor.addBoss"))}
          </button>
        </div>
        <div class="stack compact-stack">
          ${renderBossEditors(stage, selectedStageIndex)}
        </div>
      </section>

      <section class="subpanel">
        <div class="subpanel__header">
          <div class="section-copy">
            <h4>${escapeHtml(t("editor.itemPicksTitle"))}</h4>
            <p class="muted">${escapeHtml(t("editor.itemPicksBody"))}</p>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${selectedStageIndex}">
            ${escapeHtml(t("editor.addItem"))}
          </button>
        </div>
        <div class="stack compact-stack">
          ${renderItemEditors(stage, selectedStageIndex)}
        </div>
      </section>
    </section>
  `;
}

function buildContentBadge(contentId, map) {
  const entry = resolveEntry(contentId, map);
  const label = resolveEntryName(contentId, map);
  return `
    <div class="content-chip">
      <span class="content-chip__media">${iconMarkup(entry, label)}</span>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function renderStagePreview(stage) {
  const groupedItems = new Map();
  for (const item of stage.items || []) {
    const key = item.category || "other";
    const group = groupedItems.get(key) || [];
    group.push(item);
    groupedItems.set(key, group);
  }

  const groupsMarkup = Array.from(groupedItems.entries())
    .sort(([left], [right]) => categoryLabel(left).localeCompare(categoryLabel(right)))
    .map(([category, items]) => `
      <section class="category-block">
        <h4>${escapeHtml(categoryLabel(category))}</h4>
        <div class="content-grid">
          ${items.map((item) => {
            const entry = resolveEntry(item.itemId, supportIndex.itemMap);
            const label = resolveEntryName(item.itemId, supportIndex.itemMap);
            return `
              <article class="content-card">
                <div class="content-card__head">
                  <span class="content-card__media">${iconMarkup(entry, label)}</span>
                  <div>
                    <strong>${escapeHtml(label)}</strong>
                    <div class="content-card__meta">${escapeHtml(item.itemId)}</div>
                  </div>
                </div>
                ${item.note ? `<p class="content-card__note">${escapeHtml(item.note)}</p>` : ""}
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `)
    .join("");

  return `
    <article class="stage-preview">
      <div class="stage-preview__header">
        <h3>${escapeHtml(stage.title)}</h3>
        <span class="meta-pill">${escapeHtml(t("editor.stageItemPicks", { count: (stage.items || []).length }))}</span>
      </div>
      <div class="chip-row">
        <span class="meta-pill">${escapeHtml(t("common.labelEra"))}: ${escapeHtml(progression?.eraLabel?.(stage.era || "prehardmode", uiLanguage()) || stage.era || "")}</span>
      </div>
      ${stage.description ? `<p>${escapeHtml(stage.description)}</p>` : ""}
      ${renderSelectedMarkers(stage)}
      ${stage.bossRefs?.length ? `
        <section class="preview-block">
          <h4>${escapeHtml(t("common.labelBosses"))}</h4>
          <div class="chip-row">
            ${stage.bossRefs.map((bossRef) => buildContentBadge(bossRef, supportIndex.bossMap)).join("")}
          </div>
        </section>
      ` : ""}
      ${stage.goals?.length ? `
        <section class="preview-block">
          <h4>${escapeHtml(t("common.labelGoals"))}</h4>
          <ul class="line-list">
            ${stage.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")}
          </ul>
        </section>
      ` : ""}
      ${groupsMarkup || `<p class="empty-state">${escapeHtml(t("editor.noItemsPreview"))}</p>`}
      ${stage.notes?.length ? `
        <section class="preview-block">
          <h4>${escapeHtml(t("common.labelNotes"))}</h4>
          <ul class="line-list">
            ${stage.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
          </ul>
        </section>
      ` : ""}
    </article>
  `;
}

function renderGuidePreview(guide) {
  const metaPills = [
    `${t("common.labelClass")}: ${(guide.classTags || []).map(classLabel).join(", ")}`,
    `${t("common.labelLanguage")}: ${guideLanguageLabel(guide.language)}`,
    `${t("common.labelMods")}: ${(guide.requiredMods || []).join(", ")}`,
    `${(guide.stages || []).length} ${t("common.labelStages").toLowerCase()}`
  ];

  guidePreview.innerHTML = `
    <header class="guide-preview__header">
      <h2 class="guide-title">${escapeHtml(guide.title)}</h2>
      <p>${escapeHtml(guide.summary)}</p>
      <div class="chip-row">
        ${metaPills.map((pill) => `<span class="meta-pill">${escapeHtml(pill)}</span>`).join("")}
      </div>
    </header>
    <div class="guide-preview__stages">
      ${(guide.stages || []).map((stage) => renderStagePreview(stage)).join("")}
    </div>
  `;
}

function renderReview() {
  const guide = buildGuide();
  latestJson = `${JSON.stringify(guide, null, 2)}\n`;
  jsonPreview.textContent = latestJson;
  renderGuidePreview(guide);
  downloadButton.disabled = false;
}

function renderStepMeta() {
  const definition = STEP_DEFINITIONS[currentStep];
  stepEyebrow.textContent = t("editor.stepCounter", { current: currentStep + 1, total: STEP_DEFINITIONS.length });
  stepTitle.textContent = t(definition.titleKey);
  stepDescription.textContent = t(definition.descriptionKey);
}

function renderPanels() {
  for (const panel of stepPanels) {
    panel.hidden = Number(panel.dataset.stepPanel) !== currentStep;
  }
}

function renderFooter() {
  prevStepButton.disabled = currentStep === 0;
  prevStepButton.textContent = t("editor.back");

  if (currentStep === STEP_DEFINITIONS.length - 1) {
    nextStepButton.textContent = t("editor.stayOnReview");
    nextStepButton.disabled = true;
  } else {
    nextStepButton.textContent = currentStep === STEP_DEFINITIONS.length - 2
      ? t("editor.goToReview")
      : t("editor.nextStep");
    nextStepButton.disabled = false;
  }

  autosaveStatus.textContent = lastSavedAt
    ? t("editor.autosavedAt", { time: lastSavedAt })
    : t("editor.autosave");
}

function clampStageSelection() {
  selectedStageIndex = Math.max(0, Math.min(selectedStageIndex, state.stages.length - 1));
}

function renderAll() {
  clampStageSelection();
  syncMetadataInputs();
  renderChoiceGroups();
  renderWizardSteps();
  renderSnapshot();
  renderStepMeta();
  renderPanels();
  renderStageNav();
  renderStageEditor();
  renderReview();
  renderFooter();
}

function persistAndRender() {
  saveDraft();
  renderAll();
}

function refreshDerivedViews(rerenderStageEditor = false) {
  renderWizardSteps();
  renderSnapshot();
  renderStageNav();
  if (rerenderStageEditor) {
    renderStageEditor();
  }
  renderReview();
  renderFooter();
}

function toggleArrayValue(values, value) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

function swapStages(fromIndex, toIndex) {
  const next = [...state.stages];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  state.stages = next;
}

function openStep(stepIndex) {
  currentStep = Math.max(0, Math.min(STEP_DEFINITIONS.length - 1, stepIndex));
  renderAll();
}

function moveStep(offset) {
  openStep(currentStep + offset);
}

function handleMetadataChoiceChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  const group = input.dataset.choiceGroup;
  if (!group) {
    return;
  }

  if (group === "required-mods") {
    state.requiredMods = toggleArrayValue(state.requiredMods, input.value);
    if (!state.requiredMods.length) {
      state.requiredMods = ["Terraria"];
    }
  }

  if (group === "class-tags") {
    state.classTags = toggleArrayValue(state.classTags, input.value);
    if (!state.classTags.length) {
      state.classTags = ["other"];
    }
  }

  if (group === "guide-tags") {
    state.guideTags = toggleArrayValue(state.guideTags, input.value);
  }

  persistAndRender();
}

function handleStageNavClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const stageIndex = Number(button.dataset.stageIndex);

  if (action === "select-stage") {
    selectedStageIndex = stageIndex;
    renderAll();
    return;
  }

  if (action === "move-stage-up" && stageIndex > 0) {
    swapStages(stageIndex, stageIndex - 1);
    selectedStageIndex = stageIndex - 1;
    persistAndRender();
    return;
  }

  if (action === "move-stage-down" && stageIndex < state.stages.length - 1) {
    swapStages(stageIndex, stageIndex + 1);
    selectedStageIndex = stageIndex + 1;
    persistAndRender();
    return;
  }

  if (action === "remove-stage" && state.stages.length > 1) {
    state.stages.splice(stageIndex, 1);
    selectedStageIndex = Math.max(0, Math.min(selectedStageIndex, state.stages.length - 1));
    persistAndRender();
  }
}

function handleStageEditorClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const stageIndex = Number(button.dataset.stageIndex);
  const itemIndex = Number(button.dataset.itemIndex);
  const bossIndex = Number(button.dataset.bossIndex);
  const stage = state.stages[stageIndex];

  if (!stage) {
    return;
  }

  if (action === "add-boss") {
    stage.bossRefs.push("");
    persistAndRender();
    return;
  }

  if (action === "remove-boss") {
    stage.bossRefs.splice(bossIndex, 1);
    persistAndRender();
    return;
  }

  if (action === "add-item") {
    stage.items.push(createItem());
    persistAndRender();
    return;
  }

  if (action === "remove-item") {
    stage.items.splice(itemIndex, 1);
    if (!stage.items.length) {
      stage.items.push(createItem());
    }
    persistAndRender();
    return;
  }

  if (action === "toggle-marker") {
    const markerId = button.dataset.markerId;
    const next = new Set(stage.progressionMarkers || []);
    if (next.has(markerId)) {
      next.delete(markerId);
    } else {
      next.add(markerId);
    }
    stage.progressionMarkers = Array.from(next);
    persistAndRender();
  }
}

function handleStageEditorInput(event) {
  const target = event.target;
  const role = target.dataset.role;
  if (!role) {
    return;
  }

  const stageIndex = Number(target.dataset.stageIndex);
  const itemIndex = Number(target.dataset.itemIndex);
  const bossIndex = Number(target.dataset.bossIndex);
  const stage = state.stages[stageIndex];
  if (!stage) {
    return;
  }

  if (role === "stage-title") {
    stage.title = target.value;
    saveDraft();
    refreshDerivedViews(true);
    return;
  }

  if (role === "stage-era") {
    stage.era = target.value;
    const allowedIds = new Set((progression?.markersForEra?.(stage.era) || []).map((marker) => marker.id));
    stage.progressionMarkers = (stage.progressionMarkers || []).filter((markerId) => allowedIds.has(markerId));
    saveDraft();
    refreshDerivedViews(true);
    return;
  }

  if (role === "stage-description") {
    stage.description = target.value;
    saveDraft();
    refreshDerivedViews(false);
    return;
  }

  if (role === "stage-goals") {
    stage.goalsText = target.value;
    saveDraft();
    refreshDerivedViews(false);
    return;
  }

  if (role === "stage-notes") {
    stage.notesText = target.value;
    saveDraft();
    refreshDerivedViews(false);
    return;
  }

  if (role === "boss-id") {
    stage.bossRefs[bossIndex] = target.value;
    saveDraft();
    refreshDerivedViews(true);
    return;
  }

  if (role === "item-id") {
    stage.items[itemIndex].itemId = target.value;
    const entry = resolveEntry(target.value, supportIndex.itemMap);
    if (entry?.category) {
      stage.items[itemIndex].category = entry.category;
    }
    saveDraft();
    refreshDerivedViews(true);
    return;
  }

  if (role === "item-category") {
    stage.items[itemIndex].category = target.value;
    saveDraft();
    refreshDerivedViews(true);
    return;
  }

  if (role === "item-priority") {
    stage.items[itemIndex].priority = Math.max(0, Math.min(100, Number(target.value) || 0));
    saveDraft();
    refreshDerivedViews(false);
    return;
  }

  if (role === "item-note") {
    stage.items[itemIndex].note = target.value;
    saveDraft();
    refreshDerivedViews(false);
  }
}

async function copyJson() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(latestJson);
      submissionStatus.textContent = t("editor.copiedJson");
      return;
    }
  } catch {
    // Continue to selection fallback.
  }

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(jsonPreview);
  selection.removeAllRanges();
  selection.addRange(range);
  submissionStatus.textContent = t("editor.selectedJson");
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

function detectRepositoryUrl() {
  const { hostname, pathname } = window.location;

  if (hostname.endsWith(".github.io")) {
    const owner = hostname.slice(0, hostname.indexOf(".github.io"));
    const repo = pathname.split("/").filter(Boolean)[0];
    if (owner && repo) {
      return `https://github.com/${owner}/${repo}`;
    }
  }

  if (hostname === "github.com") {
    const [owner, repo] = pathname.split("/").filter(Boolean);
    if (owner && repo) {
      return `https://github.com/${owner}/${repo}`;
    }
  }

  return null;
}

function openIssuePage() {
  const repositoryUrl = detectRepositoryUrl();
  if (!repositoryUrl) {
    submissionStatus.textContent = t("editor.repoUnknown");
    return;
  }

  window.open(`${repositoryUrl}/issues/new`, "_blank", "noopener");
  submissionStatus.textContent = t("editor.issueOpened");
}

function resetDraft() {
  if (!confirm(t("editor.resetConfirm"))) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  state = createDefaultState();
  currentStep = 0;
  selectedStageIndex = 0;
  lastSavedAt = null;
  submissionStatus.textContent = t("editor.draftReset");
  renderAll();
}

async function tryFetchJson(paths) {
  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (response.ok) {
        return response.json();
      }
    } catch {
      // Continue to fallback path.
    }
  }

  throw new Error("Unable to load JSON.");
}

async function loadSupportIndex() {
  try {
    const [itemsData, oresData, bossesData] = await Promise.all([
      tryFetchJson(["supported/Terraria/items.json", "../supported/Terraria/items.json"]),
      tryFetchJson(["supported/Terraria/ores.json", "../supported/Terraria/ores.json"]),
      tryFetchJson(["supported/Terraria/bosses.json", "../supported/Terraria/bosses.json"])
    ]);

    const itemEntries = [
      ...(itemsData.items || []),
      ...((oresData.ores || []).map((entry) => ({ ...entry, category: "ore" })))
    ];
    const bossEntries = bossesData.bosses || [];

    supportIndex = {
      items: itemEntries,
      bosses: bossEntries,
      itemMap: new Map(itemEntries.map((entry) => [entry.id, entry])),
      bossMap: new Map(bossEntries.map((entry) => [entry.id, entry]))
    };

    supportStatus.textContent = t("editor.supportLoaded", { items: itemEntries.length, bosses: bossEntries.length });
  } catch (error) {
    supportStatus.textContent = t("editor.supportFailed");
    console.error(error);
  }

  renderAll();
}

function bindBasicInputs() {
  titleInput.addEventListener("input", () => {
    state.title = titleInput.value;
    saveDraft();
    refreshDerivedViews(false);
  });

  authorInput.addEventListener("input", () => {
    state.author = authorInput.value;
    saveDraft();
    refreshDerivedViews(false);
  });

  languageSelect.addEventListener("change", () => {
    state.language = languageSelect.value;
    saveDraft();
    refreshDerivedViews(false);
  });

  summaryInput.addEventListener("input", () => {
    state.summary = summaryInput.value;
    saveDraft();
    refreshDerivedViews(false);
  });
}

function init() {
  renderLanguageOptions();
  bindBasicInputs();

  wizardSteps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step-target]");
    if (!button) {
      return;
    }
    openStep(Number(button.dataset.stepTarget));
  });

  requiredModOptions.addEventListener("change", handleMetadataChoiceChange);
  classTagOptions.addEventListener("change", handleMetadataChoiceChange);
  guideTagOptions.addEventListener("change", handleMetadataChoiceChange);

  addStageButton.addEventListener("click", () => {
    state.stages.push(createStage({ title: `${localText("Stage", "Этап")} ${state.stages.length + 1}` }));
    selectedStageIndex = state.stages.length - 1;
    persistAndRender();
  });

  stageNav.addEventListener("click", handleStageNavClick);
  stageEditor.addEventListener("click", handleStageEditorClick);
  stageEditor.addEventListener("input", handleStageEditorInput);
  stageEditor.addEventListener("change", handleStageEditorInput);

  prevStepButton.addEventListener("click", () => moveStep(-1));
  nextStepButton.addEventListener("click", () => moveStep(1));

  copyJsonButton.addEventListener("click", copyJson);
  downloadButton.addEventListener("click", downloadJson);
  openIssueButton.addEventListener("click", openIssuePage);
  resetDraftButton.addEventListener("click", resetDraft);

  site?.onChange?.(() => {
    renderLanguageOptions();
    supportStatus.textContent = supportIndex.items.length
      ? t("editor.supportLoaded", { items: supportIndex.items.length, bosses: supportIndex.bosses.length })
      : t("editor.loadingSupport");
    renderAll();
  });

  renderAll();
  loadSupportIndex();
}

init();
