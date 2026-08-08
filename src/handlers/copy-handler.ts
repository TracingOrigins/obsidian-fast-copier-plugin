import { Notice, setIcon } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian";
import {
  getReadingSelectorString,
  areCopyButtonsVisible,
} from "../core/content-types";
import { t } from "../utils/i18n";
import type { FastCopierPluginLike } from "../types/plugin";

// ============================================================
// FastCopierHandler — 阅读模式
// ============================================================

export class FastCopierHandler {
  private plugin: FastCopierPluginLike;
  private onClickBound: (e: MouseEvent) => void;

  constructor(plugin: FastCopierPluginLike) {
    this.plugin = plugin;
    this.onClickBound = this.onClick.bind(this);
  }

  register(): void {
    this.plugin.registerMarkdownPostProcessor(
      this.postProcessor.bind(this),
    );
    const container = this.plugin.app.workspace.containerEl;
    container.addEventListener("click", this.onClickBound, true);
  }

  unregister(): void {
    const container = this.plugin.app.workspace.containerEl;
    container.removeEventListener("click", this.onClickBound, true);
  }

  // ---- MarkdownPostProcessor ----

  private postProcessor(
    el: HTMLElement,
    _ctx: MarkdownPostProcessorContext,
  ): void {
    const s = this.plugin.settings;
    if (!areCopyButtonsVisible() || s.enabledTypes.length === 0) return;

    const boldItalicEnabled = s.enabledTypes.includes("boldItalic");
    const selectorStr = getReadingSelectorString(s.enabledTypes);
    const selectors = selectorStr.split(",").map((x) => x.trim()).filter(Boolean);

    // 加粗斜体复合选择器（strong↔em）仅用于“纯净嵌套”检测，
    // 不进入普通收集，避免非纯净结构（如 *__加粗且斜体__*）被误当 1 个 boldItalic 按钮。
    const boldItalicCompound = ["strong em", "em strong"];

    // 1) 收集所有匹配元素（普通选择器），不做注入
    const allMatches: HTMLElement[] = [];
    for (const selector of selectors) {
      if (boldItalicCompound.includes(selector)) continue;
      try {
        el.findAll(selector).forEach((match) => {
          if (match.hasClass("fast-copier-btn")) return;
          // 代码块（围栏 ``` / ~~~）内的内容不显示复制按钮
          if (match.closest("pre")) return;
          // 行内代码内部的内容不另作匹配（仅保留代码自身按钮）
          if (match.tagName !== "CODE" && match.closest("code")) return;
          allMatches.push(match);
        });
      } catch {
        // 无效选择器静默跳过
      }
    }

    // 2) 识别加粗斜体容器（strong↔em 互为外层唯一内容）。
    //    外层 strong/em 直接含唯一相反类型子元素、且无其它直接文本时，
    //    整体专属 boldItalic。无论该选项是否启用都先识别出来：
    //    - 启用时合并为 1 个按钮；
    //    - 关闭时整体不显示，且内层也不被 bold/italic 选项回退匹配；
    //    其内部嵌套的其它类型（如高亮）仍作为独立元素单独显示按钮。
    const pureNodes = new Set<HTMLElement>();
    for (const m of el.findAll("strong, em")) {
      const inner = this.getBoldItalicInner(m);
      if (inner) {
        pureNodes.add(m);
        pureNodes.add(inner);
      }
    }

    const processed = new Set<HTMLElement>();

    // 3) 注入按钮
    for (const match of allMatches) {
      if (processed.has(match)) continue;

      if (pureNodes.has(match)) {
        const inner = this.getBoldItalicInner(match);
        if (boldItalicEnabled && inner) {
          // 仅在外层（同时包含内层）注入 1 个按钮，文案取内层纯文本
          processed.add(match);
          processed.add(inner);
          const copyText = (inner.textContent ?? match.textContent ?? "").trim();
          this.injectCopyButton(match, copyText);
        } else {
          // 关闭 boldItalic：纯净嵌套完全不显示
          processed.add(match);
          if (inner) processed.add(inner);
        }
        continue;
      }

      // 普通元素（含“加粗带 _嵌套斜体_”这种非纯净结构）：各显示 1 个
      processed.add(match);
      const copyText = this.getCopyText(match);
      this.injectCopyButton(match, copyText);
    }
  }

  // 若 el 是纯净的加粗斜体嵌套外层（strong↔em 互为唯一内容），
  // 返回其内层元素；否则返回 null。
  private getBoldItalicInner(el: HTMLElement): HTMLElement | null {
    if (el.tagName !== "STRONG" && el.tagName !== "EM") return null;
    const opposite = el.tagName === "STRONG" ? "EM" : "STRONG";
    const innerEls = Array.from(el.children).filter(
      (c) => c.tagName === "STRONG" || c.tagName === "EM",
    );
    if (innerEls.length !== 1) return null;
    const inner = innerEls[0] as HTMLElement;
    if (inner.tagName !== opposite) return null;
    // 外层除内层外不能有其他非空直接文本：
    // 以此区分 6 种对称模式（外层仅含内层）与普通“加粗带 _斜体_”（外层另有文本）。
    const directText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? "")
      .join("")
      .trim();
    if (directText) return null;
    // 内层内部可再嵌套其它类型（如高亮），不影响整体归属 boldItalic；
    // 那些嵌套类型会作为独立元素单独显示按钮。
    return inner;
  }

  // ---- 复制文本提取 ----

  private getCopyText(el: HTMLElement): string {
    // 标签
    if (el.hasClass("tag")) {
      const href = el.getAttr("href");
      if (href) return href.startsWith("#") ? href : "#" + href;
      const raw = el.textContent ?? "";
      return raw.startsWith("#") ? raw : "#" + raw;
    }
    // 内部链接：统一以 Wiki 格式复制，保留 Obsidian 链接语义。
    // 无别名 → [[href]]，有别名 → [[href|text]]。
    if (el.hasClass("internal-link")) {
      const href = el.getAttr("href") || "";
      const text = (el.textContent || "").trim();
      if (text && text !== href) return `[[${href}|${text}]]`;
      return `[[${href}]]`;
    }
    // 外部链接 / 普通链接：有名字 → [名字](目标)，否则仅目标。
    // 目标可为 http(s)://、obsidian:// 等，保留原始内容不剥离。
    const href = el.getAttr("href") || "";
    if (el.hasClass("external-link") || (el.tagName === "A" && href)) {
      const text = (el.textContent || "").trim();
      return text && text !== href ? `[${text}](${href})` : href;
    }
    // 默认：文本内容
    return el.textContent ?? "";
  }

  // ---- 按钮注入 ----

  private injectCopyButton(el: HTMLElement, copyText: string): void {
    if (!copyText) return;

    const isBlock = /^(H[1-6]|BLOCKQUOTE)$/.test(el.tagName);

    const btn = document.body.createSpan();
    btn.className = "fast-copier-btn";
    const icon = this.plugin.settings.copyButtonIcon || "copy";
    setIcon(btn, icon);
    btn.setAttr("title", copyText);
    btn.setAttr("data-fast-copier-text", copyText);

    if (isBlock) {
      // 块级元素：直接把按钮作为最后一个子节点，紧贴文本之后，
      // 不包裹整个元素，避免按钮掉到下一行或跑到块级右边缘。
      el.appendChild(btn);
    } else {
      const wrapper = document.body.createSpan();
      wrapper.className = "fast-copier-wrapper";
      el.parentNode?.insertBefore(wrapper, el);
      wrapper.appendChild(el);
      wrapper.appendChild(btn);
    }
  }

  // ---- 事件处理 ----

  private onClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest(".markdown-reading-view")) return;

    // 复制按钮
    const btn = target.closest?.(".fast-copier-btn");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.getAttr("data-fast-copier-text");
      if (text) void this.copyToClipboard(text);
      return;
    }

    // 单击复制元素
    let el: HTMLElement | null = target;
    while (el) {
      if (el.getAttr?.("data-fast-copier-type") === "click") {
        e.preventDefault();
        e.stopPropagation();
        void this.copyToClipboard(el.textContent ?? "");
        return;
      }
      el = el.parentElement;
    }
  }

  // ---- 辅助 ----

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.plugin.notifyCopy(text);
    } catch {
      new Notice(t("copy_failed"));
    }
  }
}
