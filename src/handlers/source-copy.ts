import {
  StateField,
  StateEffect,
  type Extension,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  WidgetType,
  EditorView,
} from "@codemirror/view";
import { setIcon } from "obsidian";
import {
  getEnabledSourceMatchers,
  areCopyButtonsVisible,
  boldItalicMatchers,
  codeMatchers,
  linkMatchers,
  type ContentTypeId,
} from "../core/content-types";
import type { FastCopierSettings } from "../settings/settings";
import type { FastCopierPluginLike } from "../types/plugin";

// ============================================================
// CopyButtonWidget
// ============================================================

class CopyButtonWidget extends WidgetType {
  constructor(
    private readonly text: string,
    private readonly icon: string,
    private readonly onCopy: (text: string) => void,
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const btn = document.body.createSpan();
    btn.className = "fast-copier-source-btn";
    setIcon(btn, this.icon);
    btn.title = this.text;
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onCopy(this.text);
    });
    return btn;
  }

  eq(other: CopyButtonWidget): boolean {
    return this.text === other.text && this.icon === other.icon;
  }
}

// ============================================================
// StateEffect（设置变更时触发重算）
// ============================================================

const settingsChanged = StateEffect.define<FastCopierSettings>();

export { settingsChanged };

// ============================================================
// StateField：始终显示装饰
// ============================================================

function buildDecorationField(plugin: FastCopierPluginLike) {
  return StateField.define<DecorationSet>({
    create() {
      return Decoration.none;
    },

    update(decos, tr) {
      let settings = plugin.settings;
      for (const e of tr.effects) {
        if (e.is(settingsChanged)) {
          settings = e.value;
        }
      }

      if (!areCopyButtonsVisible() || settings.enabledTypes.length === 0) {
        return Decoration.none;
      }

      // 首次加载时 decos 为空，必须计算
      if (
        decos !== Decoration.none &&
        !tr.docChanged &&
        !tr.effects.some((e) => e.is(settingsChanged))
      ) {
        return decos;
      }

      return computeDecorations(tr.state, settings, plugin);
    },

    provide: (f) => EditorView.decorations.from(f),
  });
}

interface Candidate {
  ms: number; // 匹配起始（行内偏移）
  me: number; // 匹配结束（行内偏移）
  content: string;
  type?: ContentTypeId;
}

// 收集一行内所有启用类型的候选匹配。
function collectCandidates(text: string, matchers: ReturnType<typeof getEnabledSourceMatchers>): Candidate[] {
  const candidates: Candidate[] = [];
  for (const m of matchers) {
    const { regex, group, prefix, format } = m;
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const ms = match.index;
      const me = ms + match[0].length;
      const raw = match[group] ?? "";
      if (!raw && !format) continue;
      const content = format ? format(match) : prefix ? prefix + raw : raw;
      candidates.push({ ms, me, content, type: m.type });
    }
  }
  return candidates;
}

// 计算行内代码区间、加粗斜体专属区间与链接区间。
function computeRanges(text: string): {
  fullyInCode: (ms: number, me: number) => boolean;
  protectedRanges: [number, number][];
  inLink: (ms: number, me: number) => boolean;
} {
  const codeRanges: [number, number][] = [];
  for (const m of codeMatchers) {
    const { regex } = m;
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      codeRanges.push([match.index, match.index + match[0].length]);
    }
  }
  const fullyInCode = (ms: number, me: number): boolean =>
    codeRanges.some(([ps, pe]) => ps <= ms && me <= pe);

  // 加粗斜体（boldItalic）专属区间：那 6 种对称模式整体专属加粗斜体，
  // 但位于行内代码内部的除外（代码内容里的 *__x__* 不是真正的加粗斜体）。
  // 无论 boldItalic 是否启用都计算，用于屏蔽其中的 bold/italic 误匹配。
  const protectedRanges: [number, number][] = [];
  for (const m of boldItalicMatchers) {
    const { regex } = m;
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const ms = match.index;
      const me = ms + match[0].length;
      if (fullyInCode(ms, me)) continue;
      protectedRanges.push([ms, me]);
    }
  }

  // 链接区间：内部链接与外部链接占据的字符范围。
  // 链接内部的其它候选（行内代码、加粗、高亮、标签等）一律屏蔽，
  // 仅保留链接自身在末尾的一个按钮，避免编辑模式下链接内部重复出现按钮。
  const linkRanges: [number, number][] = [];
  for (const m of linkMatchers) {
    const { regex } = m;
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      linkRanges.push([match.index, match.index + match[0].length]);
    }
  }
  const inLink = (ms: number, me: number): boolean =>
    linkRanges.some(([ps, pe]) => ps <= ms && me <= pe);

  return { fullyInCode, protectedRanges, inLink };
}

// 过滤候选：屏蔽代码内部的非代码候选，吸收与加粗斜体专属区间重叠的 bold/italic，
// 屏蔽链接内部的非链接候选，并丢弃完全相同的重复候选。
function filterCandidates(
  candidates: Candidate[],
  fullyInCode: (ms: number, me: number) => boolean,
  protectedRanges: [number, number][],
  inLink: (ms: number, me: number) => boolean,
): Candidate[] {
  const filtered = candidates.filter((c) => {
    if (fullyInCode(c.ms, c.me)) {
      return c.type === "code";
    }
    if (inLink(c.ms, c.me)) {
      // 链接内部只保留链接自身，屏蔽其内部可能命中的其它类型
      return c.type === "internalLink" || c.type === "externalLink";
    }
    if (c.type === "bold" || c.type === "italic") {
      const overlaps = protectedRanges.some(
        ([ps, pe]) => c.ms < pe && ps < c.me,
      );
      if (overlaps) return false;
    }
    return true;
  });

  const seen = new Set<string>();
  return filtered.filter((c) => {
    const key = `${c.ms}:${c.me}:${c.content}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 为一行生成装饰 widget（按结束位置升序）。
function buildWidgets(
  line: import("@codemirror/state").Line,
  kept: Candidate[],
  icon: string,
  plugin: FastCopierPluginLike,
): import("@codemirror/state").Range<Decoration>[] {
  kept.sort((a, b) => a.me - b.me);
  return kept.map((c) =>
      Decoration.widget({
        widget: new CopyButtonWidget(c.content, icon, (t) => {
          void plugin.copyText(t);
        }),
        side: 1,
      }).range(line.from + c.me),
  );
}

function computeDecorations(
  state: import("@codemirror/state").EditorState,
  settings: FastCopierSettings,
  plugin: FastCopierPluginLike,
): DecorationSet {
  const matchers = getEnabledSourceMatchers(settings.enabledTypes);
  const icon = settings.copyButtonIcon || "copy";
  const widgets: import("@codemirror/state").Range<Decoration>[] = [];

  const doc = state.doc;
  const fenceMarker = /^\s*(?:```|~~~)/;
  let inFence = false;
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const text = line.text;

    // 处理围栏代码块（``` 或 ~~~）：标记行本身及块内行均不显示复制按钮。
    if (fenceMarker.test(text)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const candidates = collectCandidates(text, matchers);
    if (candidates.length === 0) continue;

    const { fullyInCode, protectedRanges, inLink } = computeRanges(text);
    const kept = filterCandidates(candidates, fullyInCode, protectedRanges, inLink);
    widgets.push(...buildWidgets(line, kept, icon, plugin));
  }

  return Decoration.set(widgets, true);
}

// ============================================================
// 公开导出
// ============================================================

export function sourceCopyExtension(
  plugin: FastCopierPluginLike,
): Extension[] {
  const field = buildDecorationField(plugin);
  return [field];
}
