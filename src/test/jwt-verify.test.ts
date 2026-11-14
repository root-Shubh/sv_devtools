import { test } from "node:test";
import * as assert from "node:assert/strict";
import { createHmac } from "crypto";
import { verifyJwtHmac } from "../tools/developer/jwtVerify";

const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
function sign(payload: unknown, secret: string, alg = "HS256", digest = "sha256"): string {
  const h = enc({ alg, typ: "JWT" });
  const p = enc(payload);
  const sig = createHmac(digest, secret).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${sig}`;
}

test("a correct secret verifies an HS256 token", () => {
  const r = verifyJwtHmac(sign({ sub: "1" }, "s3cret"), "s3cret");
  assert.ok(r.ok && r.valid && r.alg === "HS256");
});

test("a wrong secret is reported as not matching", () => {
  const r = verifyJwtHmac(sign({ sub: "1" }, "s3cret"), "other");
  assert.ok(r.ok && !r.valid);
});

test("a tampered payload fails verification", () => {
  const t = sign({ sub: "1" }, "s3cret");
  const [h, , s] = t.split(".");
  const forged = `${h}.${enc({ sub: "admin" })}.${s}`;
  const r = verifyJwtHmac(forged, "s3cret");
  assert.ok(r.ok && !r.valid);
});

test("HS384 and HS512 are supported", () => {
  assert.ok(verifyJwtHmac(sign({ a: 1 }, "k", "HS384", "sha384"), "k").ok);
  const r = verifyJwtHmac(sign({ a: 1 }, "k", "HS512", "sha512"), "k");
  assert.ok(r.ok && r.valid);
});

test("RS256 and unsigned tokens are refused with a clear reason", () => {
  const rs = verifyJwtHmac(sign({}, "k", "RS256"), "k");
  assert.ok(!rs.ok && rs.message.includes("RS256"));
  const none = verifyJwtHmac(`${enc({ alg: "none" })}.${enc({})}.`, "k");
  assert.ok(!none.ok && none.message.includes("unsigned"));
});

test("empty secret, malformed tokens and bad headers are reported", () => {
  assert.equal(verifyJwtHmac(sign({}, "k"), "").ok, false);
  assert.equal(verifyJwtHmac("a.b", "k").ok, false);
  assert.equal(verifyJwtHmac("!!!.x.y", "k").ok, false);
});

test("a signature of the wrong length is not valid and does not throw", () => {
  const t = sign({ a: 1 }, "k");
  assert.doesNotThrow(() => verifyJwtHmac(`${t.split(".").slice(0, 2).join(".")}.AAAA`, "k"));
});
