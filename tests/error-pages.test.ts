import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(path, "utf8");
}

test("app provides branded loading, error, and not-found boundaries", () => {
  const errorPage = read("app/error.tsx");
  const loadingPage = read("app/loading.tsx");
  const notFoundPage = read("app/not-found.tsx");

  assert.match(errorPage, /^"use client";/);
  assert.match(errorPage, /reset\(\)/);
  assert.match(errorPage, /Coba Lagi/);
  assert.match(errorPage, /role="alert"/);

  assert.match(loadingPage, /role="status"/);
  assert.match(loadingPage, /Memuat/);

  assert.match(notFoundPage, /Halaman Tidak Ditemukan/);
  assert.match(notFoundPage, /Kembali ke Beranda/);
  assert.match(notFoundPage, /prefetch=\{false\}/);
});

test("anime detail routes send missing content to the custom not-found page", () => {
  for (const path of [
    "app/anime/[slug]/page.tsx",
    "app/anime/episode/[slug]/page.tsx",
    "app/otakudesu/anime/[slug]/page.tsx",
    "app/otakudesu/episode/[slug]/page.tsx",
  ]) {
    const source = read(path);

    assert.match(source, /notFound\(\)/);
    assert.doesNotMatch(source, /Gagal Memuat Data|Gagal Memuat Episode/);
  }
});
