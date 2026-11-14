import { test } from "node:test";
import * as assert from "node:assert/strict";
import { timestampToDate, dateToTimestamp, formatUtc, formatInZone } from "../tools/encoding/timestamps";

test("seconds and milliseconds are detected by magnitude", () => {
  const s = timestampToDate("1700000000");
  assert.ok(s.ok);
  if (s.ok) {
    assert.equal(s.value.unit, "seconds");
    assert.equal(s.value.date.toISOString(), "2023-11-14T22:13:20.000Z");
  }
  const ms = timestampToDate("1700000000000");
  assert.ok(ms.ok);
  if (ms.ok) {
    assert.equal(ms.value.unit, "milliseconds");
    assert.equal(ms.value.date.toISOString(), "2023-11-14T22:13:20.000Z");
  }
});

test("zero and negative timestamps (before 1970) work", () => {
  const z = timestampToDate("0");
  assert.ok(z.ok && z.value.date.toISOString() === "1970-01-01T00:00:00.000Z");
  const neg = timestampToDate("-86400");
  assert.ok(neg.ok && neg.value.date.toISOString() === "1969-12-31T00:00:00.000Z");
});

test("invalid timestamp input is rejected", () => {
  assert.equal(timestampToDate("abc").ok, false);
  assert.equal(timestampToDate("").ok, false);
  assert.equal(timestampToDate("1e9").ok, false);
});

test("dates convert to seconds and milliseconds, with timezones honoured", () => {
  assert.deepEqual(dateToTimestamp("2023-11-14T22:13:20.000Z"), {
    ok: true,
    value: { seconds: 1700000000, milliseconds: 1700000000000 }
  });
  const withOffset = dateToTimestamp("2023-11-15T00:13:20+02:00");
  assert.ok(withOffset.ok && withOffset.value.seconds === 1700000000);
});

test("unparseable dates are reported", () => {
  assert.equal(dateToTimestamp("not a date").ok, false);
});

test("UTC formatting gives ISO and readable output", () => {
  const f = formatUtc(new Date(0));
  assert.equal(f.iso, "1970-01-01T00:00:00.000Z");
  assert.equal(f.readable, "1970-01-01 00:00:00 UTC");
});

test("zone formatting uses the requested zone", () => {
  const d = new Date("2023-11-14T22:13:20.000Z");
  assert.equal(formatInZone(d, "UTC"), "2023-11-14 22:13:20 (UTC)");
  assert.equal(formatInZone(d, "Asia/Kolkata"), "2023-11-15 03:43:20 (Asia/Kolkata)");
});
