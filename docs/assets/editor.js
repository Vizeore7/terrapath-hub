const STORAGE_KEY = "terrapath-editor-draft-v4";

const STEP_DEFINITIONS = [
  { title: "Basics", description: "Set the title, author, language, and short catalog summary." },
  { title: "Scope", description: "Pick the supported mods, class tags, and broad guide tags." },
  { title: "Stages", description: "Build the progression path stage by stage with bosses, items, goals, and notes." },
  { title: "Review", description: "Check the rendered guide and export the final JSON." }
];

const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "ru-RU", label: "Russian" }
];

const SUPPORTED_MOD_OPTIONS = [
  { value: "Terraria", label: "Terraria", description: "Vanilla progression and curated content are ready now." },
  { value: "CalamityMod", label: "Calamity Mod", description: "Metadata support is ready. Curated pickers come next." },
  { value: "ThoriumMod", label: "Thorium Mod", description: "Metadata support is ready. Curated pickers come next." }
];

const CLASS_TAG_OPTIONS = [
  { value: "melee", label: "Melee" },
  { value: "ranged", label: "Ranged" },
  { value: "magic", label: "Magic" },
  { value: "summoner", label: "Summoner" },
  { value: "rogue", label: "Rogue" },
  { value: "bard", label: "Bard" },
  { value: "other", label: "Other" }
];

const GUIDE_TAG_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "prehardmode", label: "Pre-Hardmode" },
  { value: "hardmode", label: "Hardmode" },
  { value: "bossing", label: "Bossing" },
  { value: "progression", label: "Progression" },
  { value: "vanilla", label: "Vanilla" },
  { value: "calamity", label: "Calamity" },
  { value: "thorium", label: "Thorium" },
  { value: "draft", label: "Draft" }
];

const CATEGORY_LABELS = {
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
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS);

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

function createStage(seed = {}) {
  return {
    title: seed.title || "New Stage",
    description: seed.description || "",
    goalsText: seed.goalsText || "",
    notesText: seed.notesText || "",
    bossRefs: Array.isArray(seed.bossRefs) ? [...seed.bossRefs] : [],
    items: Array.isArray(seed.items) && seed.items.length
      ? seed.items.map((item) => createItem(item))
      : [createItem()]
  };
}

function createItem(seed = {}) {
  return {
    itemId: seed.itemId || "",
    category: seed.category || "weapon",
    priority: Number.isFinite(seed.priority) ? seed.priority : 50,
    note: seed.note || ""
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeLabel() {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date());
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
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function titleCaseCategory(category) {
  return CATEGORY_LABELS[category] || category;
}

function initials(label) {
  return String(label || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  lastSavedAt = nowTimeLabel();
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

function buildGuide() {
  const usedStageIds = new Map();

  const stages = state.stages.map((stage, index) => {
    const title = stage.title.trim() || `Stage ${index + 1}`;
    const baseId = slugify(title).slice(0, 40) || `stage-${index + 1}`;
    const usedCount = usedStageIds.get(baseId) || 0;
    const stageId = usedCount ? `${baseId}-${usedCount + 1}`.slice(0, 40) : baseId;
    usedStageIds.set(baseId, usedCount + 1);

    const items = stage.items
      .map((item) => ({
        itemId: item.itemId.trim(),
        category: item.category,
        priority: Number.isFinite(item.priority) ? item.priority : 50,
        note: item.note.trim()
      }))
      .filter((item) => item.itemId)
      .map((item) => {
        const output = { itemId: item.itemId, category: item.category };
        if (item.priority !== 50) {
          output.priority = item.priority;
        }
        if (item.note) {
          output.note = item.note;
        }
        return output;
      });

    const output = { id: stageId, title, items };
    const bossRefs = uniqueValues(stage.bossRefs.map((value) => value.trim()).filter(Boolean));
    const goals = splitLines(stage.goalsText);
    const notes = splitLines(stage.notesText);

    if (stage.description.trim()) {
      output.description = stage.description.trim();
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
    title: state.title.trim() || "Untitled Guide",
    author: state.author.trim() || "Unknown Author",
    language: state.language || "en-US",
    summary: state.summary.trim() || "Draft guide.",
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

function resolveEntry(contentId, map) {
  return map.get(contentId) || null;
}

function resolveEntryName(contentId, map) {
  const entry = resolveEntry(contentId, map);
  if (entry?.displayName) {
    return entry.displayName;
  }
  return String(contentId || "").split("/").pop() || contentId;
}

function iconMarkup(entry, label) {
  if (entry?.icon) {
    return `<img class="content-icon" src="${escapeHtml(entry.icon)}" alt="${escapeHtml(label)}" loading="lazy">`;
  }
  return `<span class="content-token">${escapeHtml(initials(label))}</span>`;
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
    const isComplete = completionForStep(index);
    const stateLabel = isCurrent ? "Current" : isComplete ? "Ready" : "Pending";

    return `
      <li class="wizard-step ${isCurrent ? "wizard-step--current" : ""} ${isComplete ? "wizard-step--complete" : ""}">
        <button class="wizard-step__button" type="button" data-step-target="${index}">
          <span class="wizard-step__count">${index + 1}</span>
          <span class="wizard-step__body">
            <strong>${escapeHtml(step.title)}</strong>
            <span>${escapeHtml(step.description)}</span>
          </span>
          <span class="wizard-step__state">${stateLabel}</span>
        </button>
      </li>
    `;
  }).join("");
}

function renderSnapshot() {
  const stageCount = state.stages.length;
  const itemCount = state.stages.reduce((count, stage) => count + stage.items.filter((item) => item.itemId).length, 0);

  guideSnapshot.innerHTML = `
    <article class="snapshot-metric"><span class="snapshot-metric__label">Title</span><strong>${escapeHtml(state.title || "Untitled guide")}</strong></article>
    <article class="snapshot-metric"><span class="snapshot-metric__label">Author</span><strong>${escapeHtml(state.author || "Unknown author")}</strong></article>
    <article class="snapshot-metric"><span class="snapshot-metric__label">Language</span><strong>${escapeHtml(state.language || "en-US")}</strong></article>
    <article class="snapshot-metric"><span class="snapshot-metric__label">Stages</span><strong>${stageCount}</strong></article>
    <article class="snapshot-metric"><span class="snapshot-metric__label">Item picks</span><strong>${itemCount}</strong></article>
    <article class="snapshot-metric"><span class="snapshot-metric__label">Classes</span><strong>${escapeHtml(state.classTags.join(", ") || "other")}</strong></article>
  `;
}

function renderLanguageOptions() {
  languageSelect.innerHTML = LANGUAGE_OPTIONS.map((option) => `
    <option value="${option.value}">${escapeHtml(option.label)}</option>
  `).join("");
}

function buildChoiceMarkup(option, groupName, selectedValues) {
  const checked = selectedValues.includes(option.value) ? "checked" : "";
  return `
    <label class="choice-card">
      <input type="checkbox" data-choice-group="${groupName}" value="${escapeHtml(option.value)}" ${checked}>
      <span class="choice-card__copy">
        <span class="choice-card__title">${escapeHtml(option.label)}</span>
        <span class="choice-card__description">${escapeHtml(option.description || "")}</span>
      </span>
    </label>
  `;
}

function renderChoiceGroups() {
  requiredModOptions.innerHTML = SUPPORTED_MOD_OPTIONS.map((option) =>
    buildChoiceMarkup(option, "required-mods", state.requiredMods)).join("");
  classTagOptions.innerHTML = CLASS_TAG_OPTIONS.map((option) =>
    buildChoiceMarkup(option, "class-tags", state.classTags)).join("");
  guideTagOptions.innerHTML = GUIDE_TAG_OPTIONS.map((option) =>
    buildChoiceMarkup(option, "guide-tags", state.guideTags)).join("");
}

function syncMetadataInputs() {
  titleInput.value = state.title;
  authorInput.value = state.author;
  languageSelect.value = state.language;
  summaryInput.value = state.summary;
}

function groupEntriesByMod(entries) {
  const grouped = new Map();
  for (const entry of entries) {
    const modName = String(entry.id || "").split("/")[0] || "Other";
    const existing = grouped.get(modName) || [];
    existing.push(entry);
    grouped.set(modName, existing);
  }
  return grouped;
}

function buildSelectOptions(entries, selectedValue, placeholderLabel) {
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  let markup = `<option value="">${escapeHtml(placeholderLabel)}</option>`;

  if (selectedValue && !entryMap.has(selectedValue)) {
    markup += `<option value="${escapeHtml(selectedValue)}" selected>Unavailable: ${escapeHtml(selectedValue)}</option>`;
  }

  for (const [modName, modEntries] of groupEntriesByMod(entries)) {
    const options = modEntries
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .map((entry) => `
        <option value="${escapeHtml(entry.id)}" ${entry.id === selectedValue ? "selected" : ""}>${escapeHtml(entry.displayName)}</option>
      `).join("");

    markup += `<optgroup label="${escapeHtml(modName)}">${options}</optgroup>`;
  }

  return markup;
}

function renderStageNav() {
  stageNav.innerHTML = state.stages.map((stage, index) => {
    const selected = index === selectedStageIndex;
    const stageItemCount = stage.items.filter((item) => item.itemId).length;

    return `
      <article class="stage-tab ${selected ? "stage-tab--selected" : ""}">
        <button class="stage-tab__select" type="button" data-action="select-stage" data-stage-index="${index}">
          <span class="stage-tab__index">Stage ${index + 1}</span>
          <strong>${escapeHtml(stage.title || `Stage ${index + 1}`)}</strong>
          <span>${stageItemCount} item picks</span>
        </button>
        <div class="stage-tab__actions">
          <button class="button button--quiet button--tiny" type="button" data-action="move-stage-up" data-stage-index="${index}" ${index === 0 ? "disabled" : ""}>Up</button>
          <button class="button button--quiet button--tiny" type="button" data-action="move-stage-down" data-stage-index="${index}" ${index === state.stages.length - 1 ? "disabled" : ""}>Down</button>
          <button class="button button--quiet button--tiny" type="button" data-action="remove-stage" data-stage-index="${index}" ${state.stages.length === 1 ? "disabled" : ""}>Delete</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderBossEditors(stage, stageIndex) {
  if (!stage.bossRefs.length) {
    return `<p class="empty-state">No boss milestones yet.</p>`;
  }

  return stage.bossRefs.map((bossRef, bossIndex) => {
    const entry = resolveEntry(bossRef, supportIndex.bossMap);
    const label = resolveEntryName(bossRef, supportIndex.bossMap);

    return `
      <article class="pick-card">
        <div class="pick-card__head">
          <span class="pick-card__media">${iconMarkup(entry, label)}</span>
          <div class="pick-card__copy">
            <label class="field">
              <span>Boss milestone</span>
              <select data-role="boss-id" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">
                ${buildSelectOptions(supportIndex.bosses, bossRef, "Choose a boss")}
              </select>
            </label>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="remove-boss" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">Remove</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderItemEditors(stage, stageIndex) {
  if (!stage.items.length) {
    return `<p class="empty-state">No item picks yet.</p>`;
  }

  return stage.items.map((item, itemIndex) => {
    const entry = resolveEntry(item.itemId, supportIndex.itemMap);
    const label = resolveEntryName(item.itemId, supportIndex.itemMap);

    return `
      <article class="pick-card">
        <div class="pick-card__head">
          <span class="pick-card__media">${iconMarkup(entry, label)}</span>
          <div class="pick-card__copy">
            <label class="field">
              <span>Item</span>
              <select data-role="item-id" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">
                ${buildSelectOptions(supportIndex.items, item.itemId, "Choose an item")}
              </select>
            </label>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="remove-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">Remove</button>
        </div>
        <div class="pick-card__grid">
          <label class="field">
            <span>Category</span>
            <select data-role="item-category" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">
              ${CATEGORY_OPTIONS.map((category) => `
                <option value="${category}" ${category === item.category ? "selected" : ""}>${titleCaseCategory(category)}</option>
              `).join("")}
            </select>
          </label>
          <label class="field">
            <span>Priority</span>
            <input data-role="item-priority" data-stage-index="${stageIndex}" data-item-index="${itemIndex}" type="number" min="0" max="100" value="${Number(item.priority)}">
          </label>
        </div>
        <label class="field">
          <span>Optional note</span>
          <textarea data-role="item-note" data-stage-index="${stageIndex}" data-item-index="${itemIndex}" rows="3" placeholder="Why this item matters here.">${escapeHtml(item.note)}</textarea>
        </label>
      </article>
    `;
  }).join("");
}

function renderStageEditor() {
  const stage = state.stages[selectedStageIndex];

  if (!stage) {
    stageEditor.innerHTML = `<p class="empty-state">No stage selected.</p>`;
    return;
  }

  stageEditor.innerHTML = `
    <section class="stage-panel">
      <div class="section-copy">
        <h3>${escapeHtml(stage.title || `Stage ${selectedStageIndex + 1}`)}</h3>
        <p class="muted">Keep stages narrow and actionable. One stage should feel like one chunk of progression.</p>
      </div>

      <div class="form-layout">
        <label class="field">
          <span>Stage title</span>
          <input data-role="stage-title" data-stage-index="${selectedStageIndex}" value="${escapeHtml(stage.title)}" placeholder="Early gear setup">
        </label>

        <label class="field field--wide">
          <span>Description</span>
          <textarea data-role="stage-description" data-stage-index="${selectedStageIndex}" rows="4" placeholder="Explain what this part of progression is about.">${escapeHtml(stage.description)}</textarea>
        </label>

        <label class="field field--wide">
          <span>Goals, one per line</span>
          <textarea data-role="stage-goals" data-stage-index="${selectedStageIndex}" rows="4" placeholder="Build an arena&#10;Craft movement gear">${escapeHtml(stage.goalsText)}</textarea>
        </label>

        <label class="field field--wide">
          <span>Notes, one per line</span>
          <textarea data-role="stage-notes" data-stage-index="${selectedStageIndex}" rows="4" placeholder="Optional reminders or route notes">${escapeHtml(stage.notesText)}</textarea>
        </label>
      </div>

      <section class="subpanel">
        <div class="subpanel__header">
          <div class="section-copy">
            <h4>Boss milestones</h4>
            <p class="muted">Reference bosses that define this stage or mark the transition out of it.</p>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="add-boss" data-stage-index="${selectedStageIndex}">Add boss</button>
        </div>
        <div class="stack compact-stack">
          ${renderBossEditors(stage, selectedStageIndex)}
        </div>
      </section>

      <section class="subpanel">
        <div class="subpanel__header">
          <div class="section-copy">
            <h4>Item picks</h4>
            <p class="muted">Pick curated Terraria entries with real in-game icons and place them into categories.</p>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${selectedStageIndex}">Add item</button>
        </div>
        <div class="stack compact-stack">
          ${renderItemEditors(stage, selectedStageIndex)}
        </div>
      </section>
    </section>
  `;
}

function renderStagePreview(stage) {
  const groupedItems = new Map();

  for (const item of stage.items) {
    const key = item.category || "other";
    const existing = groupedItems.get(key) || [];
    existing.push(item);
    groupedItems.set(key, existing);
  }

  const groups = Array.from(groupedItems.entries())
    .sort(([left], [right]) => titleCaseCategory(left).localeCompare(titleCaseCategory(right)))
    .map(([category, items]) => `
      <section class="category-block">
        <h4>${escapeHtml(titleCaseCategory(category))}</h4>
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
        <span class="meta-pill">${stage.items.length} item picks</span>
      </div>
      ${stage.description ? `<p>${escapeHtml(stage.description)}</p>` : ""}
      ${stage.bossRefs?.length ? `
        <section class="preview-block">
          <h4>Bosses</h4>
          <div class="chip-row">
            ${stage.bossRefs.map((bossRef) => buildContentBadge(bossRef, supportIndex.bossMap)).join("")}
          </div>
        </section>
      ` : ""}
      ${stage.goals?.length ? `
        <section class="preview-block">
          <h4>Goals</h4>
          <ul class="line-list">
            ${stage.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")}
          </ul>
        </section>
      ` : ""}
      ${groups || `<p class="empty-state">No item picks added for this stage yet.</p>`}
      ${stage.notes?.length ? `
        <section class="preview-block">
          <h4>Notes</h4>
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
    `Class: ${guide.classTags.join(", ")}`,
    `Language: ${guide.language}`,
    `Mods: ${guide.requiredMods.join(", ")}`,
    `${guide.stages.length} stages`
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
      ${guide.stages.map((stage) => renderStagePreview(stage)).join("")}
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
  stepEyebrow.textContent = `Step ${currentStep + 1} of ${STEP_DEFINITIONS.length}`;
  stepTitle.textContent = definition.title;
  stepDescription.textContent = definition.description;
}

function renderPanels() {
  for (const panel of stepPanels) {
    panel.hidden = Number(panel.dataset.stepPanel) !== currentStep;
  }
}

function renderFooter() {
  prevStepButton.disabled = currentStep === 0;

  if (currentStep === STEP_DEFINITIONS.length - 1) {
    nextStepButton.textContent = "Stay on review";
    nextStepButton.disabled = true;
  } else {
    nextStepButton.textContent = currentStep === STEP_DEFINITIONS.length - 2 ? "Go to review" : "Next step";
    nextStepButton.disabled = false;
  }

  autosaveStatus.textContent = lastSavedAt
    ? `Draft autosaved at ${lastSavedAt}.`
    : "Draft autosaves in this browser.";
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

function swapStages(fromIndex, toIndex) {
  const next = [...state.stages];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  state.stages = next;
}

function toggleArrayValue(array, value) {
  return array.includes(value)
    ? array.filter((entry) => entry !== value)
    : [...array, value];
}

function moveStep(offset) {
  currentStep = Math.max(0, Math.min(STEP_DEFINITIONS.length - 1, currentStep + offset));
  renderAll();
}

function openStep(stepIndex) {
  currentStep = Math.max(0, Math.min(STEP_DEFINITIONS.length - 1, stepIndex));
  renderAll();
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

  switch (action) {
    case "select-stage":
      selectedStageIndex = stageIndex;
      renderAll();
      return;
    case "move-stage-up":
      if (stageIndex > 0) {
        swapStages(stageIndex, stageIndex - 1);
        selectedStageIndex = stageIndex - 1;
      }
      break;
    case "move-stage-down":
      if (stageIndex < state.stages.length - 1) {
        swapStages(stageIndex, stageIndex + 1);
        selectedStageIndex = stageIndex + 1;
      }
      break;
    case "remove-stage":
      if (state.stages.length > 1) {
        state.stages.splice(stageIndex, 1);
        selectedStageIndex = Math.max(0, Math.min(selectedStageIndex, state.stages.length - 1));
      }
      break;
    default:
      return;
  }

  persistAndRender();
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

  switch (action) {
    case "add-boss":
      stage.bossRefs.push("");
      break;
    case "remove-boss":
      stage.bossRefs.splice(bossIndex, 1);
      break;
    case "add-item":
      stage.items.push(createItem());
      break;
    case "remove-item":
      stage.items.splice(itemIndex, 1);
      break;
    default:
      return;
  }

  persistAndRender();
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

  switch (role) {
    case "stage-title":
      stage.title = target.value;
      {
        const heading = stageEditor.querySelector(".stage-panel .section-copy h3");
        if (heading) {
          heading.textContent = target.value.trim() || `Stage ${stageIndex + 1}`;
        }
      }
      saveDraft();
      refreshDerivedViews(false);
      break;
    case "stage-description":
      stage.description = target.value;
      saveDraft();
      refreshDerivedViews(false);
      break;
    case "stage-goals":
      stage.goalsText = target.value;
      saveDraft();
      refreshDerivedViews(false);
      break;
    case "stage-notes":
      stage.notesText = target.value;
      saveDraft();
      refreshDerivedViews(false);
      break;
    case "boss-id":
      stage.bossRefs[bossIndex] = target.value;
      saveDraft();
      refreshDerivedViews(true);
      break;
    case "item-id": {
      stage.items[itemIndex].itemId = target.value;
      const entry = resolveEntry(target.value, supportIndex.itemMap);
      if (entry?.category) {
        stage.items[itemIndex].category = entry.category;
      }
      saveDraft();
      refreshDerivedViews(true);
      break;
    }
    case "item-category":
      stage.items[itemIndex].category = target.value;
      saveDraft();
      refreshDerivedViews(true);
      break;
    case "item-priority":
      stage.items[itemIndex].priority = Math.max(0, Math.min(100, Number(target.value) || 0));
      saveDraft();
      refreshDerivedViews(false);
      break;
    case "item-note":
      stage.items[itemIndex].note = target.value;
      saveDraft();
      refreshDerivedViews(false);
      break;
    default:
      return;
  }
}

async function copyJson() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(latestJson);
      submissionStatus.textContent = "guide.json copied. Open the GitHub issue form and paste the JSON there.";
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
  submissionStatus.textContent = "Clipboard access was blocked, so the JSON preview has been selected for manual copy.";
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
    submissionStatus.textContent = "Repository URL was not detected here. Open your TerraPath repository and create a guide submission issue manually.";
    return;
  }

  window.open(`${repositoryUrl}/issues/new`, "_blank", "noopener");
  submissionStatus.textContent = "GitHub opened in a new tab. Choose the guide submission form and paste the copied JSON.";
}

function resetDraft() {
  if (!confirm("Reset the current TerraPath draft?")) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  state = createDefaultState();
  currentStep = 0;
  selectedStageIndex = 0;
  lastSavedAt = null;
  submissionStatus.textContent = "Draft reset. A fresh example guide has been loaded.";
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
      // Ignore and continue to fallback path.
    }
  }

  throw new Error("Unable to load support index.");
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
      ...((oresData.ores || []).map((ore) => ({ ...ore, category: "ore" })))
    ];
    const bossEntries = bossesData.bosses || [];

    supportIndex = {
      items: itemEntries,
      bosses: bossEntries,
      itemMap: new Map(itemEntries.map((entry) => [entry.id, entry])),
      bossMap: new Map(bossEntries.map((entry) => [entry.id, entry]))
    };

    supportStatus.textContent = `Curated Terraria support loaded: ${itemEntries.length} item and ore entries, ${bossEntries.length} boss entry, all using extracted in-game vanilla icons.`;
  } catch (error) {
    supportStatus.textContent = "Curated support data could not be loaded. The editor still works, but curated content pickers may be empty.";
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
    state.stages.push(createStage({ title: `Stage ${state.stages.length + 1}` }));
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

  renderAll();
  loadSupportIndex();
}

init();
