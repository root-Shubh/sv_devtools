import { test } from "node:test";
import * as assert from "node:assert/strict";
import { ToolState, KeyValueStore, MAX_RECENT } from "../state/toolState";

function memoryStore(): KeyValueStore {
  const data = new Map<string, unknown>();
  return {
    get: <T>(key: string, fallback: T) => (data.has(key) ? (data.get(key) as T) : fallback),
    update: async (key: string, value: unknown) => {
      data.set(key, value);
    }
  };
}

test("favourites toggle on and off", async () => {
  const s = new ToolState(memoryStore());
  await s.toggleFavorite("hash");
  assert.equal(s.isFavorite("hash"), true);
  await s.toggleFavorite("hash");
  assert.equal(s.isFavorite("hash"), false);
});

test("recent tools are most-recent-first, unique and capped", async () => {
  const s = new ToolState(memoryStore());
  for (const id of ["a", "b", "c", "d", "e", "f", "a"]) await s.markUsed(id);
  assert.deepEqual(s.getRecent(), ["a", "f", "e", "d", "c"]);
  assert.equal(s.getRecent().length, MAX_RECENT);
});

test("reset clears favourites and recent tools", async () => {
  const s = new ToolState(memoryStore());
  await s.toggleFavorite("uuid");
  await s.markUsed("hash");
  await s.reset();
  assert.deepEqual(s.getFavorites(), []);
  assert.deepEqual(s.getRecent(), []);
});
