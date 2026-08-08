import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { t } from "../utils/i18n";
import {
  ALL_TYPE_IDS,
  CONTENT_TYPES,
  type ContentTypeId,
} from "../core/content-types";
import type { SettingDefinitionItem, SettingGroupItem } from "obsidian";
import { ConfirmModal } from "../ui/confirm-modal";

// ============================================================
// Settings interface
// ============================================================

export interface FastCopierSettings {
  // 用户勾选的内容类型（勾选即在右侧添加复制按钮，编辑模式 + 阅读模式共用）
  enabledTypes: ContentTypeId[];
  copyButtonIcon: string;
  showNotification: boolean;
}

export const DEFAULT_SETTINGS: FastCopierSettings = {
  enabledTypes: [...ALL_TYPE_IDS],
  copyButtonIcon: "copy",
  showNotification: true,
};

// 每个内容类型的开关使用独立 control key：type:<id>
const typeKey = (id: ContentTypeId): string => `type:${id}`;

// 设置面板所需的插件类型（Plugin 实例 + 本插件额外成员）
type SettingTabPlugin = Plugin & {
  settings: FastCopierSettings;
  saveSettings(): Promise<void>;
};

// ============================================================
// Settings tab (declarative API, Obsidian 1.13.0+)
// ============================================================

export class FastCopierSettingTab extends PluginSettingTab {
  plugin: SettingTabPlugin;

  constructor(app: App, plugin: SettingTabPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // 声明式设置定义：1.13.0+ 用户可在设置搜索中找到这些项
  getSettingDefinitions(): SettingDefinitionItem[] {
    const typeItems: SettingGroupItem[] = CONTENT_TYPES.map((ct) => ({
      name: t(ct.nameKey),
      desc: t(ct.descKey),
      control: {
        type: "toggle",
        key: typeKey(ct.id),
      },
    }));

    return [
      {
        type: "group",
        heading: t("content_types"),
        items: typeItems,
      },
      {
        type: "group",
        heading: t("advanced"),
        items: ([
          {
            name: t("copy_button_icon"),
            desc: t("copy_button_icon_desc"),
            control: {
              type: "dropdown",
              key: "copyButtonIcon",
              options: {
                copy: "Copy",
                clipboard: "Clipboard",
                "clipboard-copy": "Clipboard copy",
              },
            },
          },
          {
            name: t("show_notification"),
            desc: t("show_notification_desc"),
            control: {
              type: "toggle",
              key: "showNotification",
            },
          },
          {
            name: t("reset_defaults"),
            desc: t("reset_defaults_desc"),
            render: (setting: Setting) => {
              setting
                .setName(t("reset_defaults"))
                .setDesc(t("reset_defaults_desc"))
                .addButton((btn) =>
                  btn
                    .setButtonText(t("reset"))
                    .setCta()
                    .setDestructive()
                    .onClick(() => {
                      new ConfirmModal(this.app, t("reset_defaults"), t("reset_confirm"), async () => {
                        this.plugin.settings.enabledTypes = [...DEFAULT_SETTINGS.enabledTypes];
                        this.plugin.settings.copyButtonIcon = DEFAULT_SETTINGS.copyButtonIcon;
                        this.plugin.settings.showNotification = DEFAULT_SETTINGS.showNotification;
                        await this.plugin.saveSettings();
                        this.update();
                      }).open();
                    }),
                );
            },
          },
        ] as SettingGroupItem[]),
      },
    ];
  }

  // 声明式控件读取值
  getControlValue(key: string): unknown {
    if (key.startsWith("type:")) {
      return this.plugin.settings.enabledTypes.includes(
        key.slice("type:".length) as ContentTypeId,
      );
    }
    if (key === "copyButtonIcon") return this.plugin.settings.copyButtonIcon;
    if (key === "showNotification") return this.plugin.settings.showNotification;
    return undefined;
  }

  // 声明式控件写入值
  setControlValue(key: string, value: unknown): void | Promise<void> {
    if (key.startsWith("type:")) {
      const id = key.slice("type:".length) as ContentTypeId;
      const enabled = this.plugin.settings.enabledTypes;
      if (value) {
        if (!enabled.includes(id)) enabled.push(id);
      } else {
        const i = enabled.indexOf(id);
        if (i >= 0) enabled.splice(i, 1);
      }
      return this.plugin.saveSettings();
    }
    if (key === "copyButtonIcon") {
      this.plugin.settings.copyButtonIcon = value as string;
      return this.plugin.saveSettings();
    }
    if (key === "showNotification") {
      this.plugin.settings.showNotification = value as boolean;
      return this.plugin.saveSettings();
    }
  }

}
