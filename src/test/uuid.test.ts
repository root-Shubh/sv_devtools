import { test } from "node:test";
import * as assert from "node:assert/strict";
import { generateUuids, MAX_UUID_COUNT } from "../tools/generators/uuid";

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("generates valid v4 UUIDs by default", () => {
  for (const id of generateUuids({ count: 50 })) assert.match(id, V4);
});

test("generated values are unique", () => {
  const ids = generateUuids({ count: 100 });
  assert.equal(new Set(ids).size, ids.length);
});

test("uppercase and no-dash options apply", () => {
  const [id] = generateUuids({ count: 1, uppercase: true });
  assert.equal(id, id.toUpperCase());
  const [plain] = generateUuids({ count: 1, noDashes: true });
  assert.match(plain, /^[0-9a-f]{32}$/);
});

test("count is clamped to the allowed range", () => {
  assert.equal(generateUuids({ count: 0 }).length, 1);
  assert.equal(generateUuids({ count: 10000 }).length, MAX_UUID_COUNT);
});

test("injected source is used, lowercased", () => {
  assert.deepEqual(generateUuids({ count: 2 }, () => "ABCDEF01-2345-4678-9abc-def012345678"), [
    "abcdef01-2345-4678-9abc-def012345678",
    "abcdef01-2345-4678-9abc-def012345678"
  ]);
});
