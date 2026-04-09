const STORAGE_KEY = "terrapath-editor-draft-v2";
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

const supportStatus = document.querySelector("#supportStatus");
const titleInput = document.querySelector("#titleInput");
const authorInput = document.querySelector("#authorInput");
const languageInput = document.querySelector("#languageInput");
const requiredModsInput = document.querySelector("#requiredModsInput");
const classTagsInput = document.querySelector("#classTagsInput");
const guideTagsInput = document.querySelector("#guideTagsInput");
const summaryInput = document.querySelector("#summaryInput");
const addStageButton = document.querySelector("#addStageButton");
const resetDraftButton = document.querySelector("#resetDraftButton");
const downloadButton = document.querySelector("#downloadButton");
const stageList = document.querySelector("#stageList");
const guidePreview = document.querySelector("#guidePreview");
const jsonPreview = document.querySelector("#jsonPreview");
const itemSuggestions = document.querySelector("#itemSuggestions");
const bossSuggestions = document.querySelector("#bossSuggestions");

let latestJson = "{}";
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
    requiredModsText: "Terraria",
    classTagsText: "melee",
    guideTagsText: "starter, draft",
    summary: "A structured melee progression path that shows how TerraPath guides can be authored and previewed.",
    stages: [
      createStage({
        title: "First Night",
        description: "Collect movement accessories, set up an arena, and prepare a reliable early weapon.",
        goalsText: "Find a mobility accessory\nPrepare a simple wooden arena\nCraft or loot a stronger melee option",
        notesText: "This is still an example draft.",
        bossRefs: ["Terraria/EyeofCthulhu"],
        items: [
          {
            itemId: "Terraria/EnchantedBoomerang",
            category: "weapon",
            priority: 70,
            note: "A safe ranged melee option for early exploration."
          },
          {
            itemId: "Terraria/CloudinaBottle",
            category: "accessory",
            priority: 85,
            note: "Early movement is always worth prioritizing."
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

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "new-guide";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function splitCommaSeparated(value) {
  return Array.from(new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  ));
}

function splitLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
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
    requiredModsText: String(raw.requiredModsText || "Terraria"),
    classTagsText: String(raw.classTagsText || "melee"),
    guideTagsText: String(raw.guideTagsText || "draft"),
    summary: String(raw.summary || ""),
    stages: Array.isArray(raw.stages) && raw.stages.length
      ? raw.stages.map((stage) => createStage(stage))
      : [createStage()]
  };
}

function syncMetadataInputs() {
  titleInput.value = state.title;
  authorInput.value = state.author;
  languageInput.value = state.language;
  requiredModsInput.value = state.requiredModsText;
  classTagsInput.value = state.classTagsText;
  guideTagsInput.value = state.guideTagsText;
  summaryInput.value = state.summary;
}

function buildGuide() {
  const requiredMods = splitCommaSeparated(state.requiredModsText);
  const classTags = splitCommaSeparated(state.classTagsText).map((tag) => tag.toLowerCase());
  const guideTags = splitCommaSeparated(state.guideTagsText).map((tag) => tag.toLowerCase());
  const usedStageIds = new Map();

  const stages = state.stages.map((stage, index) => {
    const title = stage.title.trim() || `Stage ${index + 1}`;
    const baseId = slugify(title).slice(0, 40) || `stage-${index + 1}`;
    let stageId = baseId;
    const seenCount = usedStageIds.get(baseId) || 0;
    if (seenCount > 0) {
      stageId = `${baseId}-${seenCount + 1}`.slice(0, 40);
    }
    usedStageIds.set(baseId, seenCount + 1);

    const bossRefs = Array.from(new Set(stage.bossRefs.map((value) => value.trim()).filter(Boolean)));
    const goals = splitLines(stage.goalsText);
    const notes = splitLines(stage.notesText);
    const items = stage.items
      .map((item) => ({
        itemId: item.itemId.trim(),
        category: item.category,
        priority: Number.isFinite(item.priority) ? item.priority : 50,
        note: item.note.trim()
      }))
      .filter((item) => item.itemId)
      .map((item) => {
        const output = {
          itemId: item.itemId,
          category: item.category
        };

        if (item.priority !== 50) {
          output.priority = item.priority;
        }
        if (item.note) {
          output.note = item.note;
        }

        return output;
      });

    const output = {
      id: stageId,
      title,
      items
    };

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
    id: slugify(`${requiredMods[0] || "guide"}-${classTags[0] || "path"}-${state.title}`),
    title: state.title.trim() || "Untitled Guide",
    author: state.author.trim() || "Unknown Author",
    language: state.language.trim() || "en-US",
    summary: state.summary.trim() || "Draft guide.",
    requiredMods: requiredMods.length ? requiredMods : ["Terraria"],
    classTags: classTags.length ? classTags : ["other"],
    createdAt: state.createdAt,
    updatedAt: today(),
    stages
  };

  if (guideTags.length) {
    guide.guideTags = guideTags;
  }

  return guide;
}

function resolveEntryName(contentId, map) {
  const entry = map.get(contentId);
  if (entry?.displayName) {
    return entry.displayName;
  }
  return String(contentId || "").split("/").pop() || contentId;
}

function buildContentBadge(contentId, map) {
  const label = resolveEntryName(contentId, map);
  return `
    <div class="content-chip">
      <span class="content-token">${escapeHtml(initials(label))}</span>
      <span>${escapeHtml(label)}</span>
    </div>
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
            const label = resolveEntryName(item.itemId, supportIndex.itemMap);
            return `
              <article class="content-card">
                <div class="content-card__head">
                  <span class="content-token">${escapeHtml(initials(label))}</span>
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
      <h2>${escapeHtml(guide.title)}</h2>
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

function updateOutput() {
  const guide = buildGuide();
  latestJson = `${JSON.stringify(guide, null, 2)}\n`;
  jsonPreview.textContent = latestJson;
  renderGuidePreview(guide);
  downloadButton.disabled = false;
  saveDraft();
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

function renderBossRows(stage, stageIndex) {
  if (!stage.bossRefs.length) {
    return `<p class="empty-state">No boss references yet.</p>`;
  }

  return stage.bossRefs.map((bossRef, bossIndex) => `
    <div class="inline-row inline-row--boss">
      <input
        data-role="boss-id"
        data-stage-index="${stageIndex}"
        data-boss-index="${bossIndex}"
        list="bossSuggestions"
        value="${escapeHtml(bossRef)}"
        placeholder="Terraria/EyeofCthulhu">
      <button
        class="button button--quiet button--tiny"
        type="button"
        data-action="remove-boss"
        data-stage-index="${stageIndex}"
        data-boss-index="${bossIndex}">
        Remove
      </button>
    </div>
  `).join("");
}

function renderItemRows(stage, stageIndex) {
  if (!stage.items.length) {
    return `<p class="empty-state">No item picks yet.</p>`;
  }

  return stage.items.map((item, itemIndex) => `
    <div class="inline-row inline-row--item">
      <input
        class="inline-row__fill"
        data-role="item-id"
        data-stage-index="${stageIndex}"
        data-item-index="${itemIndex}"
        list="itemSuggestions"
        value="${escapeHtml(item.itemId)}"
        placeholder="Terraria/EnchantedBoomerang">
      <select
        data-role="item-category"
        data-stage-index="${stageIndex}"
        data-item-index="${itemIndex}">
        ${CATEGORY_OPTIONS.map((category) => `
          <option value="${category}" ${category === item.category ? "selected" : ""}>${titleCaseCategory(category)}</option>
        `).join("")}
      </select>
      <input
        data-role="item-priority"
        data-stage-index="${stageIndex}"
        data-item-index="${itemIndex}"
        type="number"
        min="0"
        max="100"
        value="${Number(item.priority)}"
        placeholder="50">
      <input
        class="inline-row__fill"
        data-role="item-note"
        data-stage-index="${stageIndex}"
        data-item-index="${itemIndex}"
        value="${escapeHtml(item.note)}"
        placeholder="Optional explanation">
      <button
        class="button button--quiet button--tiny"
        type="button"
        data-action="remove-item"
        data-stage-index="${stageIndex}"
        data-item-index="${itemIndex}">
        Remove
      </button>
    </div>
  `).join("");
}

function renderStages() {
  stageList.innerHTML = state.stages.map((stage, stageIndex) => `
    <article class="stage-card">
      <div class="stage-card__header">
        <div>
          <p class="eyebrow">Stage ${stageIndex + 1}</p>
          <h3>${escapeHtml(stage.title || `Stage ${stageIndex + 1}`)}</h3>
        </div>
        <div class="stage-card__actions">
          <button class="button button--quiet button--tiny" type="button" data-action="move-stage-up" data-stage-index="${stageIndex}" ${stageIndex === 0 ? "disabled" : ""}>Up</button>
          <button class="button button--quiet button--tiny" type="button" data-action="move-stage-down" data-stage-index="${stageIndex}" ${stageIndex === state.stages.length - 1 ? "disabled" : ""}>Down</button>
          <button class="button button--quiet button--tiny" type="button" data-action="remove-stage" data-stage-index="${stageIndex}" ${state.stages.length === 1 ? "disabled" : ""}>Delete</button>
        </div>
      </div>
      <div class="field-grid field-grid--stage">
        <label class="field">
          <span>Stage title</span>
          <input data-role="stage-title" data-stage-index="${stageIndex}" value="${escapeHtml(stage.title)}" placeholder="Getting Started">
        </label>
        <label class="field field--wide">
          <span>Description</span>
          <textarea data-role="stage-description" data-stage-index="${stageIndex}" rows="4" placeholder="Explain this progression step.">${escapeHtml(stage.description)}</textarea>
        </label>
        <label class="field field--wide">
          <span>Goals, one per line</span>
          <textarea data-role="stage-goals" data-stage-index="${stageIndex}" rows="4" placeholder="Build an arena&#10;Craft mobility items">${escapeHtml(stage.goalsText)}</textarea>
        </label>
        <label class="field field--wide">
          <span>Notes, one per line</span>
          <textarea data-role="stage-notes" data-stage-index="${stageIndex}" rows="3" placeholder="Optional reminders and tips">${escapeHtml(stage.notesText)}</textarea>
        </label>
      </div>
      <section class="subsection">
        <div class="subsection__header">
          <div>
            <h4>Boss references</h4>
            <p class="muted">Shown as stage targets in the guide page.</p>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="add-boss" data-stage-index="${stageIndex}">Add boss</button>
        </div>
        <div class="row-list">
          ${renderBossRows(stage, stageIndex)}
        </div>
      </section>
      <section class="subsection">
        <div class="subsection__header">
          <div>
            <h4>Item picks</h4>
            <p class="muted">Group weapons, armor, accessories, ores, materials, and more.</p>
          </div>
          <button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${stageIndex}">Add item</button>
        </div>
        <div class="row-list">
          ${renderItemRows(stage, stageIndex)}
        </div>
      </section>
    </article>
  `).join("");
}

function populateDatalist(element, entries) {
  element.replaceChildren();

  for (const entry of entries) {
    const option = document.createElement("option");
    option.value = entry.id;
    option.label = entry.displayName ? `${entry.displayName} (${entry.id})` : entry.id;
    element.append(option);
  }
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

    populateDatalist(itemSuggestions, itemEntries);
    populateDatalist(bossSuggestions, bossEntries);
    supportStatus.textContent = `Indexed content loaded: ${itemEntries.length} searchable item and ore entries, ${bossEntries.length} boss entries from Terraria. Manual ModName/InternalName values are still allowed.`;
  } catch (error) {
    supportStatus.textContent = "Supported content index could not be loaded here. The editor still works, and manual ModName/InternalName values are allowed.";
    console.error(error);
  }

  updateOutput();
}

function swapStages(fromIndex, toIndex) {
  const next = [...state.stages];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  state.stages = next;
}

function handleStageAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const stageIndex = Number(button.dataset.stageIndex);
  const itemIndex = Number(button.dataset.itemIndex);
  const bossIndex = Number(button.dataset.bossIndex);
  const stage = state.stages[stageIndex];

  switch (action) {
    case "move-stage-up":
      if (stageIndex > 0) {
        swapStages(stageIndex, stageIndex - 1);
      }
      break;
    case "move-stage-down":
      if (stageIndex < state.stages.length - 1) {
        swapStages(stageIndex, stageIndex + 1);
      }
      break;
    case "remove-stage":
      if (state.stages.length > 1) {
        state.stages.splice(stageIndex, 1);
      }
      break;
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

  renderStages();
  updateOutput();
}

function handleStageInput(event) {
  const target = event.target;
  const role = target.dataset.role;
  if (!role) {
    return;
  }

  const stageIndex = Number(target.dataset.stageIndex);
  const itemIndex = Number(target.dataset.itemIndex);
  const bossIndex = Number(target.dataset.bossIndex);
  const stage = state.stages[stageIndex];

  switch (role) {
    case "stage-title":
      stage.title = target.value;
      {
        const card = target.closest(".stage-card");
        const title = target.value.trim() || `Stage ${stageIndex + 1}`;
        const heading = card?.querySelector("h3");
        if (heading) {
          heading.textContent = title;
        }
      }
      break;
    case "stage-description":
      stage.description = target.value;
      break;
    case "stage-goals":
      stage.goalsText = target.value;
      break;
    case "stage-notes":
      stage.notesText = target.value;
      break;
    case "boss-id":
      stage.bossRefs[bossIndex] = target.value;
      break;
    case "item-id":
      stage.items[itemIndex].itemId = target.value;
      break;
    case "item-category":
      stage.items[itemIndex].category = target.value;
      break;
    case "item-priority":
      stage.items[itemIndex].priority = Math.max(0, Math.min(100, Number(target.value) || 0));
      break;
    case "item-note":
      stage.items[itemIndex].note = target.value;
      break;
    default:
      return;
  }

  updateOutput();
}

function bindMetadataInputs() {
  const bindings = [
    [titleInput, "title"],
    [authorInput, "author"],
    [languageInput, "language"],
    [requiredModsInput, "requiredModsText"],
    [classTagsInput, "classTagsText"],
    [guideTagsInput, "guideTagsText"],
    [summaryInput, "summary"]
  ];

  for (const [input, key] of bindings) {
    input.addEventListener("input", () => {
      state[key] = input.value;
      updateOutput();
    });
  }
}

function resetDraft() {
  if (!confirm("Reset the current TerraPath draft?")) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  state = createDefaultState();
  syncMetadataInputs();
  renderStages();
  updateOutput();
}

function init() {
  syncMetadataInputs();
  renderStages();
  bindMetadataInputs();
  stageList.addEventListener("click", handleStageAction);
  stageList.addEventListener("input", handleStageInput);
  stageList.addEventListener("change", handleStageInput);
  addStageButton.addEventListener("click", () => {
    state.stages.push(createStage({ title: `Stage ${state.stages.length + 1}` }));
    renderStages();
    updateOutput();
  });
  resetDraftButton.addEventListener("click", resetDraft);
  downloadButton.addEventListener("click", downloadJson);
  updateOutput();
  loadSupportIndex();
}

init();
