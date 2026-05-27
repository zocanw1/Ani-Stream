import assert from "node:assert/strict";
import test from "node:test";
import { normalizeNextPath } from "../lib/navigation";

test("keeps safe internal next path", () => {
  assert.equal(normalizeNextPath("/history/episodes"), "/history/episodes");
});

test("rejects external and malformed next path", () => {
  assert.equal(normalizeNextPath("https://example.com"), "/");
  assert.equal(normalizeNextPath("//example.com/path"), "/");
  assert.equal(normalizeNextPath("history"), "/");
});
