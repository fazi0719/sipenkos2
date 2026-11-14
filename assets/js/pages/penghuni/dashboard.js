// =========================================================
// Dashboard Penghuni — ringkasan sewa, tagihan, laporan, pembayaran
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

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
    if (lewat) $("bannerTagihan").classList.replace("kotak-status--peringatan", "kotak-status--bahaya");
  }

  // masa sewa
  $("masaSewa").textContent = F.rentang(sewa.mulai, sewa.akhir);
  $("ketSewa").textContent = perpanjangan?.status === "menunggu"
    ? "Pengajuan perpanjangan sedang diverifikasi"
    : `Berakhir ${F.tanggalPanjang(sewa.akhir)}`;

  // laporan kerusakan
  const aktif = laporan.filter((l) => l.status !== "selesai");
  $("jumlahLaporan").textContent = aktif.length ? `${aktif.length} sedang diproses` : "Tidak ada laporan aktif";
  $("ketLaporan").textContent = laporan.length ? `Terakhir: ${laporan[0].judul}` : "Belum pernah melapor";
  if (aktif.length === 1) $("lihatLaporan").href = `laporan-detail.html?id=${encodeURIComponent(aktif[0].id)}`;

  // pembayaran terakhir
  const lunas = tagihan.filter((t) => t.status === "lunas").sort((a, b) => b.dibayarPada.localeCompare(a.dibayarPada))[0];
  if (lunas) {
    $("bayarTerakhir").innerHTML = `${F.periode(lunas.periode)} ${ui.badge("tagihan", "lunas")}`;
    $("ketBayar").textContent = `${F.rupiah(lunas.jumlah)} · ${F.tanggal(lunas.dibayarPada)}`;
  } else {
    $("bayarTerakhir").textContent = "Belum ada";
  }

  // kamar saya
  $("fotoKamar").src = ui.gambar(sewa.tipe.foto);
  $("fotoKamar").alt = `Foto ${sewa.tipe.nama}`;
  $("namaKamar").textContent = `Kamar ${sewa.kamar.nomor} · ${ui.judulTipe(sewa.tipe)}`;
  $("hargaKamar").textContent = F.rupiah(sewa.hargaPerBulan);
  $("periodeKamar").textContent = `Periode sewa ${F.rentang(sewa.mulai, sewa.akhir)}`;
  $("detailKamar").href = SIPENKOS.url(`pages/publik/detail-kamar.html?tipe=${sewa.tipe.id}`);
});
