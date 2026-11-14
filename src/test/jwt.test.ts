import { test } from "node:test";
import * as assert from "node:assert/strict";
import { decodeJwt, claimDates } from "../tools/developer/jwt";

const b64url = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
const token = (payload: unknown, header: unknown = { alg: "HS256", typ: "JWT" }) => `${b64url(header)}.${b64url(payload)}.c2ln`;

test("decodes header and payload", () => {
  const r = decodeJwt(token({ sub: "42", name: "ann" }), new Date(0));
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual(r.value.header, { alg: "HS256", typ: "JWT" });
    assert.deepEqual(r.value.payload, { sub: "42", name: "ann" });
    assert.equal(r.value.signature, "c2ln");
  }
});

test("always states that the signature is not verified", () => {
  const r = decodeJwt(token({}), new Date(0));
  assert.ok(r.ok && r.value.notes[0].includes("NOT verified"));
});

test("flags expired and not-yet-valid tokens against a given time", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const expired = decodeJwt(token({ exp: 1000 }), now);
  assert.ok(expired.ok && expired.value.notes.some((n) => n.startsWith("Expired")));
  const future = decodeJwt(token({ nbf: 4102444800 }), now);
  assert.ok(future.ok && future.value.notes.some((n) => n.startsWith("Not valid before")));
});

test("alg none is flagged", () => {
  const r = decodeJwt(token({}, { alg: "none" }), new Date(0));
  assert.ok(r.ok && r.value.notes.some((n) => n.includes("unsigned")));
});

test("Bearer prefix and surrounding whitespace are accepted", () => {
  assert.ok(decodeJwt("  Bearer " + token({ a: 1 }) + "  ", new Date(0)).ok);
});

test("malformed tokens are reported", () => {
  assert.equal(decodeJwt("only.two").ok, false);
  assert.equal(decodeJwt("!!!.!!!.x").ok, false);
  assert.equal(decodeJwt(`${b64url("str")}.${b64url({})}.x`).ok, false, "header must be an object");
});

test("claim dates are shown as ISO strings", () => {
  assert.deepEqual(claimDates({ iat: 0, exp: 60, other: 1 }), {
    iat: "1970-01-01T00:00:00.000Z",
    exp: "1970-01-01T00:01:00.000Z"
  });
});
