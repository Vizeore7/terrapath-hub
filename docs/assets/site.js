(function () {
  const STORAGE_KEY = "terrapath-site-language";
  const listeners = new Set();

  const translations = {
    en: {
      common: {
        navBrowse: "Browse",
        navBuilder: "Editor",
        langEn: "EN",
        langRu: "RU",
        labelClass: "Class",
        labelLanguage: "Language",
        labelPopularity: "Popularity",
        labelStages: "Stages",
        labelMods: "Mods",
        labelBosses: "Bosses",
        labelGoals: "Goals",
        labelNotes: "Notes",
        labelEra: "Era",
        labelMarkers: "Progression notes",
        languageEnglishUs: "English (US)",
        languageRussian: "Russian"
      },
      home: {
        title: "TerraPath Hub",
        eyebrow: "Community progression guides for Terraria",
        heading: "TerraPath Hub",
        lede: "Build a guide, submit it, and browse what has already been published.",
        ctaBuilder: "Open editor",
        ctaBrowse: "Browse guides",
        ctaSubmit: "Submit guide",
        stagesTitle: "Structured stages",
        stagesBody: "Split a guide into progression steps with optional descriptions, goals, boss references, and notes.",
        itemsTitle: "Item categories",
        itemsBody: "Group recommendations into weapons, armor, accessories, ores, materials, buffs, tools, and alternatives.",
        modsTitle: "Built for mods",
        modsBody: "Guides store stable content IDs such as Terraria/HermesBoots or CalamityMod/SomeInternalName."
      },
      browse: {
        title: "Browse Guides - TerraPath",
        eyebrow: "Catalog preview",
        heading: "Browse Guides",
        searchLabel: "Search",
        searchPlaceholder: "Search by title, class, mod, language",
        languageLabel: "Language",
        classLabel: "Class",
        modLabel: "Required mod",
        sortLabel: "Sort",
        sortPopularity: "Popularity",
        sortUpdated: "Recently updated",
        sortTitle: "Title",
        allLanguages: "All languages",
        allClasses: "All classes",
        allMods: "All mods",
        openGuide: "Open guide",
        noGuides: "No guides found for the selected filters.",
        loadingGuideCount: "Loading guide count...",
        countSummary: "{shown} of {total} guides shown"
      },
      guide: {
        title: "Guide Page - TerraPath",
        eyebrow: "Guide page",
        back: "Back to browse",
        rawJson: "Open raw JSON",
        loading: "Loading guide...",
        noGuides: "No guides are available yet.",
        couldNotLoad: "Could not load {path}",
        noItems: "No item picks listed for this stage.",
        itemPicks: "{count} item picks"
      },
      editor: {
        title: "Guide Editor - TerraPath",
        eyebrow: "Step-by-step authoring",
        heading: "Guide Editor",
        intro: "Create a TerraPath guide one section at a time. Title, tags, stages, and export each get their own space so the screen stays readable.",
        loadingSupport: "Loading curated Terraria content...",
        snapshotTitle: "Guide snapshot",
        snapshotBody: "A quick summary of what players will see in the catalog.",
        basicsTitle: "Basics",
        basicsDesc: "Set the title, author, language, and short catalog summary.",
        scopeTitle: "Scope",
        scopeDesc: "Pick the supported mods, class tags, and broad guide tags.",
        stagesTitle: "Stages",
        stagesDesc: "Build the progression path stage by stage with bosses, items, goals, and notes.",
        reviewTitle: "Review",
        reviewDesc: "Check the rendered guide and export the final JSON.",
        guideTitleLabel: "Guide title",
        guideTitlePlaceholder: "Calamity Summoner Progression",
        authorLabel: "Author",
        authorPlaceholder: "Your name",
        guideLanguageLabel: "Guide language",
        summaryLabel: "Catalog summary",
        summaryPlaceholder: "Short description shown in the guide list.",
        calloutTitle: "What appears in the list",
        calloutBody: "The list view is meant to stay compact: title, class, popularity, language, and a short summary should explain the guide at a glance.",
        calloutTip1: "Use a clear build name, not a long paragraph.",
        calloutTip2: "Keep the summary focused on progression or playstyle.",
        calloutTip3: "Guide language should match the text inside the guide.",
        requiredModsTitle: "Required mods",
        requiredModsBody: "Pick the content packs this guide depends on. Players can still see the guide without them, but the game can flag missing content.",
        classTagsTitle: "Class tags",
        classTagsBody: "These tags drive filtering in the guide browser and in-game list.",
        guideTagsTitle: "Guide tags",
        guideTagsBody: "Use broad, reusable tags like progression, bossing, pre-hardmode, or starter. Keep them general so search stays useful.",
        stageSectionTitle: "Stages",
        stageSectionBody: "Split the guide into progression checkpoints instead of one long wall of text.",
        addStage: "Add stage",
        submissionTitle: "Submission actions",
        submissionBody: "Review the rendered page first, then copy or download the JSON and open a GitHub issue.",
        copyJson: "Copy JSON",
        downloadJson: "Download guide.json",
        openIssue: "Open GitHub issue",
        resetDraft: "Reset draft",
        submissionStatus: "Drafts are saved locally. Use the buttons above when this preview looks ready.",
        renderedPreviewTitle: "Rendered guide preview",
        renderedPreviewBody: "This is the full reading experience a player would get after opening the guide page.",
        jsonTitle: "guide.json",
        jsonBody: "Structured output used by validation, catalog building, and in-game loading.",
        back: "Back",
        nextStep: "Next step",
        goToReview: "Go to review",
        stayOnReview: "Stay on review",
        autosave: "Draft autosaves in this browser.",
        autosavedAt: "Draft autosaved at {time}.",
        resetConfirm: "Reset the current TerraPath draft?",
        stageTitleLabel: "Stage title",
        stageDescriptionLabel: "Description",
        stageDescriptionPlaceholder: "Explain what this part of progression is about.",
        stageGoalsLabel: "Goals, one per line",
        stageGoalsPlaceholder: "Build an arena\nCraft movement gear",
        stageNotesLabel: "Notes, one per line",
        stageNotesPlaceholder: "Optional reminders or route notes",
        stageIntro: "Keep stages narrow and actionable. One stage should feel like one chunk of progression.",
        stageEraLabel: "Main progression era",
        stageEraBody: "Choose the broad section of the game first, then add one or more detailed progression notes below.",
        stageMarkersTitle: "Detailed progression notes",
        stageMarkersBody: "Use smaller milestone cards such as pre-mech, pre-Plantera, or post-Golem to clarify exactly where this stage lives.",
        bossMilestonesTitle: "Boss milestones",
        bossMilestonesBody: "Reference bosses that define this stage or mark the transition out of it.",
        addBoss: "Add boss",
        bossMilestoneLabel: "Boss milestone",
        chooseBoss: "Choose a boss",
        itemPicksTitle: "Item picks",
        itemPicksBody: "Pick curated Terraria entries with real in-game icons and place them into categories.",
        addItem: "Add item",
        itemLabel: "Item",
        chooseItem: "Choose an item",
        categoryLabel: "Category",
        priorityLabel: "Priority",
        itemNoteLabel: "Optional note",
        itemNotePlaceholder: "Why this item matters here.",
        remove: "Remove",
        noBossMilestones: "No boss milestones yet.",
        noItemPicks: "No item picks yet.",
        noSelectedStage: "No stage selected.",
        current: "Current",
        ready: "Ready",
        pending: "Pending",
        stepCounter: "Step {current} of {total}",
        stageCounter: "Stage {index}",
        stageItemPicks: "{count} item picks",
        stageSnapshotTitle: "Title",
        stageSnapshotAuthor: "Author",
        stageSnapshotLanguage: "Language",
        stageSnapshotStages: "Stages",
        stageSnapshotItems: "Item picks",
        stageSnapshotClasses: "Classes",
        supportLoaded: "Curated Terraria support loaded: {items} item and ore entries, {bosses} boss entries, all using extracted in-game vanilla icons.",
        supportFailed: "Curated support data could not be loaded. The editor still works, but curated content pickers may be empty.",
        copiedJson: "guide.json copied. Open the GitHub issue form and paste the JSON there.",
        selectedJson: "Clipboard access was blocked, so the JSON preview has been selected for manual copy.",
        issueOpened: "GitHub opened in a new tab. Choose the guide submission form and paste the copied JSON.",
        repoUnknown: "Repository URL was not detected here. Open your TerraPath repository and create a guide submission issue manually.",
        draftReset: "Draft reset. A fresh example guide has been loaded.",
        noItemsPreview: "No item picks added for this stage yet."
      }
    },
    ru: {
      common: {
        navBrowse: "Руководства",
        navBuilder: "Редактор",
        langEn: "EN",
        langRu: "RU",
        labelClass: "Класс",
        labelLanguage: "Язык",
        labelPopularity: "Популярность",
        labelStages: "Этапы",
        labelMods: "Моды",
        labelBosses: "Боссы",
        labelGoals: "Цели",
        labelNotes: "Заметки",
        labelEra: "Период игры",
        labelMarkers: "Мини-этапы",
        languageEnglishUs: "Английский (США)",
        languageRussian: "Русский"
      },
      home: {
        title: "TerraPath Hub",
        eyebrow: "Сообщество руководств по прогрессии Terraria",
        heading: "TerraPath Hub",
        lede: "Публичный каталог, редактор и отправка TerraPath-гайдов.",
        ctaBuilder: "Открыть редактор",
        ctaBrowse: "Открыть каталог",
        ctaSubmit: "Отправить гайд",
        stagesTitle: "Структурные этапы",
        stagesBody: "Разделяйте гайд на шаги прогрессии с описаниями, целями, ссылками на боссов и заметками.",
        itemsTitle: "Категории предметов",
        itemsBody: "Группируйте рекомендации по оружию, броне, аксессуарам, рудам, материалам, баффам, инструментам и альтернативам.",
        modsTitle: "Подходит для модов",
        modsBody: "Гайды хранят стабильные идентификаторы вроде Terraria/HermesBoots или CalamityMod/SomeInternalName."
      },
      browse: {
        title: "Каталог руководств - TerraPath",
        eyebrow: "Предпросмотр каталога",
        heading: "Каталог руководств",
        searchLabel: "Поиск",
        searchPlaceholder: "Ищите по названию, классу, моду или языку",
        languageLabel: "Язык",
        classLabel: "Класс",
        modLabel: "Обязательный мод",
        sortLabel: "Сортировка",
        sortPopularity: "По популярности",
        sortUpdated: "Сначала новые",
        sortTitle: "По названию",
        allLanguages: "Все языки",
        allClasses: "Все классы",
        allMods: "Все моды",
        openGuide: "Открыть",
        noGuides: "По выбранным фильтрам руководства не найдены.",
        loadingGuideCount: "Загрузка количества руководств...",
        countSummary: "Показано {shown} из {total} руководств"
      },
      guide: {
        title: "Страница руководства - TerraPath",
        eyebrow: "Страница руководства",
        back: "Назад к каталогу",
        rawJson: "Открыть raw JSON",
        loading: "Загрузка руководства...",
        noGuides: "Пока нет доступных руководств.",
        couldNotLoad: "Не удалось загрузить {path}",
        noItems: "Для этого этапа пока не добавлены предметы.",
        itemPicks: "{count} предметов"
      },
      editor: {
        title: "Редактор руководств - TerraPath",
        eyebrow: "Пошаговое создание",
        heading: "Редактор гайдов",
        intro: "Создавайте TerraPath-гайд по шагам. Название, теги, этапы и экспорт разделены по отдельным экранам, чтобы интерфейс оставался понятным.",
        loadingSupport: "Загрузка curated Terraria-контента...",
        snapshotTitle: "Краткая сводка",
        snapshotBody: "Быстрый обзор того, что игроки увидят в каталоге.",
        basicsTitle: "Основа",
        basicsDesc: "Укажите название, автора, язык и короткое описание для каталога.",
        scopeTitle: "Область",
        scopeDesc: "Выберите поддерживаемые моды, теги класса и общие теги гайда.",
        stagesTitle: "Этапы",
        stagesDesc: "Соберите путь прогрессии по этапам: боссы, предметы, цели и заметки.",
        reviewTitle: "Проверка",
        reviewDesc: "Посмотрите итоговую страницу и экспортируйте готовый JSON.",
        guideTitleLabel: "Название гайда",
        guideTitlePlaceholder: "Прогрессия суммонера в Calamity",
        authorLabel: "Автор",
        authorPlaceholder: "Ваше имя",
        guideLanguageLabel: "Язык гайда",
        summaryLabel: "Описание для каталога",
        summaryPlaceholder: "Короткое описание, которое будет видно в списке руководств.",
        calloutTitle: "Что видно в списке",
        calloutBody: "Список должен оставаться компактным: название, класс, популярность, язык и короткое описание должны сразу объяснять, о чем гайд.",
        calloutTip1: "Используйте ясное название билда, а не длинный абзац.",
        calloutTip2: "Держите описание сфокусированным на прогрессии или стиле игры.",
        calloutTip3: "Язык гайда должен совпадать с языком текста внутри него.",
        requiredModsTitle: "Обязательные моды",
        requiredModsBody: "Выберите наборы контента, от которых зависит гайд. Игроки все равно смогут видеть его, но игра сможет отметить недостающий контент.",
        classTagsTitle: "Теги класса",
        classTagsBody: "Эти теги используются для фильтрации в каталоге и внутриигровом списке.",
        guideTagsTitle: "Теги гайда",
        guideTagsBody: "Используйте широкие теги вроде progression, bossing, pre-hardmode или starter, чтобы поиск оставался полезным.",
        stageSectionTitle: "Этапы",
        stageSectionBody: "Разделяйте руководство на контрольные точки прогрессии, а не на одну длинную стену текста.",
        addStage: "Добавить этап",
        submissionTitle: "Действия перед отправкой",
        submissionBody: "Сначала проверьте итоговую страницу, затем скопируйте или скачайте JSON и откройте GitHub issue.",
        copyJson: "Скопировать JSON",
        downloadJson: "Скачать guide.json",
        openIssue: "Открыть GitHub issue",
        resetDraft: "Сбросить черновик",
        submissionStatus: "Черновики сохраняются локально. Используйте кнопки выше, когда превью будет готово.",
        renderedPreviewTitle: "Итоговое превью",
        renderedPreviewBody: "Так игрок увидит руководство после открытия его страницы.",
        jsonTitle: "guide.json",
        jsonBody: "Структурированный вывод, который используется для валидации, каталога и загрузки в игре.",
        back: "Назад",
        nextStep: "Следующий шаг",
        goToReview: "К проверке",
        stayOnReview: "Остаться на проверке",
        autosave: "Черновик автоматически сохраняется в этом браузере.",
        autosavedAt: "Черновик сохранен в {time}.",
        resetConfirm: "Сбросить текущий черновик TerraPath?",
        stageTitleLabel: "Название этапа",
        stageDescriptionLabel: "Описание",
        stageDescriptionPlaceholder: "Объясните, о чем этот участок прогрессии.",
        stageGoalsLabel: "Цели, по одной на строку",
        stageGoalsPlaceholder: "Построить арену\nСобрать предметы на мобильность",
        stageNotesLabel: "Заметки, по одной на строку",
        stageNotesPlaceholder: "Дополнительные напоминания или подсказки по маршруту",
        stageIntro: "Делайте этапы узкими и понятными. Один этап должен ощущаться как один кусок прогрессии.",
        stageEraLabel: "Основной этап игры",
        stageEraBody: "Сначала выберите крупный период игры, а потом добавьте один или несколько уточняющих мини-этапов.",
        stageMarkersTitle: "Подробные мини-этапы",
        stageMarkersBody: "Используйте более точные метки вроде pre-mech, pre-Plantera или post-Golem, чтобы показать точное место этого этапа в прогрессии.",
        bossMilestonesTitle: "Отсылки к боссам",
        bossMilestonesBody: "Отмечайте боссов, которые определяют этот этап или завершают его.",
        addBoss: "Добавить босса",
        bossMilestoneLabel: "Босс",
        chooseBoss: "Выберите босса",
        itemPicksTitle: "Предметы этапа",
        itemPicksBody: "Выбирайте curated Terraria-предметы с настоящими игровыми иконками и раскладывайте их по категориям.",
        addItem: "Добавить предмет",
        itemLabel: "Предмет",
        chooseItem: "Выберите предмет",
        categoryLabel: "Категория",
        priorityLabel: "Приоритет",
        itemNoteLabel: "Необязательная заметка",
        itemNotePlaceholder: "Почему этот предмет важен именно здесь.",
        remove: "Удалить",
        noBossMilestones: "Пока нет отмеченных боссов.",
        noItemPicks: "Пока нет предметов.",
        noSelectedStage: "Этап не выбран.",
        current: "Текущий",
        ready: "Готово",
        pending: "Не заполнено",
        stepCounter: "Шаг {current} из {total}",
        stageCounter: "Этап {index}",
        stageItemPicks: "{count} предметов",
        stageSnapshotTitle: "Название",
        stageSnapshotAuthor: "Автор",
        stageSnapshotLanguage: "Язык",
        stageSnapshotStages: "Этапы",
        stageSnapshotItems: "Предметы",
        stageSnapshotClasses: "Классы",
        supportLoaded: "Curated Terraria-контент загружен: {items} записей предметов и руд, {bosses} записей боссов, все с извлеченными игровыми vanilla-иконками.",
        supportFailed: "Не удалось загрузить curated-данные. Редактор продолжит работать, но списки выбора могут быть пустыми.",
        copiedJson: "guide.json скопирован. Откройте GitHub issue и вставьте туда JSON.",
        selectedJson: "Доступ к буферу обмена был заблокирован, поэтому JSON выделен для ручного копирования.",
        issueOpened: "GitHub открыт в новой вкладке. Выберите форму отправки руководства и вставьте туда скопированный JSON.",
        repoUnknown: "URL репозитория здесь не определился. Откройте свой TerraPath-репозиторий и создайте issue вручную.",
        draftReset: "Черновик сброшен. Загружен новый пример руководства.",
        noItemsPreview: "Для этого этапа пока не добавлены предметы."
      }
    }
  };

  const guideLanguageLabels = {
    "en-US": { en: "English (US)", ru: "Английский (США)" },
    "ru-RU": { en: "Russian", ru: "Русский" }
  };

  function format(template, variables = {}) {
    return String(template).replace(/\{(\w+)\}/g, (_, name) => String(variables[name] ?? ""));
  }

  function deepGet(source, path) {
    return path.split(".").reduce((value, part) => value?.[part], source);
  }

  function getLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ru" ? "ru" : "en";
  }

  function t(key, variables = {}) {
    const language = getLanguage();
    const fallback = deepGet(translations.en, key) ?? key;
    const value = deepGet(translations[language], key) ?? fallback;
    return format(value, variables);
  }

  function getGuideLanguageLabel(code) {
    return guideLanguageLabels[code]?.[getLanguage()] ?? code;
  }

  function applyStaticTranslations() {
    document.documentElement.lang = getLanguage() === "ru" ? "ru" : "en";

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });
  }

  function renderLanguageToggle() {
    const containers = document.querySelectorAll("[data-language-toggle]");
    for (const container of containers) {
      container.innerHTML = `
        <div class="lang-switch" role="group" aria-label="Language switcher">
          <button class="lang-switch__button ${getLanguage() === "en" ? "lang-switch__button--active" : ""}" type="button" data-site-language="en">${t("common.langEn")}</button>
          <button class="lang-switch__button ${getLanguage() === "ru" ? "lang-switch__button--active" : ""}" type="button" data-site-language="ru">${t("common.langRu")}</button>
        </div>
      `;
    }
  }

  function getRepositoryUrl() {
    const { hostname, pathname } = window.location;

    if (hostname.endsWith(".github.io")) {
      const owner = hostname.slice(0, hostname.indexOf(".github.io"));
      const repo = pathname.split("/").filter(Boolean)[0];
      if (owner && repo) {
        return `https://github.com/${owner}/${repo}`;
      }
    }

    if (hostname === "github.com") {
      const parts = pathname.split("/").filter(Boolean);
      const owner = parts[0];
      const repo = parts[1];
      if (owner && repo) {
        return `https://github.com/${owner}/${repo}`;
      }
    }

    return "https://github.com/Vizeore7/terrapath-hub";
  }

  function getGuideSubmissionUrl() {
    return `${getRepositoryUrl()}/issues/new?template=guide_submission.yml`;
  }

  function applySubmissionLinks() {
    document.querySelectorAll("[data-submission-link]").forEach((element) => {
      element.setAttribute("href", getGuideSubmissionUrl());
    });
  }

  function notify() {
    applyStaticTranslations();
    renderLanguageToggle();
    applySubmissionLinks();
    for (const listener of listeners) {
      listener(getLanguage());
    }
  }

  function setLanguage(language) {
    localStorage.setItem(STORAGE_KEY, language === "ru" ? "ru" : "en");
    notify();
  }

  function onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-site-language]");
    if (!button) {
      return;
    }
    setLanguage(button.dataset.siteLanguage);
  });

  document.addEventListener("DOMContentLoaded", () => {
    notify();
  });

  window.terraPathSite = {
    getLanguage,
    setLanguage,
    t,
    onChange,
    applyStaticTranslations,
    getGuideLanguageLabel,
    getRepositoryUrl,
    getGuideSubmissionUrl
  };
})();
