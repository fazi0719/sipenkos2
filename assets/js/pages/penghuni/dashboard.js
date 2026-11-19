// =========================================================
// Dashboard Penghuni — ringkasan sewa, tagihan, laporan, pembayaran
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  // elemen keterangan tidak ada di tampilan versi kelompok → abaikan bila tidak ditemukan
  const isi = (id, teks) => { const el = $(id); if (el) el.textContent = teks; };

  // ambil semua data sekaligus (paralel)
  const [sewa, harusDibayar, tagihan, laporan, perpanjangan] = await Promise.all([
    store.sewa.saya(),
    store.tagihan.harusDibayar(),
    store.tagihan.milikSaya(),
    store.laporan.milikSaya(),
    store.perpanjangan.terakhirSaya()
  ]);

  $("sapaan").textContent = `Selamat datang, ${F.namaDepan(pengguna.nama)}`;
  $("subKamar").textContent = `Kamar ${sewa.kamar.nomor} · ${ui.judulTipe(sewa.tipe)}`;

  // banner tagihan yang harus dibayar
  if (harusDibayar) {
    const lewat = harusDibayar.jatuhTempo < F.keISO(new Date());
    $("bannerTagihan").hidden = false;
    $("teksTagihan").textContent = `Tagihan ${harusDibayar.jenis.toLowerCase()} ${F.periode(harusDibayar.periode)} sebesar ${F.rupiah(harusDibayar.jumlah)} ${lewat ? "sudah lewat jatuh tempo" : "jatuh tempo"} ${F.tanggal(harusDibayar.jatuhTempo)}`;
    $("tombolBayar").href = `bayar-tagihan.html?id=${encodeURIComponent(harusDibayar.id)}`;

  }

  // masa sewa
  $("masaSewa").textContent = F.rentang(sewa.mulai, sewa.akhir);
  const sudahBerakhir = sewa.akhir < F.keISO(new Date());
  isi("ketSewa", perpanjangan?.status === "menunggu"
    ? "Pengajuan perpanjangan sedang diverifikasi"
    : sudahBerakhir ? "Masa sewa sudah berakhir. Ajukan perpanjangan." : `Berakhir ${F.tanggalPanjang(sewa.akhir)}`);

  // laporan kerusakan
  const aktif = laporan.filter((l) => l.status !== "selesai");
  $("jumlahLaporan").textContent = aktif.length ? `${aktif.length} sedang diproses` : laporan.length ? "Tidak ada laporan aktif" : "Belum ada laporan";
  isi("ketLaporan", laporan.length ? `Terakhir: ${laporan[0].judul}` : "Belum pernah melapor");
  if (aktif.length === 1) $("lihatLaporan").href = `laporan-detail.html?id=${encodeURIComponent(aktif[0].id)}`;

  // pembayaran terakhir
  const lunas = tagihan.filter((t) => t.status === "lunas").sort((a, b) => b.dibayarPada.localeCompare(a.dibayarPada))[0];
  if (lunas) {
    $("bayarTerakhir").textContent = F.periode(lunas.periode);
    $("statusBayar").hidden = false;
    isi("ketBayar", `${F.rupiah(lunas.jumlah)} · ${F.tanggal(lunas.dibayarPada)}`);
  } else {
    $("bayarTerakhir").textContent = "Belum ada";
  }

  // kamar saya
  $("fotoKamar").src = ui.gambar(sewa.tipe.foto);
  $("fotoKamar").alt = `Foto ${sewa.tipe.nama}`;
  $("namaKamar").textContent = `Kamar ${sewa.kamar.nomor} · ${ui.judulTipe(sewa.tipe)}`;
  $("hargaKamar").textContent = `${F.rupiah(sewa.hargaPerBulan)} / bulan`;
  $("periodeKamar").textContent = F.rentang(sewa.mulai, sewa.akhir);
  $("detailKamar").href = SIPENKOS.url(`pages/publik/detail-kamar.html?tipe=${sewa.tipe.id}`);
});
