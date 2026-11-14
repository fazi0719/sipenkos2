// =========================================================
// STORE — SATU-SATUNYA file yang membaca/menulis data.
//
// Halaman TIDAK BOLEH memanggil localStorage langsung. Halaman memanggil
// fungsi di sini, misalnya:
//     const daftar = await SIPENKOS.store.laporan.milikSaya();
//
// Sekarang data disimpan di localStorage (demo, per browser).
// Nanti saat backend siap, cukup ISI fungsi-fungsi di bawah dengan fetch()
// ke API — halaman tidak perlu diubah karena semua fungsi sudah async.
// Contoh:
//     milikSaya: async () => (await fetch("/api/laporan/saya")).json()
//
// Bentuk setiap "tabel" dijelaskan di docs/data-model.md.
// =========================================================
(function () {
  const S = (window.SIPENKOS = window.SIPENKOS || {});
  const { AWALAN_KUNCI, VERSI_DATA, aturanBisnis } = S.config;
  const F = S.format;

  // Error yang pesannya aman ditampilkan ke pengguna
  class GagalStore extends Error {}
  S.GagalStore = GagalStore;

  // ---------------------------------------------------------
  // Lapisan paling bawah: baca/tulis tabel di localStorage
  // ---------------------------------------------------------
  const TABEL = ["pengguna", "tipeKamar", "kamar", "reservasi", "tagihan",
    "perpanjangan", "laporan", "notifikasi"];

  const baca = (nama, bawaan = []) => {
    try {
      const isi = localStorage.getItem(AWALAN_KUNCI + nama);
      return isi === null ? bawaan : JSON.parse(isi);
    } catch {
      return bawaan;
    }
  };

  const tulis = (nama, nilai) => {
    try {
      localStorage.setItem(AWALAN_KUNCI + nama, JSON.stringify(nilai));
    } catch {
      throw new GagalStore("Penyimpanan browser penuh. Coba gunakan foto yang lebih kecil.");
    }
  };

  // ubah satu baris di tabel, lalu simpan
  const ubahBaris = (tabel, id, perubahan) => {
    const semua = baca(tabel);
    const i = semua.findIndex((b) => b.id === id);
    if (i < 0) throw new GagalStore("Data tidak ditemukan.");
    semua[i] = { ...semua[i], ...perubahan };
    tulis(tabel, semua);
    return semua[i];
  };

  const tambahBaris = (tabel, baris) => {
    const semua = baca(tabel);
    semua.push(baris);
    tulis(tabel, semua);
    return baris;
  };

  // ID mudah dibaca, contoh: LK-20261114-4F2A
  const idBaru = (awalan) => {
    const t = new Date();
    const acak = Math.random().toString(16).slice(2, 6).toUpperCase();
    return `${awalan}-${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, "0")}${String(t.getDate()).padStart(2, "0")}-${acak}`;
  };

  const sekarang = () => new Date().toISOString();

  // bukti/foto boleh dikirim sebagai teks data URL atau objek { nama, ukuran, data }
  const ambilGambar = (berkas) => (typeof berkas === "string" ? berkas : berkas?.data || null);

  // Isi data demo bila belum ada / versinya berubah
  const siapkanData = () => {
    if (baca("versi", 0) === VERSI_DATA) return;
    const data = S.dataDemo();
    TABEL.forEach((t) => tulis(t, data[t]));
    tulis("aturan", data.aturan);
    tulis("sesi", null);
    try { sessionStorage.removeItem(AWALAN_KUNCI + "sesi"); } catch { /* abaikan */ }
    tulis("versi", VERSI_DATA);
  };
  siapkanData();

  // ---------------------------------------------------------
  // Bantuan relasi (gabungkan data antar tabel)
  // ---------------------------------------------------------
  const tanpaSandi = (p) => {
    if (!p) return null;
    const { sandi: _sandi, ...sisa } = p; // kata sandi tidak pernah dikirim ke halaman
    return sisa;
  };

  const cariPengguna = (id) => baca("pengguna").find((p) => p.id === id) || null;
  const cariTipe = (id) => baca("tipeKamar").find((t) => t.id === Number(id)) || null;
  const cariKamar = (id) => baca("kamar").find((k) => k.id === id) || null;

  const reservasiDiterima = (penggunaId) =>
    baca("reservasi").filter((r) => r.penggunaId === penggunaId && r.status === "diterima")
      .sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada))[0] || null;

  // "pemilik" | "penghuni" (reservasi sudah diterima) | "calon"
  const jenisAkun = (p) => {
    if (!p) return null;
    if (p.role === "pemilik") return "pemilik";
    return reservasiDiterima(p.id) ? "penghuni" : "calon";
  };

  // Sesi disimpan di localStorage bila "Ingat saya" dicentang,
  // atau di sessionStorage (hilang saat browser ditutup) bila tidak.
  const KUNCI_SESI = AWALAN_KUNCI + "sesi";
  const bacaSesi = () => {
    try {
      return JSON.parse(sessionStorage.getItem(KUNCI_SESI) || "null") || baca("sesi", null);
    } catch {
      return null;
    }
  };
  const simpanSesi = (sesi, ingat = true) => {
    try { sessionStorage.removeItem(KUNCI_SESI); } catch { /* abaikan */ }
    tulis("sesi", null);
    if (!sesi) return;
    if (ingat) tulis("sesi", sesi);
    else sessionStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
  };

  const penggunaSesi = () => {
    const sesi = bacaSesi();
    return sesi ? cariPengguna(sesi.penggunaId) : null;
  };

  const wajibMasuk = () => {
    const p = penggunaSesi();
    if (!p) throw new GagalStore("Sesi berakhir. Silakan masuk lagi.");
    return p;
  };

  const wajibPemilik = () => {
    const p = wajibMasuk();
    if (p.role !== "pemilik") throw new GagalStore("Hanya pemilik kos yang boleh melakukan ini.");
    return p;
  };

  // kirim notifikasi ke satu pengguna, atau ke semua pemilik
  const kirimNotifikasi = (tujuan, { judul, isi, ikon = "notifications", tautan = "" }) => {
    const penerima = tujuan === "pemilik"
      ? baca("pengguna").filter((p) => p.role === "pemilik").map((p) => p.id)
      : [tujuan];
    const semua = baca("notifikasi");
    penerima.forEach((penggunaId) => {
      semua.push({ id: idBaru("NTF"), penggunaId, judul, isi, ikon, tautan, dibaca: false, waktu: sekarang() });
    });
    tulis("notifikasi", semua);
  };

  // tagihan "aktif" = dari reservasi yang sudah diterima, atau dari perpanjangan.
  // Tagihan reservasi yang ditolak/ditinggalkan tidak dihitung (bukan tunggakan).
  const tagihanAktif = (t) => {
    if (t.perpanjanganId) return true;
    const r = baca("reservasi").find((x) => x.id === t.reservasiId);
    return r?.status === "diterima";
  };

  // tambahkan info sisa kamar ke tipe
  const lengkapiTipe = (tipe) => {
    const unit = baca("kamar").filter((k) => k.tipeId === tipe.id);
    const sisa = unit.filter((k) => k.status === "kosong").length;
    return { ...tipe, total: unit.length, sisa, tersedia: sisa > 0 };
  };

  // masa sewa penghuni: dari reservasi diterima + perpanjangan yang disetujui
  const hitungSewa = (penggunaId) => {
    const r = reservasiDiterima(penggunaId);
    if (!r) return null;
    const disetujui = baca("perpanjangan")
      .filter((p) => p.penggunaId === penggunaId && p.status === "disetujui")
      .sort((a, b) => a.mulaiBaru.localeCompare(b.mulaiBaru));
    const terakhir = disetujui[disetujui.length - 1];
    const kamar = cariKamar(terakhir?.kamarId || r.kamarId);
    const tipe = cariTipe(kamar?.tipeId || r.tipeId);
    return {
      reservasiId: r.id,
      kamar,
      tipe,
      mulai: r.tglMulai,
      akhir: terakhir ? terakhir.akhirBaru : F.keISO(F.akhirSewa(r.tglMulai, r.durasi)),
      hargaPerBulan: tipe?.harga || 0
    };
  };

  // buat tagihan bulanan untuk bulan ke-dari s.d. ke-sampai (1 = bulan pertama)
  const buatTagihanBulanan = (r, hargaPerBulan, dari, sampai) => {
    const baru = [];
    for (let i = dari; i <= sampai; i++) {
      const awalBulan = F.tambahBulan(r.tglMulai, i - 1);
      const jatuhTempo = new Date(awalBulan.getFullYear(), awalBulan.getMonth(), aturanBisnis.tanggalJatuhTempo);
      baru.push({
        id: idBaru("TGH"),
        penggunaId: r.penggunaId,
        reservasiId: r.id,
        perpanjanganId: null,
        periode: F.kodePeriode(awalBulan),
        jenis: "Sewa bulanan",
        jumlah: hargaPerBulan,
        jatuhTempo: F.keISO(jatuhTempo),
        status: "belum",
        bukti: null,
        metode: null,
        dikirimPada: null,
        dibayarPada: null,
        alasanTolak: null
      });
    }
    return baru;
  };

  // ---------------------------------------------------------
  // API PUBLIK — semua async (siap diganti fetch ke backend)
  // ---------------------------------------------------------
  const store = {};

  // ===== AUTENTIKASI =====
  store.auth = {
    async sesi() {
      const p = penggunaSesi();
      return p ? { ...tanpaSandi(p), jenis: jenisAkun(p) } : null;
    },

    async masuk({ email, sandi, ingat = true }) {
      const p = baca("pengguna").find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
      if (!p || p.sandi !== sandi) throw new GagalStore("Email atau kata sandi salah.");
      simpanSesi({ penggunaId: p.id, masukPada: sekarang() }, ingat);
      return { ...tanpaSandi(p), jenis: jenisAkun(p) };
    },

    async daftar({ nama, nik, hp, email, sandi }) {
      const semua = baca("pengguna");
      if (semua.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new GagalStore("Email ini sudah terdaftar. Silakan masuk.");
      }
      const p = {
        id: idBaru("USR"), nama: nama.trim(), nik, hp, email: email.trim().toLowerCase(),
        sandi, role: "penghuni", dibuatPada: sekarang()
      };
      tambahBaris("pengguna", p);
      simpanSesi({ penggunaId: p.id, masukPada: sekarang() });
      return { ...tanpaSandi(p), jenis: "calon" };
    },

    async keluar() {
      simpanSesi(null);
    },

    async perbaruiProfil({ nama, hp }) {
      const p = wajibMasuk();
      return tanpaSandi(ubahBaris("pengguna", p.id, { nama: nama.trim(), hp }));
    },

    async gantiSandi({ lama, baru }) {
      const p = wajibMasuk();
      if (p.sandi !== lama) throw new GagalStore("Kata sandi lama tidak sesuai.");
      ubahBaris("pengguna", p.id, { sandi: baru });
    }
  };

  // ===== KAMAR =====
  store.kamar = {
    async daftarTipe() {
      return baca("tipeKamar").map(lengkapiTipe);
    },

    async tipe(id) {
      const t = cariTipe(id);
      return t ? lengkapiTipe(t) : null;
    },

    // pemilik: semua unit kamar + penghuninya
    async daftarUnit() {
      wajibPemilik();
      return baca("kamar")
        .map((k) => ({ ...k, tipe: cariTipe(k.tipeId), penghuni: tanpaSandi(cariPengguna(k.penghuniId)) }))
        .sort((a, b) => a.nomor.localeCompare(b.nomor));
    },

    async unitKosong(tipeId) {
      return baca("kamar").filter((k) => k.tipeId === Number(tipeId) && k.status === "kosong")
        .sort((a, b) => a.nomor.localeCompare(b.nomor));
    },

    async ubahTipe(id, { harga, deskripsi }) {
      wajibPemilik();
      const semua = baca("tipeKamar");
      const t = semua.find((x) => x.id === Number(id));
      if (!t) throw new GagalStore("Tipe kamar tidak ditemukan.");
      t.harga = Number(harga);
      t.deskripsi = deskripsi.trim();
      tulis("tipeKamar", semua);
      return lengkapiTipe(t);
    },

    async ubahStatusUnit(id, status) {
      wajibPemilik();
      const k = cariKamar(id);
      if (k.status === "terisi") throw new GagalStore("Kamar yang sedang terisi tidak bisa diubah statusnya.");
      return ubahBaris("kamar", id, { status });
    }
  };

  // ===== RESERVASI (calon penghuni & pemilik) =====
  const lengkapiReservasi = (r) => {
    if (!r) return null;
    const tagihanPertama = baca("tagihan").find((t) => t.reservasiId === r.id && t.jenis === "Sewa bulan pertama") || null;
    return {
      ...r,
      tipe: cariTipe(r.tipeId),
      kamar: cariKamar(r.kamarId),
      pengguna: tanpaSandi(cariPengguna(r.penggunaId)),
      tagihanPertama,
      akhir: F.keISO(F.akhirSewa(r.tglMulai, r.durasi))
    };
  };

  store.reservasi = {
    // reservasi terbaru milik pengguna yang sedang masuk
    async milikSaya() {
      const p = wajibMasuk();
      const r = baca("reservasi").filter((x) => x.penggunaId === p.id)
        .sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada))[0];
      return lengkapiReservasi(r);
    },

    async buat({ tipeId, tglMulai, durasi, kontakNama, kontakHubungan, kontakHp, ktp }) {
      const p = wajibMasuk();
      const tipe = await store.kamar.tipe(tipeId);
      if (!tipe) throw new GagalStore("Tipe kamar tidak ditemukan.");
      if (!tipe.tersedia) throw new GagalStore("Maaf, tipe kamar ini sedang penuh.");

      const milik = await store.reservasi.milikSaya();
      if (milik && ["menunggu", "diterima"].includes(milik.status)) {
        throw new GagalStore("Kamu sudah memiliki reservasi yang sedang diproses.");
      }

      // reservasi lama yang belum dibayar diganti dengan yang baru
      if (milik && milik.status === "draf") {
        tulis("reservasi", baca("reservasi").filter((x) => x.id !== milik.id));
        tulis("tagihan", baca("tagihan").filter((x) => x.reservasiId !== milik.id));
      }

      const r = {
        id: idBaru("RSV"),
        penggunaId: p.id,
        tipeId: tipe.id,
        kamarId: null,
        tglMulai,
        durasi: Number(durasi),
        kontakDarurat: { nama: kontakNama.trim(), hubungan: kontakHubungan, hp: kontakHp },
        ktp,
        status: "draf",
        alasanTolak: null,
        dibuatPada: sekarang(),
        diputuskanPada: null
      };
      tambahBaris("reservasi", r);

      // tagihan sewa bulan pertama (dibayar di halaman Pembayaran)
      tambahBaris("tagihan", {
        ...buatTagihanBulanan(r, tipe.harga, 1, 1)[0],
        jenis: "Sewa bulan pertama",
        jatuhTempo: tglMulai
      });
      return lengkapiReservasi(r);
    },

    async kirimBukti(reservasiId, bukti) {
      const p = wajibMasuk();
      const r = baca("reservasi").find((x) => x.id === reservasiId && x.penggunaId === p.id);
      if (!r) throw new GagalStore("Reservasi tidak ditemukan.");
      const t = baca("tagihan").find((x) => x.reservasiId === r.id && x.jenis === "Sewa bulan pertama");
      if (!ambilGambar(bukti)) throw new GagalStore("Unggah bukti transfer terlebih dahulu.");
      ubahBaris("tagihan", t.id, { status: "menunggu", bukti: ambilGambar(bukti), metode: "Transfer", dikirimPada: sekarang(), alasanTolak: null });
      ubahBaris("reservasi", r.id, { status: "menunggu", alasanTolak: null, buktiDikirimPada: sekarang() });
      kirimNotifikasi("pemilik", {
        judul: "Reservasi baru menunggu verifikasi",
        isi: `${p.nama} · ${cariTipe(r.tipeId).nama}`,
        ikon: "how_to_reg",
        tautan: "pages/pemilik/reservasi.html"
      });
      return store.reservasi.milikSaya();
    },

    // pemilik
    async semua() {
      wajibPemilik();
      return baca("reservasi").filter((r) => r.status !== "draf").map(lengkapiReservasi)
        .sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada));
    },

    async terima(id, kamarId) {
      wajibPemilik();
      const r = baca("reservasi").find((x) => x.id === id);
      const k = cariKamar(kamarId);
      if (!r || r.status !== "menunggu") throw new GagalStore("Reservasi ini tidak sedang menunggu verifikasi.");
      if (!k || k.status !== "kosong" || k.tipeId !== r.tipeId) throw new GagalStore("Pilih kamar kosong yang sesuai tipe.");

      ubahBaris("kamar", k.id, { status: "terisi", penghuniId: r.penggunaId });
      ubahBaris("reservasi", id, { status: "diterima", kamarId: k.id, diputuskanPada: sekarang() });

      const tagihan = baca("tagihan");
      const pertama = tagihan.find((t) => t.reservasiId === id && t.jenis === "Sewa bulan pertama");
      pertama.status = "lunas";
      pertama.dibayarPada = pertama.dikirimPada || sekarang();
      tulis("tagihan", [...tagihan, ...buatTagihanBulanan(r, cariTipe(r.tipeId).harga, 2, r.durasi)]);

      kirimNotifikasi(r.penggunaId, {
        judul: "Reservasi diterima",
        isi: `Kamu menempati Kamar ${k.nomor} mulai ${F.tanggal(r.tglMulai)}.`,
        ikon: "check_circle",
        tautan: "pages/reservasi/status.html"
      });
    },

    async tolak(id, alasan) {
      wajibPemilik();
      const r = baca("reservasi").find((x) => x.id === id);
      if (!r || r.status !== "menunggu") throw new GagalStore("Reservasi ini tidak sedang menunggu verifikasi.");
      ubahBaris("reservasi", id, { status: "ditolak", alasanTolak: alasan.trim(), diputuskanPada: sekarang() });
      const t = baca("tagihan").find((x) => x.reservasiId === id && x.jenis === "Sewa bulan pertama");
      ubahBaris("tagihan", t.id, { status: "ditolak", alasanTolak: alasan.trim() });
      kirimNotifikasi(r.penggunaId, {
        judul: "Reservasi ditolak",
        isi: alasan.trim(),
        ikon: "cancel",
        tautan: "pages/reservasi/status.html"
      });
    }
  };

  // ===== SEWA (penghuni aktif) =====
  store.sewa = {
    async saya() {
      const p = wajibMasuk();
      return hitungSewa(p.id);
    }
  };

  // ===== TAGIHAN & PEMBAYARAN =====
  const lengkapiTagihan = (t) => ({
    ...t,
    pengguna: tanpaSandi(cariPengguna(t.penggunaId)),
    kamar: hitungSewa(t.penggunaId)?.kamar || null
  });

  store.tagihan = {
    async milikSaya() {
      const p = wajibMasuk();
      return baca("tagihan").filter((t) => t.penggunaId === p.id && tagihanAktif(t))
        .sort((a, b) => b.jatuhTempo.localeCompare(a.jatuhTempo));
    },

    async ambil(id) {
      const p = wajibMasuk();
      const t = baca("tagihan").find((x) => x.id === id);
      if (!t || (t.penggunaId !== p.id && p.role !== "pemilik")) return null;
      return lengkapiTagihan(t);
    },

    // tagihan tertua yang harus dibayar (untuk banner dashboard)
    async harusDibayar() {
      const daftar = await store.tagihan.milikSaya();
      return daftar.filter((t) => t.status === "belum" || t.status === "ditolak")
        .sort((a, b) => a.jatuhTempo.localeCompare(b.jatuhTempo))[0] || null;
    },

    async kirimBukti(id, bukti) {
      const p = wajibMasuk();
      const t = baca("tagihan").find((x) => x.id === id && x.penggunaId === p.id);
      if (!t) throw new GagalStore("Tagihan tidak ditemukan.");
      if (!["belum", "ditolak"].includes(t.status)) throw new GagalStore("Tagihan ini sudah dibayar.");
      if (!ambilGambar(bukti)) throw new GagalStore("Unggah bukti transfer terlebih dahulu.");
      const hasil = ubahBaris("tagihan", id, { status: "menunggu", bukti: ambilGambar(bukti), metode: "Transfer", dikirimPada: sekarang(), alasanTolak: null });
      kirimNotifikasi("pemilik", {
        judul: "Bukti pembayaran baru",
        isi: `${p.nama} · ${t.jenis} ${F.periode(t.periode)} · ${F.rupiah(t.jumlah)}`,
        ikon: "payments",
        tautan: "pages/pemilik/pembayaran.html"
      });
      return hasil;
    },

    // pemilik: semua tagihan (kecuali tagihan reservasi — diverifikasi di halaman Reservasi)
    async semua() {
      wajibPemilik();
      return baca("tagihan").filter((t) => t.jenis !== "Sewa bulan pertama").map(lengkapiTagihan)
        .sort((a, b) => (b.dikirimPada || b.jatuhTempo).localeCompare(a.dikirimPada || a.jatuhTempo));
    },

    // metode "Cash" dipakai bila penghuni membayar tunai langsung ke pemilik
    async konfirmasi(id, { metode } = {}) {
      wajibPemilik();
      const lama = baca("tagihan").find((x) => x.id === id);
      if (!lama || lama.status === "lunas") throw new GagalStore("Tagihan ini sudah lunas.");
      const t = ubahBaris("tagihan", id, { status: "lunas", dibayarPada: sekarang(), metode: metode || lama.metode || "Transfer", alasanTolak: null });
      kirimNotifikasi(t.penggunaId, {
        judul: "Pembayaran dikonfirmasi",
        isi: `${t.jenis} ${F.periode(t.periode)} · ${F.rupiah(t.jumlah)}`,
        ikon: "check_circle",
        tautan: "pages/penghuni/riwayat.html"
      });
    },

    async tolak(id, alasan) {
      wajibPemilik();
      const t = ubahBaris("tagihan", id, { status: "ditolak", alasanTolak: alasan.trim() });
      kirimNotifikasi(t.penggunaId, {
        judul: "Bukti pembayaran ditolak",
        isi: alasan.trim(),
        ikon: "cancel",
        tautan: `pages/penghuni/bayar-tagihan.html?id=${t.id}`
      });
    }
  };

  // ===== PERPANJANGAN SEWA =====
  const lengkapiPerpanjangan = (x) => x && ({
    ...x,
    pengguna: tanpaSandi(cariPengguna(x.penggunaId)),
    tipe: cariTipe(x.tipeId),
    kamarLama: cariKamar(x.kamarLamaId),
    kamar: cariKamar(x.kamarId),
    tagihan: baca("tagihan").filter((t) => t.perpanjanganId === x.id)
  });

  store.perpanjangan = {
    async terakhirSaya() {
      const p = wajibMasuk();
      const x = baca("perpanjangan").filter((y) => y.penggunaId === p.id)
        .sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada))[0];
      return lengkapiPerpanjangan(x) || null;
    },

    // hitung rincian tanpa menyimpan (dipakai form untuk ringkasan)
    async hitung({ tipeId, durasi, skema }) {
      const p = wajibMasuk();
      const sewa = hitungSewa(p.id);
      const tipe = cariTipe(tipeId);
      const mulaiBaru = F.tambahHari(sewa.akhir, 1);
      const total = tipe.harga * Number(durasi);
      const dibayar = skema === "dp" ? Math.round(total * aturanBisnis.persenDp / 100) : total;
      return {
        mulaiBaru: F.keISO(mulaiBaru),
        akhirBaru: F.keISO(F.akhirSewa(mulaiBaru, durasi)),
        hargaPerBulan: tipe.harga,
        total,
        dibayar,
        sisa: total - dibayar
      };
    },

    async ajukan({ tipeId, durasi, skema, metode }) {
      const p = wajibMasuk();
      const sewa = hitungSewa(p.id);
      if (!sewa) throw new GagalStore("Data sewa kamu belum tersedia.");
      const terakhir = await store.perpanjangan.terakhirSaya();
      if (terakhir && terakhir.status === "menunggu") throw new GagalStore("Masih ada pengajuan yang menunggu verifikasi.");
      const tipe = await store.kamar.tipe(tipeId);
      if (Number(tipeId) !== sewa.tipe.id && !tipe.tersedia) throw new GagalStore("Tipe kamar ini sedang penuh.");

      const r = await store.perpanjangan.hitung({ tipeId, durasi, skema });
      const x = {
        id: idBaru("EXT"),
        penggunaId: p.id,
        kamarLamaId: sewa.kamar.id,
        kamarId: Number(tipeId) === sewa.tipe.id ? sewa.kamar.id : null,
        tipeId: Number(tipeId),
        durasi: Number(durasi),
        skema,
        metode,
        ...r,
        status: "menunggu",
        alasanTolak: null,
        dibuatPada: sekarang(),
        diputuskanPada: null
      };
      tambahBaris("perpanjangan", x);
      kirimNotifikasi("pemilik", {
        judul: "Pengajuan perpanjangan sewa",
        isi: `${p.nama} · ${x.durasi} bulan · ${tipe.nama}`,
        ikon: "event_repeat",
        tautan: "pages/pemilik/perpanjangan.html"
      });
      return lengkapiPerpanjangan(x);
    },

    async semua() {
      wajibPemilik();
      return baca("perpanjangan").map(lengkapiPerpanjangan)
        .sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada));
    },

    // kamarId wajib diisi bila penghuni pindah tipe kamar
    async setujui(id, kamarId = null) {
      wajibPemilik();
      const x = baca("perpanjangan").find((y) => y.id === id);
      if (!x || x.status !== "menunggu") throw new GagalStore("Pengajuan ini tidak sedang menunggu verifikasi.");

      let kamarTujuan = x.kamarId;
      if (!kamarTujuan) {
        const k = cariKamar(kamarId);
        if (!k || k.status !== "kosong" || k.tipeId !== x.tipeId) throw new GagalStore("Pilih kamar kosong untuk tipe baru.");
        // pindah kamar: kamar lama dikosongkan, kamar baru diisi
        ubahBaris("kamar", x.kamarLamaId, { status: "kosong", penghuniId: null });
        ubahBaris("kamar", k.id, { status: "terisi", penghuniId: x.penggunaId });
        kamarTujuan = k.id;
      }
      ubahBaris("perpanjangan", id, { status: "disetujui", kamarId: kamarTujuan, diputuskanPada: sekarang() });

      // tagihan perpanjangan: DP + pelunasan, atau lunas sekaligus
      const dasar = {
        penggunaId: x.penggunaId, reservasiId: null, perpanjanganId: x.id, periode: F.kodePeriode(x.mulaiBaru),
        status: "belum", bukti: null, metode: null, dikirimPada: null, dibayarPada: null, alasanTolak: null
      };
      const seminggu = F.keISO(F.tambahHari(new Date(), 7));
      const baru = x.skema === "dp"
        ? [
            { ...dasar, id: idBaru("TGH"), jenis: `Perpanjangan · DP ${aturanBisnis.persenDp}%`, jumlah: x.dibayar, jatuhTempo: seminggu },
            { ...dasar, id: idBaru("TGH"), jenis: "Perpanjangan · Pelunasan", jumlah: x.sisa, jatuhTempo: x.mulaiBaru }
          ]
        : [{ ...dasar, id: idBaru("TGH"), jenis: "Perpanjangan · Lunas", jumlah: x.total, jatuhTempo: seminggu }];
      tulis("tagihan", [...baca("tagihan"), ...baru]);

      kirimNotifikasi(x.penggunaId, {
        judul: "Perpanjangan sewa disetujui",
        isi: `Masa sewa baru ${F.rentang(x.mulaiBaru, x.akhirBaru)}. Silakan lakukan pembayaran.`,
        ikon: "check_circle",
        tautan: "pages/penghuni/status-perpanjangan.html"
      });
    },

    async tolak(id, alasan) {
      wajibPemilik();
      const x = ubahBaris("perpanjangan", id, { status: "ditolak", alasanTolak: alasan.trim(), diputuskanPada: sekarang() });
      kirimNotifikasi(x.penggunaId, {
        judul: "Perpanjangan sewa ditolak",
        isi: alasan.trim(),
        ikon: "cancel",
        tautan: "pages/penghuni/status-perpanjangan.html"
      });
    }
  };

  // ===== LAPORAN KERUSAKAN =====
  const lengkapiLaporan = (l) => l && ({
    ...l,
    pengguna: tanpaSandi(cariPengguna(l.penggunaId)),
    kamar: cariKamar(l.kamarId)
  });

  store.laporan = {
    async milikSaya() {
      const p = wajibMasuk();
      return baca("laporan").filter((l) => l.penggunaId === p.id).map(lengkapiLaporan)
        .sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada));
    },

    async ambil(id) {
      const p = wajibMasuk();
      const l = baca("laporan").find((x) => x.id === id);
      if (!l || (l.penggunaId !== p.id && p.role !== "pemilik")) return null;
      return lengkapiLaporan(l);
    },

    async buat({ kategori, judul, deskripsi, foto }) {
      const p = wajibMasuk();
      const sewa = hitungSewa(p.id);
      const l = {
        id: idBaru("LK"),
        penggunaId: p.id,
        kamarId: sewa?.kamar?.id || null,
        kategori,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        foto: ambilGambar(foto),
        status: "baru",
        catatan: null,
        dibuatPada: sekarang(),
        diterimaPada: null,
        selesaiPada: null
      };
      tambahBaris("laporan", l);
      kirimNotifikasi("pemilik", {
        judul: "Laporan kerusakan baru",
        isi: `${l.judul} · Kamar ${sewa?.kamar?.nomor || "-"}`,
        ikon: "build",
        tautan: `pages/pemilik/laporan-detail.html?id=${l.id}`
      });
      return lengkapiLaporan(l);
    },

    async semua() {
      wajibPemilik();
      return baca("laporan").map(lengkapiLaporan).sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada));
    },

    async ubahStatus(id, status, catatan) {
      wajibPemilik();
      const lama = baca("laporan").find((x) => x.id === id);
      const perubahan = { status, catatan: catatan?.trim() || lama.catatan };
      if (status !== "baru" && !lama.diterimaPada) perubahan.diterimaPada = sekarang();
      if (status === "selesai") perubahan.selesaiPada = sekarang();
      if (status !== "selesai") perubahan.selesaiPada = null;
      const l = ubahBaris("laporan", id, perubahan);
      kirimNotifikasi(l.penggunaId, {
        judul: status === "selesai" ? "Laporan kerusakan selesai" : "Laporan kerusakan sedang diproses",
        isi: l.judul,
        ikon: "build",
        tautan: `pages/penghuni/laporan-detail.html?id=${l.id}`
      });
      return lengkapiLaporan(l);
    }
  };

  // ===== NOTIFIKASI =====
  store.notifikasi = {
    async milikSaya() {
      const p = wajibMasuk();
      return baca("notifikasi").filter((n) => n.penggunaId === p.id)
        .sort((a, b) => b.waktu.localeCompare(a.waktu));
    },

    async jumlahBelumDibaca() {
      const p = penggunaSesi();
      return p ? baca("notifikasi").filter((n) => n.penggunaId === p.id && !n.dibaca).length : 0;
    },

    async tandaiDibaca(id) {
      ubahBaris("notifikasi", id, { dibaca: true });
    },

    async tandaiSemua() {
      const p = wajibMasuk();
      tulis("notifikasi", baca("notifikasi").map((n) => (n.penggunaId === p.id ? { ...n, dibaca: true } : n)));
    }
  };

  // ===== PENGHUNI (pemilik) =====
  store.penghuni = {
    async daftar() {
      wajibPemilik();
      const hariIni = F.keISO(new Date());
      return baca("pengguna").filter((p) => p.role === "penghuni" && reservasiDiterima(p.id))
        .map((p) => {
          const tagihan = baca("tagihan").filter((t) => t.penggunaId === p.id && tagihanAktif(t));
          return {
            ...tanpaSandi(p),
            sewa: hitungSewa(p.id),
            kontakDarurat: reservasiDiterima(p.id).kontakDarurat,
            tunggakan: tagihan.filter((t) => t.status !== "lunas" && t.jatuhTempo < hariIni),
            tagihan
          };
        })
        .sort((a, b) => (a.sewa?.kamar?.nomor || "").localeCompare(b.sewa?.kamar?.nomor || ""));
    }
  };

  // ===== KEUANGAN (pemilik) =====
  store.keuangan = {
    async ringkasan(tahun) {
      wajibPemilik();
      const hariIni = F.keISO(new Date());
      const semua = baca("tagihan");
      const aktif = semua.filter(tagihanAktif);
      const lunas = aktif.filter((t) => t.status === "lunas" && t.dibayarPada && t.dibayarPada.startsWith(String(tahun)));
      const perBulan = F.BULAN.map((nama, i) => {
        const kode = `${tahun}-${String(i + 1).padStart(2, "0")}`;
        const isi = lunas.filter((t) => t.dibayarPada.startsWith(kode));
        return { kode, nama, jumlah: isi.reduce((s, t) => s + t.jumlah, 0), transaksi: isi.length };
      });
      const tunggakan = aktif.filter((t) => ["belum", "ditolak"].includes(t.status) && t.jatuhTempo < hariIni);
      const menunggu = semua.filter((t) => t.status === "menunggu");
      return {
        perBulan,
        total: perBulan.reduce((s, b) => s + b.jumlah, 0),
        transaksi: lunas.map(lengkapiTagihan).sort((a, b) => b.dibayarPada.localeCompare(a.dibayarPada)),
        tunggakan: tunggakan.map(lengkapiTagihan),
        totalTunggakan: tunggakan.reduce((s, t) => s + t.jumlah, 0),
        totalMenunggu: menunggu.reduce((s, t) => s + t.jumlah, 0)
      };
    }
  };

  // ===== ATURAN KOS =====
  store.aturan = {
    async ambil() {
      return baca("aturan", { diperbarui: null, kelompok: [] });
    },

    async simpan(kelompok) {
      wajibPemilik();
      const data = { diperbarui: sekarang(), kelompok };
      tulis("aturan", data);
      return data;
    }
  };

  // ===== HITUNGAN UNTUK MENU & DASHBOARD =====
  store.hitungan = {
    async menu() {
      const p = penggunaSesi();
      if (!p) return {};
      const hasil = { notifikasi: await store.notifikasi.jumlahBelumDibaca() };
      if (p.role === "pemilik") {
        hasil.reservasi = baca("reservasi").filter((r) => r.status === "menunggu").length;
        hasil.pembayaran = baca("tagihan").filter((t) => t.status === "menunggu" && t.jenis !== "Sewa bulan pertama").length;
        hasil.perpanjangan = baca("perpanjangan").filter((x) => x.status === "menunggu").length;
        hasil.laporan = baca("laporan").filter((l) => l.status === "baru").length;
      }
      return hasil;
    }
  };

  // ===== ALAT DEMO (dipakai dev.html, hapus saat produksi) =====
  store.demo = {
    async reset() {
      tulis("versi", 0);
      siapkanData();
    },

    async masukSebagai(email) {
      const p = baca("pengguna").find((x) => x.email === email);
      if (!p) throw new GagalStore("Akun demo tidak ditemukan.");
      return store.auth.masuk({ email: p.email, sandi: p.sandi });
    },

    async isiTabel() {
      const hasil = {};
      [...TABEL, "aturan", "sesi", "versi"].forEach((t) => { hasil[t] = baca(t, null); });
      return hasil;
    }
  };

  S.store = store;
})();
