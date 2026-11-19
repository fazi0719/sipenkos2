// =========================================================
// Tagihan — tabel tagihan (tampilan mengikuti penghuni/tagihan.php kelompok)
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, format: F } = SIPENKOS;
  const semua = await store.tagihan.milikSaya();
  const tbody = document.getElementById("isiTabel");

  const status = {
    belum: ["status-belum", "Belum bayar"],
    ditolak: ["status-belum", "Belum bayar"],
    menunggu: ["status-menunggu", "Menunggu verifikasi"],
    lunas: ["status-lunas", "Lunas"]
  };

  if (!semua.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="tagihan-kosong">Belum ada tagihan.</td></tr>';
    return;
  }

  tbody.innerHTML = semua.map((t) => {
    const [kelas, label] = status[t.status] || status.belum;
    const terbayar = t.status === "lunas" ? t.jumlah : 0;
    const catatan = t.status === "ditolak"
      ? `<span class="catatan-ditolak">Bukti terakhir ditolak${t.alasanTolak ? ": " + F.esc(t.alasanTolak) : ""}. Silakan kirim ulang.</span>` : "";
    const aksi = t.status === "menunggu"
      ? '<span class="aksi-menunggu">Menunggu verifikasi pemilik kos</span>'
      : t.status === "lunas"
        ? '<span class="aksi-selesai">Selesai</span>'
        : `<a class="btn-bayar" href="bayar-tagihan.html?id=${encodeURIComponent(t.id)}">${t.status === "ditolak" ? "Kirim Ulang Bukti" : "Bayar / Cicil"}</a>`;
    return `
      <tr>
        <td>${F.periode(t.periode)} – ${F.esc(t.jenis)}</td>
        <td>${F.rupiah(t.jumlah)}</td>
        <td>${F.rupiah(terbayar)}</td>
        <td>${F.rupiah(t.jumlah - terbayar)}</td>
        <td><span class="status-tagihan ${kelas}">${label}</span>${catatan}</td>
        <td>${aksi}</td>
      </tr>`;
  }).join("");
});
