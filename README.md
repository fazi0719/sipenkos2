# SIPENKOS — Sistem Pengelolaan dan Reservasi Kos

Frontend lengkap SIPENKOS untuk **Kos Bu Nining, Malang**: tamu, calon penghuni, penghuni, dan pemilik kos.
Dibuat dengan **HTML, CSS, dan JavaScript murni** (tanpa framework, tanpa build). Data disimpan di
`localStorage` browser sebagai **demo**, dan semua akses data lewat satu file (`store.js`) sehingga
mudah diganti ke backend nanti.

## Cara menjalankan

1. Buka folder ini di VS Code.
2. Klik kanan `index.html` → **Open with Live Server** (atau jalankan `python3 -m http.server 8000`
   lalu buka `http://localhost:8000`).
3. Buka **`dev.html`** untuk masuk cepat sebagai akun demo dan melihat isi data.

| Akun demo | Email | Kata sandi |
|---|---|---|
| Pemilik kos | `nining@sipenkos.id` | `pemilik123` |
| Penghuni (Kamar 07) | `nana@mail.com` | `nana123` |
| Calon penghuni (belum reservasi) | `rina@mail.com` | `rina123` |
| Calon penghuni (menunggu verifikasi) | `dimas@mail.com` | `dimas123` |

Data bisa dikembalikan ke awal lewat tombol **Reset Data Demo** di `dev.html`.

## Struktur folder

```
sipenkos2/
├─ index.html                 Beranda (halaman awal)
├─ dev.html                   Panel uji untuk developer (hapus saat rilis)
├─ pages/
│  ├─ publik/                 kamar, detail-kamar, tentang         (tamu)
│  ├─ auth/                   masuk, daftar
│  ├─ reservasi/              formulir, pembayaran, status          (calon penghuni)
│  ├─ akun/                   profil, notifikasi, aturan            (semua yang sudah masuk)
│  ├─ penghuni/               dashboard, tagihan, bayar-tagihan, riwayat,
│  │                          perpanjangan, status-perpanjangan,
│  │                          laporan, laporan-buat, laporan-detail
│  └─ pemilik/                dashboard, reservasi, pembayaran, perpanjangan,
│                             laporan, laporan-detail, kamar, penghuni,
│                             keuangan, aturan
├─ assets/
│  ├─ css/
│  │  ├─ main.css             satu-satunya CSS yang ditautkan (mengimpor 4 file di bawah)
│  │  ├─ tokens.css           warna, huruf, jarak  ← ubah tampilan dari sini
│  │  ├─ base.css             reset & tipografi
│  │  ├─ layout.css           header, sidebar, footer, kerangka halaman
│  │  ├─ components.css       tombol, kartu, badge, form, tabel, timeline, dialog …
│  │  └─ pages/               CSS khusus beberapa halaman (publik, penghuni)
│  ├─ js/
│  │  ├─ core/                dipakai SEMUA halaman (urutan muat penting)
│  │  │  ├─ config.js         konstanta: info kos, menu, label status, aturan bisnis
│  │  │  ├─ icons.js          ikon SVG Material Symbols
│  │  │  ├─ format.js         rupiah, tanggal, dll.
│  │  │  ├─ seed.js           data demo awal (hapus saat ada backend)
│  │  │  ├─ store.js          ★ SATU-SATUNYA tempat baca/tulis data
│  │  │  ├─ ui.js             potongan tampilan: badge, dialog, toast, unggah foto …
│  │  │  └─ shell.js          pasang header/sidebar/footer + cek hak akses
│  │  └─ pages/               satu file JS per halaman (folder sama dengan pages/)
│  ├─ fonts/                  Plus Jakarta Sans (lokal, tetap tampil tanpa internet)
│  └─ images/
└─ docs/
   ├─ data-model.md           bentuk data = calon tabel database (untuk tim backend)
   └─ DESIGN.md               sistem desain dari Figma
```

## Cara kerja satu halaman

Setiap halaman hanya berisi **isi** halamannya. Header, sidebar, dan footer dipasang otomatis oleh
`shell.js` berdasarkan atribut `<body>`:

```html
<body data-layout="akun" data-akses="penghuni" data-menu="tagihan" data-judul="Tagihan">
  <main> … isi halaman … </main>
</body>
```

| Atribut | Nilai |
|---|---|
| `data-layout` | `tamu` (header + footer) · `auth` (kartu di tengah) · `alur` (header akun saja) · `akun` (sidebar + header) |
| `data-akses` | `publik` · `tamu` (hanya yang belum masuk) · `calon` · `penghuni` · `pemilik` · `masuk` (siapa pun yang sudah masuk) — boleh lebih dari satu |
| `data-menu` | menu sidebar yang aktif (lihat `config.js`) |

Skrip halaman ditulis di dalam `SIPENKOS.halaman(...)`, yang baru dijalankan setelah kerangka
terpasang dan hak akses lolos:

```js
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, format: F } = SIPENKOS;
  const tagihan = await store.tagihan.milikSaya();   // ambil data lewat store
  // … tampilkan …
});
```

## Aturan supaya tetap rapi

1. **Halaman tidak boleh memanggil `localStorage` langsung**, selalu lewat `SIPENKOS.store`.
2. **Warna dan ukuran hanya ditulis di `tokens.css`**; file lain memakai `var(--…)`.
3. **Pakai komponen yang ada** (`.tombol`, `.kartu`, `.badge`, `.field`, `UI.dialog`, `UI.unggah`, …)
   sebelum membuat yang baru.
4. **Teks dari pengguna selalu lewat `F.esc()`** sebelum dimasukkan ke `innerHTML` (anti-XSS).
5. **Label status hanya ada di `config.js` → `status`**, jadi semua badge seragam.
6. Nama file, fungsi, dan variabel memakai **bahasa Indonesia**; nama file `huruf-kecil-pakai-strip`.

## Menyambungkan ke backend nanti

Semua fungsi di `store.js` sudah `async`. Saat backend siap, isi fungsinya cukup diganti `fetch()`;
halaman tidak perlu diubah. Contoh:

```js
// sekarang (demo)
async milikSaya() { … baca("laporan") … }

// nanti
async milikSaya() {
  const res = await fetch("/api/laporan/saya", { credentials: "include" });
  if (!res.ok) throw new GagalStore("Gagal memuat laporan.");
  return res.json();
}
```

Daftar tabel dan kolom yang dibutuhkan ada di [`docs/data-model.md`](docs/data-model.md).

## Batasan versi demo

- Data hanya ada di browser yang dipakai (tidak tersinkron antar perangkat).
- Kata sandi demo disimpan apa adanya di `localStorage`, jadi **jangan pakai kata sandi asli**.
  Produksi wajib memakai backend dengan hash kata sandi dan sesi di server.
- Hak akses diperiksa di browser saja; backend tetap harus memeriksa ulang setiap permintaan.
- Isi aturan kos dan sebagian foto masih contoh.

## Lisensi pihak ketiga

- Ikon: [Material Symbols](https://fonts.google.com/icons) (Apache License 2.0)
- Huruf: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (SIL Open Font License 1.1)
