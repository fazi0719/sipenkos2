// =========================================================
// Profil — ubah nama & nomor HP, ganti kata sandi
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const LABEL = { pemilik: "Pemilik Kos", penghuni: "Penghuni", calon: "Calon Penghuni" };

  const tampilkanKepala = (p) => {
    $("avatar").textContent = F.inisial(p.nama);
    $("nama").textContent = p.nama;
  };
  tampilkanKepala(pengguna);
  $("ringkas").textContent = `${LABEL[pengguna.jenis]} · ${pengguna.email}`;

  const form = $("formProfil");
  form.nama.value = pengguna.nama;
  form.email.value = pengguna.email;
  form.hp.value = pengguna.hp || "";

  // info kamar untuk penghuni aktif
  if (pengguna.jenis === "penghuni") {
    const sewa = await store.sewa.saya();
    const r = await store.reservasi.milikSaya();
    $("kartuSewa").hidden = false;
    $("infoSewa").innerHTML = ui.rincian([
      ["Kamar", F.esc(`Kamar ${sewa.kamar.nomor} · ${sewa.tipe.nama}`)],
      ["Masa Sewa", F.rentang(sewa.mulai, sewa.akhir)],
      ["Kontak Darurat", F.esc(`${r.kontakDarurat.nama} (${r.kontakDarurat.hubungan})`)],
      ["Nomor Darurat", F.esc(r.kontakDarurat.hp)]
    ]);
  }

  ui.bersihkanErrorSaatIsi(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = ui.validasi(form, {
      nama: (v) => (v.length < 3 ? "Nama minimal 3 huruf." : ""),
      hp: (v) => (!/^08\d{8,12}$/.test(v) ? "Nomor diawali 08, 10–14 digit." : "")
    });
    if (!valid) return;
    try {
      const p = await ui.sibuk(form.querySelector("[type=submit]"), () =>
        store.auth.perbaruiProfil({ nama: form.nama.value, hp: form.hp.value }));
      tampilkanKepala(p);
      document.querySelectorAll(".profil-nama").forEach((el) => { el.textContent = F.namaDepan(p.nama); });
      ui.toast("Profil berhasil disimpan");
    } catch (err) {
      ui.gagal(err);
    }
  });

  const sandi = $("formSandi");
  ui.bersihkanErrorSaatIsi(sandi);
  sandi.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = ui.validasi(sandi, {
      lama: (v) => (!v ? "Isi kata sandi lama." : ""),
      baru: (v) => (v.length < 6 ? "Minimal 6 karakter." : ""),
      baru2: (v, f) => (v !== f.baru.value ? "Kata sandi baru tidak sama." : "")
    });
    if (!valid) return;
    try {
      await ui.sibuk(sandi.querySelector("[type=submit]"), () =>
        store.auth.gantiSandi({ lama: sandi.lama.value, baru: sandi.baru.value }));
      sandi.reset();
      ui.toast("Kata sandi berhasil diganti");
    } catch (err) {
      ui.tandaiError(sandi.lama, err.message);
      sandi.lama.focus();
    }
  });
});
