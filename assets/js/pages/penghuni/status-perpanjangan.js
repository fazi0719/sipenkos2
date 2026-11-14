// =========================================================
// Status Perpanjangan Sewa (Figma frame 19, 19B + ditolak)
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const x = await store.perpanjangan.terakhirSaya();

  if (!x) {
    $("kosong").hidden = false;
    $("kosong").innerHTML = `<div class="kartu">${ui.kosong({
      ikon: "event_repeat", judul: "Belum ada pengajuan perpanjangan",
      aksi: '<a class="tombol tombol--utama" href="perpanjangan.html">Ajukan Perpanjangan</a>'
    })}</div>`;
    return;
  }
  $("isi").hidden = false;

  const belumBayar = x.tagihan.find((t) => ["belum", "ditolak"].includes(t.status));
  const PESAN = {
    menunggu: ["peringatan", "Pengajuan perpanjangan sedang diperiksa pemilik kos."],
    disetujui: ["sukses", belumBayar
      ? `Pengajuan disetujui! Silakan bayar ${belumBayar.jenis.includes("DP") ? `DP ${config.aturanBisnis.persenDp}%` : belumBayar.jenis.includes("Pelunasan") ? "pelunasan" : "biaya perpanjangan"} sebesar ${F.rupiah(belumBayar.jumlah)}.`
      : "Pengajuan disetujui dan masa sewa kamu sudah diperbarui."],
    ditolak: ["bahaya", `Pengajuan ditolak. Alasan: ${x.alasanTolak}`]
  };
  const [kelas, pesan] = PESAN[x.status];
  $("kotakStatus").classList.add(`kotak-status--${kelas}`);
  $("badgeStatus").outerHTML = ui.badge("perpanjangan", x.status);
  $("pesanStatus").textContent = pesan;

  $("rincian").innerHTML = ui.rincian([
    ["Kamar", F.esc(`Kamar ${(x.kamar || x.kamarLama).nomor} · ${ui.judulTipe(x.tipe)}`)],
    ["Durasi", `${x.durasi} Bulan`],
    ["Skema", x.skema === "dp" ? `DP ${config.aturanBisnis.persenDp}%` : "Lunas"],
    ["Metode", F.esc(x.metode)],
    ["Masa sewa baru", F.rentang(x.mulaiBaru, x.akhirBaru)],
    ["Total biaya", `<span class="harga">${F.rupiah(x.total)}</span>`],
    x.skema === "dp" ? ["Dibayar di awal (DP)", F.rupiah(x.dibayar)] : null,
    x.skema === "dp" ? ["Sisa pelunasan", F.rupiah(x.sisa)] : null
  ]);
  $("nomor").textContent = x.id;

  if (x.status === "disetujui" && belumBayar) {
    $("aksi").innerHTML = `<a class="tombol tombol--utama" href="bayar-tagihan.html?id=${encodeURIComponent(belumBayar.id)}">${x.skema === "dp" && belumBayar.jenis.includes("DP") ? "Bayar DP Sekarang" : "Bayar Sekarang"}</a>`;
  } else if (x.status === "ditolak") {
    $("aksi").innerHTML = '<a class="tombol tombol--utama" href="perpanjangan.html">Ajukan Ulang</a>';
  }

  const diputuskan = x.status !== "menunggu";
  $("timeline").innerHTML = ui.timeline([
    { judul: "Pengajuan dikirim", ket: F.waktu(x.dibuatPada), keadaan: "selesai" },
    x.status === "ditolak"
      ? { judul: "Pengajuan ditolak pemilik kos", ket: F.waktu(x.diputuskanPada), keadaan: "gagal" }
      : { judul: diputuskan ? "Pengajuan disetujui pemilik kos" : "Verifikasi pemilik kos", ket: diputuskan ? F.waktu(x.diputuskanPada) : "Sedang diperiksa", keadaan: diputuskan ? "selesai" : "berjalan" },
    { judul: "Pembayaran", ket: x.status === "disetujui" ? (belumBayar ? "Menunggu pembayaran" : "Sudah dibayar") : "", keadaan: x.status === "disetujui" ? (belumBayar ? "berjalan" : "selesai") : "belum", ikon: "payments" },
    { judul: "Masa sewa diperbarui", ket: x.status === "disetujui" ? `Berlaku ${F.rentang(x.mulaiBaru, x.akhirBaru)}` : "", keadaan: x.status === "disetujui" && !belumBayar ? "selesai" : "belum" }
  ]);
});
