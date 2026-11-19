// =========================================================
// Detail Laporan Kerusakan (Figma frame 22) — laporan-detail.html?id=LK-...
// Tampilan mengikuti penghuni/detail-laporan-kerusakan.php kelompok.
// Status diubah pemilik kos di pages/pemilik/laporan-detail.html.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F, laporanK: K } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const l = await store.laporan.ambil(ui.param("id"));

  if (!l) { $("tidakDitemukan").hidden = false; return; }
  $("kontenDetail").hidden = false;
  document.title = `${l.judul} · SIPENKOS`;

  const lokasi = l.kamar ? `Kamar ${l.kamar.nomor}` : "-";
  $("detailJudul").textContent = l.judul;
  $("detailStatus").className = K.kelasStatus(l.status);
  $("detailStatus").textContent = K.label(l.status);
  $("detailId").textContent = `#${l.id}`;
  $("detailKategori").textContent = l.kategori;
  $("detailLokasi").textContent = lokasi;
  $("detailTanggal").textContent = F.tanggal(l.dibuatPada);
  $("detailDeskripsi").textContent = l.deskripsi;
  $("detailPelapor").textContent = `Pengajuan dibuat oleh ${F.namaDepan(l.pengguna?.nama || "Penghuni")} (Penghuni ${lokasi})`;
  if (l.foto) {
    $("detailFoto").src = ui.gambar(l.foto);
    $("blokFoto").hidden = false;
  }
  if (l.catatan) {
    $("catatanIsi").textContent = l.catatan;
    $("catatanPengelola").hidden = false;
  }

  const diterima = l.status !== "baru";
  const selesai = l.status === "selesai";
  const langkah = [
    { judul: "Laporan dikirim", ket: F.waktu(l.dibuatPada), keadaan: "selesai" },
    { judul: "Diterima pemilik kos", ket: diterima ? F.waktu(l.diterimaPada) : "Menunggu ditinjau pemilik kos", keadaan: diterima ? "selesai" : "berjalan", ikon: K.IKON.jam },
    { judul: selesai ? "Sudah diperbaiki" : "Sedang diperbaiki", ket: selesai ? "Perbaikan sudah dikerjakan" : diterima ? "Teknisi telah ditugaskan" : "Menunggu jadwal perbaikan", keadaan: selesai ? "selesai" : diterima ? "berjalan" : "menunggu", ikon: K.IKON.kunciInggris },
    { judul: "Selesai", ket: selesai ? F.waktu(l.selesaiPada) : "Menunggu konfirmasi perbaikan", keadaan: selesai ? "selesai" : "menunggu" }
  ];
  $("timeline").innerHTML = langkah.map((x) => `
    <li class="timeline-item ${x.keadaan}"${x.keadaan === "berjalan" ? ' aria-current="step"' : ""}>
      <span class="timeline-dot">${x.keadaan === "selesai" ? K.IKON.centang : x.keadaan === "berjalan" ? x.ikon : K.IKON.jamPasir}</span>
      <div><p class="timeline-judul">${F.esc(x.judul)}</p><p class="timeline-ket">${F.esc(x.ket)}</p></div>
    </li>`).join("");
});
