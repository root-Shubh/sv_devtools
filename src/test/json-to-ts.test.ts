import { test } from "node:test";
import * as assert from "node:assert/strict";
import { jsonToTypeScript } from "../tools/json/toTs";

function ts(json: string, root = "Root"): string {
  const r = jsonToTypeScript(json, root);
  assert.ok(r.ok, r.ok ? "" : r.message);
  return r.ok ? r.text : "";
}

test("primitive fields map to TypeScript types", () => {
  const out = ts('{"name":"a","age":3,"active":true}');
  assert.match(out, /name: string;/);
  assert.match(out, /age: number;/);
  assert.match(out, /active: boolean;/);
});

test("nested objects get their own interface", () => {
  const out = ts('{"user":{"id":1}}');
  assert.match(out, /export interface User \{\n  id: number;\n\}/);
  assert.match(out, /user: User;/);
});

test("null values are nullable", () => {
  assert.match(ts('{"x":[null,"a"]}'), /x: \(null \| string\)\[\];/);
});

test("keys missing from some array items become optional", () => {
  const out = ts('{"items":[{"a":1,"b":"x"},{"a":2}]}');
  assert.match(out, /a: number;/);
  assert.match(out, /b\?: string;/);
});

test("arrays of mixed primitives become unions", () => {
  assert.match(ts('{"v":[1,"x"]}'), /v: \(number \| string\)\[\];/);
});

test("keys that are not identifiers are quoted", () => {
  assert.match(ts('{"my-key":1}'), /"my-key": number;/);
});

test("root array of objects produces an array type", () => {
  const out = ts('[{"id":1}]', "Items");
  assert.match(out, /export type Items = Item\[\];/);
});

test("invalid JSON reports an error", () => {
  assert.equal(jsonToTypeScript("{").ok, false);
});
