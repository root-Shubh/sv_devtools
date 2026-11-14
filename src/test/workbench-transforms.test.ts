import { test } from "node:test";
import * as assert from "node:assert/strict";
import { TRANSFORMS, findTransform, runTransform, MAX_OUTPUT_CHARS } from "../workbench/transforms";

test("transform ids are unique and every transform has a label and group", () => {
  const ids = TRANSFORMS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of TRANSFORMS) {
    assert.ok(t.label.length > 0);
    assert.ok(["Encode", "Format", "Text", "Hash", "Escape", "Inspect"].includes(t.group), t.id);
  }
});

test("base64 round trip through the workbench", () => {
  const enc = runTransform("base64-encode", "héllo");
  assert.ok(enc.ok);
  if (enc.ok) assert.deepEqual(runTransform("base64-decode", enc.text), { ok: true, text: "héllo" });
});

test("JSON validate reports success or the error location", () => {
  assert.deepEqual(runTransform("json-validate", '{"a":1}'), { ok: true, text: "Valid JSON." });
  const bad = runTransform("json-validate", '{\n  "a": 1,\n}');
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(bad.message, /line \d+, column \d+/);
});

test("count transform reports characters, words and lines", () => {
  const r = runTransform("count", "a b\nc");
  assert.deepEqual(r, { ok: true, text: "Characters: 5\nWords: 3\nLines: 2" });
});

test("hash transforms return hex digests", () => {
  const r = runTransform("sha256", "abc");
  assert.deepEqual(r, { ok: true, text: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" });
});

test("unknown transform and oversized input are refused", () => {
  assert.equal(runTransform("nope", "x").ok, false);
  const big = "x".repeat(MAX_OUTPUT_CHARS + 1);
  assert.equal(runTransform("uppercase", big).ok, false);
});

test("every transform handles empty input without throwing", () => {
  for (const t of TRANSFORMS) {
    assert.doesNotThrow(() => runTransform(t.id, ""), t.id);
  }
});

test("findTransform returns undefined for unknown ids", () => {
  assert.equal(findTransform("missing"), undefined);
  assert.ok(findTransform("sha256"));
});
