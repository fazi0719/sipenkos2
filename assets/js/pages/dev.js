// =========================================================
// Panel Uji (dev.html) — hanya untuk developer
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  const AKUN = [
    { email: "rina@mail.com", sandi: "rina123", peran: "Calon penghuni (belum reservasi)" },
    { email: "dimas@mail.com", sandi: "dimas123", peran: "Calon penghuni (menunggu verifikasi)" },
    { email: "nana@mail.com", sandi: "nana123", peran: "Penghuni · Kamar 07" },
    { email: "nining@sipenkos.id", sandi: "pemilik123", peran: "Pemilik kos" }
  ];

  $("sesiSekarang").textContent = pengguna ? `Sedang masuk sebagai ${pengguna.nama} (${pengguna.jenis}).` : "Belum masuk (tamu).";
  $("akunDemo").innerHTML = AKUN.map((a) => `
    <button type="button" class="kartu tombol-akun" data-email="${a.email}">
      <strong>${a.peran}</strong>
      <span class="kecil muted">${a.email} · ${a.sandi}</span>
    </button>`).join("");
  $("akunDemo").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-email]");
    if (!b) return;
    const p = await store.demo.masukSebagai(b.dataset.email);
    const r = p.jenis === "calon" ? await store.reservasi.milikSaya() : null;
    const cfg = SIPENKOS.config.beranda;
    ui.ke(p.jenis === "calon" ? (r ? cfg.calon : cfg.calonBaru) : cfg[p.jenis]);
  });

  $("reset").addEventListener("click", async () => {
    if (!(await ui.konfirmasi({ judul: "Reset data demo?", pesan: "Semua perubahan (akun baru, reservasi, laporan, dll.) akan hilang dan kembali ke data awal.", label: "Reset", bahaya: true }))) return;
    await store.demo.reset();
    window.location.reload();
  });

  const HALAMAN = {
    "Publik": [["Beranda", "index.html"], ["Daftar Kamar", "pages/publik/kamar.html"], ["Detail Kamar", "pages/publik/detail-kamar.html?tipe=4"], ["Tentang", "pages/publik/tentang.html"], ["Masuk", "pages/auth/masuk.html"], ["Daftar Akun", "pages/auth/daftar.html"]],
    "Calon penghuni": [["Formulir Reservasi", "pages/reservasi/formulir.html?tipe=4"], ["Pembayaran", "pages/reservasi/pembayaran.html"], ["Status Reservasi", "pages/reservasi/status.html"], ["Profil", "pages/akun/profil.html"], ["Notifikasi", "pages/akun/notifikasi.html"], ["Aturan", "pages/akun/aturan.html"]],
    "Penghuni": [["Dashboard", "pages/penghuni/dashboard.html"], ["Tagihan", "pages/penghuni/tagihan.html"], ["Riwayat", "pages/penghuni/riwayat.html"], ["Perpanjangan", "pages/penghuni/perpanjangan.html"], ["Status Perpanjangan", "pages/penghuni/status-perpanjangan.html"], ["Laporan Kerusakan", "pages/penghuni/laporan.html"], ["Buat Laporan", "pages/penghuni/laporan-buat.html"]],
    "Pemilik": [["Dashboard", "pages/pemilik/dashboard.html"], ["Reservasi", "pages/pemilik/reservasi.html"], ["Pembayaran", "pages/pemilik/pembayaran.html"], ["Perpanjangan", "pages/pemilik/perpanjangan.html"], ["Laporan Kerusakan", "pages/pemilik/laporan.html"], ["Kamar", "pages/pemilik/kamar.html"], ["Penghuni", "pages/pemilik/penghuni.html"], ["Keuangan", "pages/pemilik/keuangan.html"], ["Aturan", "pages/pemilik/aturan.html"]]
  };
  $("daftarHalaman").innerHTML = Object.entries(HALAMAN).map(([grup, daftar]) => `
    <div>
      <h3 class="label mb-6">${grup}</h3>
      <ul class="tumpuk tumpuk--rapat">${daftar.map(([n, h]) => `<li><a href="${SIPENKOS.url(h)}">${n}</a></li>`).join("")}</ul>
    </div>`).join("");

  const data = await store.demo.isiTabel();
  $("isiData").innerHTML = Object.entries(data).map(([t, isi]) => {
    const jumlah = Array.isArray(isi) ? isi.length : isi === null ? 0 : 1;
    const contoh = Array.isArray(isi) ? isi[0] : isi;
    const teks = JSON.stringify(contoh, (k, v) => (typeof v === "string" && v.startsWith("data:") ? "[gambar]" : v));
    return `<tr><td><code>sipenkos:${t}</code></td><td class="angka">${jumlah}</td><td class="kecil muted">${F.esc((teks || "-").slice(0, 160))}</td></tr>`;
  }).join("");
});
