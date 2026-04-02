const defaultColors = [
  "2F80ED", "27AE60", "EB5757", "9B51E0", "F2994A", "219653", "3B82F6", "10B981", "F59E0B", "EF4444",
  "EC4899", "8B5CF6", "06B6D4", "F97316", "14B8A6", "6366F1", "A855F7", "EAB308", "D946EF", "F43F5E",
  "0EA5E9", "84CC16", "64748B", "78350F", "064E3B", "312E81", "701A75", "4A044E", "742A2A", "22543D"
];

function hexToRgb(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function getHueDistance(h1, h2) {
  const d = Math.abs(h1 - h2);
  return d > 180 ? 360 - d : d;
}

function getColorDistance(h1, h2) {
  const c1 = hexToRgb(h1);
  const c2 = hexToRgb(h2);
  return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
}

function getRandomColor(excludes = [], thresholdRGB = 200, thresholdHue = 45) {
  const excludeRgbHsl = excludes.filter(ex => !!ex).map(ex => {
    const rgb = hexToRgb(ex);
    return { hex: ex, rgb, hsl: rgbToHsl(rgb.r, rgb.g, rgb.b) };
  });

  // Try up to 30 times to find a color that is distant enough in both RGB and Hue
  for (let i = 0; i < 30; i++) {
    const candHex = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    const candRgb = hexToRgb(candHex);
    const candHsl = rgbToHsl(candRgb.r, candRgb.g, candRgb.b);

    const isTooClose = excludeRgbHsl.some(ex => {
      const dRGB = Math.sqrt(Math.pow(candRgb.r - ex.rgb.r, 2) + Math.pow(candRgb.g - ex.rgb.g, 2) + Math.pow(candRgb.b - ex.rgb.b, 2));
      const dHue = getHueDistance(candHsl.h, ex.hsl.h);
      // Both must be distant enough
      return dRGB < thresholdRGB || dHue < thresholdHue;
    });

    if (!isTooClose) return candHex;
  }

  // Fallback: Pick the one with the maximum minimum distance to any exclude
  let bestCand = defaultColors[0];
  let maxMinDist = -1;
  defaultColors.forEach(candHex => {
    const candRgb = hexToRgb(candHex);
    const candHsl = rgbToHsl(candRgb.r, candRgb.g, candRgb.b);
    let minDist = Infinity;
    excludeRgbHsl.forEach(ex => {
      const dRGB = Math.sqrt(Math.pow(candRgb.r - ex.rgb.r, 2) + Math.pow(candRgb.g - ex.rgb.g, 2) + Math.pow(candRgb.b - ex.rgb.b, 2));
      const dHue = getHueDistance(candHsl.h, ex.hsl.h) * 2; // Weight hue more in fallback
      const combined = dRGB + dHue;
      if (combined < minDist) minDist = combined;
    });
    if (minDist > maxMinDist) {
      maxMinDist = minDist;
      bestCand = candHex;
    }
  });
  return bestCand;
}

/**
 * Pre-render pass to ensure every task/series has a visually distinct color.
 * Replaces the placeholder #374151 with a permanent, non-colliding color.
 */
function ensureDistinctColors() {
  const lastColors = [];
  tasksState.forEach((t) => {
    if (!t.color || t.color.toUpperCase() === "374151") {
      const newColor = getRandomColor(lastColors);
      t.color = newColor;
    }
    // Track the last 5 colors used in sequence to maintain variety
    lastColors.push(t.color);
    if (lastColors.length > 5) lastColors.shift();
  });
}

// Helper to update button text without wiping out the animation spans
function updateBtnText(btnId, htmlContent) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const textSpan = btn.querySelector(".btn-text-content");
  if (textSpan) {
    textSpan.innerHTML = htmlContent;
  } else {
    btn.innerHTML = htmlContent;
  }
}

let tasks = [];

const DAY_MS = 24 * 60 * 60 * 1000;
const NORMAL_DAY_WIDTH = 60;
const COMPRESSED_GAP_WIDTH = 2; // gaps will visually span 2 days wide
const MIN_GAP_DAYS = 5; // minimum inactive days to compress into a gap

let dayWidth = NORMAL_DAY_WIDTH;
document.documentElement.style.setProperty("--day-width", dayWidth + "px");

function pad2(n) { return String(n).padStart(2, "0"); }
function toDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function fmtDate(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
function fmtMD(d) {
  return pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
function fmtChineseMD(d) {
  return pad2(d.getMonth() + 1) + t("chineseMonth") + pad2(d.getDate()) + t("chineseDay");
}
function addDays(d, n) {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + n);
  return x;
}
function diffDays(a, b) {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}
function fmtTaskTime(task) {
  const d = diffDays(task.start, task.end) + 1;
  const dateStr = fmtMD(task.start) + "~" + fmtMD(task.end);
  if (displayMode === "duration") return d + t("dayUnit");
  if (displayMode === "both") return dateStr + ` (${d}${t("dayUnit")})`;
  return dateStr;
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function isWeekend(d) {
  const wd = d.getDay();
  return wd === 0 || wd === 6;
}

let tasksState = tasks.map(t => ({
  id: t.id,
  name: t.name,
  start: toDate(t.start),
  end: toDate(t.end),
  color: t.color
}));

let collapseMode = false; // Global collapse/summary mode toggle
let labelOutside = false; // Label inside bar vs outside bar toggle
let displayMode = "date"; // "date", "duration", or "both"

let minStart, maxEnd, totalDays, visualTotalDays, tasksById;
let timelineCells = [];
let fpInstances = {}; // Flatpickr instances
let columns = []; // Smart timeline columns

// ===== UNDO/REDO Logic =====
let undoStack = [];
let redoStack = [];
const MAX_UNDO = 100;

function getAppState() {
    const cleanTasks = (tasksState || []).map(t => {
        const startStr = (t.start instanceof Date) ? fmtDate(t.start) : (typeof t.start === "string" ? t.start : "");
        const endStr = (t.end instanceof Date) ? fmtDate(t.end) : (typeof t.end === "string" ? t.end : "");
        
        return {
            id: String(t.id || ""),
            name: String(t.name || ""),
            start: startStr,
            end: endStr,
            color: String(t.color || "3B82F6"),
            p: t.p || null,
            expanded: !!t.expanded,
            isChild: !!t.isChild
        };
    }).filter(t => t.start && t.end);

    return JSON.stringify({
        docTitle: (document.getElementById("doc-title").value || t("defaultTitleShort")).trim(),
        tasksState: cleanTasks,
        displayMode: displayMode,
        collapseMode: !!collapseMode,
        labelOutside: !!labelOutside
    });
}

function saveHistory(force = false) {
  const currentState = getAppState();
  if (!force && undoStack.length > 0 && undoStack[undoStack.length - 1] === currentState) {
    return;
  }
  undoStack.push(currentState);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack = []; // Clear redo on new action
  updateUndoButtons();
}

function updateUndoButtons() {
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
  if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

function undo() {
  if (undoStack.length <= 1) return;
  const current = undoStack.pop();
  redoStack.push(current);
  applyAppState(undoStack[undoStack.length - 1]);
  updateUndoButtons();
}

function redo() {
  if (redoStack.length === 0) return;
  const next = redoStack.pop();
  undoStack.push(next);
  applyAppState(next);
  updateUndoButtons();
}

function applyAppState(jsonStr) {
    try {
        const data = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
        if (data.docTitle) {
            document.getElementById("doc-title").value = data.docTitle;
        }
        if (data.tasksState) {
            tasksState = data.tasksState.map(t => ({
                ...t,
                start: toDate(t.start),
                end: toDate(t.end)
            })).filter(t => !isNaN(t.start.getTime()) && !isNaN(t.end.getTime()));
        }
        displayMode = data.displayMode || "date";
        collapseMode = !!data.collapseMode;

        document.body.classList.toggle("collapse-mode", collapseMode);
        const collapseBtn = document.getElementById("collapse-mode-btn");
        if (collapseBtn) {
            collapseBtn.classList.toggle("active", collapseMode);
            updateBtnText("collapse-mode-btn", collapseMode ? t("collapseHide") : t("collapseShow"));
        }

        labelOutside = !!data.labelOutside;
        document.body.classList.toggle("label-outside", labelOutside);
        const labelBtn = document.getElementById("label-position-btn");
        if (labelBtn) {
            labelBtn.classList.toggle("active", labelOutside);
            updateBtnText("label-position-btn", labelOutside ? t("labelOutside") : t("labelInside"));
        }

        // Theme is NOT restored on undo/redo — it's managed independently via localStorage
        initGantt();
    } catch (e) {
        console.error("Critical Apply Error:", e);
    }
}

function getFileName(ext) {
  let title = document.getElementById("doc-title").value.trim();
  if (!title) title = t("defaultTitle");
  return title + "." + ext;
}

// Convert Date to pixel offset from the left of the timeline
function dateToPixels(date) {
  if (date < minStart) {
    return diffDays(minStart, date) * dayWidth;
  }
  let offsetDays = 0;
  for (const col of columns) {
    if (date >= col.start && date <= col.end) {
      if (col.type === "day") {
        return offsetDays * dayWidth;
      } else {
        const durationDays = diffDays(col.start, col.end) + 1;
        const pastDays = diffDays(col.start, date);
        const ratio = pastDays / durationDays;
        return (offsetDays + ratio * col.widthDays) * dayWidth;
      }
    }
    offsetDays += col.widthDays;
  }
  return (visualTotalDays + diffDays(maxEnd, date)) * dayWidth;
}

// Convert Pixel offset back to Date
function pixelsToDate(px) {
  const targetOffsetDays = px / dayWidth;
  if (targetOffsetDays < 0) {
    return addDays(minStart, Math.round(targetOffsetDays));
  }
  if (targetOffsetDays > visualTotalDays) {
    return addDays(maxEnd, Math.round(targetOffsetDays - visualTotalDays));
  }
  let currentOffsetDays = 0;
  for (const col of columns) {
    if (targetOffsetDays >= currentOffsetDays && targetOffsetDays <= currentOffsetDays + col.widthDays) {
      if (col.type === "day") {
        return col.start;
      } else {
        const ratio = (targetOffsetDays - currentOffsetDays) / col.widthDays;
        const durationDays = diffDays(col.start, col.end) + 1;
        const add = Math.round(ratio * durationDays);
        return addDays(col.start, clamp(add, 0, durationDays - 1));
      }
    }
    currentOffsetDays += col.widthDays;
  }
  return maxEnd;
}

function taskToPixels(t) {
  let leftPx = dateToPixels(t.start);
  let rightPx = dateToPixels(addDays(t.end, 1));
  let widthPx = Math.max(rightPx - leftPx, 10); // minimum visual width
  // ensure bar is slightly padded graphically to not cover exact lines
  return {
    left: leftPx,
    width: widthPx
  };
}

function initGantt() {
  // Ensure all tasks/series have distinct colors before processing
  ensureDistinctColors();

  if (tasksState.length === 0) {
    document.getElementById("gantt-root").innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100%;width:100%;color:var(--muted);font-size:14px;background:var(--bg);">
            ${t("emptyHint")}
          </div>`;
    document.getElementById("task-list").innerHTML = "";
    return;
  }

  const container = document.getElementById("gantt-root");
  if (!container) return;

  // Re-assign parentId based on indentation level sequence
  let lastParentId = null;
  tasksState.forEach(t => {
    if (t.isChild) {
      t.parentId = lastParentId;
    } else {
      t.parentId = null;
      lastParentId = t.id;
    }
    // Also reset type so we can re-evaluate which are parents
    if (t.type === "series") t.type = "task";
  });

  // Re-map for fast lookup
  tasksById = new Map(); // Initialize tasksById as a Map
  tasksState.forEach(t => tasksById.set(t.id, t));

  // Determine parents (any task that has children)
  const parents = new Set();
  tasksState.forEach(t => {
    if (t.parentId) parents.add(t.parentId);
  });
  parents.forEach(pid => {
    const p = tasksById.get(pid);
    if (p) p.type = "series";
  });

  // Ensure ends are >= starts
  tasksState.forEach(t => {
    if (t.end < t.start) t.end = new Date(new Date(t.start).getTime());
  });

  // Recalculate series ranges from children
  const parentToChildren = new Map();
  tasksState.forEach(t => {
    if (t.parentId) {
      if (!parentToChildren.has(t.parentId)) parentToChildren.set(t.parentId, []);
      parentToChildren.get(t.parentId).push(t);
    }
  });

  tasksState.forEach(t => {
    if (t.type === "series" && parentToChildren.has(t.id)) {
      const children = parentToChildren.get(t.id);
      if (children.length > 0) {
        const minStart = new Date(Math.min(...children.map(c => new Date(c.start).getTime())));
        const maxEnd = new Date(Math.max(...children.map(c => new Date(c.end).getTime())));
        t.start = minStart;
        t.end = maxEnd;
      }
    }
  });

  let minT = Infinity, maxT = -Infinity;
  tasksState.forEach(t => {
    const s = t.start.getTime();
    const e = t.end.getTime();
    if (s < minT) minT = s;
    if (e > maxT) maxT = e;
  });
  minStart = new Date(minT);
  maxEnd = new Date(maxT);

  // Reset hours to midnight to ensure consistent math
  minStart.setHours(0, 0, 0, 0);
  maxEnd.setHours(0, 0, 0, 0);

  minStart = addDays(minStart, -1);
  maxEnd = addDays(maxEnd, 2);
  totalDays = diffDays(minStart, maxEnd) + 1;

  // Identify Critical Dates (starts and ends of all tasks)
  const criticalDates = new Set();
  tasksState.forEach(t => {
    if (t.start && t.end) {
      criticalDates.add(fmtDate(t.start));
      criticalDates.add(fmtDate(t.end));
    }
  });

  columns = [];
  let currentGap = null;

  for (let i = 0; i < totalDays; i++) {
    const d = addDays(minStart, i);
    const dateStr = fmtDate(d);
    const isCritical = criticalDates.has(dateStr);

    if (isCritical) {
      // If we were in a gap, close it
      if (currentGap) {
        columns.push(currentGap);
        currentGap = null;
      }
      columns.push({ type: "day", start: d, end: d, widthDays: 1 });
    } else {
      // Non-critical day: combine into gap, but scale width proportionally
      if (!currentGap) {
        currentGap = { type: "gap", start: d, end: d, widthDays: 0.3 }; // Base scale
      } else {
        currentGap.end = d;
        currentGap.widthDays += 0.3; // Proportionally increase by 0.3 days width for each day hidden
      }
    }
  }
  if (currentGap) columns.push(currentGap);

  visualTotalDays = columns.reduce((s, c) => s + c.widthDays, 0);
  tasksById = new Map(tasksState.map(t => [t.id, t]));

  const root = document.getElementById("gantt-root");
  buildLayout(root);
  renderTaskList();
  applyAllPositions();
  updateTimelineLabels();

  const btn = document.getElementById("display-mode-btn");
  if (btn) {
    btn.classList.toggle("active", displayMode !== "date");
    if (displayMode === "date") updateBtnText("display-mode-btn", t("showDuration"));
    else if (displayMode === "duration") updateBtnText("display-mode-btn", t("showAll"));
    else updateBtnText("display-mode-btn", t("showDate"));
  }
}

function buildLayout(root) {
  root.innerHTML = "";

  const headerLeft = document.createElement("div");
  headerLeft.className = "header-left";
  headerLeft.textContent = t("timeline");

  const headerRight = document.createElement("div");
  headerRight.className = "header-right";
  const timeline = document.createElement("div");
  timeline.className = "timeline";
  timeline.style.width = (visualTotalDays * dayWidth) + "px";

  timelineCells = [];
  columns.forEach(col => {
    const cell = document.createElement("div");
    cell.dataset.type = col.type;
    const w = col.widthDays * dayWidth;
    if (col.type === "day") {
      cell.className = "day" + (isWeekend(col.start) ? " weekend" : "");
      cell.style.flex = "0 0 " + w + "px";
      cell.textContent = fmtMD(col.start);
    } else {
      cell.className = "day gap";
      cell.style.flex = "0 0 " + w + "px";
      cell.textContent = "…";
      cell.title = fmtMD(col.start) + " ~ " + fmtMD(col.end);
    }
    timeline.appendChild(cell);
    timelineCells.push(cell);
  });
  headerRight.appendChild(timeline);

  const leftPanel = document.createElement("div");
  leftPanel.className = "gantt-left-panel";
  leftPanel.appendChild(headerLeft);
  const rowsLeft = document.createElement("div");
  rowsLeft.className = "rows-left";
  leftPanel.appendChild(rowsLeft);

  const rightPanel = document.createElement("div");
  rightPanel.className = "gantt-right-panel";
  rightPanel.appendChild(headerRight);
  const rowsRight = document.createElement("div");
  rowsRight.className = "rows-right";
  rightPanel.appendChild(rowsRight);

  root.appendChild(leftPanel);
  root.appendChild(rightPanel);

  // Restore vertical scroll sync
  rightPanel.addEventListener("scroll", () => {
    leftPanel.scrollTop = rightPanel.scrollTop;
  });

  // Compute which series tasks actually have children in tasksState
  const parentIdsWithChildren = new Set(
    tasksState.filter(t => !!t.parentId).map(t => t.parentId)
  );

  tasksState.forEach((t) => {
    // In collapse mode, only show parent series; skip all children
    if (collapseMode && t.parentId) return;

    const isParentWithChildren = t.type === "series" && parentIdsWithChildren.has(t.id);

    // Hide series if it has no children
    if (t.type === "series" && !isParentWithChildren) return;

    const name = document.createElement("div");
    name.className = "task-name";
    if (isParentWithChildren) name.classList.add("is-parent");
    if (t.parentId) name.classList.add("is-child");

    let icon = "";
    if (isParentWithChildren) icon = '<span class="parent-icon">📂</span>';

    let displayColor = t.color;
    let nameText = t.name;
    if (isParentWithChildren) {
      nameText += ` (${fmtTaskTime(t)})`;
    }
    name.innerHTML = `${icon}<span class="color-dot" style="background:#${displayColor}"></span><span class="task-name-text">${nameText}</span>`;
    rowsLeft.appendChild(name);

    const lane = document.createElement("div");
    lane.className = "lane";
    lane.style.width = (visualTotalDays * dayWidth) + "px";
    lane.style.backgroundImage = "linear-gradient(to right, var(--grid) 1px, transparent 1px)";
    rowsRight.appendChild(lane);

    lane.style.backgroundSize = "var(--day-width) 100%";

    const bar = document.createElement("div");
    bar.className = "bar";
    if (isParentWithChildren) bar.classList.add("is-parent");
    bar.dataset.taskId = t.id;
    bar.style.background = "#" + t.color;
    bar.style.setProperty("--bar-color", "#" + t.color);

    const leftHandle = document.createElement("div");
    leftHandle.className = "handle left";
    const rightHandle = document.createElement("div");
    rightHandle.className = "handle right";
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = t.name;
    const sub = document.createElement("div");
    sub.className = "sub";

    bar.appendChild(leftHandle);
    bar.appendChild(rightHandle);
    bar.appendChild(label);
    bar.appendChild(sub);

    // Parent task labels include total duration or date range
    if (isParentWithChildren) {
      label.textContent = t.name + ` (${fmtTaskTime(t)})`;
    }

    let dragMode = null;
    let startX = 0;
    let startLeftPx = 0;
    let startWidthPx = 0;

    function pointerDown(e, mode) {
      if (e.button !== 0) return; // Only left click
      e.preventDefault();
      dragMode = mode;
      startX = e.clientX;
      const p = taskToPixels(t);
      startLeftPx = p.left;
      startWidthPx = p.width;
      bar.setPointerCapture(e.pointerId);
    }

    function pointerMove(e) {
      if (!dragMode) return;
      const dx = e.clientX - startX;
      if (dragMode === "move") {
        const newLeftPx = startLeftPx + dx;
        let exactDate = pixelsToDate(newLeftPx);
        let newStart = new Date(exactDate.getTime() + DAY_MS / 2);
        newStart.setHours(0, 0, 0, 0);
        const duration = diffDays(t.start, t.end);
        t.start = newStart;
        t.end = addDays(newStart, duration);
      } else if (dragMode === "left") {
        const newLeftPx = startLeftPx + dx;
        t.start = pixelsToDate(newLeftPx);
        if (t.start > t.end) t.start = t.end;
      } else if (dragMode === "right") {
        const newRightPx = (startLeftPx + startWidthPx) + dx;
        // Subtract a small amount to get the day the cursor is actually "in" or "over"
        t.end = pixelsToDate(newRightPx - 2);
        if (t.end < t.start) t.end = t.start;
      }

      const p = taskToPixels(t);
      bar.style.left = p.left + "px";
      bar.style.width = p.width + "px";
      // Show duration or date range feedback during drag
      sub.textContent = fmtTaskTime(t);

      // Dynamically increase lane/row width during drag if exceeding bounds
      const currentMaxPx = p.left + p.width + 100;
      const rootW = visualTotalDays * dayWidth;
      if (currentMaxPx > rootW) {
        const newW = currentMaxPx + "px";
        lane.style.width = newW;
        document.querySelector(".rows-right").style.minWidth = newW;
        document.querySelector(".header-right").style.minWidth = newW;
        document.querySelector(".timeline").style.width = newW;
      }

      if (fpInstances[t.id]) {
        fpInstances[t.id].setDate([t.start, t.end], false);
      }
    }

    function pointerUp(e) {
      if (!dragMode) return;
      dragMode = null;
      bar.releasePointerCapture(e.pointerId);
      saveHistory(); // Record state after drag ends
      initGantt(); // Smart logic update to redraw gaps
    }

    bar.addEventListener("pointerdown", (e) => pointerDown(e, "move"));
    leftHandle.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      pointerDown(e, "left");
    });
    rightHandle.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      pointerDown(e, "right");
    });
    bar.addEventListener("pointermove", pointerMove);
    bar.addEventListener("pointerup", pointerUp);
    bar.addEventListener("pointercancel", pointerUp);

    lane.appendChild(bar);
    rowsRight.appendChild(lane);

    // Sync height after both are in DOM and fully measured
    requestAnimationFrame(() => {
      const nameH = name.offsetHeight;
      const barH = bar.offsetHeight;
      const targetH = Math.max(nameH, barH + 12, 45); // 12px for top/bottom padding
      name.style.height = targetH + "px";
      lane.style.height = targetH + "px";
    });
  });

  // Sync vertical scrolling of tasks Left panel and Right panel
  rowsRight.addEventListener("scroll", () => {
    rowsLeft.scrollTop = rowsRight.scrollTop;
  });
  leftPanel.addEventListener("wheel", (e) => {
    rightPanel.scrollTop += e.deltaY;
  });
}

function updateTimelineLabels(customCells, customDayWidth) {
  const cells = customCells || timelineCells;
  if (!cells || cells.length === 0) return;
  const dWidth = customDayWidth || dayWidth;

  // 1. Clear all labels
  columns.forEach((col, i) => {
    if (!cells[i]) return;
    cells[i].textContent = col.type === "gap" ? "…" : "";
    cells[i].style.overflow = "hidden";
    cells[i].style.zIndex = "1";
  });

  // 2. Choose a "nice" interval so labels don't crowd.
  //    Total visual width per real day = dWidth * 1 for day cols,
  //    but for gap cols it's much less. Use overall ratio: totalPx / totalRealDays.
  if (!minStart || !maxEnd) return;
  const totalRealDays = diffDays(minStart, maxEnd) + 1;
  const totalVisualDays = columns.reduce((s, c) => s + (c.type === "day" ? 1 : 0), 0);
  const pxPerRealDay = (totalVisualDays * dWidth) / totalRealDays;

  const MIN_LABEL_WIDTH = 50; // px
  const INTERVALS = [1, 2, 7, 14, 30, 60, 90, 180, 365];
  let intervalDays = INTERVALS[INTERVALS.length - 1];
  for (const iv of INTERVALS) {
    if (iv * pxPerRealDay >= MIN_LABEL_WIDTH) {
      intervalDays = iv;
      break;
    }
  }

  // 3. Choice indices lookup
  const usedIndices = new Set();

  // 4. Walk ticks and find which column covers each tick date
  for (let d = 0; d <= totalRealDays; d += intervalDays) {
    const tickDate = addDays(minStart, d);
    const tickStr = fmtDate(tickDate);

    // Find the column whose date range [col.start, col.end] contains tickDate
    let bestIdx = -1;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const colStartStr = fmtDate(col.start);
      const colEndStr = fmtDate(col.end);
      if (tickStr >= colStartStr && tickStr <= colEndStr) {
        bestIdx = i;
        break;
      }
    }
    if (bestIdx >= 0 && !usedIndices.has(bestIdx) && cells[bestIdx]) {
      usedIndices.add(bestIdx);
      // In duration mode show relative day number; otherwise show MM-DD
      const label = displayMode === "duration" ? (t("dayPrefix") + (d + 1) + t("dayUnit")) : fmtMD(tickDate);
      cells[bestIdx].textContent = label;
      cells[bestIdx].style.overflow = "visible";
      cells[bestIdx].style.zIndex = "2";
      cells[bestIdx].style.justifyContent = "flex-start";
    }
  }
}

function renderTaskList() {
  const list = document.getElementById("task-list");
  const activeElement = document.activeElement;
  const isEditingName = activeElement && activeElement.classList.contains("task-name-input");
  if (isEditingName) {
    tasksState.forEach(t => { if (fpInstances[t.id]) fpInstances[t.id].setDate([t.start, t.end], false); });
    return;
  }
  list.innerHTML = "";
  Object.values(fpInstances).forEach(fp => fp.destroy());
  fpInstances = {};

  tasksState.forEach((tk, index) => {
    // In global collapse mode, only show parent series cards
    if (collapseMode && tk.parentId) return;
    // Local left-panel collapse feature
    if (tk.parentId) {
      const parent = tasksById.get(tk.parentId);
      if (parent && parent.leftCollapsed) return;
    }

    const card = document.createElement("div");
    card.className = "task-card" + (tk.isChild ? " is-child" : "");
    card.draggable = true;

    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      card.style.borderTop = "2px solid #3b82f6";
    });
    card.addEventListener("dragleave", () => card.style.borderTop = "");
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
      const moved = tasksState.splice(fromIndex, 1)[0];

      let insertIndex = index;
      if (fromIndex < index) {
        insertIndex = index - 1;
      }

      // Drag-to-indent logic: use absolute X coordinate to make it intuitive
      // Sidebar left padding is ~14px. Top-level card left edge is 14px.
      // Child card left edge is 38px (14+24).
      // If mouse is near the left edge (< 40px), consider it an outdent request.
      if (e.clientX < 40) {
        moved.isChild = false;
      } else {
        moved.isChild = true;
      }

      tasksState.splice(insertIndex, 0, moved);
      saveHistory();
      initGantt();
    });

    // Fix dead zone for drag-and-drop outdenting
    if (tk.isChild) {
      card.style.position = "relative";
      const catcher = document.createElement("div");
      catcher.style.position = "absolute";
      catcher.style.left = "-24px";
      catcher.style.width = "24px";
      catcher.style.top = "0";
      catcher.style.bottom = "0";
      card.appendChild(catcher);
    }

    const nameRow = document.createElement("div");
    nameRow.className = "name-row";

    // Color dot to open custom picker
    let displayColor = tk.color;
    if (tk.type === "series" && tk.color.toUpperCase() === "374151") {
      const clrIdx = tasksState.indexOf(tk) % defaultColors.length;
      displayColor = defaultColors[clrIdx];
    }

    const colorDot = document.createElement("span");
    colorDot.className = "color-dot";
    colorDot.style.background = `#${displayColor}`;
    colorDot.addEventListener("click", (e) => {
      e.stopPropagation();
      openColorPicker(e.target, tk);
    });

    // Indent/Outdent Buttons
    const indentControls = document.createElement("div");
    indentControls.className = "indent-controls";

    const outdentBtn = document.createElement("button");
    outdentBtn.className = "indent-btn";
    outdentBtn.title = t("outdent");
    outdentBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>`;
    outdentBtn.onclick = (e) => {
      e.stopPropagation();
      tk.isChild = false;
      saveHistory();
      initGantt();
    };

    const indentBtn = document.createElement("button");
    indentBtn.className = "indent-btn";
    indentBtn.title = t("indent");
    indentBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>`;
    indentBtn.onclick = (e) => {
      e.stopPropagation();
      tk.isChild = true;
      saveHistory();
      initGantt();
    };

    indentControls.appendChild(outdentBtn);
    indentControls.appendChild(indentBtn);

    nameRow.appendChild(indentControls);

    // Add Collapse Button for parent
    if (tk.type === "series") {
      const leftCollapseBtn = document.createElement("button");
      leftCollapseBtn.className = "indent-btn left-collapse-btn"; // reusing styling from indent-btn
      leftCollapseBtn.style.marginRight = "4px";
      leftCollapseBtn.style.opacity = "1";
      leftCollapseBtn.title = tk.leftCollapsed ? t("expandChildren") : t("collapseChildren");
      leftCollapseBtn.innerHTML = tk.leftCollapsed
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
      leftCollapseBtn.onclick = (e) => {
        e.stopPropagation();
        tk.leftCollapsed = !tk.leftCollapsed;
        renderTaskList();
      };
      nameRow.appendChild(leftCollapseBtn);
    }

    nameRow.appendChild(colorDot);

    const nameInput = document.createElement("textarea");
    nameInput.className = "task-name-input";
    nameInput.value = tk.name;
    nameInput.rows = 1;

    function autoHeight() {
      nameInput.style.height = "auto";
      nameInput.style.height = nameInput.scrollHeight + "px";
    }
    nameInput.addEventListener("input", (e) => {
      autoHeight();
      tk.name = e.target.value;
      // Live sync the text in the Gantt bar
      const barLabel = document.querySelector(`.bar[data-task-id="${tk.id}"] .label`);
      if (barLabel) {
        const isParent = tk.type === "series" && tasksState.some(st => st.parentId === tk.id);
        if (isParent) {
          barLabel.textContent = tk.name + ` (${fmtTaskTime(tk)})`;
        } else {
          barLabel.textContent = tk.name;
        }
      }
    });
    setTimeout(autoHeight, 0);

    nameInput.addEventListener("change", (e) => { tk.name = e.target.value; initGantt(); });
    nameRow.appendChild(nameInput);

    // Trash button for deletion
    const trashBtn = document.createElement("button");
    trashBtn.className = "trash-btn";
    trashBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
    trashBtn.title = t("deleteTask");
    trashBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm(t("confirmDelete", tk.name))) {
        tasksState.splice(index, 1);
        saveHistory();
        initGantt();
      }
    };
    nameRow.appendChild(trashBtn);

    const dateRow = document.createElement("div");
    dateRow.className = "date-row";
    const input = document.createElement("input");
    input.className = "date-picker-input";
    input.type = "text";
    input.placeholder = t("datePlaceholder");
    input.dataset.taskId = tk.id;
    const sep = " " + t("dateSeparator") + " ";
    input.value = fmtDate(tk.start) + sep + fmtDate(tk.end);

    dateRow.appendChild(input);
    card.appendChild(nameRow);
    card.appendChild(dateRow);
    list.appendChild(card);

    // Native segment selection logic for YYYY-MM-DD <sep> YYYY-MM-DD
    // Calculate segment positions dynamically based on separator length
    const sepLen = sep.length;
    const segments = [
      { s: 0, e: 4 },    // Start YYYY
      { s: 5, e: 7 },    // Start MM
      { s: 8, e: 10 },   // Start DD
      { s: 10 + sepLen, e: 10 + sepLen + 4 },  // End YYYY
      { s: 10 + sepLen + 5, e: 10 + sepLen + 7 },  // End MM
      { s: 10 + sepLen + 8, e: 10 + sepLen + 10 }   // End DD
    ];

    function updateSelection(el, idx) {
      if (idx >= 0 && idx < segments.length) {
        // Need setTimeout to override browser default focus/selection behaviors gracefully
        setTimeout(() => {
          el.setSelectionRange(segments[idx].s, segments[idx].e);
          el.dataset.currentSeg = idx;
        }, 0);
      }
    }


    input.addEventListener("mouseup", function (e) {
      const pos = this.selectionStart;
      let foundIdx = -1;
      for (let i = 0; i < segments.length; i++) {
        if (pos >= segments[i].s && pos <= segments[i].e + 1) {
          foundIdx = i;
          break;
        }
      }
      if (foundIdx === -1 && pos >= 10 && pos <= 10 + sepLen) foundIdx = 3;
      if (foundIdx !== -1) updateSelection(this, foundIdx);
    });

    // Helper to parse date input into Date objects
    function updateDateFromInput(val) {
      const parts = val.split(t("dateSeparator"));
      if (parts.length === 2) {
        const parse = (p) => {
          const y_m_d = p.trim().split("-");
          if (y_m_d.length === 3) {
            const y = parseInt(y_m_d[0], 10);
            const m = parseInt(y_m_d[1], 10);
            const d = parseInt(y_m_d[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
              return new Date(y, m - 1, d);
            }
          }
          return null;
        };
        const s = parse(parts[0]);
        const e = parse(parts[1]);
        if (s && e) {
          fp.setDate([s, e], true);
        }
      }
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        let curr = parseInt(this.dataset.currentSeg || "-1", 10);
        if (e.shiftKey) {
          curr = curr > 0 ? curr - 1 : segments.length - 1;
        } else {
          curr = curr < segments.length - 1 ? curr + 1 : 0;
        }
        updateSelection(this, curr);
      }
      if (e.key === "Enter") {
        updateDateFromInput(this.value);
        fp.close();
      }
    });

    const fpLocale = getLang() === "zh" ? "zh" : "default";
    const fp = flatpickr(input, {
      mode: "range",
      locale: fpLocale === "zh" ? "zh" : undefined,
      dateFormat: "Y-m-d",
      defaultDate: [tk.start, tk.end],
      allowInput: true,
      closeOnSelect: false, // Important: don't close until we say so
      onReady: function (a, b, instance) {
        instance.l10n.rangeSeparator = sep;
      },
      onChange: function (selectedDates, dateStr, instance) {
        if (selectedDates.length === 2) {
          tk.start = selectedDates[0];
          tk.end = selectedDates[1];
          saveHistory();
          initGantt();
          instance.close();
        }
      }
    });

    // Parse and apply instantly on blur
    input.addEventListener("blur", function () {
      setTimeout(() => {
        // Even if calendar is open, apply the text edit immediately.
        // Wait, if calendar is open, the user clicked inside flatpickr. 
        // We only want to auto-apply if the user actually clicked away completely.
        if (!fp.isOpen) {
          updateDateFromInput(this.value);
        }
      }, 100);
    });

    fpInstances[tk.id] = fp;
  });
}

function addTask() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last3 = tasksState.slice(-3).map(t => t.color);
  const color = getRandomColor(last3);
  tasksState.push({
    id: "task-" + Date.now(),
    name: t("newTask") + " " + (tasksState.length + 1),
    start: today,
    end: addDays(today, 7),
    color: color
  });
  saveHistory();
  initGantt();
}

// Excel Import Logic
function handleExcelFile(file) {
  if (!file) return;

  const fileName = file.name.replace(/\.[^/.]+$/, "");
  document.getElementById("doc-title").value = fileName;

  const reader = new FileReader();
  reader.onload = function (evt) {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rows.length === 0) {
      alert(t("importEmpty"));
      return;
    }

    // Dynamic Header Mapping
    const newTasks = [];
    let nameIdx = -1, startIdx = -1, endIdx = -1;
    let headerRowIdx = -1;
    const nameKeywords = ["名称", "项目名称", "内容", "清单", "工作项目", "任务名称", "工程项目名称", "Name", "Task", "Task Name", "Project", "Description"];
    const startKeywords = ["开始日期", "开工时间", "开始时间", "开工日期", "起", "起始时间", "计划开始", "Start", "Start Date", "Begin", "From"];
    const endKeywords = ["结束日期", "竣工时间", "完成时间", "竣工日期", "止", "结束时间", "计划完成", "计划竣工", "End", "End Date", "Finish", "To", "Due"];

    // Scan first 5 rows to find headers
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const row = rows[i];
      if (!row) continue;
      let rowHasHeader = false;
      row.forEach((cell, idx) => {
        const val = String(cell || "").trim();
        if (!val) return;
        if (nameIdx === -1 && nameKeywords.some(k => val.includes(k))) { nameIdx = idx; rowHasHeader = true; }
        if (startIdx === -1 && startKeywords.some(k => val.includes(k))) { startIdx = idx; rowHasHeader = true; }
        if (endIdx === -1 && endKeywords.some(k => val.includes(k))) { endIdx = idx; rowHasHeader = true; }
      });
      if (rowHasHeader) {
        headerRowIdx = Math.max(headerRowIdx, i);
      }
      if (startIdx !== -1 && endIdx !== -1) break;
    }

    // Fallback to defaults if still -1
    if (nameIdx === -1) {
      // Hierarchy Detection: If Col 1 has content where Col 0 is empty, it's likely the task name column
      let c1Only = 0;
      for (let i = headerRowIdx + 1; i < Math.min(headerRowIdx + 1 + 15, rows.length); i++) {
        if (rows[i] && rows[i][1] && !rows[i][0]) c1Only++;
      }
      nameIdx = (c1Only > 0) ? 1 : 0;
    }

    // Smarter Date Detection if keywords failed
    if (startIdx === -1 || endIdx === -1) {
      for (let i = headerRowIdx + 1; i < Math.min(headerRowIdx + 1 + 10, rows.length); i++) {
        if (!rows[i]) continue;
        rows[i].forEach((cell, idx) => {
          if (idx === nameIdx) return;
          // Excel dates are numbers around 45000-47000 (roughly 2023-2028)
          const isExcelDate = (typeof cell === 'number' && cell > 44000 && cell < 50000);
          const isDateObj = (cell instanceof Date && !isNaN(cell.getTime()));
          if (isExcelDate || isDateObj) {
            if (startIdx === -1) startIdx = idx;
            else if (endIdx === -1 && idx > startIdx) endIdx = idx;
          }
        });
        if (startIdx !== -1 && endIdx !== -1) break;
      }
    }

    if (startIdx === -1) startIdx = 1;
    if (endIdx === -1) endIdx = (startIdx + 1);

    // ---- Duration Mode Detection ----
    // If numeric values in the start/end columns are small (1–999),
    // they are likely day-count durations, not Excel date serials.
    displayMode = "date";
    let durationColIdx = -1;
    {
      let smallCount = 0, dateCount = 0;
      rows.forEach((row, idx) => {
        if (idx <= headerRowIdx) return;
        if (!row) return;
        [row[startIdx], row[endIdx]].forEach(v => {
          if (typeof v === "number") {
            if (v > 0 && v < 1000) smallCount++;
            else if (v > 44000 && v < 50000) dateCount++;
          }
        });
      });
      if (smallCount > 0 && smallCount >= dateCount) {
        displayMode = "duration";
        // Use whichever column has the small numbers
        durationColIdx = startIdx;
      }
    }

    let activeSeries = "";
    // Sequential base date cursor for duration mode
    const durationBaseDate = new Date(); durationBaseDate.setHours(0, 0, 0, 0);
    let durationCursor = new Date(durationBaseDate);

    let lastColorsUsed = [];
    rows.forEach((row, idx) => {
      if (idx <= headerRowIdx) return;
      if (!row || row.length === 0) return;

      const valA = String(row[0] || "").trim();
      const nameVal = String(row[nameIdx] || "").trim();

      // If there is no name column (e.g. simple 2-column layout),
      // treat valA as the immediate task name, not a sticky series header.
      const isSingleNameCol = (nameIdx === 0 || nameIdx === -1 || !row.some((v, i) => i !== 0 && i !== startIdx && i !== endIdx && typeof v === "string"));

      let taskName, pName, isHeader;

      if (isSingleNameCol) {
        // Simple list: no separate parent column
        taskName = valA;
        pName = "";
        isHeader = false;
        activeSeries = "";
      } else {
        // Sticky Series logic: column 0 (A) is the series header if present
        if (valA) activeSeries = valA;
        taskName = nameVal || valA;
        isHeader = (valA && !nameVal);
        pName = isHeader ? "" : activeSeries;
      }

      if (!taskName) return;

      const exactIgnore = ["名称", "项目名称", "任务名称", "清单", "序号", "工项", "项目内容", "Name", "Task Name", "No.", "#"];
      const containsIgnore = ["小计", "合计", "税金", "规费", "总计", "措施费", "其他项目费", "Subtotal", "Total", "Tax", "Summary"];
      if (exactIgnore.includes(taskName) || containsIgnore.some(k => taskName.includes(k))) return;

      let tStart = null;
      let tEnd = null;
      let startVal = row[startIdx];
      let endVal = row[endIdx];

      if (displayMode === "duration") {
        // Treat cell as duration in days; assign sequential dates
        const isHeader = (valA && !nameVal);
        const dur = Math.max(1, Math.round(parseFloat(row[durationColIdx]) || 7));
        if (!isHeader) {
          tStart = new Date(durationCursor);
          tEnd = addDays(durationCursor, dur - 1);
          tEnd.setHours(0, 0, 0, 0);
          durationCursor = addDays(tEnd, 1); // next task starts after
        } else {
          // Series header placeholder dates — will be recomputed from children
          tStart = new Date(durationCursor);
          tEnd = new Date(durationCursor);
        }
      } else {
        try {
          // If startVal is a string like "05-26~06-04", parse it
          if (typeof startVal === "string" && startVal.includes("~")) {
            const parts = startVal.split("~");
            const parseMD = (str) => {
              const [m, d] = str.split("-").map(v => parseInt(v.trim()));
              const date = new Date();
              date.setMonth(m - 1);
              date.setDate(d);
              date.setHours(0, 0, 0, 0);
              return date;
            };
            tStart = parseMD(parts[0]);
            tEnd = parseMD(parts[1]);
          } else {
            if (startVal) {
              if (typeof startVal === "number") {
                tStart = new Date(Math.round((startVal - 25569) * 86400 * 1000) + new Date().getTimezoneOffset() * 60000);
              } else {
                const d = new Date(startVal);
                if (!isNaN(d.getTime())) tStart = d;
              }
            }
            if (endVal) {
              if (typeof endVal === "number") {
                tEnd = new Date(Math.round((endVal - 25569) * 86400 * 1000) + new Date().getTimezoneOffset() * 60000);
              } else {
                const d = new Date(endVal);
                if (!isNaN(d.getTime())) tEnd = d;
              }
            }
          }
        } catch (e) { }
      }

      if (!tStart) tStart = new Date();
      if (!tEnd) tEnd = addDays(tStart, 7);
      tStart.setHours(0, 0, 0, 0);
      tEnd.setHours(0, 0, 0, 0);
      if (tEnd < tStart) tEnd = new Date(tStart.getTime());

      // isHeader and pName are already determined above

      const taskColor = getRandomColor(lastColorsUsed);
      lastColorsUsed.push(taskColor);
      if (lastColorsUsed.length > 3) lastColorsUsed.shift();

      newTasks.push({
        id: "task_" + Date.now() + "_" + idx + "_" + Math.floor(Math.random() * 1000),
        name: taskName,
        start: tStart,
        end: tEnd,
        color: taskColor,
        parentName: pName,
        type: isHeader ? "series" : "task",
        isChild: !isHeader && !!pName
      });
    });


    // Hierarchy Parsing
    const finalTasksList = [];
    const seriesMap = new Map();

    newTasks.forEach(t => {
      if (t.type === "series") {
        if (!seriesMap.has(t.name)) {
          seriesMap.set(t.name, {
            ...t,
            color: "374151", // Keep as marker for now, will re-assign below
            children: []
          });
        } else {
          // Header row seen after children? unlikely but let's merge
          const s = seriesMap.get(t.name);
          s.start = new Date(Math.min(s.start, t.start));
          s.end = new Date(Math.max(s.end, t.end));
        }
      } else if (t.parentName) {
        if (!seriesMap.has(t.parentName)) {
          seriesMap.set(t.parentName, {
            id: "series_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            name: t.parentName,
            start: new Date(t.start),
            end: new Date(t.end),
            color: "374151", // Keep as marker for now, will re-assign below
            type: "series",
            children: []
          });
        }
        const s = seriesMap.get(t.parentName);
        if (t.start < s.start) s.start = new Date(t.start);
        if (t.end > s.end) s.end = new Date(t.end);
        s.children.push(t);
      } else {
        finalTasksList.push(t);
      }
    });

    let lastSeriesColors = [];
    seriesMap.forEach(s => {
      const sColor = getRandomColor(lastSeriesColors);
      s.color = sColor;
      lastSeriesColors.push(sColor);
      if (lastSeriesColors.length > 3) lastSeriesColors.shift();

      finalTasksList.push(s);
      s.children.forEach(c => {
        c.parentId = s.id;
        c.isChild = true;
        finalTasksList.push(c);
      });
      delete s.children;
    });

    if (finalTasksList.length > 0) {
      tasksState = finalTasksList;
      saveHistory(true); // Force push on import
      initGantt();
    }

    // Clear input value in the change listener instead
  };
  reader.readAsArrayBuffer(file);
}

document.getElementById("import-excel").addEventListener("change", function (e) {
  if (e.target.files && e.target.files.length > 0) {
    handleExcelFile(e.target.files[0]);
  }
  e.target.value = "";
});

// Global Drag and Drop
const dropZone = document.getElementById("drop-zone");
let dragCounter = 0;
const targetEl = document.documentElement;

targetEl.addEventListener("dragenter", (e) => {
  if (e.dataTransfer.types.includes('Files')) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    if (dropZone) dropZone.classList.add("active");
  }
});
targetEl.addEventListener("dragover", (e) => {
  if (e.dataTransfer.types.includes('Files')) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }
});
targetEl.addEventListener("dragleave", (e) => {
  if (e.dataTransfer.types.includes('Files')) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter <= 0 && dropZone) {
      dragCounter = 0;
      dropZone.classList.remove("active");
    }
  }
});
targetEl.addEventListener("drop", (e) => {
  if (e.dataTransfer.types.includes('Files')) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    if (dropZone) dropZone.classList.remove("active");

    let file = null;
    try {
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            file = e.dataTransfer.items[i].getAsFile();
            break;
          }
        }
      }
      if (!file && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        file = e.dataTransfer.files[0];
      }
    } catch (err) {
      console.error("Error extracting dropped file:", err);
    }

    if (file) {
      if (file.name.toLowerCase().endsWith(".gantt")) {
        handleProjectFile(file);
      } else {
        handleExcelFile(file);
      }
    } else {
      alert(t("importDropFail"));
    }
  }
});

function exportJson() {
  const data = tasksState.map(t => ({
    id: t.id,
    name: t.name,
    start: fmtDate(t.start),
    end: fmtDate(t.end)
  }));
  downloadText(getFileName("json"), JSON.stringify(data, null, 2));
}

function exportCsv() {
  const header = t("csvHeader");
  const lines = [header];
  tasksState.forEach(t => {
    let seriesName = "";
    let taskName = t.name;
    if (t.type === "series") {
      seriesName = t.name;
      taskName = "";
    } else if (t.parentId) {
      const p = tasksById.get(t.parentId);
      seriesName = p ? p.name : "";
    }
    const timeStr = fmtTaskTime(t);
    lines.push(`"${seriesName.replaceAll('"', '""')}","${taskName.replaceAll('"', '""')}","${timeStr}"`);
  });
  // Prepend BOM for Excel UTF-8 support
  downloadText(getFileName("csv"), "\ufeff" + lines.join("\n"), "text/csv;charset=utf-8");
}

function exportXlsx() {
  // Create Header Row (Matching Import Format)
  const data = [[t("xlsxSeries"), t("xlsxTaskName"), t("xlsxTimeRange"), t("xlsxColor")]];

  tasksState.forEach(t => {
    let seriesName = "";
    let taskName = "";

    if (t.type === "series") {
      seriesName = t.name;
    } else if (t.parentId) {
      const parent = tasksById.get(t.parentId);
      seriesName = parent ? parent.name : "";
      taskName = t.name;
    } else {
      taskName = t.name;
    }

    const timeStr = fmtTaskTime(t);
    data.push([
      seriesName,
      taskName,
      timeStr,
      t.color
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, t("sheetName"));

  const fileName = getFileName("xlsx");

  if (window.showSaveFilePicker) {
    try {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const opts = {
        suggestedName: fileName,
        types: [{
          description: t("excelFileDesc"),
          accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
        }],
      };
      window.showSaveFilePicker(opts).then(handle => {
        handle.createWritable().then(writable => {
          writable.write(blob).then(() => writable.close());
        });
      }).catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
      return;
    } catch (err) {
      console.error(err);
    }
  }

  XLSX.writeFile(wb, fileName);
}

function exportProject() {
  const state = {
    docTitle: document.getElementById("doc-title").value,
    tasksState: tasksState.map(t => ({
      ...t,
      start: t.start.toISOString(),
      end: t.end.toISOString(),
      // Ensure isChild is explicitly saved
      isChild: !!t.isChild
    })),
    displayMode: displayMode,
    collapseMode: collapseMode,
    theme: localStorage.getItem("gantt-theme") || "light",
    version: "1.0"
  };

  const fileName = getFileName("gantt");
  downloadText(fileName, JSON.stringify(state, null, 2), "application/json");
}

function handleProjectFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const state = JSON.parse(e.target.result);
      if (!state.tasksState) throw new Error(t("invalidProject"));

      document.getElementById("doc-title").value = state.docTitle || t("untitledProject");

      tasksState = state.tasksState.map(t => ({
        ...t,
        start: new Date(t.start),
        end: new Date(t.end)
      }));

      displayMode = state.displayMode || (state.durationMode ? "duration" : "date");
      collapseMode = !!state.collapseMode;

      // Apply modes to UI
      document.body.classList.toggle("collapse-mode", collapseMode);
      const collapseBtn = document.getElementById("collapse-mode-btn");
      if (collapseBtn) {
        collapseBtn.classList.toggle("active", collapseMode);
        collapseBtn.textContent = collapseMode ? t("collapseHide") : t("collapseShow");
      }

      const btn = document.getElementById("display-mode-btn");
      if (btn) {
        btn.classList.toggle("active", displayMode !== "date");
        if (displayMode === "date") btn.textContent = t("showDuration");
        else if (displayMode === "duration") btn.textContent = t("showAll");
        else btn.textContent = t("showDate");
      }

      if (state.theme) {
        applyTheme(state.theme);
      }

      saveHistory(true); // Force push on project load
      initGantt();
    } catch (err) {
      alert(t("importProjectFail") + err.message);
    }
  };
  reader.readAsText(file);
}

async function downloadText(filename, text, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mimeType });
  if (window.showSaveFilePicker) {
    try {
      const ext = filename.split('.').pop();
      const opts = {
        suggestedName: filename,
        types: [{
          description: ext.toUpperCase() + ' ' + t("fileDesc"),
          accept: { [mimeType]: ['.' + ext] },
        }],
      };
      const handle = await window.showSaveFilePicker(opts);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
      return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function applyAllPositions() {
  // Adaptive dayWidth to fill viewport
  const rr = document.querySelector(".rows-right");
  if (rr && !document.body.classList.contains("printing")) {
    const viewportW = rr.clientWidth;
    if (viewportW > 100) {
      // Use Math.floor to ensure dayWidth is an integer to avoid sub-pixel drift
      const ideal = Math.floor(viewportW / visualTotalDays);
      dayWidth = Math.max(ideal, 12);
    }
  }
  document.documentElement.style.setProperty("--day-width", dayWidth + "px");

  // Calculate exact pixel widths for each column to ensure perfect alignment
  let totalW_px = 0;
  columns.forEach(col => {
    col.pixelWidth = Math.round(col.widthDays * dayWidth);
    totalW_px += col.pixelWidth;
  });
  const totalW = totalW_px + "px";

  const timeline = document.querySelector(".timeline");
  if (timeline) {
    timeline.style.width = totalW;
    const days = timeline.querySelectorAll(".day");
    columns.forEach((col, i) => {
      if (days[i]) {
        days[i].style.flex = "0 0 " + col.pixelWidth + "px";
      }
    });
  }

  const hr = document.querySelector(".header-right");
  if (hr) hr.style.minWidth = totalW;
  if (rr) rr.style.minWidth = totalW;

  // Simple flat repeating grid — cleaner look, integer dayWidth keeps alignment precise
  document.querySelectorAll(".lane").forEach(lane => {
    lane.style.width = totalW;
    lane.style.backgroundImage = "linear-gradient(to right, var(--grid) 1px, transparent 1px)";
    lane.style.backgroundSize = dayWidth + "px 100%";
  });


  document.querySelectorAll(".bar").forEach(bar => {
    const taskId = bar.dataset.taskId;
    const t = tasksById.get(taskId);
    if (!t) return;
    const p = taskToPixels(t);
    bar.style.left = p.left + "px";
    bar.style.width = p.width + "px";
    // For very narrow bars, prevent single-character vertical stacking
    // by forcing "pre" so text honors explicit newlines but doesn't auto-wrap horizontally
    const label = bar.querySelector(".label");
    if (label) {
      label.style.whiteSpace = p.width < 60 ? "pre" : "";
    }
    const sub = bar.querySelector(".sub");
    if (sub) {
      sub.textContent = fmtTaskTime(t);
    }
  });
}

function computePrintDayWidth() {
  const rightPanel = document.querySelector(".gantt-right-panel");
  if (!rightPanel) return 18;
  const available = Math.max(200, rightPanel.getBoundingClientRect().width - 24);
  const fit = Math.floor(available / visualTotalDays);
  return Math.max(fit, 8);
}

function exportPdf() {
  const originalTitle = document.title;
  const titleVal = (document.getElementById("doc-title").value || t("defaultTitleShort")).trim();
  document.title = titleVal;

  document.body.classList.add("printing");

  // 1. Calculate print dimensions
  const TARGET_PAGE_WIDTH = 2200;
  const SIDEBAR_PFX = 360;
  const GANTT_PFX = TARGET_PAGE_WIDTH - SIDEBAR_PFX;
  const PRINT_DAY_WIDTH = Math.max(15, Math.floor(GANTT_PFX / (visualTotalDays || 1)));
  const actualGanttWidth = visualTotalDays * PRINT_DAY_WIDTH;
  const actualTotalWidth = SIDEBAR_PFX + actualGanttWidth;

  const printContainer = document.createElement("div");
  printContainer.id = "print-proxy";
  printContainer.style.width = actualTotalWidth + "px";
  
  // Force high-contrast colors for PDF export regardless of theme
  const themeBg = "#ffffff";
  const themeBorder = "#374151";
  const themeHeaderBg = "#f1f5f9";
  const themeRowBg = "#ffffff";
  const themeText = "#0f172a"; // Deep slate/black
  printContainer.style.background = themeBg;

  // 2. Title
  if (titleVal) {
    const h1 = document.createElement("h1");
    h1.textContent = titleVal;
    h1.style.color = themeText;
    printContainer.appendChild(h1);
  }

  // 3. Helper for Rows
  const createRow = (contentLeft, isHeader = false) => {
    const row = document.createElement("div");
    row.className = "print-row" + (isHeader ? " is-header" : "");
    row.style.background = isHeader ? themeHeaderBg : themeRowBg;
    if (isHeader) {
      row.style.borderTop = `2px solid ${themeBorder}`;
      row.style.borderBottom = `2px solid ${themeBorder}`;
    }

    const left = document.createElement("div");
    left.className = "task-name";
    left.style.width = SIDEBAR_PFX + "px";
    left.style.color = themeText;
    left.innerHTML = contentLeft;

    const right = document.createElement("div");
    right.className = "lane";
    right.style.width = actualGanttWidth + "px";

    row.appendChild(left);
    row.appendChild(right);
    return { row, right };
  };

  // 4. Header (Timeline)
  const { row: hRow, right: hLane } = createRow('<div style="padding-left:10px">' + t("timeline") + '</div>', true);
  const tm = document.querySelector(".timeline").cloneNode(true);
  tm.style.width = actualGanttWidth + "px";
  const tmCells = Array.from(tm.querySelectorAll(".day"));
  tmCells.forEach((c, idx) => {
    c.style.flex = `0 0 ${columns[idx].widthDays * PRINT_DAY_WIDTH}px`;
  });
  updateTimelineLabels(tmCells, PRINT_DAY_WIDTH);
  hLane.appendChild(tm);
  printContainer.appendChild(hRow);

  // 5. Tasks
  // Compute which series tasks have children (for PDF rendering)
  // FIX: Properly identify parent IDs that have visible children in the current rendering
  const visibleTaskIds = new Set(
    tasksState
      .filter(t => !collapseMode || !t.parentId) // Omit children if in collapse mode
      .map(t => t.id)
  );

  const pdfParentIdsWithChildren = new Set(
    tasksState
      .filter(t => t.parentId && visibleTaskIds.has(t.id)) // A child that is visible
      .map(t => t.parentId)
  );

  tasksState.forEach(t => {
    // Obey collapse mode
    if (collapseMode && t.parentId) return;

    // FIX: In collapse mode, always show parent series; otherwise check if it has children
    const isPdfParent = t.type === "series" && (pdfParentIdsWithChildren.has(t.id) || collapseMode);

    // Hide series if it has no children in the current rendering (unless in collapse mode)
    if (t.type === "series" && !isPdfParent) return;

    let icon = "";
    if (isPdfParent) icon = '<span class="parent-icon">📂</span>';

    let displayColor = t.color;
    if (t.type === "series" && t.color.toUpperCase() === "374151") {
      const clrIdx = tasksState.indexOf(t) % defaultColors.length;
      displayColor = defaultColors[clrIdx];
    }

    let nameText = t.name;
    if (isPdfParent) {
      nameText += ` (${fmtTaskTime(t)})`;
    }
    const nameHtml = `${icon}<span class="color-dot" style="background:#${displayColor}"></span><span class="task-name-text">${nameText}</span>`;

    const { row, right } = createRow(nameHtml);
    if (isPdfParent) row.classList.add("is-parent");
    if (t.parentId) {
      row.classList.add("is-child");
      row.querySelector(".task-name").style.paddingLeft = "40px";
    }

    right.style.backgroundImage = `linear-gradient(to right, ${cs.getPropertyValue("--border").trim() || "#eee"} 1px, transparent 1px)`;
    right.style.backgroundSize = `${(1 / (visualTotalDays || 1)) * 100}% 100%`;

    const bar = document.createElement("div");
    bar.className = "bar";
    if (isPdfParent) bar.classList.add("is-parent");
    bar.style.background = "#" + t.color;
    bar.style.setProperty("--bar-color", "#" + displayColor);

    // Add labels to bar
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = t.name;
    if (isPdfParent) {
      label.textContent = t.name + ` (${fmtTaskTime(t)})`;
    }
    // Use theme text color with contrasting glow for readability on colored bars
    const labelTextColor = themeText;
    const themeAttr = document.documentElement.getAttribute("data-theme");
    const glowColor = (themeAttr === "dark" || themeAttr === "blue" || themeAttr === "gray") ? "#000" : "#fff";
    label.style.cssText = `white-space:nowrap !important; word-break:normal !important; color:${labelTextColor} !important; text-shadow:0 0 2px ${glowColor}, 0 0 2px ${glowColor}, 0 0 2px ${glowColor} !important; font-weight:500 !important; overflow:visible !important;`;
    bar.appendChild(label);

    const sub = document.createElement("div");
    sub.className = "sub";
    sub.textContent = fmtTaskTime(t);
    bar.appendChild(sub);

    const getUnits = (date) => {
      let units = 0;
      for (let col of columns) {
        if (date > col.end) units += col.widthDays;
        else if (date >= col.start) {
          const dur = diffDays(col.start, col.end) + 1;
          units += (diffDays(col.start, date) / dur) * col.widthDays;
          break;
        } else break;
      }
      return units;
    };

    const lUnits = getUnits(t.start);
    const rUnits = getUnits(addDays(t.end, 1));
    bar.style.left = (lUnits * PRINT_DAY_WIDTH) + "px";
    bar.style.width = ((rUnits - lUnits) * PRINT_DAY_WIDTH) + "px";

    right.appendChild(bar);
    printContainer.appendChild(row);
  });

  document.body.appendChild(printContainer);

  requestAnimationFrame(() => {
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      document.body.classList.remove("printing");
      printContainer.remove();
    }, 150);
  });
}

const exportModal = document.getElementById("export-modal");
document.getElementById("export-dialog-btn").addEventListener("click", () => {
  exportModal.style.display = "flex";
});
document.getElementById("close-export-modal").addEventListener("click", () => {
  exportModal.style.display = "none";
});
exportModal.addEventListener("click", (e) => {
  if (e.target === exportModal) exportModal.style.display = "none";
});

document.getElementById("do-export-json").addEventListener("click", () => { exportModal.style.display = "none"; exportJson(); });
document.getElementById("do-export-csv").addEventListener("click", () => { exportModal.style.display = "none"; exportCsv(); });
document.getElementById("do-export-xlsx").addEventListener("click", () => { exportModal.style.display = "none"; exportXlsx(); });
document.getElementById("save-project").addEventListener("click", exportProject);
document.getElementById("import-project").addEventListener("change", function (e) {
  if (e.target.files && e.target.files.length > 0) {
    handleProjectFile(e.target.files[0]);
  }
  e.target.value = "";
});

document.getElementById("do-export-pdf").addEventListener("click", () => { exportModal.style.display = "none"; exportPdf(); });
document.getElementById("preview-mode-btn").addEventListener("click", () => {
  document.body.classList.add("preview-mode");
  applyAllPositions();
});

document.getElementById("collapse-mode-btn").addEventListener("click", () => {
  collapseMode = !collapseMode;
  document.body.classList.toggle("collapse-mode", collapseMode);
  const btn = document.getElementById("collapse-mode-btn");
  btn.classList.toggle("active", collapseMode);
  const textSpan = btn.querySelector(".btn-text-content");
  if (textSpan) {
    textSpan.textContent = collapseMode ? t("collapseHide") : t("collapseShow");
  }
  initGantt();
});

document.getElementById("display-mode-btn").addEventListener("click", () => {
  if (displayMode === "date") displayMode = "duration";
  else if (displayMode === "duration") displayMode = "both";
  else displayMode = "date";
  saveHistory();
  initGantt();
});

document.getElementById("label-position-btn").addEventListener("click", () => {
  labelOutside = !labelOutside;
  document.body.classList.toggle("label-outside", labelOutside);
  const btn = document.getElementById("label-position-btn");
  if (btn) {
    btn.classList.toggle("active", labelOutside);
    updateBtnText("label-position-btn", labelOutside ? t("labelOutside") : t("labelInside"));
  }
  try { localStorage.setItem("gantt-label-outside", labelOutside); } catch (e) { }
  saveHistory();
  initGantt();
});

const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
if (undoBtn) undoBtn.addEventListener("click", undo);
if (redoBtn) redoBtn.addEventListener("click", redo);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("preview-mode")) {
    document.body.classList.remove("preview-mode");
    applyAllPositions();
  }
  // Undo/Redo Shortcuts
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
    e.preventDefault();
    redo();
  }
});

// Recalculate on window resize
window.addEventListener("resize", () => {
  if (!document.body.classList.contains("printing")) {
    applyAllPositions();
  }
});

// Color Picker Popover Logic
let currentPickingTask = null;
function openColorPicker(target, task) {
  currentPickingTask = task;
  const popover = document.getElementById("color-picker-popover");
  const swatchesContainer = document.getElementById("popover-swatches");
  const hexInput = document.getElementById("popover-hex-input");
  const nativeHidden = document.getElementById("popover-native-hidden");

  // Build swatches
  swatchesContainer.innerHTML = "";
  defaultColors.forEach(c => {
    const s = document.createElement("div");
    s.className = "swatch";
    s.style.background = `#${c}`;
    s.onclick = () => {
      task.color = c;
      saveHistory();
      initGantt();
      popover.style.display = "none";
    };
    swatchesContainer.appendChild(s);
  });

  hexInput.value = `#${task.color}`;
  nativeHidden.value = `#${task.color}`;

  // Position
  const rect = target.getBoundingClientRect();
  popover.style.display = "block";
  popover.style.top = (rect.top + window.scrollY) + "px";
  popover.style.left = (rect.right + 10) + "px";

  // Auto-hide when clicking outside
  const outsideClick = (e) => {
    if (!popover.contains(e.target) && e.target !== target) {
      popover.style.display = "none";
      document.removeEventListener("mousedown", outsideClick);
    }
  };
  document.addEventListener("mousedown", outsideClick);
}

document.getElementById("popover-hex-input").addEventListener("change", (e) => {
  let val = e.target.value;
  if (!val.startsWith("#")) val = "#" + val;
  if (/^#[0-9A-F]{6}$/i.test(val) && currentPickingTask) {
    currentPickingTask.color = val.replace("#", "").toUpperCase();
    saveHistory();
    initGantt();
  }
});

document.getElementById("popover-native-btn").onclick = () => {
  document.getElementById("popover-native-hidden").click();
};

document.getElementById("popover-native-hidden").onchange = (e) => {
  if (currentPickingTask) {
    const val = e.target.value.replace("#", "").toUpperCase();
    currentPickingTask.color = val;
    document.getElementById("popover-hex-input").value = e.target.value.toUpperCase();
    saveHistory();
    initGantt();
  }
};

saveHistory(true);
initGantt();
updateUndoButtons();

// ===== THEME SWITCHING =====
const THEMES = ["light", "dark", "gray", "blue"];

function applyTheme(theme) {
  if (!THEMES.includes(theme)) theme = "light";
  // Apply to <html> so CSS [data-theme] selectors work
  if (theme === "light") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  // Update active button state
  document.querySelectorAll(".theme-btn:not(.lang-btn)").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });
  // Persist
  try { localStorage.setItem("gantt-theme", theme); } catch (e) { }
}

// Wire up theme buttons
document.querySelectorAll(".theme-btn:not(.lang-btn)").forEach(btn => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

// Restore saved theme on load
(function () {
  let savedTheme = "light";
  try { savedTheme = localStorage.getItem("gantt-theme") || "light"; } catch (e) { }
  applyTheme(savedTheme);

  let savedLabel = "false";
  try { savedLabel = localStorage.getItem("gantt-label-outside") || "false"; } catch (e) { }
  labelOutside = (savedLabel === "true");
  document.body.classList.toggle("label-outside", labelOutside);
  const labelBtn = document.getElementById("label-position-btn");
  if (labelBtn) {
    labelBtn.classList.toggle("active", labelOutside);
    updateBtnText("label-position-btn", labelOutside ? t("labelOutside") : t("labelInside"));
  }
})();


// Sharing logic removed to maintain core project stability.

// ===== SIDEBAR RESIZING =====
const sidebarResizer = document.getElementById("sidebar-resizer");
let isResizingSidebar = false;
let sidebarStartX = 0;
let sidebarStartWidth = 0;

if (sidebarResizer) {
  sidebarResizer.addEventListener("mousedown", (e) => {
    isResizingSidebar = true;
    sidebarStartX = e.clientX;
    const rootStyles = getComputedStyle(document.documentElement);
    let currentWidth = document.documentElement.style.getPropertyValue('--left-width');
    if (!currentWidth) {
      currentWidth = rootStyles.getPropertyValue('--left-width');
    }
    sidebarStartWidth = parseInt(currentWidth || 320, 10);
    sidebarResizer.classList.add("is-resizing");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizingSidebar) return;
    const dx = e.clientX - sidebarStartX;
    let newWidth = sidebarStartWidth + dx;
    if (newWidth < 200) newWidth = 200;
    if (newWidth > 800) newWidth = 800;
    document.documentElement.style.setProperty('--left-width', newWidth + "px");
  });

  document.addEventListener("mouseup", () => {
    if (isResizingSidebar) {
      isResizingSidebar = false;
      sidebarResizer.classList.remove("is-resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });
}

// Add shortcut hints to buttons
function initShortcutHints() {
  const isMac = navigator.userAgent.indexOf('Mac') !== -1;
  const undoHint = isMac ? "Cmd+Z" : "Ctrl+Z";
  const redoHint = isMac ? "Cmd+Y" : "Ctrl+Y";

  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");

  if (undoBtn) {
    updateBtnText("undo-btn", `${t("undo")} <span class="btn-shortcut">${undoHint}</span>`);
    undoBtn.title = `${t("undo")} (${undoHint})`;
  }
  if (redoBtn) {
    updateBtnText("redo-btn", `${t("redo")} <span class="btn-shortcut">${redoHint}</span>`);
    redoBtn.title = `${t("redo")} (${redoHint})`;
  }
}
initShortcutHints();

// Apply i18n translations to static HTML elements on load
applyI18n();
