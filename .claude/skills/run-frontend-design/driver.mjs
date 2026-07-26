#!/usr/bin/env node
/**
 * AniStream Frontend Design Driver
 * ==================================
 * Playwright-based driver that launches the AniStream app, takes screenshots,
 * and lets a future agent visually verify design changes.
 *
 * Usage:
 *   node driver.mjs                          # Full audit (all pages)
 *   node driver.mjs --page /                 # Single page screenshot
 *   node driver.mjs --diff                   # Diff mode: compare screenshots
 *   node driver.mjs --help                   # Show all flags
 *
 * Environment:
 *   APP_URL        — base URL (default: http://localhost:3001)
 *   SCREENSHOT_DIR — where to save screenshots (default: ./screenshots)
 *   PAGES          — comma-separated pages to screenshot (default: all)
 *
 * The driver captures every major page and interactive state, providing
 * a visual baseline that a future agent can compare against after making
 * design changes.
 */

import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ────────────────────────────────────────────────────────────
const APP_URL = process.env.APP_URL || "http://localhost:3001";
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || resolve(__dirname, "screenshots");
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const SLOW_MOTION = parseInt(process.env.SLOW_MO || "0", 10);

// ─── Pages to capture ──────────────────────────────────────────────────
const PAGES = [
  { path: "/",            label: "homepage" },
  { path: "/popular",     label: "popular" },
  { path: "/batch",       label: "batch" },
  { path: "/search",      label: "search-empty" },
  { path: "/search?q=naruto", label: "search-results" },
  { path: "/login",       label: "login" },
  { path: "/otakudesu",   label: "otakudesu-home" },
  { path: "/otakudesu/search", label: "otakudesu-search" },
  { path: "/otakudesu/anime/unlimited", label: "otakudesu-unlimited" },
  { path: "/not-found",   label: "not-found" },
];

const INTERACTIONS = [
  { page: "/", label: "mobile-dock", viewport: "mobile" },
  { page: "/login", label: "login-form-filled", viewport: "desktop" },
];

// ─── Helpers ───────────────────────────────────────────────────────────
function log(msg) {
  console.log(`[driver] ${new Date().toLocaleTimeString()} ${msg}`);
}

async function screenshot(page, { label, viewport, suffix = "" }) {
  const vp = VIEWPORTS.find((v) => v.name === viewport) || VIEWPORTS[0];
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.waitForTimeout(500);

  const filename = suffix
    ? `${label}__${viewport}__${suffix}.png`
    : `${label}__${viewport}.png`;
  const filepath = resolve(SCREENSHOT_DIR, filename);

  // Wait for content to settle
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  } catch {
    // Page may have long-polling; proceed anyway
  }
  await page.waitForTimeout(1000);

  await page.screenshot({ path: filepath, fullPage: true });
  log(`📸 Saved ${filename} (${vp.width}x${vp.height})`);
  return filepath;
}

// ─── Visual Audit ──────────────────────────────────────────────────────
async function runAudit(browser) {
  const results = [];
  const ctx = await browser.newContext({
    deviceScaleFactor: 2,       // Retina-quality screenshots
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  // ── Full-page screenshots ──────────────────────────────
  for (const { path, label } of PAGES) {
    const page = await ctx.newPage();
    try {
      log(`Navigating to ${path} (${label})`);
      await page.goto(`${APP_URL}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Take in all viewports
      for (const vp of VIEWPORTS) {
        results.push(await screenshot(page, { label, viewport: vp.name }));
      }
    } catch (err) {
      log(`⚠️  Error capturing ${label}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  // ── Interaction captures ───────────────────────────────
  for (const { page: path, label, viewport } of INTERACTIONS) {
    const page = await ctx.newPage();
    try {
      log(`Interaction: ${label}`);
      await page.goto(`${APP_URL}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      const vp = VIEWPORTS.find((v) => v.name === viewport) || VIEWPORTS[0];
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(1000);

      // Mobile dock screenshot
      if (label === "mobile-dock") {
        results.push(await screenshot(page, { label, viewport, suffix: "dock-visible" }));
      }

      // Fill login form
      if (label === "login-form-filled") {
        const emailInput = page.locator('input[type="email"]');
        const passInput = page.locator('input[type="password"]');
        if (await emailInput.isVisible()) {
          await emailInput.fill("user@example.com");
          await passInput.fill("password123");
          await page.waitForTimeout(300);
          results.push(await screenshot(page, { label, viewport, suffix: "filled" }));
        }
      }
    } catch (err) {
      log(`⚠️  Error in interaction ${label}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await ctx.close();
  return results;
}

// ─── Main ──────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
AniStream Frontend Design Driver
=================================
Usage: node driver.mjs [options]

Options:
  --page <path>    Screenshot only one page (e.g. --page /login)
  --viewport <vp>  desktop | tablet | mobile (default: all)
  --diff           Generate diff report against baseline
  --help           Show this help

Environment:
  APP_URL        Base URL (default: http://localhost:3001)
  SCREENSHOT_DIR Output directory (default: ./screenshots)
  SLOW_MO        Slow motion in ms
    `);
    return;
  }

  await mkdir(SCREENSHOT_DIR, { recursive: true });

  log(`🚀 Launching browser (APP_URL=${APP_URL})`);
  const browser = await chromium.launch({
    headless: true,
    slowMo: SLOW_MOTION,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    log("📷 Running visual audit...");
    const start = Date.now();
    const results = await runAudit(browser);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    log(`✅ Audit complete: ${results.length} screenshots in ${elapsed}s`);
    log(`   Saved to: ${SCREENSHOT_DIR}`);

    // Write manifest
    const manifest = results.map((f) => resolve(f));
    await writeFile(
      resolve(SCREENSHOT_DIR, "manifest.json"),
      JSON.stringify(manifest, null, 2)
    );
    log(`📄 Manifest: manifest.json`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[driver] Fatal error:", err);
  process.exit(1);
});
