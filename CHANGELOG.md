# Changelog

Semua perubahan penting AniStream dicatat di file ini.

## [Unreleased]

### Added

- Halaman loading, error, dan 404 khusus AniStream, termasuk tombol mencoba ulang untuk gangguan API.
- Metadata route `robots.txt` untuk mengatur indexing crawler.
- Metadata route `sitemap.xml` untuk halaman publik utama.
- Security headers global, termasuk CSP, nosniff, frame protection, referrer policy, dan permissions policy.
- Server-side initial data dengan cache/revalidation untuk halaman Home, Popular, Batch, dan Search.
- Helper server `fetchAnimeApi()` untuk request API anime yang konsisten.
- Test production-readiness untuk SEO, security headers, dan server-rendered list pages.
- Dokumentasi alur kerja pengembangan dan rilis di `WORKFLOW.md`.
- Rate limit berbasis database untuk login dan registrasi, termasuk respons `429` dan header `Retry-After`.
- Sandbox, referrer policy, dan izin media terbatas pada iframe player.
- Test untuk rate limit autentikasi dan hardening player.
- Mobile bottom navigation, skip link, carousel pause control, dan focus state global.
- Continue Watching shelf yang terhubung ke riwayat akun.
- Dokumentasi desain, visual QA, screenshot desktop/mobile, dan kerangka KPI UX.
- Lucide React untuk ikon antarmuka yang konsisten.
- Kontrol fullscreen player khusus mobile dengan orientasi landscape otomatis dan fallback rotasi CSS.
- Test regresi untuk fullscreen mobile, orientation lock, dan pencegahan fullscreen bawaan iframe.
- Tombol kunci fullscreen untuk memblokir sentuhan pada iframe agar video tidak ter-pause atau terganggu kontrol player.

### Changed

- Pencarian Otakudesu sekarang dijalankan melalui Server Component memakai endpoint `/anime/search/:keyword`, sehingga tidak lagi gagal akibat redirect domain API dan CSP browser.
- Komponen interaktif halaman list dipisahkan ke `components/pages` agar initial content dapat dirender dari server.
- Gambar poster pada halaman besar dan history menggunakan `next/image`.
- Masalah ESLint pada source aplikasi telah dibersihkan.
- Global shell, homepage, kartu anime, login, dan account menu didesain ulang mengikuti konsep Cinematic Focus.
- Homepage kini memakai hero yang lebih ringkas, jadwal horizontal, Top 10 rail, serta tiga katalog padat.
- Responsivitas mobile diperbaiki agar tidak menghasilkan horizontal page overflow.
- Player Samehadaku dan Otakudesu sekarang memakai satu kontrol fullscreen milik AniStream; double tap pada player tidak lagi mengaktifkan atau menutup fullscreen.
- Saat player dikunci, interaksi video ditutup oleh interaction shield dan tombol fullscreen disembunyikan sampai kunci dibuka.
- Iframe streaming tidak lagi memakai atribut `sandbox` agar provider Otakudesu seperti Desustream dapat memutar video.
- Vercel Functions dipindahkan dari Washington, D.C. (`iad1`) ke Singapura (`sin1`).
- History kini dapat difilter terpisah antara Samehadaku dan Otakudesu tanpa memisahkan akun pengguna.
- Episode langsung disimpan saat halaman tontonan dibuka, termasuk ketika pengguna berhenti di tengah episode.
- Progress video hanya disimpan dan ditampilkan jika iframe provider mengirim posisi player asli; AniStream tidak membuat estimasi dari lamanya halaman terbuka.
- Navigasi Otakudesu kini mengikuti Samehadaku dengan menonaktifkan prefetch otomatis agar halaman detail tidak memicu banyak request episode dan API yang belum dibuka pengguna.
- Halaman detail anime dan episode kini membedakan konten yang tidak ditemukan dari gangguan server API.

### Removed

- Tombol Favorite di hero yang belum memiliki penyimpanan atau alur pengguna yang lengkap.

### Backup

- Git branch: `backup/pre-seo-security-20260612`.
- Working-tree patch: `C:\coding\backups\web-anime-20260612-before-seo-security.patch`.
- Git branch lanjutan: `backup/pre-auth-lint-media-20260612`.
- Working-tree patch lanjutan: `C:\coding\backups\web-anime-20260612-before-auth-lint-media.patch`.
- Git branch redesign: `backup/pre-cinematic-ux-20260612`.
- Working-tree patch redesign: `C:\coding\backups\web-anime-20260612-before-cinematic-ux.patch`.
