# Alur Kerja AniStream

## Pengembangan

1. Buat branch perubahan dari `main`.
2. Jalankan `npm install` jika dependency berubah.
3. Kerjakan perubahan pada route, komponen, atau library terkait.
4. Tambahkan atau perbarui test untuk perilaku yang berubah.
5. Jalankan `npm test`.
6. Jalankan `npm run build`.
7. Periksa `git diff` agar file lokal dan rahasia tidak ikut ter-commit.
8. Commit dan push branch setelah verifikasi berhasil.

## Data Anime

- Initial data halaman utama, populer, batch, dan pencarian diambil di Server Component.
- Request server menggunakan `fetchAnimeApi()` dan cache Next.js melalui `revalidate`.
- Interaksi setelah halaman terbuka, seperti pagination, tetap dijalankan oleh Client Component.
- Jika API utama gagal, halaman menampilkan state error tanpa merusak shell aplikasi.

## SEO dan Keamanan

- Perbarui daftar route publik di `app/sitemap.ts` saat menambah halaman utama baru.
- Route akun, API, dan history tidak dimasukkan ke indeks melalui `app/robots.ts`.
- Security headers dikelola terpusat di `next.config.ts`.
- Jika menambah domain API, gambar, media, atau iframe, domain tersebut harus ditambahkan secara terbatas ke CSP.
- Login dibatasi per alamat dan akun, sedangkan registrasi dibatasi per alamat melalui tabel `auth_rate_limits`.
- Player pihak ketiga wajib memakai sandbox dan referrer policy; penambahan izin iframe harus sesempit mungkin.
- Iframe streaming tidak diberi izin fullscreen langsung. Fullscreen mobile dikendalikan melalui `MobileFullscreenPlayer` agar orientasi landscape dan tombol keluar tetap konsisten.
- Mode kunci fullscreen wajib memblokir semua sentuhan ke iframe; pengguna harus membuka kunci sebelum mengakses kontrol atau keluar fullscreen.
- Kontrol UI yang belum memiliki perilaku lengkap tidak boleh ditampilkan ke pengguna.

## Rilis

1. Pastikan test dan build berhasil.
2. Push ke repository GitHub.
3. Tunggu deployment Vercel selesai.
4. Verifikasi `/`, `/robots.txt`, `/sitemap.xml`, `/popular`, `/batch`, dan pencarian di URL production.

## UX dan Visual QA

1. Gunakan `docs/ux-audit/selected-cinematic-focus.png` sebagai visual target homepage.
2. Periksa desktop pada viewport 1440 x 1024 dan mobile pada 390 x 844.
3. Pastikan lebar dokumen mobile sama dengan lebar viewport dan tidak ada horizontal page overflow.
4. Uji keyboard focus, shortcut pencarian, carousel pause, mobile dock, login, dan Continue Watching.
5. Perbarui `design-qa.md` serta screenshot di `docs/ux-audit` jika tampilan utama berubah.
6. Gunakan `docs/ux-audit/UX_KPI_FRAMEWORK.md` saat analytics produk mulai dipasang.
7. Pada perangkat mobile, uji tombol fullscreen player, orientation lock landscape, tombol kunci, tombol keluar kanan bawah, dan pastikan double tap tidak menutup fullscreen.
