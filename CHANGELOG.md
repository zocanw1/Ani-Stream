# Changelog

Semua perubahan penting AniStream dicatat di file ini.

## [Unreleased]

### Added

- Metadata route `robots.txt` untuk mengatur indexing crawler.
- Metadata route `sitemap.xml` untuk halaman publik utama.
- Security headers global, termasuk CSP, nosniff, frame protection, referrer policy, dan permissions policy.
- Server-side initial data dengan cache/revalidation untuk halaman Home, Popular, Batch, dan Search.
- Helper server `fetchAnimeApi()` untuk request API anime yang konsisten.
- Test production-readiness untuk SEO, security headers, dan server-rendered list pages.
- Dokumentasi alur kerja pengembangan dan rilis di `WORKFLOW.md`.

### Changed

- Komponen interaktif halaman list dipisahkan ke `components/pages` agar initial content dapat dirender dari server.

### Backup

- Git branch: `backup/pre-seo-security-20260612`.
- Working-tree patch: `C:\coding\backups\web-anime-20260612-before-seo-security.patch`.
