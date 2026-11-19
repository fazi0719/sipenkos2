// =========================================================
// Laporan Keuangan (pemilik) — tampilan mengikuti admin/pages/laporan-keuangan.php
// sipenkos2 belum mencatat pengeluaran, jadi kartu & tabel memakai pemasukan,
// pembayaran yang menunggu, dan tunggakan.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, format: F, adminUI: A } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const kini = new Date();
  const pilihan = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(kini.getFullYear(), kini.getMonth() - i, 1);
    pilihan.push(F.keISO(d).slice(0, 7));
  }
  $("periode").innerHTML = pilihan.map((p) => `<option value="${p}">${F.periode(p)}</option>`).join("");

  const tampilkan = async () => {
    const kode = $("periode").value;
    const k = await store.keuangan.ringkasan(Number(kode.slice(0, 4)));
    const transaksi = k.transaksi.filter((t) => t.dibayarPada.startsWith(kode));
    const total = transaksi.reduce((s, t) => s + t.jumlah, 0);
    const stat = (ikon, nada, label, nilai, ket, utama = false) => `
      <div class="card stat stat-money">
        <div class="stat-top">${A.kotakIkon(ikon, nada)}<p class="stat-label">${label}</p></div>
        <div><p class="stat-value${utama ? " stat-value-primary" : ""}">${nilai}</p><p class="stat-note">${ket}</p></div>
      </div>`;
    $("statistik").innerHTML =
      stat("trending-up", "green", "Pendapatan Kotor", F.rupiah(total), `${transaksi.length} pembayaran lunas`) +
      stat("clock", "amber", "Menunggu Konfirmasi", F.rupiah(k.totalMenunggu), "Bukti transfer belum diperiksa") +
      stat("trending-down", "red", "Tunggakan", F.rupiah(k.totalTunggakan), `${k.tunggakan.length} tagihan lewat jatuh tempo`);

    $("tabelTransaksi").innerHTML = transaksi.length ? transaksi.map((t) => `
      <tr>
        <td class="nowrap">${F.tanggal(t.dibayarPada)}</td>
        <td>${A.badge(t.metode === "Cash" ? "Tunai" : "Transfer", t.metode === "Cash" ? "amber" : "neutral")}</td>
        <td>${F.esc(t.jenis)} ${F.periode(t.periode)} · ${F.esc(t.pengguna?.nama || "-")} (Kamar ${F.esc(t.kamar?.nomor || "-")})</td>
        <td class="ta-right nowrap">${F.rupiah(t.jumlah)}</td>
      </tr>`).join("") : '<tr class="table-empty"><td colspan="4">Belum ada pemasukan pada periode ini.</td></tr>';
    $("totalTransaksi").textContent = F.rupiah(total);

    $("tabelTunggakan").innerHTML = k.tunggakan.length ? k.tunggakan.map((t) => `
      <tr>
        <td class="nowrap">${F.tanggal(t.jatuhTempo)}</td>
        <td>${F.esc(t.pengguna?.nama || "-")} · Kamar ${F.esc(t.kamar?.nomor || "-")}</td>
        <td>${F.esc(t.jenis)} ${F.periode(t.periode)}</td>
        <td class="ta-right nowrap">${F.rupiah(t.jumlah)}</td>
      </tr>`).join("") : '<tr class="table-empty"><td colspan="4">Tidak ada tunggakan.</td></tr>';
  };

  $("periode").addEventListener("change", tampilkan);
  $("cetak").addEventListener("click", () => window.print());
  await tampilkan();
});
