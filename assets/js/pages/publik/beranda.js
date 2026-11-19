// =========================================================
// Beranda — tampilan mengikuti calon-penghuni/beranda.php kelompok
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  const tipe = await store.kamar.daftarTipe();
  $("daftarTipe").innerHTML = tipe.map((t) => `
    <article class="card-kamar">
      <div class="card">
        <img src="${F.esc(ui.gambar(t.foto))}" alt="${F.esc(t.nama)} ${F.esc(t.ringkas)} Kos Bu Nining" loading="lazy">
        ${t.tersedia ? `<span class="tersedia">Tersedia - sisa ${t.sisa}</span>` : '<span class="penuh">Penuh</span>'}
      </div>
      <div class="card-body">
        <h3 class="tipe-kamar">${F.esc(t.nama)} ${F.esc(t.ringkas)}</h3>
        <p class="deskripsi-kamar">${F.esc(t.deskripsi)}</p>
      </div>
    </article>`).join("");

  // banner status reservasi untuk calon penghuni yang sudah reservasi (banner-status.js kelompok)
  if (pengguna && pengguna.jenis === "calon") {
    const r = await store.reservasi.milikSaya();
    const konten = {
      menunggu: ["⏳", "Reservasimu sedang diverifikasi", "Bukti pembayaran sedang diperiksa oleh pemilik kos."],
      diterima: ["✅", "Reservasimu diterima!", "Reservasi dan pembayaran kamu sudah dikonfirmasi oleh pemilik kos."],
      ditolak: ["✕", "Pembayaran ditolak", "Bukti pembayaran belum dapat diterima. Silakan unggah ulang."]
    }[r?.status];
    if (konten) {
      $("bannerStatusIcon").textContent = konten[0];
      $("bannerStatusTitle").textContent = konten[1];
      $("bannerStatusDescription").textContent = konten[2];
      $("bannerStatus").hidden = false;
    }
  }
});
