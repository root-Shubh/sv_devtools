import { test } from "node:test";
import * as assert from "node:assert/strict";
import { randomInt } from "crypto";
import { base64Encode, base64Decode } from "../tools/encoding/base64";
import { urlEncode, urlDecode } from "../tools/encoding/url";
import * as c from "../tools/encoding/conversion";
import { formatJson, minifyJson } from "../tools/json/format";
import { compareJson } from "../tools/json/compare";
import { jsonToCsv, csvToJson, escapeJsonString, unescapeJsonString } from "../tools/json/utilities";
import { diffLines, diffSummary } from "../tools/text/diff";

// Random text drawn from ASCII, control characters, Latin, CJK and emoji.
const POOL = [
  ..."abcXYZ 0123 !@#$%^&*()_+-=[]{};:'\",.<>/?\\|`~",
  "\n",
  "\t",
  "\r",
  "é",
  "ß",
  "日",
  "本",
  "🙂",
  "\u0001",
  "​"
];
function randomText(maxLen: number): string {
  const n = randomInt(0, maxLen + 1);
  let out = "";
  for (let i = 0; i < n; i++) out += POOL[randomInt(POOL.length)];
  return out;
}

const ROUNDS = 200;

function ok<T extends { ok: boolean }>(r: T): T & { ok: true } {
  assert.equal(r.ok, true, JSON.stringify(r));
  return r as T & { ok: true };
}

test("round trip: Base64 preserves any text", () => {
  for (let i = 0; i < ROUNDS; i++) {
    const s = randomText(80);
    assert.equal(ok(base64Decode(ok(base64Encode(s)).text)).text, s);
  }
});

test("round trip: URL component encoding preserves any text", () => {
  for (let i = 0; i < ROUNDS; i++) {
    const s = randomText(80);
    assert.equal(ok(urlDecode(ok(urlEncode(s)).text)).text, s);
  }
});

test("round trip: HTML entities preserve any text", () => {
  for (let i = 0; i < ROUNDS; i++) {
    const s = randomText(80);
    assert.equal(ok(c.htmlDecode(ok(c.htmlEncode(s)).text)).text, s);
  }
});

test("round trip: Unicode escapes preserve any text", () => {
  for (let i = 0; i < ROUNDS; i++) {
    const s = randomText(80);
    assert.equal(ok(c.unicodeUnescape(ok(c.unicodeEscape(s)).text)).text, s);
  }
});

test("round trip: hex and binary preserve any text", () => {
  for (let i = 0; i < ROUNDS; i++) {
    const s = randomText(40);
    assert.equal(ok(c.hexToText(ok(c.textToHex(s)).text)).text, s);
    assert.equal(ok(c.binaryToText(ok(c.textToBinary(s)).text)).text, s);
  }
});

test("round trip: string escape preserves any text", () => {
  for (let i = 0; i < ROUNDS; i++) {
    const s = randomText(80);
    assert.equal(ok(c.stringUnescape(ok(c.stringEscape(s)).text)).text, s);
    assert.equal(ok(unescapeJsonString(escapeJsonString(s))).text, s);
  }
});

test("round trip: JSON format and minify keep the same document", () => {
  for (let i = 0; i < 50; i++) {
    const value = { s: randomText(30), n: randomInt(1000), arr: [randomText(10), null, true] };
    const text = JSON.stringify(value);
    assert.deepEqual(JSON.parse(ok(formatJson(text)).text), value);
    assert.deepEqual(JSON.parse(ok(minifyJson(ok(formatJson(text)).text)).text), value);
  }
});

test("round trip: a document compares equal to its own formatted copy", () => {
  const value = { a: [1, { b: "x" }], c: null };
  assert.deepEqual(compareJson(value, JSON.parse(ok(formatJson(JSON.stringify(value))).text)), []);
});

test("deeply nested JSON (depth 400) formats and compares", () => {
  let nested: unknown = "leaf";
  for (let i = 0; i < 400; i++) nested = { k: nested };
  const text = JSON.stringify(nested);
  assert.ok(ok(formatJson(text)).text.length > text.length);
  assert.deepEqual(compareJson(nested, JSON.parse(text)), []);
});

test("CSV round trip with commas, quotes and newlines in fields", () => {
  const rows = [
    { a: "x,y", b: 'say "hi"', c: "line1\nline2" },
    { a: "plain", b: "", c: "日本" }
  ];
  const csv = ok(jsonToCsv(JSON.stringify(rows))).text;
  assert.deepEqual(JSON.parse(ok(csvToJson(csv)).text), rows);
});

test("diff round trip: applying the diff's added/equal lines rebuilds the right side", () => {
  for (let i = 0; i < 50; i++) {
    const left = Array.from({ length: randomInt(0, 30) }, () => randomText(6)).join("\n");
    const right = Array.from({ length: randomInt(0, 30) }, () => randomText(6)).join("\n");
    const lines = diffLines(left, right);
    const rebuilt = lines.filter((l) => l.kind !== "removed").map((l) => l.text);
    const expected = right === "" ? [] : right.split(/\r?\n/);
    assert.deepEqual(rebuilt, expected);
    const s = diffSummary(lines);
    assert.equal(s.equal + s.removed, left === "" ? 0 : left.split(/\r?\n/).length);
  }
});

test("large diff input (3000 lines per side) finishes quickly", () => {
  const a = Array.from({ length: 3000 }, (_, i) => `line ${i}`).join("\n");
  const b = Array.from({ length: 3000 }, (_, i) => (i % 100 === 0 ? `changed ${i}` : `line ${i}`)).join("\n");
  const start = Date.now();
  const s = diffSummary(diffLines(a, b));
  const elapsed = Date.now() - start;
  assert.equal(s.removed, 30);
  assert.equal(s.added, 30);
  assert.ok(elapsed < 5000, `took ${elapsed} ms`);
});
