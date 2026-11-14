// =========================================================
// Buat Laporan Kerusakan (Figma frame 21)
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config } = SIPENKOS;
  const form = document.getElementById("formLaporan");
  const sewa = await store.sewa.saya();

  document.getElementById("lokasi").value = `Kamar ${sewa.kamar.nomor}`;
  form.kategori.innerHTML = '<option value="" selected disabled>Pilih Kategori</option>' +
    config.pilihan.kategoriLaporan.map((k) => `<option>${k}</option>`).join("");

  const foto = ui.unggah(document.getElementById("unggahFoto"), { nama: "foto", teks: "Klik untuk unggah foto atau seret berkas ke sini" });

  ui.bersihkanErrorSaatIsi(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = ui.validasi(form, {
      kategori: (v) => (!v ? "Pilih kategori kerusakan." : ""),
      judul: (v) => (v.length < 5 ? "Tulis judul kerusakan (minimal 5 huruf)." : ""),
      deskripsi: (v) => (v.length < 10 ? "Jelaskan detail kerusakannya (minimal 10 huruf)." : "")
    });
    if (!valid) return;
    try {
      const l = await ui.sibuk(form.querySelector("[type=submit]"), () => store.laporan.buat({
        kategori: form.kategori.value,
        judul: form.judul.value,
        deskripsi: form.deskripsi.value,
        foto: foto.nilai()?.data
      }));
      ui.ke(`pages/penghuni/laporan-detail.html?id=${encodeURIComponent(l.id)}`);
    } catch (err) {
      ui.gagal(err);
    }
  });
});
