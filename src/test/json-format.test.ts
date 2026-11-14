import { test } from "node:test";
import * as assert from "node:assert/strict";
import { formatJson, minifyJson, validateJson, positionToLineColumn } from "../tools/json/format";

test("formats nested objects and arrays with indentation", () => {
  const r = formatJson('{"a":1,"b":[true,null],"c":{"d":"x"}}');
  assert.ok(r.ok);
  assert.equal(r.ok && r.text, '{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ],\n  "c": {\n    "d": "x"\n  }\n}');
});

test("minifies to a single line", () => {
  const r = minifyJson('{\n  "a": [1, 2]\n}');
  assert.deepEqual(r, { ok: true, text: '{"a":[1,2]}' });
});

test("empty input is rejected", () => {
  const r = validateJson("   ");
  assert.equal(r.ok, false);
});

test("syntax errors report line and column", () => {
  const r = validateJson('{\n  "a": 1,\n}');
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.line !== undefined && r.line >= 2);
    assert.ok(r.column !== undefined && r.column >= 1);
  }
});

test("unicode and escapes round-trip", () => {
  const input = '{"s":"caf\u00e9 \\"quoted\\" 日本"}';
  const formatted = formatJson(input);
  assert.ok(formatted.ok);
  if (formatted.ok) assert.deepEqual(JSON.parse(formatted.text), JSON.parse(input));
});

test("large input formats without error", () => {
  const big = JSON.stringify(Array.from({ length: 20000 }, (_, i) => ({ i, s: "x" + i })));
  const r = minifyJson(big);
  assert.ok(r.ok);
});

test("positionToLineColumn counts lines", () => {
  assert.deepEqual(positionToLineColumn("ab\ncd", 4), { line: 2, column: 2 });
});
