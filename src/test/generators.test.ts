import { test } from "node:test";
import * as assert from "node:assert/strict";
import {
  randomString,
  generatePassword,
  loremIpsum,
  sampleJson,
  sqlInserts,
  CHARSETS
} from "../tools/generators/generators";

test("random string uses only the charset and the requested length", () => {
  const s = randomString(64, CHARSETS.hex);
  assert.equal(s.length, 64);
  assert.match(s, /^[0-9a-f]+$/);
});

test("random string rejects an empty charset and clamps length", () => {
  assert.throws(() => randomString(5, ""), RangeError);
  assert.equal(randomString(0, "ab").length, 1);
});

test("password satisfies every enabled class", () => {
  for (let i = 0; i < 50; i++) {
    const p = generatePassword({ length: 12, upper: true, lower: true, digits: true, symbols: true });
    assert.equal(typeof p, "string");
    if (typeof p === "string") {
      assert.equal(p.length, 12);
      assert.match(p, /[A-Z]/);
      assert.match(p, /[a-z]/);
      assert.match(p, /[0-9]/);
      assert.match(p, /[!@#$%^&*()\-_=+[\]{};:,.?/]/);
    }
  }
});

test("password options are validated", () => {
  const none = generatePassword({ length: 10, upper: false, lower: false, digits: false, symbols: false });
  assert.ok(typeof none === "object" && "error" in none);
  const tooShort = generatePassword({ length: 2, upper: true, lower: true, digits: true, symbols: false });
  assert.ok(typeof tooShort === "object" && "error" in tooShort);
  const tooLong = generatePassword({ length: 300, upper: true, lower: false, digits: false, symbols: false });
  assert.ok(typeof tooLong === "object" && "error" in tooLong);
});

test("lorem ipsum has the requested word count and starts capitalised", () => {
  const text = loremIpsum(20);
  assert.equal(text.replace(/\.$/, "").split(" ").length, 20);
  assert.match(text, /^Lorem ipsum dolor/);
  assert.ok(text.endsWith("."));
});

test("sample JSON follows the field spec", () => {
  const r = sampleJson("id:int, name:string, active:bool, created:date, ref:uuid, price:float", 3);
  assert.ok(r.ok);
  if (r.ok) {
    const rows = JSON.parse(r.text);
    assert.equal(rows.length, 3);
    assert.equal(typeof rows[0].id, "number");
    assert.equal(typeof rows[0].active, "boolean");
    assert.match(rows[0].created, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(rows[0].ref, /^[0-9a-f-]{36}$/);
  }
});

test("sample JSON rejects unknown types and bad names", () => {
  assert.equal(sampleJson("x:blob", 1).ok, false);
  assert.equal(sampleJson("1bad:int", 1).ok, false);
  assert.equal(sampleJson("", 1).ok, false);
});

test("SQL INSERT quotes, escapes and types values", () => {
  const r = sqlInserts("users", '[{"name":"O\'Brien","age":30,"active":true,"note":null}]');
  assert.deepEqual(r, {
    ok: true,
    text: "INSERT INTO users (name, age, active, note) VALUES\n  ('O''Brien', 30, TRUE, NULL);"
  });
});

test("SQL INSERT fills missing columns with NULL and validates input", () => {
  const r = sqlInserts("t", '[{"a":1},{"b":"x"}]');
  assert.ok(r.ok && r.text.includes("(1, NULL)") && r.text.includes("(NULL, 'x')"));
  assert.equal(sqlInserts("bad name", "[]").ok, false);
  assert.equal(sqlInserts("t", "[1]").ok, false);
  assert.equal(sqlInserts("t", "{").ok, false);
});

test("SQL INSERT with empty input gives the shared message", () => {
  const r = sqlInserts("t", "");
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.message, /Nothing to process/);
});
