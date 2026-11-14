// =========================================================
// Daftar Akun — validasi lengkap, buat akun, lalu lanjut reservasi
// Memakai fungsi tampilkanInfoReservasi() & pasangLihatSandi() yang
// ada di auth/bersama.js.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config } = SIPENKOS;
  const form = document.getElementById("formDaftar");

  await tampilkanInfoReservasi();
  pasangLihatSandi();
  document.getElementById("keMasuk").href = "masuk.html" + window.location.search;

  // NIK & HP hanya angka
  ["nik", "hp"].forEach((n) => form[n].addEventListener("input", () => {
    form[n].value = form[n].value.replace(/\D/g, "");
  }));

  ui.bersihkanErrorSaatIsi(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = ui.validasi(form, {
      nama: (v) => (v.length < 3 ? "Nama lengkap minimal 3 huruf." : ""),
      nik: (v) => (!/^\d{16}$/.test(v) ? "NIK harus 16 digit." : ""),
      hp: (v) => (!/^08\d{8,12}$/.test(v) ? "Nomor HP diawali 08, 10–14 digit." : ""),
      email: (v) => (!/^\S+@\S+\.\S+$/.test(v) ? "Format email belum benar." : ""),
      sandi: (v) => (v.length < 6 ? "Kata sandi minimal 6 karakter." : ""),
      sandi2: (v, f) => (v !== f.sandi.value ? "Konfirmasi kata sandi tidak sama." : ""),
      setuju: (v) => (!v ? "Kamu perlu menyetujui aturan kos." : "")
    });
    if (!valid) return;

    try {
      await ui.sibuk(form.querySelector("[type=submit]"), () => store.auth.daftar({
        nama: form.nama.value, nik: form.nik.value, hp: form.hp.value,
        email: form.email.value, sandi: form.sandi.value
      }));
      ui.ke(ui.param("kembali") || config.beranda.calonBaru);
    } catch (err) {
      ui.tandaiError(form.email, err.message);
      form.email.focus();
    }
  });
});
