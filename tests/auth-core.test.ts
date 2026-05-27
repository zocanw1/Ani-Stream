import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, isValidEmail, isValidPassword, normalizeEmail, verifyPassword } from "../lib/auth-core";

test("normalizes email before account lookup", () => {
  assert.equal(normalizeEmail("  USER@Example.COM "), "user@example.com");
});

test("validates basic email and password rules", () => {
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("bad-email"), false);
  assert.equal(isValidPassword("123456"), true);
  assert.equal(isValidPassword("12345"), false);
});

test("hashes passwords and rejects the wrong password", async () => {
  const hash = await hashPassword("secret123");

  assert.notEqual(hash, "secret123");
  assert.equal(await verifyPassword("secret123", hash), true);
  assert.equal(await verifyPassword("wrong123", hash), false);
});
