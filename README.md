<div align="center">
    <h1>Fast Copier</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22fast-copier%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-fast-copier-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[<a href="https://github.com/TracingOrigins/obsidian-fast-copier-plugin/blob/master/README.zh.md">中文</a> | English | <a href="https://github.com/TracingOrigins/obsidian-fast-copier-plugin/blob/master/README.ru.md">Русский</a>]</p>
    <p><a href="https://community.obsidian.md/plugins/fast-copier" target="_blank">Fast Copier</a> is an Obsidian plugin that adds a copy button next to formatted text — inline code, bold, italic, highlights, headings, tags, links, and more — in both Editing and Reading modes. Click the button to copy the content instantly, no external dependencies.</p>
</div>

## Features

- **Copy button on formatted text** — inline code, bold, italic, underline, strikethrough, highlight, headings, tags, internal links, and external links
- **Both modes** — works in Editing (Source) mode and Reading (Live Preview / Preview) mode with a single shared toggle list
- **Unified content-type settings** — one checkbox list to enable/disable each content type; no need to edit patterns or CSS selectors
- **Command-controlled visibility** — toggle copy buttons on/off with the **Toggle show/hide copy button** command
- **Custom icon** — choose the copy button icon
- **Copy notification** — optional notice after copying
- **Zero dependencies** — no external libraries at runtime, only Obsidian APIs
- **Multi-language UI** — English, 中文, Русский support

## Usage

1. Install and enable the plugin
2. In any note, a copy button appears to the right of supported content (e.g. `inline code`, **bold**, ==highlight==, # Heading, #tag, [[link]])
3. Click the button to copy the content; the copied text matches the content type (e.g. tags keep the `#` prefix)
4. Use the **Toggle show/hide copy button** command to show or hide all copy buttons at any time

Customize which content types show a button via **Settings → Fast Copier**.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Content types** | All enabled | Checkbox list of content types (inline code, bold, italic, underline, strikethrough, highlight, heading, tag, internal link, external link). Enabled types show a copy button. |
| **Copy button icon** | copy | Icon used for the copy button. |
| **Show copy notification** | On | Show a notice after copying to clipboard. |

> **Tip:** Showing or hiding the copy buttons is controlled by the **Toggle show/hide copy button** command, not by a setting.

> **Requirements:** Obsidian 1.13.0 or later.

## Installation

### From the Official Community Plugin Market (Recommended)

1. Open Obsidian and go to **Settings → Community plugins**
2. Turn off **Safe mode**
3. Click **Browse** and search for "Fast Copier"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest `main.js`, `manifest.json` and `styles.css` from [Releases](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/releases)
2. Create a `fast-copier` folder in your vault's plugin directory (e.g. `YourVault/.obsidian/plugins/fast-copier/`) and place the three files inside
3. Enable the plugin in **Settings → Community plugins**

### Install via BRAT (Recommended for Testers)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Open BRAT settings and click **Add Beta plugin**
3. Enter `TracingOrigins/obsidian-fast-copier-plugin`
4. Enable the plugin

## Development Guide

1. Clone the repository:

    ```bash
    git clone https://github.com/TracingOrigins/obsidian-fast-copier-plugin.git
    cd obsidian-fast-copier-plugin
    ```

2. Copy `.env.example` to `.env` and set `VAULT_PATH` to your Obsidian vault path:

    ```
    VAULT_PATH=C:/Users/YourName/Documents/MyVault
    ```

3. Install dependencies and start developing:

    ```bash
    npm install          # install dependencies
    npm run dev          # watch mode (auto-deploys to vault)
    npm run build        # production build (auto-deploys to vault)
    npm run lint         # run eslint
    ```

## Support & Feedback

If this plugin helps you, please consider:

- ⭐ **Star the repository**
- 🐛 Report bugs using the [bug report template](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/issues/new?template=bug_report.md)
- 💡 Request features using the [feature request template](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/issues/new?template=feature_request.md)
- ❓ Ask questions or share ideas in [GitHub Issues](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/issues)
- 📝 Read the [contributing guide](https://github.com/TracingOrigins/obsidian-fast-copier-plugin/blob/master/docs/contributing/contributing.md) and contribute code or docs
- 💰 Donate to the developer at the [support page](https://support.tracingorigins.top/) (if available)
