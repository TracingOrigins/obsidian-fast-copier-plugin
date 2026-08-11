// ============================================================
// Content types
// 统一定义"要显示复制按钮的内容类型"，编辑模式（源码）与
// 阅读模式共用同一份勾选状态，不再区分两个分类。
// ============================================================

// 内容类型 ID。顺序即设置面板中展示的顺序。
export type ContentTypeId =
  | "code"
  | "bold"
  | "boldItalic"
  | "italic"
  | "underline"
  | "strikethrough"
  | "highlight"
  | "heading"
  | "tag"
  | "internalLink"
  | "externalLink";

// 编辑模式每个类型的匹配规则
export interface SourceMatcher {
  // 匹配正则（全局）。内容捕获在 group 指定的分组里。
  regex: RegExp;
  // 内容捕获分组下标
  group: number;
  // 复制文本前缀（如标签需要补 #）
  prefix?: string;
  // 自定义格式化：传入整段匹配结果，返回最终复制文本。
  // 优先于 prefix；存在时忽略 group/raw 的空检查。
  format?: (match: RegExpExecArray) => string;
  // 来源内容类型（用于加粗斜体区间互斥过滤）
  type?: ContentTypeId;
}

export interface ContentTypeMeta {
  id: ContentTypeId;
  // 文案 key（name 与 desc）
  nameKey: string;
  descKey: string;
  // 编辑模式（源码）匹配规则
  sourceMatchers: SourceMatcher[];
  // 阅读模式 CSS 选择器
  readingSelectors: string[];
}

// ---- 编辑模式（源码）正则 ----
// 注意：源码模式按行处理，行首锚点 ^ 在按行文本上直接生效。
export const codeMatchers: SourceMatcher[] = [{ regex: /`([^`]+)`/g, group: 1 }];
const boldMatchers: SourceMatcher[] = [
  // 恢复宽松匹配；与加粗斜体（6 种对称模式）的互斥由区间过滤处理
  { regex: /\*\*([^*]+)\*\*/g, group: 1 },
  { regex: /__([^_]+)__/g, group: 1 },
];
export const boldItalicMatchers: SourceMatcher[] = [
  // 6 种加粗斜体组合，全部归属 boldItalic（仅当其开关启用时匹配）
  { regex: /\*\*\*([^*]+)\*\*\*/g, group: 1 }, // ***x***
  { regex: /___([^_]+)___/g, group: 1 }, // ___x___
  { regex: /\*\*_([^_]+)_\*\*/g, group: 1 }, // **_x_**
  { regex: /(_\*\*([^*]+)\*\*_)/g, group: 2 }, // _**x**_
  { regex: /__\*([^*]+)\*__/g, group: 1 }, // __*x*__
  { regex: /(\*__([^_]+)__\*)/g, group: 2 }, // *__x__*
];
const italicMatchers: SourceMatcher[] = [
  { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, group: 1 },
  { regex: /(?<!_)_([^_]+)_(?!_)/g, group: 1 },
];
const underlineMatchers: SourceMatcher[] = [{ regex: /<u>([^<]+)<\/u>/gi, group: 1 }];
const strikethroughMatchers: SourceMatcher[] = [{ regex: /~~([^~]+)~~/g, group: 1 }];
const highlightMatchers: SourceMatcher[] = [{ regex: /==([^=]+)==/g, group: 1 }];
const headingMatchers: SourceMatcher[] = [{ regex: /^#{1,6}\s+(.+)$/g, group: 1 }];
const tagMatchers: SourceMatcher[] = [{ regex: /#([^\s#][^\s]*)/g, group: 1, prefix: "#" }];
// 内部链接：两种写法都支持，按原样复制（不转换格式）。
//   - Wiki 链接：[[note]] / [[note|alias]]（整段捕获）
//   - Markdown 链接：[note](note.md)（整段捕获）
const internalLinkMatchers: SourceMatcher[] = [
  { regex: /\[\[[^\]]+\]\]/g, group: 0 },
  { regex: /\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.(?:md|canvas)(?:#[^)]*)?)\)/g, group: 0 },
];

// 外部链接：覆盖文档 "External links" 全部写法（不含图片 ![]()），保留原始内容不剥离。
//   - [名字](目标)      → 原样
//   - <scheme://...>      → 原样（含尖括号）
//   - 裸 scheme://...     → 原样
const externalLinkMatchers: SourceMatcher[] = [
  {
    regex:
      /(?<!!)\[([^\]]+)\]\((?!(?!\w+:\/\/).*\.(?:md|canvas)(?:#[^)]*)?\))([^)]+)\)|<([a-z][a-z0-9+.-]*:\/\/[^>\s]+)>|(?<!\S)([a-z][a-z0-9+.-]*:\/\/[^\s)]+)/g,
    group: 2,
    format: (m: RegExpExecArray) => {
      if (m[1] !== undefined) {
        return `[${m[1]}](${m[2]})`;
      }
      return m[3] ?? m[4] ?? "";
    },
  },
];

// ---- 阅读模式（渲染后 DOM）选择器 ----
const codeSelectors = ["code"];
const boldSelectors = ["strong"];
const boldItalicSelectors = ["strong em", "em strong"];
const italicSelectors = ["em"];
const underlineSelectors = ["u"];
const strikethroughSelectors = ["del"];
const highlightSelectors = ["mark"];
const headingSelectors = ["h1", "h2", "h3", "h4", "h5", "h6"];
const tagSelectors = ["a.tag"];
const internalLinkSelectors = ["a.internal-link"];
const externalLinkSelectors = ["a.external-link"];

export const CONTENT_TYPES: ContentTypeMeta[] = [
  { id: "code", nameKey: "type_code", descKey: "type_code_desc", sourceMatchers: codeMatchers, readingSelectors: codeSelectors },
  { id: "bold", nameKey: "type_bold", descKey: "type_bold_desc", sourceMatchers: boldMatchers, readingSelectors: boldSelectors },
  { id: "italic", nameKey: "type_italic", descKey: "type_italic_desc", sourceMatchers: italicMatchers, readingSelectors: italicSelectors },
  { id: "boldItalic", nameKey: "type_bold_italic", descKey: "type_bold_italic_desc", sourceMatchers: boldItalicMatchers, readingSelectors: boldItalicSelectors },
  { id: "underline", nameKey: "type_underline", descKey: "type_underline_desc", sourceMatchers: underlineMatchers, readingSelectors: underlineSelectors },
  { id: "strikethrough", nameKey: "type_strikethrough", descKey: "type_strikethrough_desc", sourceMatchers: strikethroughMatchers, readingSelectors: strikethroughSelectors },
  { id: "highlight", nameKey: "type_highlight", descKey: "type_highlight_desc", sourceMatchers: highlightMatchers, readingSelectors: highlightSelectors },
  { id: "heading", nameKey: "type_heading", descKey: "type_heading_desc", sourceMatchers: headingMatchers, readingSelectors: headingSelectors },
  { id: "tag", nameKey: "type_tag", descKey: "type_tag_desc", sourceMatchers: tagMatchers, readingSelectors: tagSelectors },
  { id: "internalLink", nameKey: "type_internal_link", descKey: "type_internal_link_desc", sourceMatchers: internalLinkMatchers, readingSelectors: internalLinkSelectors },
  { id: "externalLink", nameKey: "type_external_link", descKey: "type_external_link_desc", sourceMatchers: externalLinkMatchers, readingSelectors: externalLinkSelectors },
];

export const ALL_TYPE_IDS: ContentTypeId[] = CONTENT_TYPES.map((c) => c.id);

// 返回已启用类型的所有编辑模式匹配规则
export function getEnabledSourceMatchers(enabled: ContentTypeId[]): SourceMatcher[] {
  const out: SourceMatcher[] = [];
  // 遍历所有类型，加入已启用的匹配器（含 code / heading / tag 等）
  for (const ct of CONTENT_TYPES) {
    if (enabled.includes(ct.id)) {
      for (const m of ct.sourceMatchers) {
        out.push({ ...m, type: ct.id });
      }
    }
  }
  return out;
}

// 返回已启用类型的阅读模式 CSS 选择器（逗号拼接字符串）
export function getReadingSelectorString(enabled: ContentTypeId[]): string {
  const out: string[] = [];
  for (const ct of CONTENT_TYPES) {
    if (enabled.includes(ct.id)) out.push(...ct.readingSelectors);
  }
  return out.join(",");
}

// 链接匹配器（内部 + 外部），供编辑模式屏蔽链接内部的其它候选使用。
export const linkMatchers: SourceMatcher[] = [
  ...internalLinkMatchers,
  ...externalLinkMatchers,
];

// ---- 运行时可见性（由命令切换，不持久化） ----
let copyButtonsVisible = true;

export function setCopyButtonsVisible(visible: boolean): void {
  copyButtonsVisible = visible;
}

export function areCopyButtonsVisible(): boolean {
  return copyButtonsVisible;
}
