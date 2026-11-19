// =========================================================
// DATA DEMO — isi awal "database" untuk mencoba semua role.
// Dipanggil sekali oleh store.js bila data belum ada / versi berubah.
// Hapus file ini saat backend sudah tersedia.
//
// Akun demo (lihat juga dev.html):
//   Pemilik  : nining@sipenkos.id  / pemilik123
//   Penghuni : nana@mail.com       / nana123    (Kamar 07 · Tipe 4)
//   Calon    : rina@mail.com       / rina123    (belum reservasi)
// =========================================================
(function () {
  const S = (window.SIPENKOS = window.SIPENKOS || {});

  S.dataDemo = function () {
    const F = S.format;
    const TGL_JT = S.config.aturanBisnis.tanggalJatuhTempo;

    // ---------- tipe kamar ----------
    const fasilitasDasar = [
      { ikon: "bed", label: "Kasur & Bantal" },
      { ikon: "checkroom", label: "Lemari Pakaian" },
      { ikon: "desk", label: "Meja & Kursi" }
    ];
    const ac = { ikon: "ac_unit", label: "AC" };
    const kmDalam = { ikon: "shower", label: "Kamar Mandi Dalam" };
    const galeri = (foto) => [
      { src: foto, label: "Kamar" },
      { src: "assets/images/kamar-mandi.jpg", label: "Kamar Mandi" },
      { src: "assets/images/lemari.jpg", label: "Lemari" },
      { src: "assets/images/meja-belajar.jpg", label: "Meja Belajar" }
    ];

    const tipeKamar = [
      {
        id: 1, nama: "Tipe 1", ringkas: "Non-AC, Kamar Mandi Luar", ac: false, kamarMandiDalam: false, harga: 500000,
        foto: "assets/images/kamar-tipe1.jpg", galeri: galeri("assets/images/kamar-tipe1.jpg"),
        deskripsi: "Pilihan ekonomis yang nyaman, dengan sirkulasi udara dan pencahayaan alami. Kamar mandi luar selalu terawat bersih. Cocok untuk penghuni yang menginginkan hunian tenang dengan harga terjangkau.",
        fasilitas: fasilitasDasar
      },
      {
        id: 2, nama: "Tipe 2", ringkas: "Non-AC, Kamar Mandi Dalam", ac: false, kamarMandiDalam: true, harga: 650000,
        foto: "assets/images/kamar-tipe2.jpg", galeri: galeri("assets/images/kamar-tipe2.jpg"),
        deskripsi: "Privasi lebih dengan kamar mandi pribadi di dalam kamar. Ruangan sejuk dan tertata rapi untuk istirahat maupun belajar sehari-hari.",
        fasilitas: [kmDalam, ...fasilitasDasar]
      },
      {
        id: 3, nama: "Tipe 3", ringkas: "AC, Kamar Mandi Luar", ac: true, kamarMandiDalam: false, harga: 800000,
        foto: "assets/images/kamar-tipe3.jpg", galeri: galeri("assets/images/kamar-tipe3.jpg"),
        deskripsi: "Dilengkapi AC agar istirahat lebih nyaman. Kamar mandi luar bersih dan berada dekat area kamar.",
        fasilitas: [ac, ...fasilitasDasar]
      },
      {
        id: 4, nama: "Tipe 4", ringkas: "AC, Kamar Mandi Dalam", ac: true, kamarMandiDalam: true, harga: 950000,
        foto: "assets/images/kamar-tipe4.jpg", galeri: galeri("assets/images/kamar-tipe4.jpg"),
        deskripsi: "Fasilitas paling lengkap: AC dan kamar mandi pribadi di dalam kamar. Ruangan tertata rapi untuk istirahat, belajar, maupun bekerja.",
        fasilitas: [ac, kmDalam, ...fasilitasDasar]
      }
    ];

    // ---------- pengguna ----------
    const p = (id, nama, email, sandi, hp, extra = {}) =>
      ({ id, nama, email, sandi, hp, nik: "3573" + String(Math.abs(hashKecil(nama))).padStart(12, "0").slice(0, 12), role: "penghuni", dibuatPada: "2026-06-01T09:00:00+07:00", ...extra });
    function hashKecil(t) { let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

    const pengguna = [
      p("USR-PEMILIK", "Bu Nining", "nining@sipenkos.id", "pemilik123", "085444211076", { role: "pemilik", nik: "3573010101700001" }),
      p("USR-NANA", "Nana Putri", "nana@mail.com", "nana123", "081234560001"),
      p("USR-RINA", "Rina Ayu", "rina@mail.com", "rina123", "081234560002", { dibuatPada: "2026-10-25T19:00:00+07:00" }),
      p("USR-DIMAS", "Dimas Pratama", "dimas@mail.com", "dimas123", "081234560003", { dibuatPada: "2026-11-10T19:00:00+07:00" }),
      p("USR-ANDI", "Andi Saputra", "andi@mail.com", "andi123", "081234560010"),
      p("USR-BAYU", "Bayu Firmansyah", "bayu@mail.com", "bayu123", "081234560011"),
      p("USR-SINTA", "Sinta Maharani", "sinta@mail.com", "sinta123", "081234560012"),
      p("USR-DEWI", "Dewi Lestari", "dewi@mail.com", "dewi123", "081234560013"),
      p("USR-EKO", "Eko Prasetyo", "eko@mail.com", "eko123", "081234560014"),
      p("USR-FAJAR", "Fajar Nugroho", "fajar@mail.com", "fajar123", "081234560015"),
      p("USR-GITA", "Gita Savitri", "gita@mail.com", "gita123", "081234560016"),
      p("USR-HANA", "Hana Wulandari", "hana@mail.com", "hana123", "081234560017"),
      p("USR-INDRA", "Indra Kusuma", "indra@mail.com", "indra123", "081234560018")
    ];

    // ---------- unit kamar (16 kamar) ----------
    // [nomor, tipe, penghuni, mulai sewa, durasi]
    const penempatan = [
      ["01", 1, "USR-ANDI", "2026-08-01", 6], ["02", 1, "USR-BAYU", "2026-07-01", 12], ["03", 1, "USR-SINTA", "2026-09-01", 6], ["04", 1],
      ["05", 2, "USR-DEWI", "2026-07-01", 6], ["06", 2, "USR-EKO", "2026-08-01", 12], ["08", 2], ["09", 2],
      ["10", 3, "USR-FAJAR", "2026-07-01", 12], ["11", 3, "USR-GITA", "2026-08-01", 6], ["12", 3, "USR-HANA", "2026-09-01", 12],
      ["07", 4, "USR-NANA", "2026-07-01", 6], ["13", 4, "USR-INDRA", "2026-06-01", 6], ["14", 4], ["15", 4], ["16", 4]
    ];
    const kamar = penempatan.map(([nomor, tipeId, penghuniId]) => ({
      id: "KMR-" + nomor, nomor, tipeId, status: penghuniId ? "terisi" : "kosong", penghuniId: penghuniId || null
    }));

    // ---------- reservasi & tagihan penghuni lama ----------
    const reservasi = [];
    const tagihan = [];
    const hubungan = ["Orang Tua", "Orang Tua", "Saudara", "Wali"];
    // tagihan yang sengaja BELUM dibayar / MENUNGGU agar demo terasa hidup
    const pengecualian = {
      "USR-NANA:2026-10": { status: "belum" },
      "USR-ANDI:2026-10": { status: "belum" },
      "USR-DEWI:2026-11": { status: "menunggu", dikirimPada: "2026-11-12T20:10:00+07:00" },
      "USR-EKO:2026-11": { status: "menunggu", dikirimPada: "2026-11-13T08:45:00+07:00" }
    };
    const BATAS_LUNAS = "2026-11"; // tagihan sebelum bulan ini dianggap sudah dibayar

    penempatan.filter((x) => x[2]).forEach(([nomor, tipeId, penggunaId, mulai, durasi], i) => {
      const harga = tipeKamar.find((t) => t.id === tipeId).harga;
      const id = "RSV-DEMO-" + nomor;
      const dibuat = F.tambahHari(mulai, -10);
      reservasi.push({
        id, penggunaId, tipeId, kamarId: "KMR-" + nomor, tglMulai: mulai, durasi,
        kontakDarurat: { nama: "Keluarga " + pengguna.find((u) => u.id === penggunaId).nama.split(" ")[1], hubungan: hubungan[i % 4], hp: "08129999" + String(1000 + i) },
        ktp: { nama: "ktp.jpg", ukuran: 1800000, data: null },
        status: "diterima", alasanTolak: null,
        dibuatPada: dibuat.toISOString(), buktiDikirimPada: dibuat.toISOString(),
        diputuskanPada: F.tambahHari(dibuat, 1).toISOString()
      });

      for (let b = 1; b <= durasi; b++) {
        const awal = F.tambahBulan(mulai, b - 1);
        const periode = F.kodePeriode(awal);
        const jatuhTempo = b === 1 ? mulai : F.keISO(new Date(awal.getFullYear(), awal.getMonth(), TGL_JT));
        const khusus = pengecualian[`${penggunaId}:${periode}`];
        const sudahLunas = !khusus && periode < BATAS_LUNAS;
        const tglBayar = F.tambahHari(jatuhTempo, -2);
        tglBayar.setHours(19, 30);
        tagihan.push({
          id: `TGH-DEMO-${nomor}-${periode}`,
          penggunaId, reservasiId: id, perpanjanganId: null, periode,
          jenis: b === 1 ? "Sewa bulan pertama" : "Sewa bulanan",
          jumlah: harga, jatuhTempo,
          status: khusus ? khusus.status : sudahLunas ? "lunas" : "belum",
          bukti: (sudahLunas || khusus?.status === "menunggu") ? "assets/images/contoh-bukti-transfer.jpg" : null,
          metode: sudahLunas || khusus?.status === "menunggu" ? "Transfer" : null,
          dikirimPada: khusus?.dikirimPada || (sudahLunas ? tglBayar.toISOString() : null),
          dibayarPada: sudahLunas ? tglBayar.toISOString() : null,
          alasanTolak: null
        });
      }
    });

    // reservasi baru yang menunggu verifikasi pemilik (Dimas, Tipe 2)
    reservasi.push({
      id: "RSV-DEMO-DIMAS", penggunaId: "USR-DIMAS", tipeId: 2, kamarId: null, tglMulai: "2026-12-01", durasi: 6,
      kontakDarurat: { nama: "Slamet Pratama", hubungan: "Orang Tua", hp: "081277778888" },
      ktp: { nama: "ktp_dimas.jpg", ukuran: 1500000, data: null },
      status: "menunggu", alasanTolak: null,
      dibuatPada: "2026-11-13T19:20:00+07:00", buktiDikirimPada: "2026-11-13T19:35:00+07:00", diputuskanPada: null
    });
    tagihan.push({
      id: "TGH-DEMO-DIMAS-1", penggunaId: "USR-DIMAS", reservasiId: "RSV-DEMO-DIMAS", perpanjanganId: null,
      periode: "2026-12", jenis: "Sewa bulan pertama", jumlah: 650000, jatuhTempo: "2026-12-01",
      status: "menunggu", bukti: "assets/images/contoh-bukti-transfer.jpg", metode: "Transfer",
      dikirimPada: "2026-11-13T19:35:00+07:00", dibayarPada: null, alasanTolak: null
    });

    // ---------- perpanjangan (Indra menunggu verifikasi) ----------
    const perpanjangan = [{
      id: "EXT-DEMO-INDRA", penggunaId: "USR-INDRA", kamarLamaId: "KMR-13", kamarId: "KMR-13", tipeId: 4,
      durasi: 6, skema: "dp", metode: "Transfer",
      mulaiBaru: "2026-12-01", akhirBaru: "2027-05-31", hargaPerBulan: 950000, total: 5700000, dibayar: 2850000, sisa: 2850000,
      status: "menunggu", alasanTolak: null, dibuatPada: "2026-11-11T08:30:00+07:00", diputuskanPada: null
    }];

    // ---------- laporan kerusakan ----------
    const laporan = [
      {
        id: "LK-20261018-007", penggunaId: "USR-NANA", kamarId: "KMR-07", kategori: "Air/Kamar Mandi",
        judul: "Keran kamar mandi bocor", deskripsi: "Keran di kamar mandi menetes terus walaupun sudah ditutup rapat.",
        foto: null, status: "diproses", catatan: "Tukang dijadwalkan datang 20 Okt 2026.",
        dibuatPada: "2026-10-18T08:10:00+07:00", diterimaPada: "2026-10-18T10:00:00+07:00", selesaiPada: null
      },
      {
        id: "LK-20260902-003", penggunaId: "USR-NANA", kamarId: "KMR-07", kategori: "Listrik",
        judul: "Lampu kamar mati", deskripsi: "Lampu utama kamar tidak menyala sejak semalam.",
        foto: null, status: "selesai", catatan: "Lampu sudah diganti dengan yang baru.",
        dibuatPada: "2026-09-02T19:20:00+07:00", diterimaPada: "2026-09-03T08:00:00+07:00", selesaiPada: "2026-09-03T15:30:00+07:00"
      },
      {
        id: "LK-20261112-011", penggunaId: "USR-FAJAR", kamarId: "KMR-10", kategori: "Lainnya",
        judul: "AC kurang dingin", deskripsi: "AC sudah dinyalakan di suhu 18 derajat tetapi ruangan tetap panas.",
        foto: null, status: "baru", catatan: null,
        dibuatPada: "2026-11-12T21:05:00+07:00", diterimaPada: null, selesaiPada: null
      }
    ];

    // ---------- notifikasi ----------
    const n = (id, penggunaId, judul, isi, ikon, tautan, dibaca, waktu) => ({ id, penggunaId, judul, isi, ikon, tautan, dibaca, waktu });
    const notifikasi = [
      n("NTF-1", "USR-NANA", "Tagihan jatuh tempo 2 hari lagi", "Tagihan Oktober 2026 Rp 950.000", "receipt_long", "pages/penghuni/tagihan.html", false, "2026-10-25T08:00:00+07:00"),
      n("NTF-2", "USR-NANA", "Laporan kerusakan sedang diproses", "Keran kamar mandi bocor", "build", "pages/penghuni/laporan-detail.html?id=LK-20261018-007", false, "2026-10-18T10:00:00+07:00"),
      n("NTF-3", "USR-NANA", "Tagihan Oktober 2026 sudah terbit", "Sewa bulanan Rp 950.000", "receipt_long", "pages/penghuni/tagihan.html", true, "2026-10-01T07:00:00+07:00"),
      n("NTF-4", "USR-NANA", "Pembayaran September 2026 dikonfirmasi", "Sewa bulanan Rp 950.000", "check_circle", "pages/penghuni/riwayat.html", true, "2026-09-25T20:00:00+07:00"),
      n("NTF-5", "USR-PEMILIK", "Reservasi baru menunggu verifikasi", "Dimas Pratama · Tipe 2", "how_to_reg", "pages/pemilik/reservasi.html", false, "2026-11-13T19:35:00+07:00"),
      n("NTF-6", "USR-PEMILIK", "Bukti pembayaran baru", "Eko Prasetyo · Sewa bulanan November 2026", "payments", "pages/pemilik/pembayaran.html", false, "2026-11-13T08:45:00+07:00"),
      n("NTF-7", "USR-PEMILIK", "Laporan kerusakan baru", "AC kurang dingin · Kamar 10", "build", "pages/pemilik/laporan-detail.html?id=LK-20261112-011", false, "2026-11-12T21:05:00+07:00"),
      n("NTF-8", "USR-PEMILIK", "Pengajuan perpanjangan sewa", "Indra Kusuma · 6 bulan · Tipe 4", "event_repeat", "pages/pemilik/perpanjangan.html", true, "2026-11-11T08:30:00+07:00")
    ];

    // ---------- aturan kos ----------
    // CATATAN: isi aturan masih contoh — ganti dengan aturan asli dari Bu Nining.
    const aturan = {
      diperbarui: "2026-10-01T08:00:00+07:00",
      // sama dengan aturan di admin/pages/aturan-kos.php repo kelompok
      kelompok: [
        { judul: "Jam Bertamu", isi: ["Bertamu maksimal hingga pukul 22.00 WIB di area ruang tamu bersama."] },
        { judul: "Keamanan & Kunci", isi: ["Pintu pagar utama wajib dikunci kembali setelah pukul 23.00 WIB."] },
        { judul: "Pembayaran Sewa", isi: [`Pembayaran sewa dilakukan paling lambat tanggal ${TGL_JT} setiap bulannya.`] },
        { judul: "Kebersihan & Ketertiban", isi: ["Dilarang membuat kegaduhan di atas pukul 22.00 WIB dan wajib menjaga kebersihan area bersama."] },
        { judul: "Penggunaan Fasilitas", isi: ["Penggunaan fasilitas umum (dapur/mesin cuci) harap dirapikan kembali setelah digunakan."] }
      ]
    };

    return { pengguna, tipeKamar, kamar, reservasi, tagihan, perpanjangan, laporan, notifikasi, aturan };
  };
})();
