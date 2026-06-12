import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getAuthRateLimitPolicies, getClientAddress } from "../lib/auth-rate-limit";

test("uses the first forwarded address for auth throttling", () => {
  const request = new Request("https://anistream.test/api/auth/login", {
    headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.2" },
  });

  assert.equal(getClientAddress(request), "203.0.113.10");
});

test("login has both IP and account rate-limit policies", () => {
  const policies = getAuthRateLimitPolicies("login", "203.0.113.10", "USER@example.com");

  assert.equal(policies.length, 2);
  assert.ok(policies.every((policy) => policy.limit > 0 && policy.windowSeconds > 0));
  assert.notEqual(policies[0].key, policies[1].key);
});

test("registration is restricted per client address", () => {
  const policies = getAuthRateLimitPolicies("register", "203.0.113.10", "user@example.com");

  assert.equal(policies.length, 1);
  assert.equal(policies[0].limit, 5);
});

test("auth endpoints return retry guidance when throttled", () => {
  for (const path of ["app/api/auth/login/route.ts", "app/api/auth/register/route.ts"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /checkAuthRateLimit/);
    assert.match(source, /status: 429/);
    assert.match(source, /"Retry-After"/);
  }
});
