import { test } from "node:test";
import * as assert from "node:assert/strict";
import { TOOLS, CATEGORIES } from "../tools/registry";
import { CATEGORY_ICONS, TOOL_ICONS } from "../views/icons";

test("every tool has an icon", () => {
  const missing = TOOLS.map((t) => t.id).filter((id) => !TOOL_ICONS[id]);
  assert.deepEqual(missing, []);
});

test("every category has an icon", () => {
  for (const c of CATEGORIES) assert.ok(CATEGORY_ICONS[c.id], `no icon for ${c.id}`);
});
