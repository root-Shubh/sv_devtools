import { test } from "node:test";
import * as assert from "node:assert/strict";
import { compareJson, compareJsonText } from "../tools/json/compare";

test("identical documents have no changes", () => {
  assert.deepEqual(compareJson({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }), []);
});

test("added, removed and changed keys are reported with paths", () => {
  const changes = compareJson({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 });
  assert.deepEqual(changes, [
    { kind: "changed", path: "$.b", from: 2, to: 3 },
    { kind: "added", path: "$.c", to: 4 }
  ]);
});

test("nested objects and arrays are compared by path", () => {
  const changes = compareJson({ u: { roles: ["a", "b"] } }, { u: { roles: ["a"] } });
  assert.deepEqual(changes, [{ kind: "removed", path: "$.u.roles[1]", from: "b" }]);
});

test("key order is ignored by default", () => {
  assert.deepEqual(compareJson({ a: 1, b: 2 }, { b: 2, a: 1 }), []);
});

test("key order is checked when orderSensitive is set", () => {
  const changes = compareJson({ a: 1, b: 2 }, { b: 2, a: 1 }, { orderSensitive: true });
  assert.equal(changes.length, 1);
  assert.equal(changes[0].kind, "changed");
});

test("null, false and zero differ from missing keys and each other", () => {
  assert.equal(compareJson({ a: null }, { a: false }).length, 1);
  assert.equal(compareJson({ a: 0 }, { a: "0" }).length, 1);
});

test("unusual keys are quoted in paths", () => {
  const changes = compareJson({ "my key": 1 }, { "my key": 2 });
  assert.equal(changes[0].path, '$["my key"]');
});

test("invalid text returns an error on the side that failed", () => {
  const r = compareJsonText("{", "{}");
  assert.ok(r.error && r.error.startsWith("Left side"));
  const r2 = compareJsonText("{}", "{");
  assert.ok(r2.error && r2.error.startsWith("Right side"));
});

test("empty side of a JSON comparison is reported by side", () => {
  const r = compareJsonText("", "{}");
  assert.ok(r.error && r.error.startsWith("Left side is empty"));
});
