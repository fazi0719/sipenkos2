// =========================================================
// Status Reservasi & Pembayaran (langkah 3 dari 3)
// Tampilan berubah sesuai status: draf · menunggu · diterima · ditolak
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const r = await store.reservasi.milikSaya();

  if (!r) {
    $("kosong").hidden = false;
    $("kosong").innerHTML = `<div class="kartu">${ui.kosong({
      ikon: "assignment",
      judul: "Belum ada reservasi",
      pesan: "Pilih kamar yang kamu inginkan, lalu tekan Reservasi Sekarang.",
      aksi: `<a class="tombol tombol--utama" href="${SIPENKOS.url("pages/publik/kamar.html")}">Lihat Kamar</a>`
    })}</div>`;
    return;
  }
  $("isi").hidden = false;

  const t = r.tagihanPertama;
  const wa = `<a class="tombol tombol--wa" href="${ui.waLink(`Halo Bu Nining, saya ${r.pengguna.nama} ingin bertanya tentang reservasi saya.`)}" target="_blank" rel="noopener">${SIPENKOS.ikon("chat")}Hubungi Pemilik (WhatsApp)</a>`;
  const lihatBukti = t?.bukti ? `<button type="button" class="tombol tombol--sekunder" id="lihatBukti">Lihat Bukti Pembayaran</button>` : "";

  // ---------- kotak status & penunjuk langkah ----------
  const TAMPILAN = {
    draf: {
      kelas: "info", langkah: ui.langkahReservasi(2),
      pesan: "Reservasi kamu belum dibayar. Selesaikan pembayaran sewa bulan pertama agar bisa diverifikasi.",
      aksi: `<a class="tombol tombol--utama" href="pembayaran.html">Lanjutkan Pembayaran</a>`
    },
    menunggu: {
      kelas: "peringatan", langkah: ui.langkahReservasi(3),
      pesan: "Pemilik kos sedang memeriksa data dan bukti pembayaran kamu. Hasilnya dikirim lewat notifikasi.",
      aksi: lihatBukti + wa
    },
    diterima: {
      kelas: "sukses", langkah: ui.langkahReservasi(3, { semuaSelesai: true }),
      pesan: `Reservasi dan pembayaran kamu sudah dikonfirmasi. Kamu menempati Kamar ${r.kamar?.nomor} · ${r.tipe.nama} mulai ${F.tanggal(r.tglMulai)}.`,
      aksi: `<a class="tombol tombol--utama" href="${SIPENKOS.url(config.beranda.penghuni)}">Masuk ke Dashboard Penghuni${SIPENKOS.ikon("arrow_forward")}</a>`
    },
    ditolak: {
      kelas: "bahaya", langkah: ui.langkahReservasi(3, { gagal: 3 }),
      pesan: `Alasan: ${r.alasanTolak}. Silakan unggah ulang bukti atau hubungi pemilik kos.`,
      aksi: `<a class="tombol tombol--utama" href="pembayaran.html">${SIPENKOS.ikon("upload")}Unggah Ulang Bukti</a>${wa}`
    }
  };
  const v = TAMPILAN[r.status];
  $("langkah").innerHTML = v.langkah;
  $("kotakStatus").classList.add(`kotak-status--${v.kelas}`);
  $("badgeStatus").outerHTML = ui.badge("reservasi", r.status);
  $("pesanStatus").textContent = v.pesan;
  $("aksiStatus").innerHTML = v.aksi;
  $("lihatBukti")?.addEventListener("click", () => ui.lihatGambar(t.bukti, "Bukti Pembayaran"));

  // ---------- ringkasan ----------
  $("fotoKamar").src = ui.gambar(r.tipe.foto);
  $("fotoKamar").alt = `Foto ${r.tipe.nama}`;
  $("ringkasan").innerHTML = ui.rincian([
    ["Kamar", F.esc((r.kamar ? `Kamar ${r.kamar.nomor} · ` : "") + ui.judulTipe(r.tipe))],
    ["Durasi", `${r.durasi} Bulan`],
    ["Mulai", F.tanggal(r.tglMulai)],
    [r.status === "ditolak" ? "Jumlah transfer" : "Dibayar", `<span class="harga">${F.rupiah(t.jumlah)}</span> <span class="muted kecil">(sewa bulan pertama)</span>`]
  ]);

  // ---------- timeline ----------
  const keputusan = r.status === "diterima" || r.status === "ditolak";
  $("timeline").innerHTML = ui.timeline([
    { judul: "Reservasi dikirim", ket: F.waktu(r.dibuatPada), keadaan: "selesai" },
    { judul: "Bukti pembayaran diunggah", ket: t.dikirimPada ? F.waktu(t.dikirimPada) : "Menunggu bukti transfer", keadaan: t.dikirimPada ? "selesai" : "berjalan", ikon: "upload" },
    { judul: "Verifikasi pemilik kos", ket: keputusan ? F.waktu(r.diputuskanPada) : "", keadaan: keputusan ? "selesai" : r.status === "menunggu" ? "berjalan" : "belum" },
    r.status === "ditolak"
      ? { judul: "Reservasi ditolak", ket: F.waktu(r.diputuskanPada), keadaan: "gagal" }
      : { judul: "Reservasi diterima", ket: r.status === "diterima" ? "Kamar siap ditempati sesuai tanggal mulai sewa." : "", keadaan: r.status === "diterima" ? "selesai" : "belum" }
  ]);
});
