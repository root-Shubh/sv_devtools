import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as t from "../tools/text/textUtils";

test("dedupe keeps the first occurrence, optionally ignoring case", () => {
  assert.equal(t.removeDuplicateLines("a\nb\na\nc\nb"), "a\nb\nc");
  assert.equal(t.removeDuplicateLines("A\na", true), "A");
  assert.equal(t.removeDuplicateLines("A\na"), "A\na");
});

test("sort handles ascending, descending and case", () => {
  assert.equal(t.sortLines("c\na\nb"), "a\nb\nc");
  assert.equal(t.sortLines("a\nc\nb", { descending: true }), "c\nb\na");
  assert.equal(t.sortLines("b\nA\na", { ignoreCase: true }), "A\na\nb");
});

test("reverse, trim and remove-empty behave on lines", () => {
  assert.equal(t.reverseLines("1\n2\n3"), "3\n2\n1");
  assert.equal(t.trimLines("  a \n\tb\t"), "a\nb");
  assert.equal(t.removeEmptyLines("a\n\n   \nb"), "a\nb");
});

test("find and replace: literal, regex, case-insensitive and errors", () => {
  assert.deepEqual(t.findReplace("a.b a.b", ".", "!"), { text: "a!b a!b", count: 2 });
  assert.deepEqual(t.findReplace("x1 x22", "x(\\d+)", "y$1", { useRegex: true }), { text: "y1 y22", count: 2 });
  assert.equal(t.findReplace("Hello", "hello", "hi", { ignoreCase: true }).text, "hi");
  assert.ok(t.findReplace("x", "", "y").error);
  assert.ok(t.findReplace("x", "(", "y", { useRegex: true }).error);
});

test("line endings convert both ways", () => {
  assert.equal(t.convertLineEndings("a\r\nb\nc", "lf"), "a\nb\nc");
  assert.equal(t.convertLineEndings("a\nb", "crlf"), "a\r\nb");
});

test("counts characters (Unicode-aware), words and lines", () => {
  assert.deepEqual(t.countStats("日本 語\nok"), { characters: 7, words: 3, lines: 2 });
  assert.deepEqual(t.countStats(""), { characters: 0, words: 0, lines: 0 });
  assert.deepEqual(t.countStats("🙂"), { characters: 1, words: 1, lines: 1 });
});
