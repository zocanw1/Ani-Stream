import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("publishes valid robots and sitemap metadata routes", () => {
  const robots = read("app/robots.ts");
  const sitemap = read("app/sitemap.ts");

  assert.match(robots, /MetadataRoute\.Robots/);
  assert.match(robots, /sitemap/);
  assert.match(sitemap, /MetadataRoute\.Sitemap/);
  assert.match(sitemap, /\/popular/);
  assert.match(sitemap, /\/batch/);
});

test("configures baseline production security headers", () => {
  const config = read("next.config.ts");

  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /Referrer-Policy/);
  assert.match(config, /Permissions-Policy/);
  assert.match(config, /X-Frame-Options/);
});

test("important list routes render initial API data on the server with revalidation", () => {
  for (const route of ["app/page.tsx", "app/popular/page.tsx", "app/batch/page.tsx", "app/search/page.tsx"]) {
    const source = read(route);
    assert.doesNotMatch(source, /^"use client";/, `${route} must remain a server component`);
    assert.match(source, /export const revalidate\s*=|revalidate:/, `${route} must cache upstream API data`);
  }
});

test("deploys Vercel Functions in Singapore", () => {
  const config = JSON.parse(read("vercel.json")) as { regions?: string[] };

  assert.deepEqual(config.regions, ["sin1"]);
});
