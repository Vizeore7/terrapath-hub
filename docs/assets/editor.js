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

const ARMOR_SET_IDS = new Set(ARMOR_SET_ALIASES.map((entry) => entry.id));

const CATEGORY_PATTERNS = {
  armor: [/helmet/i, /headgear/i, /mask/i, /hood/i, /hat$/i, /cap$/i, /chainmail/i, /breastplate/i, /greaves/i, /leggings/i, /pants$/i, /robe$/i, /cuirass/i, /tunic/i, /shirt$/i, /mail$/i],
  accessory: [/boots/i, /balloon/i, /band/i, /shackle/i, /claws/i, /shield/i, /emblem/i, /anklet/i, /quiver/i, /glove/i, /gauntlet/i, /wings/i, /charm/i, /stone/i, /shell/i, /insignia/i, /necklace/i, /cloak/i, /scarf/i, /rose/i, /bezoar/i, /horseshoe/i, /skates/i, /fins/i, /flipper/i, /bundle/i, /mitten/i, /glove/i, /cuffs/i],
  buff: [/potion/i, /flask/i, /ale$/i, /beer$/i, /cake$/i, /soup$/i, /stew$/i, /food/i, /candle/i, /bowl/i, /buff/i, /fed/i, /sake/i],
  weapon: [/sword/i, /blade/i, /bow/i, /gun/i, /staff/i, /tome/i, /book/i, /blaster/i, /boomerang/i, /spear/i, /lance/i, /yoyo/i, /whip/i, /knife/i, /dagger/i, /flail/i, /launcher/i, /cannon/i, /rifle/i, /shotgun/i, /pistol/i, /revolver/i, /wand/i, /trident/i, /chakram/i, /javelin/i, /scythe/i]
};

const ALLOWED_ITEM_CATEGORIES = new Set(GROUPS.flatMap((group) => group.cats));

const STEP_COPY = {
  en: [
    { title: "Guide", desc: "Title, author, language, summary, required mods, and class." },
    { title: "Stages", desc: "Pre-Hardmode, Hardmode, and Post-Moon Lord sections with their own sub-stages." },
    { title: "Export", desc: "Preview the guide and export guide.json." }
  ],
  ru: [
    { title: "\u0413\u0430\u0439\u0434", desc: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435, \u0430\u0432\u0442\u043e\u0440, \u044f\u0437\u044b\u043a, \u043a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435, \u043c\u043e\u0434\u044b \u0438 \u043a\u043b\u0430\u0441\u0441." },
    { title: "\u042d\u0442\u0430\u043f\u044b", desc: "\u0411\u043b\u043e\u043a\u0438 Pre-Hardmode, Hardmode \u0438 Post-Moon Lord \u0441 \u0438\u0445 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u043c\u0438 \u043f\u043e\u0434-\u044d\u0442\u0430\u043f\u0430\u043c\u0438." },
    { title: "\u042d\u043a\u0441\u043f\u043e\u0440\u0442", desc: "\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0432\u0438\u0434 \u0433\u0430\u0439\u0434\u0430 \u0438 \u0432\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u0435 guide.json." }
  ]
};

const COPY = {
  en: {
    current: "Current",
    ready: "Ready",
    pending: "Pending",
    stepCounter: "Step {current} of {total}",
    stage: "Sub-stage",
    stageTitle: "Sub-stage title",
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
    draftReset: "Draft reset.",
    exportGuideTitle: "How to publish this guide",
    exportGuideIntro: "If you are new, follow these steps from top to bottom. The draft stays in this browser until you reset it.",
    exportStepPreviewTitle: "Check the preview",
    exportStepPreviewBody: "Make sure the title, stages, bosses, and item sections look correct before you export.",
    exportStepCopyTitle: "Copy or download guide.json",
    exportStepCopyBody: "Copy JSON is the fastest option. Download guide.json is useful as a backup if you want to save the file first.",
    exportStepIssueTitle: "Open the GitHub submission form",
    exportStepIssueBody: "Use Open GitHub issue to open the guide submission form directly in a new tab.",
    exportStepSubmitTitle: "Paste JSON and send it",
    exportStepSubmitBody: "Paste the copied JSON into the issue form, add a short note if you want, and submit the issue.",
    submissionActionsTitle: "Export actions",
    submissionActionsIntro: "The usual order is: copy JSON, open the GitHub issue, paste the JSON, then submit.",
    copyJsonHelp: "Recommended first step. Copies the ready JSON so you can paste it into the GitHub form.",
    downloadJsonHelp: "Optional backup. Downloads the same JSON as a file to your computer.",
    openIssueHelp: "Opens the Guide submission form directly in a new tab.",
    resetDraftHelp: "Clears the current draft and loads the starter example again. Use only if you want to start over."
  },
  ru: {
    current: "\u0422\u0435\u043a\u0443\u0449\u0438\u0439",
    ready: "\u0413\u043e\u0442\u043e\u0432\u043e",
    pending: "\u041d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u043e",
    stepCounter: "\u0428\u0430\u0433 {current} \u0438\u0437 {total}",
    stage: "\u041f\u043e\u0434-\u044d\u0442\u0430\u043f",
    stageTitle: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043f\u043e\u0434-\u044d\u0442\u0430\u043f\u0430",
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
    draftReset: "\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a \u0441\u0431\u0440\u043e\u0448\u0435\u043d.",
    exportGuideTitle: "\u041a\u0430\u043a \u0437\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e \u0440\u0443\u043a\u043e\u0432\u043e\u0434\u0441\u0442\u0432\u043e",
    exportGuideIntro: "\u0415\u0441\u043b\u0438 \u0432\u044b \u0434\u0435\u043b\u0430\u0435\u0442\u0435 \u044d\u0442\u043e \u0432\u043f\u0435\u0440\u0432\u044b\u0435, \u0438\u0434\u0438\u0442\u0435 \u043f\u043e \u0448\u0430\u0433\u0430\u043c \u0441\u0432\u0435\u0440\u0445\u0443 \u0432\u043d\u0438\u0437. \u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a \u0445\u0440\u0430\u043d\u0438\u0442\u0441\u044f \u0432 \u044d\u0442\u043e\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435, \u043f\u043e\u043a\u0430 \u0432\u044b \u0435\u0433\u043e \u043d\u0435 \u0441\u0431\u0440\u043e\u0441\u0438\u0442\u0435.",
    exportStepPreviewTitle: "\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043f\u0440\u0435\u0432\u044c\u044e",
    exportStepPreviewBody: "\u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044c, \u0447\u0442\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435, \u044d\u0442\u0430\u043f\u044b, \u0431\u043e\u0441\u0441\u044b \u0438 \u0441\u043f\u0438\u0441\u043a\u0438 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432 \u0432\u044b\u0433\u043b\u044f\u0434\u044f\u0442 \u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e.",
    exportStepCopyTitle: "\u0421\u043a\u043e\u043f\u0438\u0440\u0443\u0439\u0442\u0435 \u0438\u043b\u0438 \u0441\u043a\u0430\u0447\u0430\u0439\u0442\u0435 guide.json",
    exportStepCopyBody: "\u041a\u043d\u043e\u043f\u043a\u0430 Copy JSON \u0431\u044b\u0441\u0442\u0440\u0435\u0435 \u0432\u0441\u0435\u0433\u043e. Download guide.json \u043d\u0443\u0436\u0435\u043d \u043a\u0430\u043a \u0437\u0430\u043f\u0430\u0441\u043d\u043e\u0439 \u0432\u0430\u0440\u0438\u0430\u043d\u0442, \u0435\u0441\u043b\u0438 \u0445\u043e\u0442\u0438\u0442\u0435 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0444\u0430\u0439\u043b.",
    exportStepIssueTitle: "\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 GitHub-\u0444\u043e\u0440\u043c\u0443 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438",
    exportStepIssueBody: "\u041a\u043d\u043e\u043f\u043a\u0430 Open GitHub issue \u0441\u0440\u0430\u0437\u0443 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0444\u043e\u0440\u043c\u0443 Guide submission \u0432 \u043d\u043e\u0432\u043e\u0439 \u0432\u043a\u043b\u0430\u0434\u043a\u0435.",
    exportStepSubmitTitle: "\u0412\u0441\u0442\u0430\u0432\u044c\u0442\u0435 JSON \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435",
    exportStepSubmitBody: "\u0412\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 JSON \u0432 GitHub-\u0444\u043e\u0440\u043c\u0443, \u043f\u0440\u0438 \u0436\u0435\u043b\u0430\u043d\u0438\u0438 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043a\u043e\u0440\u043e\u0442\u043a\u0443\u044e \u0437\u0430\u043c\u0435\u0442\u043a\u0443 \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435 issue.",
    submissionActionsTitle: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f \u0434\u043b\u044f \u044d\u043a\u0441\u043f\u043e\u0440\u0442\u0430",
    submissionActionsIntro: "\u041e\u0431\u044b\u0447\u043d\u044b\u0439 \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0442\u0430\u043a\u043e\u0439: \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c JSON, \u043e\u0442\u043a\u0440\u044b\u0442\u044c GitHub issue, \u0432\u0441\u0442\u0430\u0432\u0438\u0442\u044c JSON \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c.",
    copyJsonHelp: "\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0439 \u043f\u0435\u0440\u0432\u044b\u0439 \u0448\u0430\u0433. \u041a\u043e\u043f\u0438\u0440\u0443\u0435\u0442 \u0433\u043e\u0442\u043e\u0432\u044b\u0439 JSON, \u0447\u0442\u043e\u0431\u044b \u0435\u0433\u043e \u043c\u043e\u0436\u043d\u043e \u0431\u044b\u043b\u043e \u0441\u0440\u0430\u0437\u0443 \u0432\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0432 \u0444\u043e\u0440\u043c\u0443.",
    downloadJsonHelp: "\u041d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0437\u0430\u043f\u0430\u0441\u043d\u043e\u0439 \u0432\u0430\u0440\u0438\u0430\u043d\u0442. \u0421\u043a\u0430\u0447\u0438\u0432\u0430\u0435\u0442 \u0442\u043e\u0442 \u0436\u0435 JSON \u0432 \u0432\u0438\u0434\u0435 \u0444\u0430\u0439\u043b\u0430.",
    openIssueHelp: "\u0421\u0440\u0430\u0437\u0443 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0444\u043e\u0440\u043c\u0443 Guide submission \u0432 \u043d\u043e\u0432\u043e\u0439 \u0432\u043a\u043b\u0430\u0434\u043a\u0435.",
    resetDraftHelp: "\u041e\u0447\u0438\u0449\u0430\u0435\u0442 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u0447\u0435\u0440\u043d\u043e\u0432\u0438\u043a \u0438 \u0441\u043d\u043e\u0432\u0430 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442 \u0441\u0442\u0430\u0440\u0442\u043e\u0432\u044b\u0439 \u043f\u0440\u0438\u043c\u0435\u0440. \u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435, \u0442\u043e\u043b\u044c\u043a\u043e \u0435\u0441\u043b\u0438 \u0445\u043e\u0442\u0438\u0442\u0435 \u043d\u0430\u0447\u0430\u0442\u044c \u0441 \u043d\u0443\u043b\u044f."
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
  outline: $("#stageOutline"),
  accordion: $("#stageDetail"),
  copy: $("#copyJsonButton"),
  download: $("#downloadButton"),
  issue: $("#openIssueButton"),
  reset: $("#resetDraftButton"),
  submissionGuide: $("#submissionGuide"),
  submissionActionsTitle: $("#submissionActionsTitle"),
  submissionActionsIntro: $("#submissionActionsIntro"),
  copyHelp: $("#copyJsonHelp"),
  downloadHelp: $("#downloadJsonHelp"),
  issueHelp: $("#openIssueHelp"),
  resetHelp: $("#resetDraftHelp"),
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
  if (entry?.icon) {
    return `<img class="content-icon ${boss ? "content-icon--boss" : ""}" src="${esc(entry.icon)}" alt="${esc(label)}" title="${esc(label)}" loading="lazy">`;
  }
  return `<span class="content-token">${esc(initials(label))}</span>`;
}

function inlineIconMarkup(entry, label, boss = false) {
  if (entry?.icon) {
    return `<span class="inline-flow-media" title="${esc(label)}" aria-label="${esc(label)}"><img class="inline-flow-icon ${boss ? "inline-flow-icon--boss" : ""}" src="${esc(entry.icon)}" alt="${esc(label)}" title="${esc(label)}" loading="lazy"></span>`;
  }
  return `<span class="inline-flow-media" title="${esc(label)}" aria-label="${esc(label)}"><span class="inline-flow-token">${esc(initials(label).slice(0, 1) || "?")}</span></span>`;
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

function eraLabel(eraId) {
  return progression?.eraLabel?.(eraId, lang()) || eraId;
}

function eraOrder(eraId) {
  const index = ERA_IDS.indexOf(eraId);
  return index === -1 ? ERA_IDS.length : index;
}

function stagesForEra(eraId) {
  return state.stages.map((stage, index) => ({ stage, index })).filter((entry) => entry.stage.era === eraId);
}

function insertStageForEra(eraId) {
  const nextStage = stageTemplate({
    title: lang() === "ru" ? "\u041d\u043e\u0432\u044b\u0439 \u043f\u043e\u0434-\u044d\u0442\u0430\u043f" : "New sub-stage",
    era: eraId
  });
  const indices = stagesForEra(eraId).map((entry) => entry.index);
  const insertAt = indices.length ? Math.max(...indices) + 1 : state.stages.length;
  state.stages.splice(insertAt, 0, nextStage);
  openStage = insertAt;
}

function previousStageIndexInEra(stageIndex) {
  const stage = state.stages[stageIndex];
  if (!stage) return -1;
  const indices = stagesForEra(stage.era).map((entry) => entry.index);
  const position = indices.indexOf(stageIndex);
  return position > 0 ? indices[position - 1] : -1;
}

function nextStageIndexInEra(stageIndex) {
  const stage = state.stages[stageIndex];
  if (!stage) return -1;
  const indices = stagesForEra(stage.era).map((entry) => entry.index);
  const position = indices.indexOf(stageIndex);
  return position !== -1 && position < indices.length - 1 ? indices[position + 1] : -1;
}

function supportSearchIcon(internalName) {
  return `assets/icons/terraria/search-items/${String(internalName || "").toLowerCase()}.png`;
}

function inferSearchCategory(entry) {
  if (!entry) return "weapon";
  if (entry.category && ALLOWED_ITEM_CATEGORIES.has(entry.category)) return entry.category;

  const haystack = [entry.displayName, entry.displayNameRu, entry.internalName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const category of ["armor", "accessory", "buff", "weapon"]) {
    if (CATEGORY_PATTERNS[category].some((pattern) => pattern.test(haystack))) {
      return category;
    }
  }

  return "weapon";
}

function applySupportEnhancements() {
  ARMOR_SET_ALIASES.forEach((alias) => {
    const previous = support.itemMap.get(alias.id) || {};
    support.itemMap.set(alias.id, {
      ...previous,
      ...alias,
      category: "armor",
      icon: previous.icon || alias.icon || supportSearchIcon(alias.internalName)
    });
  });

  for (const [id, entry] of support.itemMap.entries()) {
    support.itemMap.set(id, {
      ...entry,
      category: inferSearchCategory(entry)
    });
  }
}

function visibleSearchItems() {
  return [...support.itemMap.values()]
    .filter((entry) => !entry.pickerHidden && entry.icon)
    .sort((left, right) => localizedDisplayName(left).localeCompare(localizedDisplayName(right), undefined, { sensitivity: "base" }));
}

function inferItemCategory(entry, groupKey) {
  const group = GROUPS.find((item) => item.key === groupKey) || GROUPS[0];
  if (groupKey) return group.cats[0];
  if (entry?.category && entry.category !== "other") return entry.category;
  return group.cats[0];
}

function normalizeRichTextSource(value) {
  const iconOnlyLine = /^\s*(?:\{\{icon:[^}]+\}\}\s*)+$/;
  const sourceLines = String(value || "").replace(/\r\n?/g, "\n").split("\n");
  const lines = [];

  for (let index = 0; index < sourceLines.length; index += 1) {
    const rawLine = sourceLines[index];
    const trimmed = rawLine.trim();

    if (trimmed && iconOnlyLine.test(trimmed)) {
      const iconLines = [trimmed];

      while (index + 1 < sourceLines.length) {
        const nextTrimmed = String(sourceLines[index + 1] || "").trim();
        if (!nextTrimmed || !iconOnlyLine.test(nextTrimmed)) break;
        iconLines.push(nextTrimmed);
        index += 1;
      }

      const iconText = iconLines.join(" ");
      let previousIndex = lines.length - 1;
      while (previousIndex >= 0 && !String(lines[previousIndex] || "").trim()) previousIndex -= 1;

      if (previousIndex >= 0) {
        lines[previousIndex] = `${String(lines[previousIndex]).replace(/[ \t]+$/g, "")} ${iconText}`;
        continue;
      }

      let nextIndex = index + 1;
      while (nextIndex < sourceLines.length && !String(sourceLines[nextIndex] || "").trim()) nextIndex += 1;
      if (nextIndex < sourceLines.length) {
        sourceLines[nextIndex] = `${iconText} ${String(sourceLines[nextIndex]).replace(/^[ \t]+/g, "")}`;
        continue;
      }

      lines.push(iconText);
      continue;
    }

    lines.push(rawLine);
  }

  return lines.join("\n")
    .replace(/[ \t]*\n+[ \t]*(\{\{icon:[^}]+\}\})/g, " $1")
    .replace(/(\{\{icon:[^}]+\}\})[ \t]*\n+[ \t]*/g, "$1 ");
}

function renderRichText(textValue) {
  const tokenPattern = /\{\{icon:([^}]+)\}\}/g;
  const source = normalizeRichTextSource(textValue);
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
    parts.push(inlineIconMarkup(entry, label, Boolean(bossEntry)));
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

  return {
    title: seed.title || s("stage"),
    era: seed.era || "prehardmode",
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
        accessoryGroups: [
          { title: "Mobility" }
        ],
        items: [
          { itemId: "Terraria/EnchantedBoomerang", category: "weapon" },
          { itemId: "Terraria/CloudinaBottle", category: "accessory", subgroup: "Mobility" }
        ]
      }),
      stageTemplate({
        title: "Early Hardmode",
        era: "hardmode",
        description: "Upgrade mobility, collect your first hardmode armor set, and prepare for the mechanical bosses.",
        bossRefs: ["Terraria/TheDestroyer"],
        accessoryGroups: [
          { title: "Damage" }
        ],
        items: [
          { itemId: "Terraria/CobaltHelmet", category: "armor" },
          { itemId: "Terraria/WarriorEmblem", category: "accessory", subgroup: "Damage" }
        ]
      }),
      stageTemplate({
        title: "After Moon Lord",
        era: "postmoonlord",
        description: "Switch into the final endgame loadout and collect the last upgrades for this class.",
        items: [
          { itemId: "Terraria/SolarFlareHelmet", category: "armor" }
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
  renderOutline();
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
  const stages = [...state.stages]
    .sort((left, right) => eraOrder(left.era) - eraOrder(right.era))
    .map((stage, index) => {
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

function previewBosses(stage) {
  if (!stage.bossRefs?.length) return "";
  return `<section class="preview-block"><h4>${esc(t("common.labelBosses"))}</h4><div class="chip-row">${stage.bossRefs.map((id) => {
    const entry = support.bossMap.get(id);
    const label = pickLabel(id, support.bossMap);
    return `<div class="content-chip"><span class="content-chip__media">${iconMarkup(entry, label, true)}</span><span>${esc(label)}</span></div>`;
  }).join("")}</div></section>`;
}

function denseItemList(rows) {
  return `<ul class="wiki-items">${rows.map((itemEntry) => {
    const entry = support.itemMap.get(itemEntry.itemId);
    const label = pickLabel(itemEntry.itemId, support.itemMap);
    return `<li class="wiki-item"><span class="wiki-item__media">${iconMarkup(entry, label)}</span><span class="wiki-item__label">${esc(label)}</span></li>`;
  }).join("")}</ul>`;
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

      return `<section class="wiki-group"><h4>${esc(group[lang()])}</h4>${subgroupOrder.map((subgroup) => {
        const subgroupRows = rows.filter((entry) => String(entry.subgroup || "").trim() === subgroup);
        return `<div class="wiki-subgroup">${subgroup ? `<h5>${esc(subgroup)}</h5>` : ""}${denseItemList(subgroupRows)}</div>`;
      }).join("")}</section>`;
    }

    return `<section class="wiki-group"><h4>${esc(group[lang()])}</h4>${denseItemList(rows)}</section>`;
  }).filter(Boolean);

  return blocks.join("") || `<p class="empty-state">${esc(s("noItemsPreview"))}</p>`;
}

function stagesByEra(stages) {
  const groups = new Map(ERA_IDS.map((eraId) => [eraId, []]));
  (stages || []).forEach((stage) => {
    const eraId = ERA_IDS.includes(stage.era) ? stage.era : "prehardmode";
    groups.get(eraId).push(stage);
  });
  return ERA_IDS.map((eraId) => ({ eraId, stages: groups.get(eraId) || [] })).filter((entry) => entry.stages.length);
}

function stageStats(stage) {
  return {
    items: (stage.items || []).filter((entry) => entry.itemId).length,
    bosses: (stage.bossRefs || []).length
  };
}

function stageSummary(stage) {
  const stats = stageStats(stage);
  return lang() === "ru"
    ? `${stats.items} \u043f\u0440\u0435\u0434\u043c. • ${stats.bosses} \u0431\u043e\u0441\u0441.`
    : `${stats.items} items • ${stats.bosses} bosses`;
}

function previewSubStage(stage) {
  return `<article class="guide-substage"><section class="guide-substage__main"><div class="guide-substage__header"><h3>${renderRichText(stage.title)}</h3></div>${stage.description ? `<p class="stage-description">${renderRichText(stage.description)}</p>` : ""}${previewBosses(stage)}</section><section class="guide-substage__loadout">${previewGroups(stage.items)}</section></article>`;
}

function renderPreview() {
  const guide = buildGuide();
  latestJson = `${JSON.stringify(guide, null, 2)}\n`;
  refs.json.textContent = latestJson;
  refs.preview.innerHTML = `<header class="guide-reader__header"><h2 class="guide-title">${esc(guide.title)}</h2><p>${esc(guide.summary)}</p><div class="chip-row"><span class="meta-pill">${esc(`${t("common.labelClass")}: ${classList(guide.classTags)}`)}</span><span class="meta-pill">${esc(`${t("common.labelLanguage")}: ${guideLanguageLabel(guide.language)}`)}</span><span class="meta-pill">${esc(`${t("common.labelMods")}: ${(guide.requiredMods || []).join(", ")}`)}</span></div></header><div class="guide-reader__eras">${stagesByEra(guide.stages).map((eraGroup) => `<section class="guide-era"><header class="guide-era__header"><h2>${esc(eraLabel(eraGroup.eraId))}</h2></header><div class="guide-era__list">${eraGroup.stages.map(previewSubStage).join("")}</div></section>`).join("")}</div>`;
}

function renderSubmissionGuide() {
  const steps = [
    { title: s("exportStepPreviewTitle"), body: s("exportStepPreviewBody") },
    { title: s("exportStepCopyTitle"), body: s("exportStepCopyBody") },
    { title: s("exportStepIssueTitle"), body: s("exportStepIssueBody") },
    { title: s("exportStepSubmitTitle"), body: s("exportStepSubmitBody") }
  ];

  refs.submissionGuide.innerHTML = `
    <div class="review-card__header">
      <h3>${esc(s("exportGuideTitle"))}</h3>
      <p class="muted">${esc(s("exportGuideIntro"))}</p>
    </div>
    <ol class="instruction-list">
      ${steps.map((entry) => `
        <li>
          <strong>${esc(entry.title)}</strong>
          <span>${esc(entry.body)}</span>
        </li>
      `).join("")}
    </ol>
  `;
}

function renderSubmissionActions() {
  refs.submissionActionsTitle.textContent = s("submissionActionsTitle");
  refs.submissionActionsIntro.textContent = s("submissionActionsIntro");
  refs.copyHelp.textContent = s("copyJsonHelp");
  refs.downloadHelp.textContent = s("downloadJsonHelp");
  refs.issueHelp.textContent = s("openIssueHelp");
  refs.resetHelp.textContent = s("resetDraftHelp");
}

function bossRows(stage, stageIndex) {
  if (!stage.bossRefs.length) return `<p class="empty-state">${esc(s("noBosses"))}</p>`;
  return stage.bossRefs.map((id, bossIndex) => {
    const entry = support.bossMap.get(id);
    const label = pickLabel(id, support.bossMap);
    return `<div class="picker-row boss-row"><span class="picker-row__media">${iconMarkup(entry, label, true)}</span><button class="picker-select" type="button" data-action="change-boss" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">${esc(label || s("chooseBoss"))}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-boss" data-stage-index="${stageIndex}" data-boss-index="${bossIndex}">${esc(s("remove"))}</button></div>`;
  }).join("");
}

function renderItemRow(itemEntry, itemIndex, stageIndex, groupKey, subgroupId = "") {
  const entry = support.itemMap.get(itemEntry.itemId);
  const label = pickLabel(itemEntry.itemId, support.itemMap) || s("chooseItem");
  return `<div class="picker-row item-row"><span class="picker-row__media">${iconMarkup(entry, label)}</span><button class="picker-select" type="button" data-action="change-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}" data-group-key="${esc(groupKey)}" data-subgroup-id="${esc(subgroupId)}">${esc(label)}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-item" data-stage-index="${stageIndex}" data-item-index="${itemIndex}">${esc(s("remove"))}</button></div>`;
}

function accessoryGroupRows(stage, stageIndex) {
  const ungroupedItems = (stage.items || []).filter((itemEntry) => itemEntry.category === "accessory" && !itemEntry.subgroupId);
  const groups = stage.accessoryGroups || [];
  const subgroupTitle = lang() === "ru" ? "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043f\u043e\u0434\u0433\u0440\u0443\u043f\u043f\u044b" : "Subgroup title";
  const addSubgroup = lang() === "ru" ? "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u0434\u0433\u0440\u0443\u043f\u043f\u0443" : "Add subgroup";

  return `<section class="loadout-section"><div class="loadout-section__header"><h4>${esc(groupLabel("accessory"))}</h4><div class="item-group__actions"><button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${stageIndex}" data-group-key="accessory">${esc(s("addItem"))}</button><button class="button button--quiet button--tiny" type="button" data-action="add-accessory-group" data-stage-index="${stageIndex}">${esc(addSubgroup)}</button></div></div>${ungroupedItems.length ? `<div class="accessory-bucket">${ungroupedItems.map((itemEntry) => renderItemRow(itemEntry, stage.items.indexOf(itemEntry), stageIndex, "accessory")).join("")}</div>` : ""}${groups.map((group) => {
    const subgroupItems = stage.items.filter((itemEntry) => itemEntry.category === "accessory" && itemEntry.subgroupId === group.id);
    return `<section class="accessory-editor-group"><div class="accessory-editor-group__header"><input class="inline-input" data-role="accessory-group-title" data-stage-index="${stageIndex}" data-group-id="${esc(group.id)}" value="${esc(group.title)}" placeholder="${esc(subgroupTitle)}"><div class="item-group__actions"><button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${stageIndex}" data-group-key="accessory" data-subgroup-id="${esc(group.id)}">${esc(s("addItem"))}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-accessory-group" data-stage-index="${stageIndex}" data-group-id="${esc(group.id)}">${esc(s("remove"))}</button></div></div><div class="accessory-bucket">${subgroupItems.length ? subgroupItems.map((itemEntry) => renderItemRow(itemEntry, stage.items.indexOf(itemEntry), stageIndex, "accessory", group.id)).join("") : `<p class="empty-state">${esc(s("noItems"))}</p>`}</div></section>`;
  }).join("")}${!ungroupedItems.length && !groups.length ? `<p class="empty-state">${esc(s("noItems"))}</p>` : ""}</section>`;
}

function itemRows(stage, stageIndex, groupEntry) {
  const rows = [];
  (stage.items || []).forEach((itemEntry, itemIndex) => {
    if (groupEntry.cats.includes(itemEntry.category || "other")) rows.push({ itemEntry, itemIndex });
  });

  return `<section class="loadout-section"><div class="loadout-section__header"><h4>${esc(groupEntry[lang()])}</h4><button class="button button--quiet button--tiny" type="button" data-action="add-item" data-stage-index="${stageIndex}" data-group-key="${esc(groupEntry.key)}">${esc(s("addItem"))}</button></div><div class="accessory-bucket">${rows.length ? rows.map(({ itemEntry, itemIndex }) => renderItemRow(itemEntry, itemIndex, stageIndex, groupEntry.key)).join("") : `<p class="empty-state">${esc(s("noItems"))}</p>`}</div></section>`;
}

function stageBody(stage, stageIndex) {
  const stats = stageStats(stage);
  return `<article class="stage-detail-card"><header class="stage-detail-card__header"><div><p class="eyebrow">${esc(eraLabel(stage.era || "prehardmode"))}</p><h3>${renderRichText(stage.title || `${s("stage")} ${stageIndex + 1}`)}</h3></div><div class="stage-detail-card__meta"><span class="meta-pill">${esc(s("itemCount", { count: stats.items }))}</span><span class="meta-pill">${esc(lang() === "ru" ? `${stats.bosses} \u0431\u043e\u0441\u0441.` : `${stats.bosses} bosses`)}</span></div></header><div class="stage-detail-card__grid"><section class="stage-detail-card__main"><label class="field"><span class="field-label-with-action"><span>${esc(s("stageTitle"))}</span><button class="button button--quiet button--tiny" type="button" data-action="open-title-picker" data-stage-index="${stageIndex}">${esc(s("insertIcon"))}</button></span><input data-role="stage-title" data-stage-index="${stageIndex}" value="${esc(stage.title)}"></label><label class="field"><span>${esc(s("era"))}</span><select data-role="stage-era" data-stage-index="${stageIndex}">${(progression?.eras || []).map((era) => `<option value="${esc(era.id)}" ${era.id === stage.era ? "selected" : ""}>${esc(era.label?.[lang()] || era.label?.en || era.id)}</option>`).join("")}</select></label><label class="field"><span class="field-label-with-action"><span>${esc(s("description"))}</span><button class="button button--quiet button--tiny" type="button" data-action="open-description-picker" data-stage-index="${stageIndex}">${esc(s("insertIcon"))}</button></span><textarea data-role="stage-description" data-stage-index="${stageIndex}" rows="9" placeholder="${esc(s("descriptionPlaceholder"))}">${esc(stage.description)}</textarea></label><section class="stage-section stage-section--compact"><div class="section-heading section-heading--with-action"><h3>${esc(s("bosses"))}</h3><button class="button button--quiet button--tiny" type="button" data-action="add-boss" data-stage-index="${stageIndex}">${esc(s("addBoss"))}</button></div><div class="stage-stack">${bossRows(stage, stageIndex)}</div></section></section><aside class="stage-detail-card__side"><section class="stage-section stage-section--loadout"><div class="section-heading"><h3>${esc(s("items"))}</h3></div><div class="loadout-grid">${GROUPS.map((group) => group.key === "accessory" ? accessoryGroupRows(stage, stageIndex) : itemRows(stage, stageIndex, group)).join("")}</div></section></aside></div></article>`;
}

function outlineStageSummary(stage) {
  const stats = stageStats(stage);
  return lang() === "ru"
    ? `${stats.items} предмет. - ${stats.bosses} босс.`
    : `${stats.items} items - ${stats.bosses} bosses`;
}

function outlineStageRow(stage, stageIndex) {
  const selected = stageIndex === openStage;
  return `<article class="outline-stage ${selected ? "outline-stage--active" : ""}"><button class="outline-stage__select" type="button" data-action="select-stage" data-stage-index="${stageIndex}"><strong>${renderRichText(stage.title || `${s("stage")} ${stageIndex + 1}`)}</strong><span class="muted">${esc(outlineStageSummary(stage))}</span></button><div class="outline-stage__actions"><button class="button button--quiet button--tiny" type="button" data-action="move-stage-up" data-stage-index="${stageIndex}" ${previousStageIndexInEra(stageIndex) === -1 ? "disabled" : ""}>${esc(s("moveUp"))}</button><button class="button button--quiet button--tiny" type="button" data-action="move-stage-down" data-stage-index="${stageIndex}" ${nextStageIndexInEra(stageIndex) === -1 ? "disabled" : ""}>${esc(s("moveDown"))}</button><button class="button button--quiet button--tiny" type="button" data-action="remove-stage" data-stage-index="${stageIndex}" ${state.stages.length === 1 ? "disabled" : ""}>${esc(s("delete"))}</button></div></article>`;
}

function renderOutline() {
  refs.outline.innerHTML = ERA_IDS.map((eraId) => {
    const stages = stagesForEra(eraId);
    return `<section class="outline-era"><header class="outline-era__header"><div><h3>${esc(eraLabel(eraId))}</h3><p class="muted">${esc(lang() === "ru" ? "\u041f\u043e\u0434-\u044d\u0442\u0430\u043f\u044b \u044d\u0442\u043e\u0439 \u0447\u0430\u0441\u0442\u0438 \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441\u0438\u0438." : "Sub-stages inside this era.")}</p></div><button class="button button--primary button--tiny" type="button" data-action="add-era-stage" data-era="${esc(eraId)}">${esc(lang() === "ru" ? "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u0434-\u044d\u0442\u0430\u043f" : "Add sub-stage")}</button></header><div class="outline-era__list">${stages.length ? stages.map(({ stage, index }) => outlineStageRow(stage, index)).join("") : `<p class="empty-state">${esc(lang() === "ru" ? "\u041f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043f\u043e\u0434-\u044d\u0442\u0430\u043f\u043e\u0432." : "No sub-stages yet.")}</p>`}</div></section>`;
  }).join("");
}

function renderStageDetail() {
  const stage = state.stages[openStage];
  if (!stage) {
    refs.accordion.innerHTML = `<div class="empty-stage-detail"><p class="muted">${esc(lang() === "ru" ? "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u043b\u0438 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043f\u043e\u0434-\u044d\u0442\u0430\u043f." : "Select or add a sub-stage.")}</p></div>`;
    return;
  }
  refs.accordion.innerHTML = stageBody(stage, openStage);
}

function renderStageWorkspace() {
  renderOutline();
  renderStageDetail();
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
  renderStageWorkspace();
  renderPreview();
  renderSubmissionGuide();
  renderSubmissionActions();
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
  const issueUrl = new URL(`${url}/issues/new`);
  issueUrl.searchParams.set("template", "guide_submission.yml");
  window.open(issueUrl.toString(), "_blank", "noopener");
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
  const nextOptions = { ...options };
  if (mode === "description" && Number.isInteger(options.stageIndex)) {
    const fieldRole = options.fieldRole || "stage-description";
    const field = document.querySelector(`[data-role="${fieldRole}"][data-stage-index="${options.stageIndex}"]`);
    if (field) {
      nextOptions.selectionStart = field.selectionStart ?? field.value.length;
      nextOptions.selectionEnd = field.selectionEnd ?? field.value.length;
    }
  }

  const filter = mode === "item"
    ? (options.groupKey || "other")
    : mode === "boss"
      ? "boss"
      : "all";
  pickerState = { mode, filter, ...nextOptions };
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
  if (pickerState.groupKey === "armor") {
    return [{ key: "armor", label: groupLabel("armor") }];
  }
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
  if (pickerState.groupKey === "armor") {
    return visibleSearchItems()
      .filter((entry) => ARMOR_SET_IDS.has(entry.id))
      .map((entry) => ({ ...entry, pickerType: "item" }));
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
      if (query) return true;
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

function insertAtCursor(field, value, startOverride, endOverride) {
  const start = Number.isInteger(startOverride) ? startOverride : (field.selectionStart ?? field.value.length);
  const end = Number.isInteger(endOverride) ? endOverride : (field.selectionEnd ?? field.value.length);
  field.value = `${field.value.slice(0, start)}${value}${field.value.slice(end)}`;
  const nextPosition = start + value.length;
  field.selectionStart = nextPosition;
  field.selectionEnd = nextPosition;
}

function handlePickerSelection(contentId) {
  if (!pickerState) return;

  if (pickerState.mode === "description") {
    const fieldRole = pickerState.fieldRole || "stage-description";
    const field = refs.accordion.querySelector(`[data-role="${fieldRole}"][data-stage-index="${pickerState.stageIndex}"]`);
    if (field) {
      insertAtCursor(field, `{{icon:${contentId}}}`, pickerState.selectionStart, pickerState.selectionEnd);
      if (fieldRole === "stage-title") {
        state.stages[pickerState.stageIndex].title = field.value;
      } else if (fieldRole === "stage-description") {
        state.stages[pickerState.stageIndex].description = field.value;
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
    applySupportEnhancements();
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

refs.outline.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const stageIndex = Number(button.dataset.stageIndex);
  const eraId = button.dataset.era || "";

  if (action === "add-era-stage") {
    insertStageForEra(eraId || "prehardmode");
    saveAndRender();
    return;
  }

  if (action === "select-stage") {
    openStage = stageIndex;
    renderStageWorkspace();
    renderFooter();
    return;
  }

  const stage = state.stages[stageIndex];
  if (!stage) return;

  if (action === "move-stage-up") {
    const targetIndex = previousStageIndexInEra(stageIndex);
    if (targetIndex === -1) return;
    moveStage(stageIndex, targetIndex);
    openStage = targetIndex;
    saveAndRender();
    return;
  }

  if (action === "move-stage-down") {
    const targetIndex = nextStageIndexInEra(stageIndex);
    if (targetIndex === -1) return;
    moveStage(stageIndex, targetIndex);
    openStage = targetIndex;
    saveAndRender();
    return;
  }

  if (action === "remove-stage" && state.stages.length > 1) {
    state.stages.splice(stageIndex, 1);
    openStage = Math.max(0, Math.min(openStage, state.stages.length - 1));
    saveAndRender();
  }
});

refs.accordion.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const stageIndex = Number(button.dataset.stageIndex);
  const itemIndex = Number(button.dataset.itemIndex);
  const bossIndex = Number(button.dataset.bossIndex);
  const groupKey = button.dataset.groupKey;
  const subgroupId = button.dataset.subgroupId || "";
  const groupId = button.dataset.groupId || "";
  const stage = state.stages[stageIndex];

  if (!stage) return;

  if (action === "open-title-picker") return openPicker("description", { stageIndex, fieldRole: "stage-title" });
  if (action === "open-description-picker") return openPicker("description", { stageIndex, fieldRole: "stage-description" });
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
