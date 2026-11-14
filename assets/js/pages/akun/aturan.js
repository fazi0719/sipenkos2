// =========================================================
// Kebijakan & Aturan Kos (penghuni & calon penghuni)
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F } = SIPENKOS;
  const aturan = await store.aturan.ambil();
  document.getElementById("diperbarui").textContent = aturan.diperbarui ? `Terakhir diperbarui ${F.tanggal(aturan.diperbarui)}` : "";
  document.getElementById("isiAturan").innerHTML = ui.aturanHTML(aturan.kelompok);
});
