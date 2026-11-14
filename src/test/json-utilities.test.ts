import { test } from "node:test";
import * as assert from "node:assert/strict";
import { jsonToCsv, csvToJson, parseCsv, jsonPath, escapeJsonString, unescapeJsonString } from "../tools/json/utilities";

test("JSON array of objects converts to CSV with quoting", () => {
  const r = jsonToCsv('[{"a":"x,y","b":1},{"a":"say \\"hi\\"","c":true}]');
  assert.deepEqual(r, { ok: true, text: 'a,b,c\n"x,y",1,\n"say ""hi""",,true' });
});

test("CSV to JSON uses the header row and keeps quoted newlines", () => {
  const r = csvToJson('name,note\nann,"line1\nline2"\nbob,');
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual(JSON.parse(r.text), [
      { name: "ann", note: "line1\nline2" },
      { name: "bob", note: "" }
    ]);
  }
});

test("CSV parser handles CRLF and empty input", () => {
  assert.deepEqual(parseCsv("a,b\r\n1,2\r\n"), [["a", "b"], ["1", "2"]]);
  assert.equal(csvToJson("").ok, false);
});

test("non-array JSON is rejected for CSV", () => {
  assert.equal(jsonToCsv('{"a":1}').ok, false);
  assert.equal(jsonToCsv("[1,2]").ok, false);
});

test("JSONPath selects keys, indexes and wildcards", () => {
  const doc = '{"users":[{"name":"a"},{"name":"b"}],"x-y":{"z":1}}';
  assert.deepEqual(jsonPath(doc, "$.users[1].name"), { ok: true, text: '"b"' });
  assert.deepEqual(jsonPath(doc, "$.users[*].name"), { ok: true, text: JSON.stringify(["a", "b"], null, 2) });
  assert.deepEqual(jsonPath(doc, '$["x-y"].z'), { ok: true, text: "1" });
});

test("JSONPath reports bad paths and misses", () => {
  assert.equal(jsonPath("{}", "users").ok, false);
  assert.equal(jsonPath("{}", "$.nope").ok, false);
  assert.equal(jsonPath("{", "$").ok, false);
});

test("escape and unescape round-trip special characters", () => {
  const original = 'quote " slash \\ newline \n tab \t 日本';
  const escaped = escapeJsonString(original);
  assert.deepEqual(unescapeJsonString(escaped), { ok: true, text: original });
  assert.equal(unescapeJsonString("bad\\x").ok, false);
});
