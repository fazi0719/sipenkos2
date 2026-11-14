// =========================================================
// Laporan Keuangan (pemilik) — pendapatan per bulan, transaksi, tunggakan
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const tahunIni = new Date().getFullYear();
  $("tahun").innerHTML = [tahunIni, tahunIni - 1].map((t) => `<option>${t}</option>`).join("");

  const tampilkan = async () => {
    const tahun = Number($("tahun").value);
    const k = await store.keuangan.ringkasan(tahun);
    const kartu = (nama, label, nilai, ket) => `
      <section class="kartu statistik">
        <p class="statistik-label">${ikon(nama, "kecil")}${label}</p>
        <p class="statistik-nilai">${nilai}</p>
        <p class="statistik-ket">${ket}</p>
      </section>`;
    $("statistik").innerHTML = [
      kartu("trending_up", `Pendapatan ${tahun}`, F.rupiah(k.total), `${k.transaksi.length} pembayaran lunas`),
      kartu("pending", "Menunggu Konfirmasi", F.rupiah(k.totalMenunggu), "Bukti transfer belum diperiksa"),
      kartu("warning", "Tunggakan", F.rupiah(k.totalTunggakan), `${k.tunggakan.length} tagihan lewat jatuh tempo`)
    ].join("");

    ui.grafikBatang($("grafik"), k.perBulan.map((b) => ({ label: b.nama.slice(0, 3), nilai: b.jumlah })));

    $("tabelTransaksi").innerHTML = k.transaksi.slice(0, 10).map((t) => `
      <tr>
        <td data-label="Tanggal">${F.tanggal(t.dibayarPada)}</td>
        <td data-label="Penghuni">${F.esc(t.pengguna?.nama || "-")}<span class="tabel-sub">${F.esc(t.jenis)} · ${F.periode(t.periode)}</span></td>
        <td data-label="Jumlah" class="angka">${F.rupiah(t.jumlah)}</td>
      </tr>`).join("") || `<tr><td colspan="3">${ui.kosong({ ikon: "payments", judul: "Belum ada transaksi" })}</td></tr>`;

    $("tabelTunggakan").innerHTML = k.tunggakan.map((t) => `
      <tr>
        <td data-label="Penghuni">${F.esc(t.pengguna?.nama || "-")}<span class="tabel-sub">Kamar ${F.esc(t.kamar?.nomor || "-")}</span></td>
        <td data-label="Periode">${F.periode(t.periode)}<span class="tabel-sub">Jatuh tempo ${F.tanggal(t.jatuhTempo)}</span></td>
        <td data-label="Jumlah" class="angka">${F.rupiah(t.jumlah)}</td>
      </tr>`).join("") || `<tr><td colspan="3">${ui.kosong({ ikon: "task_alt", judul: "Tidak ada tunggakan" })}</td></tr>`;
  };

  $("tahun").addEventListener("change", tampilkan);
  $("cetak").addEventListener("click", () => window.print());
  await tampilkan();
});
