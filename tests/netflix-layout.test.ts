import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("global theme uses a Netflix-style dark streaming palette", () => {
  const css = read("app/globals.css");

  assert.match(css, /--netflix-red:\s*#e50914/i);
  assert.match(css, /--netflix-black:\s*#050505/i);
  assert.match(css, /background:\s*var\(--netflix-black\)/i);
  assert.doesNotMatch(css, /radial-gradient\(rgba\(108,\s*92,\s*231/i);
});

test("site shell uses dark streaming navigation and brand treatment", () => {
  const layout = read("app/layout.tsx");

  assert.match(layout, /bg-gradient-to-b from-black\/95/i);
  assert.match(layout, /text-\[#E50914\]/);
  assert.match(layout, /AniStream/);
  assert.doesNotMatch(layout, /border-b-\[3px\] border-\[#1E1B29\]/);
});

test("history pages render as Netflix-style continue watching shelves", () => {
  const history = read("app/history/page.tsx");
  const episodes = read("app/history/episodes/page.tsx");

  assert.match(history, /Continue Watching/i);
  assert.match(history, /bg-\[#141414\]/);
  assert.match(episodes, /Episode Timeline/i);
  assert.match(episodes, /bg-\[#141414\]/);
});
