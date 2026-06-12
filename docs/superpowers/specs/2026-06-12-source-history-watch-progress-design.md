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
- Episode langsung disimpan ke history saat halaman tontonan dibuka, tanpa harus mencapai persentase tertentu.
- Posisi asli player dipakai jika iframe provider mengirim data yang valid melalui `postMessage`.
- Jika provider tidak menyediakan posisi asli, aplikasi tidak menampilkan atau memperkirakan menit terakhir menonton.

## Data Model

Kolom berikut ditambahkan ke `watch_history` dan `watch_history_events`:

- `watched_seconds`: posisi video asli yang dilaporkan player.
- `duration_seconds`: durasi video jika diketahui.
- `progress_percent`: persentase progres yang sudah dinormalisasi.
- `progress_source`: `player` jika data berasal langsung dari iframe.
- `is_completed`: penanda episode dianggap selesai.
- `last_watched_at`: waktu history atau progres terakhir diperbarui.

Nilai progres tidak boleh negatif dan persentase dibatasi ke rentang `0-100`. Kolom progres boleh kosong ketika provider tidak memberikan posisi asli. Status selesai hanya boleh ditentukan dari data player yang valid dan tidak memengaruhi apakah episode disimpan ke history.

## Recording Flow

1. Saat episode dibuka, `WatchRecorder` mengirim data metadata awal.
2. Metadata awal langsung membuat atau memperbarui history, meskipun pengguna berhenti di tengah episode.
3. Recorder tidak menghitung durasi berdasarkan lamanya halaman terbuka karena hasilnya tidak mewakili posisi video setelah pengguna melakukan skip.
4. Jika iframe mengirim `postMessage` berisi posisi dan durasi yang valid, recorder mengirim posisi asli tersebut ke server.
5. Server memvalidasi dan membatasi semua angka sebelum menyimpannya.
6. Pembaruan history tidak mengurangi progres yang sudah tersimpan akibat pesan terlambat.

## Provider Safety

Data `postMessage` hanya diterima dari origin iframe aktif. Payload harus memiliki nilai waktu numerik yang masuk akal. Pesan lain diabaikan.

AniStream tidak memaksa akses DOM iframe lintas domain, tidak memperkirakan posisi dari waktu halaman aktif, dan tidak melakukan seek jika provider tidak menyediakan API yang kompatibel. Ini mencegah error cross-origin serta menghindari informasi progres yang menyesatkan.

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
- Progress bar hanya jika provider mengirim posisi asli.
- Persentase atau posisi video hanya jika datanya akurat.
- Tidak menampilkan menit atau persentase perkiraan.
- Status selesai hanya jika dapat ditentukan dari data player yang valid.

History lama dan provider tanpa dukungan posisi player tetap ditampilkan tanpa progress bar.

## Error Handling

- Kegagalan pencatatan history atau pembaruan progres tidak menghentikan pemutaran video.
- Request anonim tetap diabaikan seperti perilaku sekarang.
- Nilai progres rusak atau berlebihan ditolak atau dinormalisasi oleh server.
- Provider tanpa dukungan posisi asli tetap menyimpan episode, tetapi tidak menyimpan posisi perkiraan.
- Database yang belum memiliki kolom baru ditingkatkan secara idempoten oleh bootstrap schema.

## Testing

- Normalisasi filter sumber.
- Query history memfilter `source`.
- Pengelompokan anime tidak mencampur provider.
- Validasi dan normalisasi payload progres.
- Episode tersimpan sejak halaman dibuka tanpa syarat persentase.
- Progress tidak mundur karena request lama.
- Recorder tidak membuat estimasi berdasarkan waktu halaman aktif.
- Pesan iframe hanya diterima dari origin yang benar.
- Halaman history memiliki tab provider dan hanya menampilkan indikator progres untuk data player yang valid.

## Non-Goals

- Mengontrol atau melakukan seek langsung pada semua iframe provider.
- Memisahkan akun atau database berdasarkan provider.
- Mengubah API anime eksternal.
- Menambahkan watchlist, favorit, rating, atau komentar dalam perubahan ini.
