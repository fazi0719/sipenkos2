// =========================================================
// Riwayat Pembayaran — tampilan mengikuti penghuni/riwayat-pembayaran.php kelompok
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const sewa = await store.sewa.saya();
  const daftar = (await store.tagihan.milikSaya())
    .filter((t) => ["lunas", "menunggu", "ditolak"].includes(t.status) && (t.dibayarPada || t.dikirimPada))
    .sort((a, b) => (b.dibayarPada || b.dikirimPada).localeCompare(a.dibayarPada || a.dikirimPada));
  const tgl = (t) => t.dibayarPada || t.dikirimPada;

  const status = {
    lunas: ["status-diterima", "Terverifikasi", "Tagihan lunas"],
    menunggu: ["status-menunggu", "Menunggu verifikasi", "Menunggu dicek pemilik kos"],
    ditolak: ["status-ditolak", "Ditolak", ""]
  };

  if (!daftar.length) {
    $("isiTabel").innerHTML = '<tr><td colspan="7" class="riwayat-kosong">Belum ada pembayaran.</td></tr>';
    return;
  }

  // opsi filter: hanya bulan yang ada transaksinya
  const bulan = [...new Set(daftar.map((t) => tgl(t).slice(0, 7)))];
  $("filterBulan").insertAdjacentHTML("beforeend", bulan.map((b) => `<option value="${b}">${F.periode(b)}</option>`).join(""));

  const tampilkan = () => {
    const k = $("filterBulan").value;
    const isi = k ? daftar.filter((t) => tgl(t).startsWith(k)) : daftar;
    $("resetFilter").hidden = !k;
    $("infoFilter").textContent = k ? `${isi.length} transaksi` : "";
    $("isiTabel").innerHTML = isi.length ? isi.map((t) => {
      const [kelas, label, ket] = status[t.status];
      const keterangan = t.status === "ditolak" && t.alasanTolak
        ? `<span class="alasan-tolak">Alasan: ${F.esc(t.alasanTolak)}</span>`
        : ket ? `<span class="keterangan-bayar">${ket}</span>` : "";
      return `
        <tr>
          <td>${F.waktu ? F.waktu(tgl(t)) : F.tanggal(tgl(t))}</td>
          <td>Kamar ${F.esc(sewa.kamar.nomor)}</td>
          <td>${F.esc(t.jenis)}</td>
          <td class="jumlah-pembayaran">${F.rupiah(t.jumlah)}</td>
          <td>${F.esc(t.metode || "Transfer")}</td>
          <td><span class="status-badge ${kelas}">${label}</span>${keterangan}</td>
          <td>${t.bukti ? `<button type="button" class="btn-lihat-bukti" data-bukti="${F.esc(t.id)}">Lihat</button>` : "-"}</td>
        </tr>`;
    }).join("") : '<tr><td colspan="7" class="riwayat-kosong">Tidak ada pembayaran di bulan ini.</td></tr>';
  };

  $("filterBulan").addEventListener("change", tampilkan);
  $("resetFilter").addEventListener("click", () => { $("filterBulan").value = ""; tampilkan(); });
  $("isiTabel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-bukti]");
    if (b) ui.dialogTagihan(daftar.find((t) => t.id === b.dataset.bukti));
  });
  tampilkan();
});
