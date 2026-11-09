// Syntax owned by other plugins should not receive Fast Copier buttons.
export type TextRange = [number, number];

const metaBindField = /^(?:INPUT|VIEW|BUTTON|BUTTON_GROUP)\[/i;
const dataviewQuery = /^(?:\$=|=)(?:\s|[^=])/;

export function isSpecialInlineCode(text: string): boolean {
  const content = text.trimStart();
  return metaBindField.test(content) || dataviewQuery.test(content);
}

export function getSpecialSyntaxRanges(text: string): TextRange[] {
  const ranges: TextRange[] = [];
  const codeRanges: TextRange[] = [];
  // Match complete Markdown code spans, including spans with multiple backticks.
  const codeSpan = /(`+)([^`]*?)\1(?!`)/g;
  let match: RegExpExecArray | null;
  while ((match = codeSpan.exec(text)) !== null) {
    codeRanges.push([match.index, match.index + match[0].length]);
    if (isSpecialInlineCode(match[2])) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }

  // Dataview's bracketed and parenthesized inline metadata fields.
  const inlineField = /\[([^\]\n]+?)::\s*[^\]\n]*\]|\(([^)\n]+?)::\s*[^)\n]*\)/g;
  while ((match = inlineField.exec(text)) !== null) {
    if (!codeRanges.some(([start, end]) => start <= match!.index && match!.index < end)) {
      ranges.push([match.index, match.index + match[0].length]);
    }
  }
  // Dataview also accepts an unwrapped field when it occupies a full line.
  if (/^\s*[\p{L}][\p{L}\p{N}_ -]*::\s*\S/u.test(text)) {
    ranges.push([0, text.length]);
  }
  return ranges;
}

export function overlapsSpecialSyntax(start: number, end: number, ranges: TextRange[]): boolean {
  return ranges.some(([from, to]) => start < to && from < end);
}

export function isSpecialRenderedElement(el: HTMLElement): boolean {
  if (el.closest(".dataview-inline-query, .dataview.inline-field, .mb-input, .mb-view, .mb-button, .mb-button-group")) {
    return true;
  }
  return el.tagName === "CODE" && isSpecialInlineCode(el.textContent ?? "");
}
