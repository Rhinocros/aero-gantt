/**
 * i18n — Internationalization module for Gantt Chart Generator
 * Supports: zh (Chinese), en (English)
 */

const LANG = {
  zh: {
    // App
    appTitle: "灵越甘特图生成系统",
    defaultTitle: "灵越甘特图生成系统",
    defaultTitleShort: "灵越甘特图",
    hint: "拖动条形可移动工期，拉伸边缘可修改日期，工程项可拖动调整顺序，点击颜色块可以更换项目颜色。",

    // Theme
    themeLabel: "主题：",
    themeLight: "浅色主题",
    themeDark: "黑色主题",
    themeGray: "灰色主题",
    themeBlue: "深蓝主题",

    // Buttons
    importExcel: "导入 Excel",
    exportBtn: "导出...",
    exportBtnTitle: "将数据导出为其它格式",
    openProject: "打开工程",
    openProjectTitle: "打开现有工程文件 (.gantt)",
    saveProject: "保存工程",
    saveProjectTitle: "保存当前工程为 .gantt 文件",
    undo: "撤销",
    redo: "重做",
    showDuration: "显示时长",
    showAll: "显示全部",
    showDate: "显示日期",
    previewMode: "预览模式",
    collapseShow: "折叠显示",
    collapseHide: "取消折叠",
    labelInside: "名称外显",
    labelOutside: "名称内嵌",
    addTask: "增加工程项",
    cancel: "取消",

    // Gantt
    timeline: "时间轴",
    emptyHint: '请点击左侧"导入 Excel"按钮或拖入Excel和Gantt文件以生成甘特图',

    // Export modal
    exportTitle: "导出选项",
    exportHint: "请选择您要导出的文件格式：",
    exportPdf: "导出为 PDF",
    exportXlsx: "导出为 Excel (XLSX)",
    exportCsv: "导出为 CSV 表格",
    exportJson: "导出为 JSON 数据",

    // Drag & drop
    dropHint: "松开鼠标，导入 Excel 文件",

    // Color picker
    moreColors: "更多颜色",

    // Task list
    datePlaceholder: "选择开始和结束日期",
    dateSeparator: "至",
    outdent: "取消缩进",
    indent: "缩进",
    expandChildren: "展开子项(仅左侧)",
    collapseChildren: "折叠子项(仅左侧)",
    deleteTask: "删除工程项",
    confirmDelete: "确定要删除 \"{0}\" 吗？",
    newTask: "新工程项目",

    // Date/time
    dayUnit: "天",
    dayPrefix: "第",
    chineseMonth: "月",
    chineseDay: "日",

    // Import/Export messages
    importEmpty: "导入失败：该表格为空或未识别出数据。",
    importDropFail: "导入失败：未获取到拖放的文件，可能被浏览器或系统限制拦截，请使用导入按钮。",
    importProjectFail: "导入工程失败：",
    invalidProject: "无效的工程文件",
    untitledProject: "未命名工程",

    // Export data
    csvHeader: "项目系列,工程项目,开始日期,结束日期",
    xlsxSeries: "项目系列",
    xlsxTaskName: "工程项目名称",
    xlsxTimeRange: "时间范围",
    xlsxColor: "颜色",
    sheetName: "甘特图数据",
    excelFileDesc: "Excel 文件",
    fileDesc: "文件",

    // Language
    langToggle: "EN",
    langLabel: "语言：",
  },

  en: {
    // App
    appTitle: "AeroGantt Chart Generator",
    defaultTitle: "AeroGantt Chart Generator",
    defaultTitleShort: "AeroGantt Chart",
    hint: "Drag bars to move tasks, stretch edges to change dates, drag task cards to reorder, click color dots to change colors.",

    // Theme
    themeLabel: "Theme:",
    themeLight: "Light Theme",
    themeDark: "Dark Theme",
    themeGray: "Gray Theme",
    themeBlue: "Blue Theme",

    // Buttons
    importExcel: "Import Excel",
    exportBtn: "Export...",
    exportBtnTitle: "Export data to other formats",
    openProject: "Open Project",
    openProjectTitle: "Open existing project file (.gantt)",
    saveProject: "Save Project",
    saveProjectTitle: "Save current project as .gantt file",
    undo: "Undo",
    redo: "Redo",
    showDuration: "Show Duration",
    showAll: "Show All",
    showDate: "Show Date",
    previewMode: "Preview",
    collapseShow: "Collapse",
    collapseHide: "Expand",
    labelInside: "Label Out",
    labelOutside: "Label In",
    addTask: "Add Task",
    cancel: "Cancel",

    // Gantt
    timeline: "Timeline",
    emptyHint: 'Click "Import Excel" on the left or drag in Excel / Gantt files to generate a Gantt chart',

    // Export modal
    exportTitle: "Export Options",
    exportHint: "Please select the export format:",
    exportPdf: "Export as PDF",
    exportXlsx: "Export as Excel (XLSX)",
    exportCsv: "Export as CSV",
    exportJson: "Export as JSON",

    // Drag & drop
    dropHint: "Drop to import Excel file",

    // Color picker
    moreColors: "More Colors",

    // Task list
    datePlaceholder: "Select start and end date",
    dateSeparator: "to",
    outdent: "Outdent",
    indent: "Indent",
    expandChildren: "Expand children (sidebar only)",
    collapseChildren: "Collapse children (sidebar only)",
    deleteTask: "Delete Task",
    confirmDelete: 'Are you sure you want to delete "{0}"?',
    newTask: "New Task",

    // Date/time
    dayUnit: "d",
    dayPrefix: "Day ",
    chineseMonth: "/",
    chineseDay: "",

    // Import/Export messages
    importEmpty: "Import failed: The spreadsheet is empty or contains no recognizable data.",
    importDropFail: "Import failed: Could not read the dropped file. It may be blocked by the browser or system. Please use the Import button instead.",
    importProjectFail: "Failed to import project: ",
    invalidProject: "Invalid project file",
    untitledProject: "Untitled Project",

    // Export data
    csvHeader: "Series,Task,Start Date,End Date",
    xlsxSeries: "Series",
    xlsxTaskName: "Task Name",
    xlsxTimeRange: "Time Range",
    xlsxColor: "Color",
    sheetName: "Gantt Data",
    excelFileDesc: "Excel Files",
    fileDesc: "File",

    // Language
    langToggle: "中",
    langLabel: "Lang:",
  }
};

// ---- Engine ----

let _currentLang = "zh";

/** Get current language code */
function getLang() {
  return _currentLang;
}

/**
 * Get translation for key.
 * Supports placeholders: t('confirmDelete', taskName) → replaces {0}
 */
function t(key, ...args) {
  const dict = LANG[_currentLang] || LANG.zh;
  let text = dict[key];
  if (text === undefined) {
    // Fallback to zh
    text = LANG.zh[key];
  }
  if (text === undefined) return key; // Return key itself if not found

  // Replace {0}, {1}, ... placeholders
  args.forEach((arg, i) => {
    text = text.replace(new RegExp("\\{" + i + "\\}", "g"), arg);
  });
  return text;
}

/**
 * Scan DOM for [data-i18n], [data-i18n-title], [data-i18n-placeholder], [data-i18n-value]
 * and apply translations.
 */
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      // For elements with .btn-text-content children, update the text span
      const textSpan = el.querySelector(".btn-text-content");
      if (textSpan) {
        // Preserve inner icons (SVGs) — only update text nodes
        const svgs = textSpan.querySelectorAll("svg, img");
        if (svgs.length > 0) {
          // Has icon — update only text nodes
          textSpan.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              node.textContent = "\n            " + t(key) + "\n          ";
            }
          });
        } else {
          textSpan.textContent = t(key);
        }
      } else {
        el.textContent = t(key);
      }
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (key) el.title = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.placeholder = t(key);
  });

  document.querySelectorAll("[data-i18n-value]").forEach(el => {
    const key = el.getAttribute("data-i18n-value");
    if (key) el.value = t(key);
  });

  // Update page title
  document.title = t("appTitle");
}

/**
 * Set language and re-render UI.
 * @param {string} lang - 'zh' or 'en'
 */
function setLang(lang) {
  if (!LANG[lang]) lang = "zh";
  _currentLang = lang;
  try {
    localStorage.setItem("gantt-lang", lang);
  } catch (e) { }

  // Apply static HTML translations
  applyI18n();

  // Update lang toggle button text
  const toggleBtn = document.getElementById("lang-toggle-btn");
  if (toggleBtn) {
    const textSpan = toggleBtn.querySelector(".btn-text-content");
    if (textSpan) textSpan.textContent = t("langToggle");
  }

  // Update Flatpickr locale
  if (typeof flatpickr !== "undefined") {
    // Will be handled by script.js reinit
  }

  // Re-init Gantt if available (script.js defines initGantt)
  if (typeof initGantt === "function") {
    initGantt();
  }

  // Re-apply shortcut hints if available
  if (typeof initShortcutHints === "function") {
    initShortcutHints();
  }
}

// Initialize language from localStorage
(function initLang() {
  let saved = "zh";
  try {
    saved = localStorage.getItem("gantt-lang") || "zh";
  } catch (e) { }
  if (!LANG[saved]) saved = "zh";
  _currentLang = saved;
})();
