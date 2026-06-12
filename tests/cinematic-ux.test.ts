import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("global shell provides accessible cinematic navigation", () => {
  const layout = read("app/layout.tsx");
  const css = read("app/globals.css");

  assert.match(layout, /Lewati ke konten/i);
  assert.match(layout, /MobileDock/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

test("home implements the selected Cinematic Focus experience", () => {
  const home = read("components/pages/HomePageClient.tsx");

  assert.match(home, /ContinueWatchingShelf/);
  assert.match(home, /id="jadwal-rilis"/);
  assert.match(home, /Detail Anime/);
  assert.match(home, /aria-pressed/);
  assert.match(home, /Jeda carousel|Putar carousel/);
});

test("shared anime cards support keyboard and touch interaction", () => {
  const card = read("components/common/AnimeCard.tsx");

  assert.match(card, /Play/);
  assert.match(card, /focus-visible/);
  assert.doesNotMatch(card, /<svg/);
});

test("navigation uses product icons instead of handwritten svg", () => {
  for (const path of [
    "app/layout.tsx",
    "components/NavbarSearch.tsx",
    "components/NavbarLinks.tsx",
    "components/AuthMenu.tsx",
  ]) {
    assert.doesNotMatch(read(path), /<svg/);
  }
});
