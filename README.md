<p align="right">
  <strong>🌐 Language / 语言：</strong>
  <a href="README.md">🇨🇳 中文</a> | <a href="README_EN.md">🇺🇸 English</a>
</p>

<div align="center">

# 📊 灵越甘特图生成系统

**Gantt Chart Generator**

一款轻量、开箱即用的甘特图生成工具，无需安装任何依赖，没有复杂框架和环境配置，原生HTML5，JavaScript，CSS3，浏览器打开即用。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

</div>

---

## ✨ 功能特性

### 📥 数据导入
- **Excel 导入** — 支持 `.xlsx` / `.xls` 格式，智能识别表头（项目名称、开始日期、结束日期等）
- **工程文件** — 支持打开 `.gantt` 专用工程文件，保留所有状态
- **拖放导入** — 将 Excel 或 `.gantt` 文件直接拖入浏览器窗口即可导入
- **智能解析** — 自动识别层级结构（父子任务）、日期格式、工期模式

### 📤 数据导出
- **PDF 导出** — 调用浏览器打印功能，生成高质量 PDF 文档
- **Excel (XLSX)** — 导出为标准 Excel 表格，可二次编辑
- **CSV 表格** — 导出为 CSV 格式，兼容各种数据处理工具
- **JSON 数据** — 导出为结构化 JSON，便于程序对接
- **工程文件保存** — 保存为 `.gantt` 工程文件，下次可完整恢复

### 🎨 可视化与交互
- **拖动调整** — 拖动条形图可平移工期，拉伸边缘可修改起止日期
- **拖动排序** — 工程项目卡片支持拖动调整顺序
- **层级管理** — 支持缩进/取消缩进，可创建父子任务组
- **颜色自定义** — 内置 30 种预设颜色 + 自定义 HEX 色值 + 系统取色器
- **智能时间轴** — 自动压缩空闲时间段，重点展示关键日期
- **自适应宽度** — 甘特图自动适配视口宽度

### 🖥️ 显示模式
- **日期模式** — 显示起止日期范围 (MM-DD ~ MM-DD)
- **时长模式** — 显示天数 (N天)
- **全部模式** — 同时显示日期和天数
- **折叠模式** — 折叠子任务，仅显示父级汇总
- **名称切换** — 切换项目名称显示在条形图内部或右端外侧
- **预览模式** — 隐藏侧边栏，全屏预览甘特图

### 🎭 主题切换
| 主题 | 说明 |
|------|------|
| ☀️ 浅色 | 经典白色背景，清晰明亮 |
| 🌑 黑色 | 深色背景，护眼模式 |
| 🌫️ 灰色 | 中性灰调，低对比度 |
| 🌊 深蓝 | 深蓝背景，专业沉稳 |

### ⏪ 撤销/重做
- 支持最多 **100 步**撤销/重做
- 快捷键：`Ctrl+Z` 撤销 / `Ctrl+Y` 重做

### 🌍 多语言支持 (i18n)
- **中文 / English** 一键切换
- 语言偏好自动保存，下次打开自动恢复
- Excel 导入同时兼容中英文表头

---

## 🚀 快速开始

### 方式一：直接使用

1. 下载本项目
2. 双击打开 `index.html` 即可使用
3. 无需安装任何依赖，无需启动服务器
4. JS及CSS本地化，无需网络连接

### 方式二：在线部署

将项目文件部署到任意 Web 服务器或静态托管平台即可：

```
甘特图生成/
├── index.html          # 主页面
└── assets/
    ├── css/
    │   ├── style.css         # 主样式
    │   ├── button.css        # 按钮样式
    │   └── flatpickr.min.css # 日期选择器样式
    ├── js/
    │   ├── script.js         # 主逻辑
    │   ├── i18n.js           # 多语言翻译引擎
    │   ├── flatpickr.min.js  # 日期选择器
    │   ├── flatpickr_zh.js   # 中文本地化
    │   ├── xlsx.full.min.js  # Excel 解析 (SheetJS)
    │   └── lz-string.min.js  # 数据压缩
    └── images/
        ├── pdf.svg           # PDF 图标
        ├── xlsx.svg          # XLSX 图标
        ├── csv.svg           # CSV 图标
        └── json.svg          # JSON 图标
```

---

## 📖 使用说明

### 导入 Excel 表格

支持的 Excel 表头格式（自动识别）：

| 字段类型 | 可识别的表头关键词 |
|---------|------------------|
| 项目名称 | `名称`、`项目名称`、`内容`、`清单`、`工作项目`、`任务名称`、`工程项目名称`、`Name`、`Task`、`Task Name`、`Project`、`Description` |
| 开始日期 | `开始日期`、`开工时间`、`开始时间`、`开工日期`、`计划开始`、`Start`、`Start Date`、`Begin`、`From` |
| 结束日期 | `结束日期`、`竣工时间`、`完成时间`、`竣工日期`、`计划完成`、`计划竣工`、`End`、`End Date`、`Finish`、`To`、`Due` |

**Excel 格式示例：**

| 项目名称 | 开始日期 | 结束日期 |
|---------|---------|---------|
| 基础施工 | 2026-01-01 | 2026-02-15 |
| 主体结构 | 2026-02-10 | 2026-05-20 |
| 装修装饰 | 2026-05-01 | 2026-08-30 |

> 💡 **提示：** 也支持带有父子层级的 Excel 表格 —— 如果第一列（A列）为项目系列名称、后续列为具体任务名称，系统会自动识别层级关系。

### 日期输入格式

在侧边栏的日期输入框中，支持以下格式：
- `YYYY-MM-DD 至 YYYY-MM-DD`（如 `2026-01-01 至 2026-03-15`）
- 也可点击日期选择器在日历中选取日期范围

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Z` | 撤销 |
| `Ctrl + Y` 或 `Ctrl + Shift + Z` | 重做 |
| `Esc` | 退出预览模式 |
| `Tab` / `Shift + Tab` | 在日期输入框中切换年/月/日字段 |

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **HTML5 + CSS3 + JavaScript** | 核心前端 |
| **[Flatpickr](https://flatpickr.js.org/)** | 日期范围选择器 |
| **[SheetJS (xlsx)](https://sheetjs.com/)** | Excel 文件解析与生成 |
| **[LZ-String](https://pieroxy.net/blog/pages/lz-string/index.html)** | 数据压缩 |

> ⚡ **零依赖部署** — 所有第三方库已内置于 `assets/js/` 目录，无需 npm 安装，无需构建工具。

---

## 📦 .gantt 工程文件

`.gantt` 文件为 JSON 格式的工程文件，保存了以下信息：

```json
{
  "docTitle": "项目标题",
  "tasksState": [
    {
      "id": "task_xxx",
      "name": "任务名称",
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

## 🌐 浏览器兼容性

| 浏览器 | 最低版本 |
|--------|---------|
| Chrome | 90+ |
| Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |

> 📌 推荐使用 **Chrome** 或 **Edge** 浏览器以获得最佳体验（支持 `showSaveFilePicker` API 实现"另存为"对话框）。

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**如果觉得好用，请给个 ⭐ Star 支持一下！**

</div>
