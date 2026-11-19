// =========================================================
// Daftar Kamar — tampilan mengikuti calon-penghuni/daftar-kamar.php kelompok
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F } = SIPENKOS;
  const semua = await store.kamar.daftarTipe();
  document.getElementById("daftarTipe").innerHTML = semua.map((t) => `
    <article class="card-kamar">
      <div class="card">
        <img src="${F.esc(ui.gambar(t.foto))}" alt="${F.esc(t.nama)} ${F.esc(t.ringkas)} Kos Bu Nining" loading="lazy">
        ${t.tersedia ? `<span class="tersedia">Tersedia - sisa ${t.sisa}</span>` : '<span class="penuh">Penuh</span>'}
      </div>
      <div class="card-body">
        <h3 class="tipe-kamar">${F.esc(t.nama)} ${F.esc(t.ringkas)}</h3>
        <p class="deskripsi-kamar">${F.esc(t.deskripsi)}</p>
        <div class="harga-container">
          <span class="label">Biaya sewa</span>
          <div class="harga${t.tersedia ? "" : " text-muted-harga"}"><span class="nominal">${F.rupiah(t.harga)}</span> / bulan</div>
        </div>
        ${t.tersedia
          ? `<a href="detail-kamar.html?tipe=${t.id}" class="btn btn-outline btn-full">Lihat Detail</a>`
          : '<button type="button" class="btn btn-disabled btn-full" disabled>Penuh (Tidak Tersedia)</button>'}
      </div>
    </article>`).join("");
});
