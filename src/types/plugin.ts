import type { MarkdownPostProcessorContext } from "obsidian";
import type { FastCopierSettings } from "../settings/settings";

// 各模块需要的插件子集。集中定义，避免多处重复且形状漂移。
// FastCopierPlugin 的实例满足此接口。
export interface FastCopierPluginLike {
  settings: FastCopierSettings;
  app: {
    workspace: {
      containerEl: HTMLElement;
    };
  };
  registerMarkdownPostProcessor(
    processor: (
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext,
    ) => void,
  ): void;
  notifyCopy(text: string): void;
  // 写入剪贴板并（可选）弹出通知，源码模式与阅读模式共用
  copyText(text: string): void | Promise<void>;
}
