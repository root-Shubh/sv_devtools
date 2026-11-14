import { test } from "node:test";
import * as assert from "node:assert/strict";
import { hashText, hashAll } from "../tools/generators/hash";

// Published test vectors for "abc".
test("matches known digests for abc", () => {
  const all = hashAll("abc");
  assert.equal(all.md5, "900150983cd24fb0d6963f7d28e17f72");
  assert.equal(all.sha1, "a9993e364706816aba3e25717850c26c9cd0d89d");
  assert.equal(all.sha256, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(all.sha512.slice(0, 16), "ddaf35a193617aba");
});

test("empty input has the known empty-string digest", () => {
  assert.equal(hashText("", "sha256"), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});

test("Unicode is hashed as UTF-8", () => {
  const { createHash } = require("crypto");
  const utf8Bytes = Buffer.from([0xc3, 0xa9]); // "é" in UTF-8
  assert.equal(hashText("é", "md5"), createHash("md5").update(utf8Bytes).digest("hex"));
});

test("large input hashes without error", () => {
  assert.equal(hashText("x".repeat(1_000_000), "sha256").length, 64);
});
