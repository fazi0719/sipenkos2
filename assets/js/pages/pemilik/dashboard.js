// =========================================================
// Dashboard Pemilik — okupansi, pendapatan, hal yang perlu ditindak
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, ikon, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const tahun = new Date().getFullYear();

  const [tipe, hitungan, keuangan, keuanganLalu] = await Promise.all([
    store.kamar.daftarTipe(),
    store.hitungan.menu(),
    store.keuangan.ringkasan(tahun),
    store.keuangan.ringkasan(tahun - 1)
  ]);

  $("sapaan").textContent = `Selamat datang, ${pengguna.nama}`;

  // ---------- kartu statistik ----------
  const total = tipe.reduce((s, t) => s + t.total, 0);
  const kosong = tipe.reduce((s, t) => s + t.sisa, 0);
  const bulanIni = keuangan.perBulan[new Date().getMonth()];
  const menunggu = (hitungan.reservasi || 0) + (hitungan.pembayaran || 0) + (hitungan.perpanjangan || 0);
  const kartu = (ikonNama, label, nilai, ket) => `
    <section class="kartu statistik">
      <p class="statistik-label">${ikon(ikonNama, "kecil")}${label}</p>
      <p class="statistik-nilai">${nilai}</p>
      <p class="statistik-ket">${ket}</p>
    </section>`;
  $("statistik").innerHTML = [
    kartu("meeting_room", "Kamar Terisi", `${total - kosong} / ${total}`, `Okupansi ${Math.round(((total - kosong) / total) * 100)}% · ${kosong} kamar kosong`),
    kartu("payments", `Pendapatan ${bulanIni.nama}`, F.rupiah(bulanIni.jumlah), `${bulanIni.transaksi} pembayaran dikonfirmasi`),
    kartu("pending", "Menunggu Verifikasi", menunggu, "Reservasi, pembayaran, perpanjangan"),
    kartu("warning", "Tunggakan", F.rupiah(keuangan.totalTunggakan), `${keuangan.tunggakan.length} tagihan lewat jatuh tempo`)
  ].join("");

  // ---------- perlu tindakan ----------
  const tugas = [
    { n: hitungan.reservasi, ikon: "how_to_reg", judul: "reservasi menunggu verifikasi", href: "reservasi.html" },
    { n: hitungan.pembayaran, ikon: "payments", judul: "bukti pembayaran perlu dikonfirmasi", href: "pembayaran.html" },
    { n: hitungan.perpanjangan, ikon: "event_repeat", judul: "pengajuan perpanjangan sewa", href: "perpanjangan.html" },
    { n: hitungan.laporan, ikon: "build", judul: "laporan kerusakan baru", href: "laporan.html" }
  ].filter((t) => t.n);
  $("tindakan").innerHTML = tugas.length
    ? tugas.map((t) => `
      <a class="item" href="${t.href}">
        <span class="item-ikon">${ikon(t.ikon)}</span>
        <p class="item-judul">${t.n} ${t.judul}</p>
        <span class="tautan-lihat">Buka${ikon("arrow_forward")}</span>
      </a>`).join("")
    : ui.kosong({ ikon: "task_alt", judul: "Semua beres", pesan: "Tidak ada yang perlu ditindaklanjuti saat ini." });

  // ---------- grafik 6 bulan terakhir ----------
  const semuaBulan = [...keuanganLalu.perBulan, ...keuangan.perBulan];
  const akhir = 12 + new Date().getMonth();
  const enam = semuaBulan.slice(akhir - 5, akhir + 1);
  ui.grafikBatang($("grafik"), enam.map((b) => ({ label: b.nama.slice(0, 3), nilai: b.jumlah })));

  // ---------- tabel ketersediaan ----------
  $("tabelTipe").innerHTML = tipe.map((t) => `
    <tr>
      <td data-label="Tipe"><span class="tabel-utama">${F.esc(t.nama)}</span><span class="tabel-sub">${F.esc(t.ringkas)}</span></td>
      <td data-label="Harga" class="angka">${F.rupiah(t.harga)}</td>
      <td data-label="Total" class="angka">${t.total}</td>
      <td data-label="Terisi" class="angka">${t.total - t.sisa}</td>
      <td data-label="Kosong" class="angka">${t.sisa}</td>
      <td data-label="Status">${ui.badgeKetersediaan(t)}</td>
    </tr>`).join("");
});

