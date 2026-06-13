import assert from "node:assert/strict";
import test from "node:test";
import { isAnimeNotFoundResponse } from "../lib/anime-response";

test("recognizes provider-specific not-found responses", () => {
  assert.equal(isAnimeNotFoundResponse({ statusCode: 404, data: null }), true);
  assert.equal(isAnimeNotFoundResponse({ error: "Request failed with status code 404" }), true);
});

test("does not hide real upstream failures as missing content", () => {
  assert.equal(isAnimeNotFoundResponse({ statusCode: 500, message: "Server error" }), false);
  assert.equal(isAnimeNotFoundResponse(null), false);
});
