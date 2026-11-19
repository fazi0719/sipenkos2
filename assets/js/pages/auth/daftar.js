// =========================================================
// Daftar Akun — tampilan mengikuti calon-penghuni/registrasi.php kelompok
// (tanpa isian NIK, seperti repo kelompok).
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config } = SIPENKOS;
  const form = document.getElementById("formDaftar");

  const tipe = ui.param("tipe") && await store.kamar.tipe(ui.param("tipe"));
  if (tipe) document.getElementById("infoReservasiTeks").textContent = `Buat akun untuk melanjutkan reservasi ${ui.judulTipe(tipe)}.`;
  document.getElementById("keMasuk").href = "masuk.html" + window.location.search;

  form.hp.addEventListener("input", () => { form.hp.value = form.hp.value.replace(/\D/g, ""); });

  ui.bersihkanErrorSaatIsi(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = ui.validasi(form, {
      nama: (v) => (v.length < 3 ? "Nama lengkap minimal 3 huruf." : ""),
      hp: (v) => (!/^08\d{8,12}$/.test(v) ? "Nomor HP diawali 08, 10–14 digit." : ""),
      email: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Format email belum benar." : ""),
      sandi: (v) => (v.length < 6 ? "Kata sandi minimal 6 karakter." : ""),
      sandi2: (v, f) => (v !== f.sandi.value ? "Konfirmasi kata sandi tidak sama." : ""),
      setuju: (v) => (!v ? "Kamu perlu menyetujui aturan kos." : "")
    });
    if (!valid) return;
    try {
      await ui.sibuk(form.querySelector("[type=submit]"), () => store.auth.daftar({
        nama: form.nama.value, nik: "", hp: form.hp.value, email: form.email.value, sandi: form.sandi.value
      }));
      ui.ke(ui.param("kembali") || config.beranda.calonBaru);
    } catch (err) {
      ui.tandaiError(form.email, err.message);
      form.email.focus();
    }
  });
});
