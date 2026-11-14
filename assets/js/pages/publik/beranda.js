// =========================================================
// Beranda — fasilitas ringkas & kartu tipe kamar
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, ikon, format } = SIPENKOS;

  document.getElementById("fasilitas").innerHTML = config.kos.fasilitasRingkas
    .map((f) => `<span class="chip">${ikon(f.ikon)}${format.esc(f.label)}</span>`).join("");

  const tipe = await store.kamar.daftarTipe();
  document.getElementById("daftarTipe").innerHTML = tipe.map(ui.kartuKamar).join("");
});
