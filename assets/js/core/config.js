// =========================================================
// CONFIG — konstanta aplikasi SIPENKOS.
// Semua teks/angka yang dipakai banyak halaman ditaruh di sini,
// supaya cukup diubah di satu tempat.
// =========================================================
(function () {
  const S = (window.SIPENKOS = window.SIPENKOS || {});

  // Akar situs: dihitung dari lokasi file ini, jadi tautan tetap benar
  // walau dibuka dari Live Server, GitHub Pages, atau subfolder.
  const skrip = document.currentScript && document.currentScript.src;
  const ROOT = skrip ? skrip.replace(/assets\/js\/core\/config\.js.*$/, "") : "/";

  S.config = {
    ROOT,
    VERSI_DATA: 4, // naikkan bila bentuk data demo berubah (data lama akan direset)
    AWALAN_KUNCI: "sipenkos:", // awalan kunci localStorage

    kos: {
      nama: "Kos Bu Nining",
      kota: "Malang, Jawa Timur",
      alamat: "Jl. Pisang Agung III No. 29",
      alamatLengkap: "Jl. Pisang Agung III No. 29, Malang, Jawa Timur",
      whatsapp: "0854-4421-1076",
      whatsappLink: "https://wa.me/6285444211076",
      jamBertamu: "07.00–22.00 WIB",
      petaLink: "https://www.google.com/maps/search/?api=1&query=Jl.+Pisang+Agung+III+No.+29+Malang",
      rekening: { bank: "Bank BCA", nomor: "123 456 7890", atasNama: "Nining" },
      // fasilitas yang ditampilkan di Beranda
      fasilitasRingkas: [
        { ikon: "wifi", label: "Wi-Fi" }, { ikon: "soup_kitchen", label: "Dapur" },
        { ikon: "bolt", label: "Listrik" }, { ikon: "two_wheeler", label: "Parkir" },
        { ikon: "local_laundry_service", label: "Laundry" }, { ikon: "videocam", label: "CCTV" }
      ],
      // fasilitas bersama di Detail Kamar
      fasilitasBersama: [
        { ikon: "wifi", label: "Wi-Fi" }, { ikon: "soup_kitchen", label: "Dapur Bersama" },
        { ikon: "bolt", label: "Listrik Token" }, { ikon: "two_wheeler", label: "Parkir Motor" },
        { ikon: "videocam", label: "CCTV 24 Jam" }
      ]
    },

    aturanBisnis: {
      persenDp: 50, // DP perpanjangan sewa
      tanggalJatuhTempo: 27, // tagihan bulan X jatuh tempo tgl 27 bulan X (keputusan tim masih terbuka: 1 atau 27)
      durasiSewa: [1, 3, 6, 12], // pilihan durasi (bulan) di formulir reservasi
      durasiPerpanjangan: [1, 6, 12],
      maksUkuranFotoMB: 5
    },

    pilihan: {
      hubunganDarurat: ["Orang Tua", "Saudara", "Wali", "Pasangan", "Lainnya"],
      kategoriLaporan: ["Air/Kamar Mandi", "Listrik", "Lainnya"],
      metodeBayar: ["Transfer", "Cash"]
    },

    // ---------- label & warna badge untuk setiap status ----------
    // kelas badge: sukses (hijau) · peringatan (kuning) · bahaya (merah) · info (biru) · netral (abu)
    status: {
      reservasi: {
        draf: { label: "Belum Dibayar", badge: "netral" },
        menunggu: { label: "Menunggu Verifikasi", badge: "peringatan" },
        diterima: { label: "Diterima", badge: "sukses" },
        ditolak: { label: "Ditolak", badge: "bahaya" }
      },
      tagihan: {
        belum: { label: "Belum Dibayar", badge: "bahaya" },
        menunggu: { label: "Menunggu Konfirmasi", badge: "peringatan" },
        lunas: { label: "Lunas", badge: "sukses" },
        ditolak: { label: "Bukti Ditolak", badge: "bahaya" }
      },
      perpanjangan: {
        menunggu: { label: "Menunggu Verifikasi", badge: "peringatan" },
        disetujui: { label: "Disetujui", badge: "sukses" },
        ditolak: { label: "Ditolak", badge: "bahaya" }
      },
      laporan: {
        baru: { label: "Baru", badge: "info" },
        diproses: { label: "Diproses", badge: "peringatan" },
        selesai: { label: "Selesai", badge: "sukses" }
      },
      kamar: {
        kosong: { label: "Kosong", badge: "sukses" },
        terisi: { label: "Terisi", badge: "info" },
        perbaikan: { label: "Perbaikan", badge: "peringatan" }
      }
    },

    // ---------- menu sidebar per role ----------
    // href relatif terhadap ROOT. "kunci" dicocokkan dengan <body data-menu="...">.
    menu: {
      calon: [
        { kunci: "status-reservasi", label: "Status Reservasi", ikon: "assignment", href: "pages/reservasi/status.html" },
        { kunci: "aturan", label: "Kebijakan & Aturan Kos", ikon: "gavel", href: "pages/akun/aturan.html" },
        { kunci: "profil", label: "Profil", ikon: "person", href: "pages/akun/profil.html" }
      ],
      penghuni: [
        { kunci: "dashboard", label: "Dashboard", ikon: "grid_view", href: "pages/penghuni/dashboard.html" },
        { kunci: "tagihan", label: "Tagihan", ikon: "receipt_long", href: "pages/penghuni/tagihan.html" },
        { kunci: "riwayat", label: "Riwayat Pembayaran", ikon: "history", href: "pages/penghuni/riwayat.html" },
        { kunci: "perpanjangan", label: "Perpanjangan Sewa", ikon: "event_repeat", href: "pages/penghuni/perpanjangan.html" },
        { kunci: "laporan", label: "Laporan Kerusakan", ikon: "build", href: "pages/penghuni/laporan.html" },
        { kunci: "notifikasi", label: "Notifikasi", ikon: "notifications", href: "pages/akun/notifikasi.html", hitung: "notifikasi" },
        { kunci: "aturan", label: "Kebijakan & Aturan Kos", ikon: "gavel", href: "pages/akun/aturan.html" }
      ],
      pemilik: [
        { kunci: "dashboard", label: "Dashboard", ikon: "grid_view", href: "pages/pemilik/dashboard.html" },
        { judul: "Operasional" },
        { kunci: "reservasi", label: "Reservasi", ikon: "how_to_reg", href: "pages/pemilik/reservasi.html", hitung: "reservasi" },
        { kunci: "pembayaran", label: "Pembayaran", ikon: "payments", href: "pages/pemilik/pembayaran.html", hitung: "pembayaran" },
        { kunci: "perpanjangan", label: "Perpanjangan Sewa", ikon: "event_repeat", href: "pages/pemilik/perpanjangan.html", hitung: "perpanjangan" },
        { kunci: "laporan", label: "Laporan Kerusakan", ikon: "build", href: "pages/pemilik/laporan.html", hitung: "laporan" },
        { judul: "Data Kos" },
        { kunci: "kamar", label: "Kamar", ikon: "meeting_room", href: "pages/pemilik/kamar.html" },
        { kunci: "penghuni", label: "Penghuni", ikon: "group", href: "pages/pemilik/penghuni.html" },
        { kunci: "keuangan", label: "Laporan Keuangan", ikon: "monitoring", href: "pages/pemilik/keuangan.html" },
        { kunci: "aturan", label: "Kebijakan & Aturan Kos", ikon: "gavel", href: "pages/pemilik/aturan.html" },
        { kunci: "notifikasi", label: "Notifikasi", ikon: "notifications", href: "pages/akun/notifikasi.html", hitung: "notifikasi" }
      ]
    },

    // ---------- menu sidebar versi tampilan repo kelompok (PBL-Sipenkos) ----------
    // penghuni & pemilik memakai kerangka & ikon Lucide yang sama (gaya admin kelompok)
    menuKelompok: {
      penghuni: [
        { kunci: "dashboard", label: "Dashboard", lucide: "layout-grid", href: "pages/penghuni/dashboard.html" },
        { kunci: "tagihan", label: "Tagihan", lucide: "receipt-text", href: "pages/penghuni/tagihan.html" },
        { kunci: "riwayat", label: "Riwayat Pembayaran", lucide: "clock", href: "pages/penghuni/riwayat.html" },
        { kunci: "perpanjangan", label: "Perpanjangan Sewa", lucide: "calendar", href: "pages/penghuni/perpanjangan.html" },
        { kunci: "laporan", label: "Laporan Kerusakan", lucide: "wrench", href: "pages/penghuni/laporan.html" },
        { kunci: "aturan", label: "Kebijakan & Aturan Kos", lucide: "file-text", href: "pages/akun/aturan.html" }
      ],
      pemilik: [
        { kunci: "dashboard", label: "Dashboard", lucide: "layout-grid", href: "pages/pemilik/dashboard.html" },
        { kunci: "reservasi", label: "Data Reservasi", lucide: "calendar-check", href: "pages/pemilik/reservasi.html" },
        { kunci: "penghuni", label: "Data Penghuni", lucide: "users", href: "pages/pemilik/penghuni.html" },
        { kunci: "kamar", label: "Monitor Kamar", lucide: "bed-double", href: "pages/pemilik/kamar.html" },
        { kunci: "pembayaran", label: "Verifikasi Pembayaran", lucide: "credit-card", href: "pages/pemilik/pembayaran.html" },
        { kunci: "perpanjangan", label: "Perpanjangan Sewa", lucide: "calendar", href: "pages/pemilik/perpanjangan.html" },
        { kunci: "laporan", label: "Laporan Kerusakan", lucide: "wrench", href: "pages/pemilik/laporan.html" },
        { kunci: "keuangan", label: "Laporan Keuangan", lucide: "chart-column", href: "pages/pemilik/keuangan.html" },
        { kunci: "aturan", label: "Kebijakan & Aturan Kos", lucide: "file-text", href: "pages/pemilik/aturan.html" }
      ]
    },

    menuTamu: [
      { kunci: "beranda", label: "Beranda", href: "index.html" },
      { kunci: "kamar", label: "Kamar", href: "pages/publik/kamar.html" },
      { kunci: "tentang", label: "Tentang", href: "pages/publik/tentang.html" }
    ],

    // halaman awal setiap jenis akun setelah masuk
    beranda: {
      calon: "pages/reservasi/status.html",
      calonBaru: "pages/publik/kamar.html", // belum pernah reservasi
      penghuni: "pages/penghuni/dashboard.html",
      pemilik: "pages/pemilik/dashboard.html"
    }
  };

  // membuat URL absolut dari jalur relatif terhadap ROOT
  S.url = (jalur = "") => ROOT + String(jalur).replace(/^\/+/, "");
})();
