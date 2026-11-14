// =========================================================
// Laporan Kerusakan (pemilik) — semua laporan dari penghuni
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F } = SIPENKOS;
  const semua = await store.laporan.semua();
  const daftar = document.getElementById("daftar");

  const tampilkan = (saring) => {
    const isi = saring === "semua" ? semua : semua.filter((l) => l.status === saring);
    daftar.innerHTML = isi.length
      ? isi.map((l) => `
        <a class="item" href="laporan-detail.html?id=${encodeURIComponent(l.id)}">
          <div class="item-gambar">${l.foto ? `<img src="${F.esc(ui.gambar(l.foto))}" alt="">` : ikon(ui.ikonKategori(l.kategori))}</div>
          <div>
            <h2 class="item-judul">${F.esc(l.judul)}</h2>
            <p class="item-ket">Kamar ${F.esc(l.kamar?.nomor || "-")} · ${F.esc(l.pengguna?.nama || "-")} · ${F.esc(l.kategori)} · ${F.tanggal(l.dibuatPada)}</p>
          </div>
          <div class="item-kanan">${ui.badge("laporan", l.status)}<span class="tautan-lihat">Tindak lanjut${ikon("arrow_forward")}</span></div>
        </a>`).join("")
      : `<div class="kartu">${ui.kosong({ ikon: "build", judul: "Tidak ada laporan" })}</div>`;
  };

  ui.filterPil(document.getElementById("filter"), [
    { nilai: "baru", label: `Baru (${semua.filter((l) => l.status === "baru").length})` },
    { nilai: "diproses", label: "Diproses" },
    { nilai: "selesai", label: "Selesai" },
    { nilai: "semua", label: "Semua" }
  ], tampilkan, "baru");
  tampilkan("baru");
});
