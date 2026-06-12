# Source History and Watch Progress Design

## Goal

Pisahkan history Samehadaku dan Otakudesu tanpa memisahkan akun, lalu simpan aktivitas menonton yang lebih nyata daripada sekadar mencatat episode yang dibuka.

## Scope

- Akun dan sesi login tetap satu.
- Data history tetap berada dalam tabel yang sama dan dibedakan memakai kolom `source`.
- Halaman history per anime dan per episode mendapatkan pilihan sumber:
  - Semua
  - Samehadaku
  - Otakudesu
- Filter sumber disimpan di URL melalui query `source`, sehingga dapat dibuka ulang dan dibagikan.
- Aktivitas menonton direkam berkala selama halaman aktif.
- Posisi asli player dipakai jika iframe provider mengirim data yang valid melalui `postMessage`.
- Jika provider tidak menyediakan posisi asli, aplikasi memakai durasi menonton aktif sebagai fallback.

## Data Model

Kolom berikut ditambahkan ke `watch_history` dan `watch_history_events`:

- `watched_seconds`: posisi atau estimasi waktu yang sudah ditonton.
- `duration_seconds`: durasi video jika diketahui.
- `progress_percent`: persentase progres yang sudah dinormalisasi.
- `progress_source`: `player` untuk data iframe asli atau `estimated` untuk heartbeat halaman.
- `is_completed`: penanda episode dianggap selesai.
- `last_watched_at`: waktu heartbeat atau pembaruan progres terakhir.

Nilai progres tidak boleh negatif. Persentase dibatasi ke rentang `0-100`. Episode dianggap selesai jika progres mencapai minimal 90 persen saat durasi tersedia.

## Recording Flow

1. Saat episode dibuka, `WatchRecorder` mengirim data metadata awal.
2. Selama halaman terlihat dan browser aktif, recorder menghitung waktu menonton aktif.
3. Heartbeat dikirim berkala, bukan setiap detik, agar beban database tetap rendah.
4. Jika iframe mengirim `postMessage` berisi posisi dan durasi yang valid, data tersebut menggantikan estimasi.
5. Saat tab disembunyikan atau komponen dilepas, recorder mengirim pembaruan terakhir jika memungkinkan.
6. Server memvalidasi dan membatasi semua angka sebelum menyimpannya.
7. Pembaruan history memakai nilai progres terbaru dan tidak mengurangi progres yang sudah tersimpan akibat heartbeat terlambat.

## Provider Safety

Data `postMessage` hanya diterima dari origin iframe aktif. Payload harus memiliki nilai waktu numerik yang masuk akal. Pesan lain diabaikan.

AniStream tidak memaksa akses DOM iframe lintas domain dan tidak melakukan seek jika provider tidak menyediakan API yang kompatibel. Ini mencegah error cross-origin dan menjaga server streaming tetap dapat digunakan.

## History Filtering

Query history menerima filter sumber terkontrol:

- Tanpa parameter atau `source=all`: tampilkan semua.
- `source=samehadaku`: hanya Samehadaku.
- `source=otakudesu`: hanya Otakudesu.
- Nilai lain dinormalisasi menjadi `all`.

Pengelompokan per anime memakai pasangan `source + anime_slug`, bukan hanya `anime_slug`, agar slug dari dua provider tidak bertabrakan.

## User Interface

Halaman `/history` dan `/history/episodes` menampilkan tab sumber di dekat pilihan Per Anime/Per Episode. Setiap kartu menampilkan:

- Provider.
- Episode terakhir.
- Waktu terakhir ditonton.
- Progress bar.
- Persentase atau durasi progres jika tersedia.
- Status selesai jika episode mencapai batas selesai.

History lama tetap dapat ditampilkan dengan progres nol tanpa migrasi data manual.

## Error Handling

- Kegagalan heartbeat tidak menghentikan pemutaran video.
- Request anonim tetap diabaikan seperti perilaku sekarang.
- Nilai progres rusak atau berlebihan ditolak atau dinormalisasi oleh server.
- Provider tanpa dukungan posisi asli tetap menggunakan estimasi.
- Database yang belum memiliki kolom baru ditingkatkan secara idempoten oleh bootstrap schema.

## Testing

- Normalisasi filter sumber.
- Query history memfilter `source`.
- Pengelompokan anime tidak mencampur provider.
- Validasi dan normalisasi payload progres.
- Progress tidak mundur karena request lama.
- Status selesai pada batas 90 persen.
- Recorder berhenti menghitung saat halaman tidak aktif.
- Pesan iframe hanya diterima dari origin yang benar.
- Halaman history memiliki tab provider dan indikator progres.

## Non-Goals

- Mengontrol atau melakukan seek langsung pada semua iframe provider.
- Memisahkan akun atau database berdasarkan provider.
- Mengubah API anime eksternal.
- Menambahkan watchlist, favorit, rating, atau komentar dalam perubahan ini.
