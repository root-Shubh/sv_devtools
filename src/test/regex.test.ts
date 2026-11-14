import { test } from "node:test";
import * as assert from "node:assert/strict";
import { compile, findMatches, replacePreview, portabilityWarnings, validateFlags } from "../tools/regex/playground";

test("finds all matches with indexes", () => {
  const r = findMatches({ pattern: "\\d+", flags: "", text: "a1 b22 c333" });
  assert.deepEqual(r.matches.map((m) => [m.index, m.match]), [[1, "1"], [4, "22"], [8, "333"]]);
});

test("captured groups are returned per match", () => {
  const r = findMatches({ pattern: "(\\w+)@(\\w+)", flags: "", text: "a@b c@d" });
  assert.deepEqual(r.matches[0].groups, ["a", "b"]);
  assert.deepEqual(r.matches[1].groups, ["c", "d"]);
});

test("named groups are returned", () => {
  const r = findMatches({ pattern: "(?<year>\\d{4})-(?<month>\\d{2})", flags: "", text: "2026-11" });
  assert.deepEqual(r.matches[0].named, { year: "2026", month: "11" });
});

test("flags i and m change matching", () => {
  assert.equal(findMatches({ pattern: "abc", flags: "", text: "ABC" }).matches.length, 0);
  assert.equal(findMatches({ pattern: "abc", flags: "i", text: "ABC" }).matches.length, 1);
  assert.equal(findMatches({ pattern: "^x", flags: "m", text: "a\nx" }).matches.length, 1);
});

test("zero-length matches do not loop forever", () => {
  const r = findMatches({ pattern: "a*", flags: "", text: "bab" });
  assert.ok(r.matches.length > 0);
  assert.equal(r.truncated, false);
});

test("invalid pattern returns an error instead of throwing", () => {
  const r = findMatches({ pattern: "(unclosed", flags: "", text: "x" });
  assert.equal(r.matches.length, 0);
  assert.ok(r.error && r.error.length > 0);
});

test("unknown flags are rejected", () => {
  assert.ok(validateFlags("z"));
  assert.ok(compile("a", "z").error);
});

test("empty text and empty pattern are handled", () => {
  assert.equal(findMatches({ pattern: "x", flags: "", text: "" }).matches.length, 0);
  assert.doesNotThrow(() => findMatches({ pattern: "", flags: "", text: "abc" }));
});

test("unicode text matches correctly", () => {
  const r = findMatches({ pattern: "\\p{L}+", flags: "u", text: "café 日本" });
  assert.deepEqual(r.matches.map((m) => m.match), ["café", "日本"]);
});

test("replace preview expands numbered and named groups", () => {
  const numbered = replacePreview({ pattern: "(\\w+)@(\\w+)", flags: "", text: "a@b" }, "$2 at $1");
  assert.equal(numbered.result, "b at a");
  const named = replacePreview({ pattern: "(?<y>\\d{4})", flags: "", text: "in 2026" }, "<$<y>>");
  assert.equal(named.result, "in <2026>");
  assert.equal(named.count, 1);
});

test("replace preview keeps literal dollar signs", () => {
  assert.equal(replacePreview({ pattern: "x", flags: "", text: "x" }, "$$5").result, "$5");
});

test("portability warnings for python and java", () => {
  assert.ok(portabilityWarnings("(?<n>a)", "", "python").length > 0);
  assert.deepEqual(portabilityWarnings("(?<n>a)", "", "javascript"), []);
  assert.ok(portabilityWarnings("a", "u", "java").length > 0);
});
