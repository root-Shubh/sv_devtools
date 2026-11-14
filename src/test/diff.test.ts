import { test } from "node:test";
import * as assert from "node:assert/strict";
import { diffLines, diffSummary } from "../tools/text/diff";

test("identical inputs produce only equal lines", () => {
  const result = diffLines("a\nb", "a\nb");
  assert.deepEqual(diffSummary(result), { added: 0, removed: 0, equal: 2 });
});

test("empty inputs are handled", () => {
  assert.deepEqual(diffLines("", ""), []);
  assert.deepEqual(diffSummary(diffLines("", "x")), { added: 1, removed: 0, equal: 0 });
  assert.deepEqual(diffSummary(diffLines("x", "")), { added: 0, removed: 1, equal: 0 });
});

test("added and removed lines get correct line numbers", () => {
  const result = diffLines("one\ntwo\nthree", "one\n2\nthree");
  const changed = result.filter((l) => l.kind !== "equal");
  assert.deepEqual(changed, [
    { kind: "removed", text: "two", leftLine: 2 },
    { kind: "added", text: "2", rightLine: 2 }
  ]);
});

test("ignoreWhitespace treats spacing differences as equal", () => {
  assert.equal(diffSummary(diffLines("a  b", "a b", { ignoreWhitespace: true })).equal, 1);
  assert.equal(diffSummary(diffLines("a  b", "a b")).equal, 0);
});

test("ignoreCase treats case differences as equal", () => {
  assert.equal(diffSummary(diffLines("Hello", "hello", { ignoreCase: true })).equal, 1);
});

test("Unicode content is compared correctly", () => {
  const result = diffLines("café\n日本", "café\n日本語");
  assert.deepEqual(diffSummary(result), { added: 1, removed: 1, equal: 1 });
});

test("CRLF line endings do not create false differences", () => {
  assert.deepEqual(diffSummary(diffLines("a\r\nb", "a\nb")), { added: 0, removed: 0, equal: 2 });
});

test("oversized input is rejected with a clear error", () => {
  const big = Array.from({ length: 5001 }, (_, i) => String(i)).join("\n");
  assert.throws(() => diffLines(big, "x"), RangeError);
});

import { unifiedDiff } from "../tools/text/diff";

test("unified diff is empty for identical text", () => {
  assert.equal(unifiedDiff("a\nb", "a\nb"), "");
});

test("unified diff shows removed and added lines with markers", () => {
  const u = unifiedDiff("one\ntwo", "one\n2");
  assert.ok(u.includes("-two"));
  assert.ok(u.includes("+2"));
  assert.ok(u.includes(" one"));
});
