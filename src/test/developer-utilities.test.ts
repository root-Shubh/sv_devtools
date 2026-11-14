import { test } from "node:test";
import * as assert from "node:assert/strict";
import * as d from "../tools/developer/utilities";

test("cron: parses lists, ranges and steps and rejects bad fields", () => {
  const ok = d.parseCron("*/15 9-17 * * 1,5");
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.deepEqual(
      [...ok.value.minute].sort((a, b) => a - b),
      [0, 15, 30, 45]
    );
    assert.ok(ok.value.hour.has(9) && ok.value.hour.has(17) && !ok.value.hour.has(18));
    assert.deepEqual(
      [...ok.value.dow].sort((a, b) => a - b),
      [1, 5]
    );
  }
  assert.equal(d.parseCron("60 * * * *").ok, false);
  assert.equal(d.parseCron("* * * *").ok, false);
  assert.equal(d.parseCron("*/0 * * * *").ok, false);
});

test("cron: next runs are correct and in order (UTC-independent check via local time)", () => {
  const from = new Date(2026, 0, 1, 10, 7, 0); // local time, 10:07
  const r = d.nextRuns("0 */2 * * *", from, 3);
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual(
      r.runs.map((x) => [x.getHours(), x.getMinutes()]),
      [
        [12, 0],
        [14, 0],
        [16, 0]
      ]
    );
  }
});

test("cron: day-of-month and day-of-week combine with OR when both are restricted", () => {
  const from = new Date(2026, 0, 1, 0, 0, 0); // Thu 1 Jan 2026
  const r = d.nextRuns("0 0 15 * 1", from, 2); // 15th OR Monday
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.runs[0].getDate(), 5, "first Monday after 1 Jan 2026 is 5 Jan");
});

test("cron: describe gives a short plain-English summary", () => {
  assert.equal(d.describeCron("0 * * * *"), "At the start of every hour, every day.");
});

test("unix permissions convert between octal and symbolic", () => {
  assert.deepEqual(d.permsFromOctal("755"), { ok: true, text: "-rwxr-xr-x", symbolic: "-rwxr-xr-x" });
  assert.deepEqual(d.permsFromSymbolic("rw-r-----"), { ok: true, octal: "640" });
  assert.equal(d.permsFromOctal("9").ok, false);
  assert.equal(d.permsFromSymbolic("rwx").ok, false);
});

test("colours convert between HEX, RGB and HSL", () => {
  assert.deepEqual(d.hexToRgb("#f00"), { r: 255, g: 0, b: 0 });
  assert.deepEqual(d.hexToRgb("1A2B3C"), { r: 26, g: 43, b: 60 });
  assert.equal(d.hexToRgb("#ggg"), undefined);
  assert.equal(d.rgbToHex(255, 0, 128), "#FF0080");
  assert.deepEqual(d.rgbToHsl(255, 0, 0), { h: 0, s: 100, l: 50 });
  assert.deepEqual(d.rgbToHsl(128, 128, 128), { h: 0, s: 0, l: 50 });
});

test("SQL formatter puts clauses on their own lines and keeps strings intact", () => {
  const out = d.formatSql("select id, name from users where name = 'select from' and id > 1 order by id");
  assert.match(out, /^SELECT id, name\nFROM users\nWHERE name = 'select from'\n {2}AND id > 1\nORDER BY id$/);
});

test("SQL formatter handles joins", () => {
  const out = d.formatSql("select a from t left join u on t.id = u.id");
  assert.ok(out.includes("\nLEFT JOIN u\n  ON t.id = u.id") || out.includes("\nLEFT JOIN u\nON t.id = u.id"));
});
