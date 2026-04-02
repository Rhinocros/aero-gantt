<p align="right">
  <strong>🌐 Language / 语言：</strong>
  <a href="README.md">🇨🇳 中文</a> | <a href="README_EN.md">🇺🇸 English</a>
</p>

<div align="center">

# 📊 Gantt Chart Generator

A lightweight, zero-dependency Gantt chart generator — built with native HTML5, JavaScript, and CSS3. No installation, no frameworks, no build tools. Open in any browser and start working.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

</div>

---

## ✨ Features

### 📥 Data Import
- **Excel Import** — Supports `.xlsx` / `.xls` formats with smart header detection (task name, start date, end date, etc.)
- **Project Files** — Open `.gantt` project files to restore all states
- **Drag & Drop** — Drag Excel or `.gantt` files directly into the browser window
- **Smart Parsing** — Automatically detects hierarchies (parent/child tasks), date formats, and duration modes

### 📤 Data Export
- **PDF Export** — Generate high-quality PDF documents via the browser print dialog
- **Excel (XLSX)** — Export to standard Excel spreadsheets for further editing
- **CSV** — Export to CSV format, compatible with various data processing tools
- **JSON** — Export structured JSON data for programmatic integration
- **Project Save** — Save as `.gantt` project files for full session restoration

### 🎨 Visualization & Interaction
- **Drag to Move** — Drag bars to shift tasks; stretch edges to change start/end dates
- **Drag to Reorder** — Reorder task cards by dragging them in the sidebar
- **Hierarchy Management** — Indent/Outdent to create parent-child task groups
- **Color Customization** — 30 preset colors + custom HEX input + system color picker
- **Smart Timeline** — Automatically compresses idle periods, highlighting key dates
- **Auto-fit Width** — Gantt chart adapts to viewport width

### 🖥️ Display Modes
- **Date Mode** — Shows date ranges (MM-DD ~ MM-DD)
- **Duration Mode** — Shows day counts (N days)
- **Full Mode** — Shows both dates and duration
- **Collapse Mode** — Collapses child tasks, showing only parent summaries
- **Label Toggle** — Toggle project name display inside or outside the bars
- **Preview Mode** — Hides the sidebar for full-screen Gantt chart viewing

### 🎭 Themes
| Theme | Description |
|-------|-------------|
| ☀️ Light | Classic white background, clean and bright |
| 🌑 Dark | Dark background, eye-friendly |
| 🌫️ Gray | Neutral gray tone, low contrast |
| 🌊 Deep Blue | Deep blue background, professional look |

### ⏪ Undo / Redo
- Supports up to **100 steps** of undo/redo
- Shortcuts: `Ctrl+Z` for undo / `Ctrl+Y` for redo

### 🌍 Internationalization (i18n)
- **Chinese / English** toggle with one click
- Language preference auto-saved and restored on next visit
- Excel import supports both Chinese and English headers

---

## 🚀 Quick Start

### Option 1: Direct Use

1. Download this project
2. Double-click `index.html` to open
3. No dependencies, no server required
4. All JS and CSS files are local — no internet connection needed

### Option 2: Online Deployment

Deploy the project files to any web server or static hosting platform:

```
gantt-chart/
├── index.html              # Main page
└── assets/
    ├── css/
    │   ├── style.css             # Main styles
    │   ├── button.css            # Button styles
    │   └── flatpickr.min.css     # Date picker styles
    ├── js/
    │   ├── script.js             # Main logic
    │   ├── i18n.js               # Internationalization engine
    │   ├── flatpickr.min.js      # Date picker
    │   ├── flatpickr_zh.js       # Chinese localization
    │   ├── xlsx.full.min.js      # Excel parsing (SheetJS)
    │   └── lz-string.min.js      # Data compression
    └── images/
        ├── pdf.svg               # PDF icon
        ├── xlsx.svg              # XLSX icon
        ├── csv.svg               # CSV icon
        └── json.svg              # JSON icon
```

---

## 📖 Usage Guide

### Importing Excel Files

Supported Excel header formats (auto-detected):

| Field Type | Recognized Header Keywords |
|-----------|---------------------------|
| Task Name | `Name`, `Task`, `Task Name`, `Project`, `Description`, `名称`, `项目名称`, `任务名称` |
| Start Date | `Start`, `Start Date`, `Begin`, `From`, `开始日期`, `开工时间`, `计划开始` |
| End Date | `End`, `End Date`, `Finish`, `To`, `Due`, `结束日期`, `竣工时间`, `计划完成` |

**Example Excel Format:**

| Task Name | Start Date | End Date |
|-----------|-----------|----------|
| Foundation | 2026-01-01 | 2026-02-15 |
| Structure | 2026-02-10 | 2026-05-20 |
| Finishing | 2026-05-01 | 2026-08-30 |

> 💡 **Tip:** Hierarchical Excel files are also supported — if column A contains a series/group name and subsequent columns contain specific task names, the system will automatically detect the parent-child relationship.

### Date Input Format

In the sidebar date input field, the following formats are supported:
- `YYYY-MM-DD to YYYY-MM-DD` (e.g., `2026-01-01 to 2026-03-15`)
- You can also use the date picker to select a date range from the calendar

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` or `Ctrl + Shift + Z` | Redo |
| `Esc` | Exit preview mode |
| `Tab` / `Shift + Tab` | Navigate year/month/day fields in date input |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5 + CSS3 + JavaScript** | Core frontend |
| **[Flatpickr](https://flatpickr.js.org/)** | Date range picker |
| **[SheetJS (xlsx)](https://sheetjs.com/)** | Excel file parsing & generation |
| **[LZ-String](https://pieroxy.net/blog/pages/lz-string/index.html)** | Data compression |

> ⚡ **Zero-dependency deployment** — All third-party libraries are bundled in the `assets/js/` directory. No npm, no build tools required.

---

## 📦 .gantt Project Files

`.gantt` files are JSON-formatted project files containing:

```json
{
  "docTitle": "Project Title",
  "tasksState": [
    {
      "id": "task_xxx",
      "name": "Task Name",
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-03-15T00:00:00.000Z",
      "color": "3B82F6",
      "isChild": false
    }
  ],
  "displayMode": "date",
  "collapseMode": false,
  "theme": "light",
  "version": "1.0"
}
```

---

## 🌐 Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |

> 📌 **Chrome** or **Edge** is recommended for the best experience (supports the `showSaveFilePicker` API for native "Save As" dialogs).

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

---

<div align="center">

**If you find this useful, please give it a ⭐ Star!**

</div>
