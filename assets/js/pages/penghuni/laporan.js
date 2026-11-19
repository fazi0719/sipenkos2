// =========================================================
// Laporan Kerusakan (Figma frame 20) — daftar + filter status.
// Tampilan mengikuti penghuni/laporan-kerusakan.php kelompok.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F, laporanK: K } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const semua = await store.laporan.milikSaya();
  let filterAktif = "semua";

  const item = (l) => `
    <li class="card-box item-laporan">
      <div class="thumb">${l.foto ? `<img src="${F.esc(ui.gambar(l.foto))}" alt="">` : K.ikonKategori(l.kategori)}</div>
      <div>
        <h2 class="item-judul">${F.esc(l.judul)}</h2>
        <p class="item-meta">${F.esc(l.kategori)}  ·  ${F.tanggal(l.dibuatPada)}</p>
      </div>
      <div class="item-kanan">
        <span class="${K.kelasStatus(l.status)}">${K.label(l.status)}</span>
        <a class="link-detail" href="laporan-detail.html?id=${encodeURIComponent(l.id)}" aria-label="Lihat detail laporan ${F.esc(l.judul)}">Lihat Detail ${K.IKON.panah}</a>
      </div>
    </li>`;

  const tampilkan = () => {
    const hasil = filterAktif === "semua" ? semua : semua.filter((l) => l.status === filterAktif);
    $("daftarLaporan").innerHTML = hasil.map(item).join("");
    $("kosong").hidden = hasil.length > 0;
    if (!hasil.length) {
      const belumAda = semua.length === 0;
      $("kosongJudul").textContent = belumAda ? "Belum ada laporan" : `Tidak ada laporan berstatus ${K.label(filterAktif)}`;
      $("kosongPesan").textContent = belumAda
        ? "Ada fasilitas kamar yang rusak? Buat laporan agar pemilik kos bisa segera menindaklanjuti."
        : "Coba pilih filter status yang lain.";
    }
  };

  $("filterStatus").addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    filterAktif = b.dataset.filter.toLowerCase();
    $("filterStatus").querySelectorAll("[data-filter]").forEach((x) => {
      const aktif = x === b;
      x.classList.toggle("aktif", aktif);
      x.setAttribute("aria-pressed", String(aktif));
    });
    tampilkan();
  });
  tampilkan();
});
