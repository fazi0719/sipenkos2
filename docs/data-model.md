# Model Data SIPENKOS

Setiap kunci `localStorage` berawalan `sipenkos:` = **satu tabel** di database nanti.
Semua akses data ada di `assets/js/core/store.js`; tabel ini menjelaskan bentuk barisnya.

Format: tanggal `YYYY-MM-DD`, waktu ISO 8601, uang dalam **rupiah (angka bulat)**,
gambar sebagai URL (demo: data URL / jalur `assets/images/...`).

## pengguna
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | teks | `USR-…` |
| nama, email, hp, nik | teks | email unik, NIK 16 digit |
| sandi | teks | **demo saja**: produksi simpan hash |
| role | `penghuni` \| `pemilik` | "calon" bukan role, melainkan penghuni yang reservasinya belum diterima |
| dibuatPada | waktu | |

## tipeKamar
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | angka | 1–4 |
| nama, ringkas | teks | "Tipe 4", "AC, Kamar Mandi Dalam" |
| ac, kamarMandiDalam | boolean | untuk filter |
| harga | angka | per bulan |
| deskripsi, foto | teks | |
| galeri | `[{src, label}]` | |
| fasilitas | `[{ikon, label}]` | |

Ketersediaan (`sisa`, `tersedia`) **tidak disimpan**, tetapi dihitung dari tabel `kamar`.

## kamar (unit)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | teks | `KMR-07` |
| nomor | teks | "07" |
| tipeId | → tipeKamar | |
| status | `kosong` \| `terisi` \| `perbaikan` | |
| penghuniId | → pengguna \| null | |

## reservasi
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | teks | `RSV-…` |
| penggunaId, tipeId | relasi | |
| kamarId | → kamar \| null | diisi pemilik saat menerima |
| tglMulai, durasi | tanggal, angka (bulan) | |
| kontakDarurat | `{nama, hubungan, hp}` | |
| ktp | `{nama, ukuran, data}` | |
| status | `draf` → `menunggu` → `diterima` \| `ditolak` | `draf` = belum bayar |
| alasanTolak | teks \| null | |
| dibuatPada, buktiDikirimPada, diputuskanPada | waktu | |

## tagihan
Satu baris = satu kewajiban bayar (sewa bulan pertama, sewa bulanan, DP/pelunasan perpanjangan).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | teks | `TGH-…` |
| penggunaId | relasi | |
| reservasiId \| perpanjanganId | relasi | salah satu terisi |
| periode | `YYYY-MM` | |
| jenis | teks | "Sewa bulan pertama", "Sewa bulanan", "Perpanjangan · DP 50%", … |
| jumlah | angka | |
| jatuhTempo | tanggal | tanggal 27 tiap bulan (lihat `config.js`) |
| status | `belum` → `menunggu` → `lunas` \| `ditolak` | `ditolak` = bukti ditolak, boleh unggah ulang |
| bukti | URL gambar | |
| metode | `Transfer` \| `Cash` | |
| dikirimPada, dibayarPada | waktu | `dibayarPada` = saat dikonfirmasi pemilik |
| alasanTolak | teks | |

## perpanjangan
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | teks | `EXT-…` |
| penggunaId, tipeId | relasi | |
| kamarLamaId, kamarId | → kamar | `kamarId` null bila pindah tipe (dipilih pemilik saat menyetujui) |
| durasi, skema, metode | angka, `dp`\|`lunas`, teks | |
| mulaiBaru, akhirBaru | tanggal | mulai = sehari setelah sewa berakhir |
| hargaPerBulan, total, dibayar, sisa | angka | DP = 50% (`config.js`) |
| status | `menunggu` → `disetujui` \| `ditolak` | disetujui → tagihan perpanjangan dibuat |
| alasanTolak, dibuatPada, diputuskanPada | | |

Masa sewa penghuni **dihitung**: `reservasi.tglMulai` + durasi, diperpanjang oleh perpanjangan yang disetujui.

## laporan
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | teks | `LK-…` |
| penggunaId, kamarId | relasi | |
| kategori | teks | Air/Kamar Mandi · Listrik · Lainnya |
| judul, deskripsi, foto | teks | foto opsional |
| status | `baru` → `diproses` → `selesai` | diubah pemilik |
| catatan | teks | catatan pemilik untuk penghuni |
| dibuatPada, diterimaPada, selesaiPada | waktu | |

## notifikasi
| Kolom | Tipe | Keterangan |
|---|---|---|
| id, penggunaId | | |
| judul, isi, ikon | teks | |
| tautan | teks | jalur halaman tujuan |
| dibaca | boolean | |
| waktu | waktu | |

## aturan (satu dokumen)
`{ diperbarui: waktu, kelompok: [{ judul, isi: [teks, …] }] }`

## sesi
`{ penggunaId, masukPada }`. **Produksi:** diganti cookie sesi / token dari server.

## Usulan endpoint API

| Fungsi store | Endpoint |
|---|---|
| `auth.masuk / daftar / keluar` | `POST /api/auth/masuk`, `POST /api/auth/daftar`, `POST /api/auth/keluar` |
| `kamar.daftarTipe / tipe(id)` | `GET /api/tipe-kamar`, `GET /api/tipe-kamar/:id` |
| `reservasi.milikSaya / buat / kirimBukti` | `GET /api/reservasi/saya`, `POST /api/reservasi`, `POST /api/reservasi/:id/bukti` |
| `reservasi.semua / terima / tolak` | `GET /api/reservasi`, `POST /api/reservasi/:id/terima`, `…/tolak` |
| `tagihan.milikSaya / kirimBukti` | `GET /api/tagihan/saya`, `POST /api/tagihan/:id/bukti` |
| `tagihan.semua / konfirmasi / tolak` | `GET /api/tagihan`, `POST /api/tagihan/:id/konfirmasi`, `…/tolak` |
| `perpanjangan.*` | `GET/POST /api/perpanjangan`, `POST /api/perpanjangan/:id/setujui`, `…/tolak` |
| `laporan.*` | `GET/POST /api/laporan`, `PATCH /api/laporan/:id` |
| `notifikasi.*` | `GET /api/notifikasi`, `POST /api/notifikasi/:id/dibaca` |
| `penghuni.daftar`, `keuangan.ringkasan(tahun)` | `GET /api/penghuni`, `GET /api/keuangan?tahun=` |
| `aturan.ambil / simpan` | `GET /api/aturan`, `PUT /api/aturan` |
