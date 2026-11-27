import assert from "node:assert/strict";
import test from "node:test";
import { getSpecialSyntaxRanges, isSpecialInlineCode, overlapsSpecialSyntax } from "../src/core/special-syntax";

void test("recognizes Meta Bind and Dataview expressions in inline code", () => {
  for (const value of ["INPUT[toggle:done]", "VIEW[{score}]", "BUTTON[save]", "BUTTON_GROUP[save, cancel]", "= this.file.name", "$= dv.current().score"]) {
    assert.equal(isSpecialInlineCode(value), true, value);
  }
  for (const value of ["ordinary code", "x = 1", "==highlight==", "INPUT field"]) {
    assert.equal(isSpecialInlineCode(value), false, value);
  }
});

void test("suppresses complete special expressions without swallowing adjacent content", () => {
  const text = "**keep** `INPUT[slider:score]` and `= this.score` #tag";
  const ranges = getSpecialSyntaxRanges(text);
  assert.equal(ranges.length, 2);
  assert.equal(overlapsSpecialSyntax(0, 8, ranges), false);
  assert.equal(overlapsSpecialSyntax(text.indexOf("INPUT"), text.indexOf("INPUT") + 5, ranges), true);
  assert.equal(overlapsSpecialSyntax(text.indexOf("#tag"), text.length, ranges), false);
});

void test("handles Dataview inline fields and leaves ordinary code untouched", () => {
  const text = "[status:: **open**] (score:: 5) `literal [key:: value]`";
  const ranges = getSpecialSyntaxRanges(text);
  assert.equal(ranges.length, 2);
  assert.equal(overlapsSpecialSyntax(text.indexOf("literal"), text.length, ranges), false);
  assert.deepEqual(getSpecialSyntaxRanges("status:: **open**"), [[0, 17]]);
});
