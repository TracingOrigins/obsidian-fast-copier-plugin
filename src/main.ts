import { Plugin, Notice, MarkdownView } from "obsidian";
import { EditorView } from "@codemirror/view";
import { t } from "./utils/i18n";
import {
  FastCopierSettings,
  DEFAULT_SETTINGS,
  FastCopierSettingTab,
} from "./settings/settings";
import { FastCopierHandler } from "./handlers/copy-handler";
import { sourceCopyExtension, settingsChanged } from "./handlers/source-copy";
import {
  setCopyButtonsVisible,
  areCopyButtonsVisible,
} from "./core/content-types";

// ============================================================
// Plugin
// ============================================================

export default class FastCopierPlugin extends Plugin {
  settings: FastCopierSettings = DEFAULT_SETTINGS;
  private copyHandler: FastCopierHandler | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    // 阅读模式处理器
    this.copyHandler = new FastCopierHandler(this);
    this.copyHandler.register();

    // 源码模式：始终显示的装饰扩展
    this.registerEditorExtension(sourceCopyExtension(this));

    // 设置面板
    this.addSettingTab(new FastCopierSettingTab(this.app, this));

    // 命令：切换显示/隐藏复制按钮
    this.addCommand({
      id: "toggle-copy-button-visibility",
      name: t("toggle_copy_button_visibility"),
      callback: () => this.toggleCopyButtonsVisible(),
    });
  }

  onunload(): void {
    this.copyHandler?.unregister();
    this.copyHandler = null;
  }

  // ---- 设置持久化 ----

  async loadSettings(): Promise<void> {
    const loaded =
      (await this.loadData()) as Partial<FastCopierSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(loaded ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.refreshAllViews();
  }

  private refreshAllViews(): void {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const view = leaf.view;
      if (!(view instanceof MarkdownView)) return;

      // 阅读模式：触发预览重新渲染
      if (view.previewMode) {
        view.previewMode.rerender(true);
      }

      // 编辑模式：dispatch CM6 effect 刷新装饰
      const cm = (view.editor as unknown as { cm: EditorView }).cm;
      if (cm) {
        cm.dispatch({ effects: settingsChanged.of(this.settings) });
      }
    });
  }

  // ---- 复制通知 ----

  notifyCopy(text: string): void {
    if (this.settings.showNotification) {
      const preview =
        text.length > 30 ? text.slice(0, 30) + "\u2026" : text;
      new Notice(t("copied") + ": " + preview, 2000);
    }
  }

  // 写入剪贴板并（可选）弹出通知，源码模式与阅读模式共用
  async copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      new Notice(t("copy_failed"));
      return;
    }
    this.notifyCopy(text);
  }

  private toggleCopyButtonsVisible(): void {
    const next = !areCopyButtonsVisible();
    setCopyButtonsVisible(next);
    this.refreshAllViews();
    new Notice(
      next ? t("copy_button_shown") : t("copy_button_hidden"),
      2000,
    );
  }
}
