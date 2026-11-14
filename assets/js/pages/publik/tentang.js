// =========================================================
// Tentang — kontak, peta, dan aturan kos
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config } = SIPENKOS;
  const k = config.kos;

  document.getElementById("alamat").textContent = k.alamatLengkap;
  document.getElementById("jam").textContent = `Jam bertamu ${k.jamBertamu}`;
  document.getElementById("tombolPeta").href = k.petaLink;
  document.getElementById("tombolWa").href = ui.waLink("Halo Bu Nining, saya ingin bertanya tentang kos.");

  const aturan = await store.aturan.ambil();
  document.getElementById("isiAturan").innerHTML = ui.aturanHTML(aturan.kelompok);

  if (window.location.hash === "#aturan") document.getElementById("aturan").scrollIntoView();
});
