// =========================================================
// Daftar Akun — tampilan mengikuti calon-penghuni/registrasi.php kelompok
// NIK tetap diminta karena dipakai pemilik untuk pendataan penghuni.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config } = SIPENKOS;
  const form = document.getElementById("formDaftar");

  const tipe = ui.param("tipe") && await store.kamar.tipe(ui.param("tipe"));
  if (tipe) document.getElementById("infoReservasiTeks").textContent = `Buat akun untuk melanjutkan reservasi ${ui.judulTipe(tipe)}.`;
  document.getElementById("keMasuk").href = "masuk.html" + window.location.search;

  ["nik", "hp"].forEach((n) => form[n].addEventListener("input", () => { form[n].value = form[n].value.replace(/\D/g, ""); }));

  ui.bersihkanErrorSaatIsi(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = ui.validasi(form, {
      nama: (v) => (v.length < 3 ? "Nama lengkap minimal 3 huruf." : ""),
      nik: (v) => (!/^\d{16}$/.test(v) ? "NIK harus 16 digit angka." : ""),
      hp: (v) => (!/^08\d{8,12}$/.test(v) ? "Nomor HP diawali 08, 10–14 digit." : ""),
      email: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Format email belum benar." : ""),
      sandi: (v) => (v.length < 6 ? "Kata sandi minimal 6 karakter." : ""),
      sandi2: (v, f) => (v !== f.sandi.value ? "Konfirmasi kata sandi tidak sama." : ""),
      setuju: (v) => (!v ? "Kamu perlu menyetujui aturan kos." : "")
    });
    if (!valid) return;
    try {
      await ui.sibuk(form.querySelector("[type=submit]"), () => store.auth.daftar({
        nama: form.nama.value, nik: form.nik.value, hp: form.hp.value, email: form.email.value, sandi: form.sandi.value
      }));
      ui.ke(ui.param("kembali") || config.beranda.calonBaru);
    } catch (err) {
      ui.tandaiError(form.email, err.message);
      form.email.focus();
    }
  });
});
