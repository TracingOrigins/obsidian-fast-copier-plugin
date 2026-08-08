<div align="center">
    <h1>Fast Copier</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22fast-copier%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-fast-copier-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[<a href="https://github.com/TracingOrigins/obsidian-fast-copier-plugin/blob/master/README.zh.md">中文</a> | English | <a href="https://github.com/TracingOrigins/obsidian-fast-copier-plugin/blob/master/README.ru.md">Русский</a>]</p>
</div>

Fast Copier is an Obsidian plugin that adds a **copy button** next to formatted text — inline code, bold, italic, highlights, headings, tags, links, and more — in both **Editing** and **Reading** modes. Click the button to copy the content instantly, no external dependencies.

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

## Supported Languages

Python, PowerShell, Bash, TypeScript, TSX, JavaScript, JSX, C#, C, C++, SQL, YAML, TOML, Rust, Go, Lua, GDScript, Batch, Ruby, PHP, Perl, R, Dart, Kotlin, Swift, Vue, Svelte, INI, XML, HTML, CSS, SCSS, Less, JSON, JSON5, HCL, Protobuf, GraphQL, and more.

## Installation

### From Obsidian Community Plugins

1. Open **Settings → Community plugins**
2. Disable **Safe mode**
3. Click **Browse** and search for "Fast Copier"
4. Install and enable

### Manual

```bash
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/TracingOrigins/obsidian-fast-copier-plugin.git fast-copier
cd fast-copier
npm install && npm run build
```

Then enable the plugin in **Settings → Community plugins**.

## Development

1. Copy `.env.example` to `.env` and set `VAULT_PATH` to your Obsidian vault path:
   ```
   VAULT_PATH=C:/Users/YourName/Documents/MyVault
   ```
2. Install dependencies and start developing:

```bash
npm install        # install dependencies
npm run dev        # watch mode (auto-deploys to vault)
npm run build      # production build (auto-deploys to vault)
npm run lint       # run eslint
```
