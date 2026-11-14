# Sistem Desain SIPENKOS (ringkas)

Sumber: desain Figma SIPENKOS (Kelompok 3 SIB 2E). Nilai teknisnya ada di `assets/css/tokens.css`.

## Warna
| Peran | Nilai | Dipakai untuk |
|---|---|---|
| Biru utama | `#1A6FD8` | tombol utama, tautan, menu aktif, harga, langkah aktif |
| Navy | `#1E3A8A` | logo & footer saja |
| Hijau WhatsApp | `#16A34A` | hanya tombol WhatsApp |
| Teks / teks sekunder | `#1F2937` / `#6B7280` | |
| Garis | `#E5E7EB` | |
| Latar halaman | gradien `#FFFFFF` → `#E8F2FD` | semua halaman |
| Panel dalam kartu | `#F8FAFC` | tidak ada kartu berlatar biru |
| Status hijau / kuning / merah | `#DCFCE7`/`#15803D` · `#FEF3C7`/`#B45309` · `#FEE2E2`/`#B91C1C` | badge & kotak status |

## Huruf
Plus Jakarta Sans. Judul halaman 28px bold · judul kartu 18px semibold · isi 15px · kecil 13px.
Teks menu, tombol, badge, chip, dan nominal tidak boleh pecah baris.

## Ikon
Material Symbols Outlined (weight 400, tidak terisi), 20px (24px di header).
Satu konsep = satu ikon: Dashboard `grid_view`, Tagihan `receipt_long`, Riwayat `history`,
Perpanjangan `event_repeat`, Laporan `build`, Notifikasi `notifications`, Aturan `gavel`,
Status Reservasi `assignment`, Profil `person`, Keluar `logout`.

## Komponen (lihat `components.css`)
- **Tombol** 44px, radius 8px: utama · sekunder · WhatsApp · teks · batal · kecil (36px) · ikon (40×40).
- **Kartu** putih, radius 12px, garis `#E5E7EB`, padding 24px, jarak 24px.
- **Badge** pil 26px dengan titik di depan.
- **Input** 44px (textarea 120px), label 13px semibold di atas, error merah dengan ikon.
- **Area unggah** garis putus-putus, latar panel, "PNG/JPG maks. 5 MB".
- **Timeline** titik 28px: selesai hijau, berjalan biru, belum abu, gagal merah.
- **Penunjuk langkah** reservasi: Formulir Reservasi → Pembayaran → Menunggu Verifikasi.

## Kerangka halaman
| Kerangka | Halaman |
|---|---|
| Tamu: header + footer | Beranda, Daftar Kamar, Detail Kamar, Tentang |
| Auth: kartu 440px di tengah | Masuk, Daftar |
| Alur: header akun saja | Formulir Reservasi, Pembayaran |
| Akun: sidebar 260px + header 64px | Status Reservasi & semua halaman penghuni/pemilik |

## Halaman tanpa desain Figma
Halaman **pemilik kos** belum punya desain Figma, sehingga dibuat dengan komponen yang sama.
Begitu desainnya ada, cukup sesuaikan isi halaman. Komponen dan warna sudah seragam.
