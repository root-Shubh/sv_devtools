import { test } from "node:test";
import * as assert from "node:assert/strict";
import { LIBRARY } from "../tools/regex/library";

for (const entry of LIBRARY) {
  test(`library pattern "${entry.label}" compiles and matches its examples`, () => {
    const re = new RegExp(entry.pattern, entry.flags);
    for (const v of entry.valid) assert.ok(re.test(v), `expected valid: ${v}`);
    for (const i of entry.invalid) assert.ok(!re.test(i), `expected invalid: ${i}`);
  });
}

test("library ids are unique", () => {
  const ids = LIBRARY.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});
