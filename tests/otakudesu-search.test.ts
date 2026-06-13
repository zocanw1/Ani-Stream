import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("Otakudesu search is fetched on the server through the documented keyword endpoint", () => {
  const page = read("app/otakudesu/search/page.tsx");

  assert.doesNotMatch(page, /^"use client";/);
  assert.match(page, /fetchAnimeApi/);
  assert.match(page, /\/search\/\$\{encodeURIComponent\(query\)\}/);
  assert.doesNotMatch(page, /useEffect|useSearchParams/);
  assert.doesNotMatch(page, /fetch\(`https:\/\/www\.sankavollerei\.com/);
});

test("navbar sends Otakudesu queries to the Otakudesu search route", () => {
  const navbar = read("components/NavbarSearch.tsx");

  assert.match(navbar, /pathname\.startsWith\("\/otakudesu"\)/);
  assert.match(navbar, /"\/otakudesu\/search"/);
  assert.match(navbar, /encodeURIComponent\(normalized\)/);
});

test("workflow documents the complete Otakudesu search data flow", () => {
  const workflow = read("WORKFLOW.md");

  assert.match(workflow, /## Pencarian Otakudesu/);
  assert.match(workflow, /\/otakudesu\/search\?q=/);
  assert.match(workflow, /\/anime\/search\/:keyword/);
  assert.match(workflow, /data\.animeList/);
});
