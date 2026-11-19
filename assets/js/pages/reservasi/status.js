// =========================================================
// Status Reservasi & Pembayaran (langkah 3 dari 3) — tampilan mengikuti
// calon-penghuni/status-reservasi.php kelompok.
// Keputusan terima/tolak dibuat pemilik kos di pages/pemilik/reservasi.html.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const r = await store.reservasi.milikSaya();
  if (!r) { $("kosong").hidden = false; return; }
  if (r.status === "draf") return ui.ke("pages/reservasi/pembayaran.html");
  $("isi").hidden = false;

  const t = r.tagihanPertama;
  const judulKamar = `${r.kamar ? `Kamar ${r.kamar.nomor} · ` : ""}${r.tipe.nama} ${r.tipe.ringkas}`;
  const KONDISI = {
    menunggu: {
      banner: "menunggu", ikon: "◷", pill: "Menunggu Verifikasi",
      pesan: "Pemilik kos sedang memeriksa data dan bukti pembayaran kamu. Hasilnya dikirim lewat notifikasi.",
      aksi: { teks: "Lihat Bukti Pembayaran", kelas: "btn btn-outline", bukti: true },
      langkah: ["active", "3", "Menunggu Verifikasi"], label: "Dibayar",
      timeline: [
        ["selesai", "✓", "Reservasi dikirim", F.waktu(r.dibuatPada)],
        ["selesai", "✓", "Bukti pembayaran diunggah", F.waktu(t.dikirimPada)],
        ["aktif", "◷", "Verifikasi pemilik kos", "Sedang diproses"],
        ["menunggu", "●", "Reservasi diterima", "Menunggu langkah sebelumnya"]
      ]
    },
    diterima: {
      banner: "diterima", ikon: "✓", pill: "Diterima",
      pesan: `Reservasi dan pembayaran kamu sudah dikonfirmasi. Kamu menempati ${judulKamar} mulai ${F.tanggalPanjang(r.tglMulai)}.`,
      aksi: { teks: "Masuk ke Dashboard Penghuni →", kelas: "btn btn-primary", href: SIPENKOS.url(config.beranda.penghuni) },
      langkah: ["completed", "✓", "Verifikasi Selesai"], label: "Dibayar",
      timeline: [
        ["selesai", "✓", "Reservasi dikirim", F.waktu(r.dibuatPada)],
        ["selesai", "✓", "Bukti pembayaran diunggah", F.waktu(t.dikirimPada)],
        ["selesai", "✓", "Verifikasi pemilik kos", F.waktu(r.diputuskanPada)],
        ["selesai", "✓", "Reservasi diterima", F.waktu(r.diputuskanPada), "Kamar siap ditempati sesuai tanggal mulai sewa."]
      ]
    },
    ditolak: {
      banner: "ditolak", ikon: "✕", pill: "Ditolak",
      pesan: `Alasan: ${r.alasanTolak}`,
      aksi: { teks: "⇧ Unggah Ulang Bukti", kelas: "btn btn-primary", href: "pembayaran.html" },
      langkah: ["ditolak", "✕", "Verifikasi Ditolak"], label: "Jumlah transfer",
      timeline: [
        ["selesai", "✓", "Reservasi dikirim", F.waktu(r.dibuatPada)],
        ["selesai", "✓", "Bukti pembayaran diunggah", F.waktu(t.dikirimPada)],
        ["selesai", "✓", "Verifikasi pemilik kos", F.waktu(r.diputuskanPada)],
        ["ditolak", "✕", "Reservasi ditolak", F.waktu(r.diputuskanPada)]
      ]
    }
  };
  const k = KONDISI[r.status];

  $("statusBanner").className = `status-banner status-banner--${k.banner}`;
  $("statusIkon").textContent = k.ikon;
  $("statusPill").textContent = k.pill;
  $("statusPesan").textContent = k.pesan;
  const aksi = $("statusAksi");
  aksi.className = k.aksi.kelas;
  aksi.textContent = k.aksi.teks;
  if (k.aksi.bukti) {
    aksi.setAttribute("role", "button");
    aksi.addEventListener("click", (e) => { e.preventDefault(); if (t.bukti) ui.lihatGambar(t.bukti, "Bukti Pembayaran"); });
  } else {
    aksi.href = k.aksi.href;
  }
  if (r.status !== "menunggu") $("kembali").hidden = true;

  $("langkahVerifikasi").className = `alur-sewa ${k.langkah[0]}`;
  $("langkahNomor").textContent = k.langkah[1];
  $("langkahLabel").textContent = k.langkah[2];

  $("fotoKamar").src = ui.gambar(r.tipe.foto);
  $("fotoKamar").alt = `Foto ${r.tipe.nama}`;
  const rincian = [
    ["Kamar", judulKamar],
    ["Durasi", `${r.durasi} Bulan`],
    ["Metode", "Sewa bulan pertama (Transfer)"]
  ];
  if (r.status === "menunggu") rincian.push(["Total Harus Dibayar", F.rupiah(t.jumlah)]);
  rincian.push(["Mulai", F.tanggalPanjang(r.tglMulai)]);
  $("ringkasanList").innerHTML = rincian.map(([l, v]) => `<div class="rincian-item"><span>${F.esc(l)}</span><span>${F.esc(v)}</span></div>`).join("");
  $("nominalLabel").textContent = k.label;
  $("nominalDibayar").textContent = F.rupiah(t.jumlah);

  $("timelineList").innerHTML = k.timeline.map(([status, ikon, judul, ket, catatan]) => `
    <li class="timeline-item ${status}">
      <span class="timeline-marker">${ikon}</span>
      <div class="timeline-konten">
        <strong>${F.esc(judul)}</strong>
        <p>${F.esc(ket || "-")}</p>
        ${catatan ? `<p class="timeline-catatan">${F.esc(catatan)}</p>` : ""}
      </div>
    </li>`).join("");
});
