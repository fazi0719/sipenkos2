// =========================================================
// Masuk — validasi isian, masuk, lalu arahkan ke halaman tujuan
// Parameter opsional:
//   ?kembali=pages/reservasi/formulir.html?tipe=4   (tujuan setelah masuk)
//   ?tipe=4                                          (tampilkan info reservasi)
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const form = document.getElementById("formMasuk");
  const kembali = ui.param("kembali");

  await tampilkanInfoReservasi();
  pasangLihatSandi();

  // teruskan parameter ke tautan Daftar
  document.getElementById("keDaftar").href = "daftar.html" + window.location.search;

  document.getElementById("lupaSandi").addEventListener("click", () => ui.dialog({
    judul: "Lupa kata sandi?",
    isi: `<p>Hubungi pemilik kos lewat WhatsApp <strong>${F.esc(config.kos.whatsapp)}</strong> untuk mengatur ulang kata sandi akun kamu.</p>`,
    tombol: [{ label: "Tutup", kelas: "tombol--sekunder", nilai: "batal" }]
  }));

  ui.bersihkanErrorSaatIsi(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pesan = document.getElementById("pesanMasuk");
    pesan.hidden = true;

    const valid = ui.validasi(form, {
      email: (v) => (!v ? "Email wajib diisi." : !/^\S+@\S+\.\S+$/.test(v) ? "Format email belum benar." : ""),
      sandi: (v) => (!v ? "Kata sandi wajib diisi." : "")
    });
    if (!valid) return;

    try {
      const p = await ui.sibuk(form.querySelector("[type=submit]"), () =>
        store.auth.masuk({ email: form.email.value, sandi: form.sandi.value }));
      const reservasi = p.jenis === "calon" ? await store.reservasi.milikSaya() : null;
      const tujuan = kembali
        || (p.jenis === "calon" ? (reservasi ? config.beranda.calon : config.beranda.calonBaru) : config.beranda[p.jenis]);
      ui.ke(tujuan);
    } catch (err) {
      pesan.innerHTML = SIPENKOS.ikon("error") + F.esc(err.message);
      pesan.hidden = false;
    }
  });
});
