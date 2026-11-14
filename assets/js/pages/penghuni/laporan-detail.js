// =========================================================
// Detail Laporan Kerusakan (Figma frame 22)
// Alamat: laporan-detail.html?id=LK-...
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui } = SIPENKOS;
  const wadah = document.getElementById("isiLaporan");
  const l = await store.laporan.ambil(ui.param("id"));

  if (!l) {
    wadah.innerHTML = `<div class="kartu">${ui.kosong({ ikon: "build", judul: "Laporan tidak ditemukan", aksi: '<a class="tombol tombol--utama" href="laporan.html">Lihat Semua Laporan</a>' })}</div>`;
    return;
  }
  document.title = `${l.judul} · SIPENKOS`;
  wadah.innerHTML = ui.detailLaporan(l);
  wadah.querySelector("[data-lihat-foto]")?.addEventListener("click", () => ui.lihatGambar(l.foto, "Foto Kerusakan"));
});
