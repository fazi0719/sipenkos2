// =========================================================
// Masuk — tampilan mengikuti calon-penghuni/login.php kelompok
// (tab Penghuni / Pengelola). Parameter opsional:
//   ?kembali=pages/reservasi/formulir.html?tipe=4   (tujuan setelah masuk)
//   ?tipe=4                                          (tampilkan info reservasi)
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const kembali = ui.param("kembali");

  await tampilkanInfoReservasi();
  $("keDaftar").href = "daftar.html" + window.location.search;
  if (ui.param("tipe")) {
    $("tautanKembali").href = `../publik/detail-kamar.html?tipe=${encodeURIComponent(ui.param("tipe"))}`;
    $("tautanKembali").textContent = "← Kembali ke Detail Kamar";
  }

  // ---------- tab Penghuni / Pengelola ----------
  const tab = { penghuni: $("tab-penghuni"), pengelola: $("tab-pengelola") };
  const pilihTab = (nama) => {
    Object.entries(tab).forEach(([k, el]) => {
      const aktif = k === nama;
      el.classList.toggle("is-active", aktif);
      el.setAttribute("aria-selected", String(aktif));
      el.tabIndex = aktif ? 0 : -1;
      $("panel-" + k).hidden = !aktif;
    });
  };
  tab.penghuni.addEventListener("click", () => pilihTab("penghuni"));
  tab.pengelola.addEventListener("click", () => pilihTab("pengelola"));

  $("lupaSandi").addEventListener("click", (e) => {
    e.preventDefault();
    ui.dialog({
      judul: "Lupa kata sandi?",
      isi: `<p>Hubungi pemilik kos lewat WhatsApp <strong>${F.esc(config.kos.whatsapp)}</strong> untuk mengatur ulang kata sandi akun kamu.</p>`,
      tombol: [{ label: "Tutup", kelas: "tombol--sekunder", nilai: "batal" }]
    });
  });

  const masuk = (form, pesan, { pemilik }) => form.addEventListener("submit", async (e) => {
    e.preventDefault();
    pesan.hidden = true;
    const email = form.email.value.trim();
    const sandi = form.sandi.value;
    const salah = !email ? (pemilik ? "Username wajib diisi." : "Email wajib diisi.")
      : !pemilik && !/^\S+@\S+\.\S+$/.test(email) ? "Format email belum benar."
      : !sandi ? "Kata sandi wajib diisi." : "";
    if (salah) { pesan.textContent = salah; pesan.hidden = false; return; }
    try {
      const p = await ui.sibuk(form.querySelector("[type=submit]"), () =>
        store.auth.masuk({ email, sandi, ingat: pemilik ? true : form.ingat.checked }));
      if (pemilik && p.jenis !== "pemilik") {
        await store.auth.keluar();
        throw new Error("Akun ini bukan akun pengelola kos.");
      }
      const reservasi = p.jenis === "calon" ? await store.reservasi.milikSaya() : null;
      ui.ke(kembali || (p.jenis === "calon" ? (reservasi ? config.beranda.calon : config.beranda.calonBaru) : config.beranda[p.jenis]));
    } catch (err) {
      pesan.textContent = err.message;
      pesan.hidden = false;
    }
  });
  masuk($("formMasuk"), $("pesanMasuk"), { pemilik: false });
  masuk($("formPengelola"), $("pengelola-galat"), { pemilik: true });
});
