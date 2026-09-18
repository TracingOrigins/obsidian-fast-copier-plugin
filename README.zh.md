<div align="center">
    <h1>Fast Copier</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22fast-copier%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-fast-copier-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[中文 | <a href="https://github.com/TracingOrigins/obsidian-fast-copier-plugin/blob/master/README.md">English</a> | <a href="https://github.com/TracingOrigins/obsidian-fast-copier-plugin/blob/master/README.ru.md">Русский</a>]</p>
    <p><a href="https://community.obsidian.md/plugins/fast-copier" target="_blank">Fast Copier</a> 是一个为格式化文本（行内代码、加粗、斜体、高亮、标题、标签、链接等）在编辑模式和阅读模式右侧添加复制按钮的 Obsidian 插件。点击按钮即可一键复制内容，无需外部依赖。</p>
</div>

## 功能特性

- **格式化文本复制按钮** — 行内代码、加粗、斜体、下划线、删除线、高亮、标题、标签、内部链接、外部链接
- **两种模式通用** — 编辑（源码）模式与阅读（实时预览/预览）模式共用同一份勾选列表
- **统一内容类型设置** — 一份勾选列表即可开启/关闭每种内容类型，无需手动编写匹配模式或 CSS 选择器
- **命令控制显隐** — 通过命令 **切换显示/隐藏复制按钮** 控制复制按钮的显示与隐藏
- **自定义图标** — 选择复制按钮使用的图标
- **复制提示** — 复制后可选弹出通知
- **零依赖** — 运行时无外部库，仅使用 Obsidian API
- **多语言界面** — 支持 English、中文、Русский

## 使用方法

1. 安装并启用插件
2. 在任意笔记中，受支持的内容（如 `行内代码`、`**加粗**`、`==高亮==`、`# 标题`、`#标签`、`[[链接]]`）右侧会出现复制按钮
3. 点击按钮即可复制内容；复制文本会匹配内容类型（例如标签保留 `#` 前缀）
4. 使用命令 **切换显示/隐藏复制按钮** 可随时显示或隐藏所有复制按钮

可通过 **设置 → Fast Copier** 自定义哪些内容类型显示按钮。

## 设置

| 设置项 | 默认值 | 说明 |
|---------|---------|------|
| **内容类型** | 全部开启 | 内容类型勾选列表（行内代码、加粗、斜体、下划线、删除线、高亮、标题、标签、内部链接、外部链接）。勾选的类型会显示复制按钮。 |
| **复制按钮图标** | copy | 复制按钮使用的图标。 |
| **显示复制提示** | 开启 | 复制到剪贴板后显示通知。 |

> **提示：** 复制按钮的显示与隐藏由命令 **切换显示/隐藏复制按钮** 控制，不在此设置中。

> **系统要求：** Obsidian 1.13.0 或更高版本。

## 下载安装

### 通过官方插件市场安装（推荐）

1. 打开 Obsidian，进入 **设置 → 第三方插件**
2. 关闭**安全模式**
3. 点击**浏览**，搜索「Fast Copier」
4. 点击**安装**，然后**启用**

### 手动安装

1. 从 [Releases](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/releases) 下载最新版本的 `main.js`、`manifest.json`、`styles.css`
2. 在 Obsidian 插件目录下创建 `fast-copier` 文件夹（如 `你的库/.obsidian/plugins/fast-copier/`），将上述三个文件放入其中
3. 在 Obsidian **设置 → 第三方插件** 中启用本插件

### 通过 BRAT 安装（推荐给测试用户）

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件
2. 在 BRAT 设置中点击 **Add Beta plugin**（添加测试插件）
3. 输入 `TracingOrigins/obsidian-fast-copier-plugin`
4. 启用插件

## 开发指南

1. 克隆仓库：

    ```bash
    git clone https://github.com/TracingOrigins/obsidian-fast-copier-plugin.git
    cd obsidian-fast-copier-plugin
    ```

2. 将 `.env.example` 复制为 `.env`，并设置 `VAULT_PATH` 为你的 Obsidian Vault 路径：

    ```
    VAULT_PATH=C:/Users/YourName/Documents/MyVault
    ```

3. 安装依赖并开始开发：

    ```bash
    npm install          # 安装依赖
    npm run dev          # 监听模式（自动部署到 Vault）
    npm run build        # 生产构建（自动部署到 Vault）
    npm run lint         # 运行 eslint
    ```

## 支持与帮助

如果这个插件对您有帮助，请考虑：

- ⭐ **给仓库“点星”**
- 🐛 使用 [bug 报告模板](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/issues/new?template=bug_report.md) 提交错误报告
- 💡 使用 [功能请求模板](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/issues/new?template=feature_request.md) 提交功能建议
- ❓ 在 [GitHub Issues](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/issues) 提问或分享想法
- 📝 参阅 [贡献指南](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/blob/master/docs/contributing/contributing.zh.md)，为本项目贡献代码或文档
- 💰 为开发者提供[赞助](https://support.tracingorigins.top/zh)（如果可用）
