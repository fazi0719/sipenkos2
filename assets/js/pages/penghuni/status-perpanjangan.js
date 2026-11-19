// =========================================================
// Status Perpanjangan Sewa (Figma frame 19, 19B + ditolak)
// Tampilan mengikuti penghuni/status-perpanjangan-sewa.php kelompok.
// Keputusan setuju/tolak dibuat pemilik kos di pages/pemilik/perpanjangan.html.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, config, format: F, ui } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const x = await store.perpanjangan.terakhirSaya();

  if (!x) { $("emptyState").hidden = false; return; }

  const belumBayar = x.tagihan.find((t) => ["belum", "ditolak"].includes(t.status));
  const TAMPILAN = {
    menunggu: { banner: "menunggu", pill: "Menunggu Verifikasi", pesan: "Pengajuan perpanjangan sedang diperiksa pemilik kos." },
    disetujui: { banner: "disetujui", pill: "Pengajuan Disetujui!", pesan: "Pengajuan perpanjangan sewa kamu telah disetujui pemilik kos." },
    ditolak: { banner: "ditolak", pill: "Pengajuan Ditolak", pesan: `Pengajuan perpanjangan sewa kamu ditolak pemilik kos.${x.alasanTolak ? " Alasan: " + x.alasanTolak : ""}` }
  };
  const t = TAMPILAN[x.status];
  $("statusBanner").className = `status-banner status-banner--${t.banner}`;
  $("statusPill").textContent = t.pill;
  $("statusPesan").textContent = t.pesan;

  $("detailKamar").textContent = `Kamar ${(x.kamar || x.kamarLama).nomor} · ${x.tipe.nama}`;
  $("detailDurasi").textContent = `${x.durasi} Bulan`;
  $("detailSkema").textContent = x.skema === "dp" ? `DP (Down Payment) ${config.aturanBisnis.persenDp}%` : "Lunas";
  $("detailMetode").textContent = x.metode;
  $("detailMasa").textContent = F.rentang(x.mulaiBaru, x.akhirBaru);
  $("detailTotal").textContent = F.rupiah(x.total);
  $("detailDibayar").textContent = F.rupiah(x.dibayar);
  $("detailSisa").textContent = F.rupiah(x.sisa);
  $("detailNomor").textContent = x.id;

  const tombol = $("tombolAksi");
  if (x.status === "disetujui" && belumBayar) {
    $("aksiDetail").hidden = false;
    tombol.textContent = belumBayar.jenis.includes("DP") ? "Bayar DP Sekarang" : "Bayar Sekarang";
    tombol.href = `bayar-tagihan.html?id=${encodeURIComponent(belumBayar.id)}`;
  } else if (x.status === "ditolak") {
    $("aksiDetail").hidden = false;
    tombol.textContent = "Ajukan Ulang";
    tombol.href = "perpanjangan.html";
  }

  const IKON = {
    selesai: '<svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.6L16 9.5"/></svg>',
    berjalan: '<svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    menunggu: '<svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
    gagal: '<svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>'
  };
  const langkah = [{ keadaan: "selesai", judul: `Pengajuan dikirim · ${F.waktu(x.dibuatPada)}`, ket: "Formulir dan berkas berhasil diterima sistem SIPENKOS" }];
  if (x.status === "menunggu") {
    langkah.push(
      { keadaan: "berjalan", judul: "Verifikasi pemilik kos", ket: "Bu Nining sedang meninjau ketersediaan dan ketentuan masa tinggal" },
      { keadaan: "menunggu", judul: "Masa sewa diperbarui", ket: "Masa sewa dan tagihan baru diperbarui setelah disetujui pemilik kos." });
  } else if (x.status === "disetujui") {
    langkah.push(
      { keadaan: "selesai", judul: "Verifikasi pemilik kos", ket: `Pengajuan disetujui pemilik kos · ${F.waktu(x.diputuskanPada)}` },
      { keadaan: belumBayar ? "berjalan" : "selesai aktif", judul: "Masa sewa diperbarui", ket: belumBayar ? "Masa sewa diperbarui setelah pembayaran dikonfirmasi." : "Masa sewa dan tagihan baru sudah diperbarui." });
  } else {
    langkah.push(
      { keadaan: "gagal", judul: "Pengajuan ditolak pemilik kos", ket: "Hubungi pemilik kos untuk informasi lebih lanjut, atau ajukan ulang." },
      { keadaan: "menunggu", judul: "Masa sewa diperbarui", ket: "Masa sewa tidak berubah." });
  }
  $("timeline").innerHTML = langkah.map((l) => `
    <li class="timeline-item ${l.keadaan}">
      <span class="timeline-dot" aria-hidden="true">${IKON[l.keadaan.split(" ")[0]]}</span>
      <div><p class="timeline-judul">${F.esc(l.judul)}</p><p class="timeline-ket">${F.esc(l.ket)}</p></div>
    </li>`).join("");

  $("kontenStatus").hidden = false;
});
