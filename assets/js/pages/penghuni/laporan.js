// =========================================================
// Laporan Kerusakan — daftar laporan milik penghuni + filter
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F } = SIPENKOS;
  const semua = await store.laporan.milikSaya();
  const daftar = document.getElementById("daftar");

  const tampilkan = (saring) => {
    const isi = saring === "semua" ? semua : semua.filter((l) => l.status === saring);
    daftar.innerHTML = isi.length
      ? isi.map((l) => `
        <article class="item">
          <div class="item-gambar">${l.foto ? `<img src="${F.esc(ui.gambar(l.foto))}" alt="">` : ikon(ui.ikonKategori(l.kategori))}</div>
          <div>
            <h2 class="item-judul">${F.esc(l.judul)}</h2>
            <p class="item-ket">${F.esc(l.kategori)} · ${F.tanggal(l.dibuatPada)}</p>
          </div>
          <div class="item-kanan">
            ${ui.badge("laporan", l.status)}
            <a class="tautan-lihat" href="laporan-detail.html?id=${encodeURIComponent(l.id)}" aria-label="Lihat detail laporan ${F.esc(l.judul)}">Lihat Detail${ikon("arrow_forward")}</a>
          </div>
        </article>`).join("")
      : `<div class="kartu">${ui.kosong({
          ikon: "build",
          judul: semua.length ? "Tidak ada laporan dengan status ini" : "Belum ada laporan",
          pesan: semua.length ? "Coba pilih filter lain." : "Ada fasilitas kamar yang rusak? Buat laporan agar pemilik kos bisa segera menindaklanjuti.",
          aksi: semua.length ? "" : '<a class="tombol tombol--sekunder" href="laporan-buat.html">Buat Laporan</a>'
        })}</div>`;
  };

  ui.filterPil(document.getElementById("filter"), [
    { nilai: "semua", label: "Semua" },
    { nilai: "baru", label: "Baru" },
    { nilai: "diproses", label: "Diproses" },
    { nilai: "selesai", label: "Selesai" }
  ], tampilkan);
  tampilkan("semua");
});
