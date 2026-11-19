// =========================================================
// Kebijakan & Aturan Kos (penghuni & calon penghuni)
// Tampilan mengikuti penghuni/aturan.php & calon-penghuni/aturan.php kelompok.
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, format: F } = SIPENKOS;
  const aturan = await store.aturan.ambil();
  const daftar = aturan.kelompok.flatMap((g) => g.isi.map((teks) => ({ judul: g.judul, deskripsi: teks })));

  if (!pengguna || pengguna.jenis === "calon") document.getElementById("tautanKembali").hidden = false;
  document.getElementById("jumlahAturan").textContent = `${daftar.length} aturan`;
  document.getElementById("aturanList").innerHTML = daftar.length
    ? daftar.map((a, i) => `
      <div class="aturan-item">
        <span class="nomor">${i + 1}</span>
        <div class="aturan-content">
          <h3>${F.esc(a.judul)}</h3>
          <p>${F.esc(a.deskripsi)}</p>
        </div>
      </div>`).join("")
    : '<p class="pesan-memuat">Belum ada aturan kos yang tersedia.</p>';
});
