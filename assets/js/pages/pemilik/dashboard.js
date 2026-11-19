// =========================================================
// Dashboard Pemilik — tampilan mengikuti admin/pages/dashboard.php kelompok
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, format: F, adminUI: A } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  const [tipe, reservasi, tagihan, perpanjangan, laporan] = await Promise.all([
    store.kamar.daftarTipe(), store.reservasi.semua(), store.tagihan.semua(), store.perpanjangan.semua(), store.laporan.semua()
  ]);

  $("sapaan").textContent = `Selamat datang, ${F.namaDepan(pengguna.nama) === "Bu" ? pengguna.nama : F.namaDepan(pengguna.nama)}`;
  $("subjudul").textContent = `Ringkasan aktivitas Kos Bu Nining · ${F.periode(F.keISO(new Date()).slice(0, 7))}`;

  const resMenunggu = reservasi.filter((r) => r.status === "menunggu");
  const bayarMenunggu = tagihan.filter((t) => t.status === "menunggu");
  const perpMenunggu = perpanjangan.filter((p) => p.status === "menunggu");
  const lapBaru = laporan.filter((l) => l.status === "baru");

  if (bayarMenunggu.length) {
    const t = bayarMenunggu[0];
    $("bannerTeks").textContent = bayarMenunggu.length === 1
      ? `1 bukti pembayaran dari ${t.pengguna?.nama || "penghuni"} menunggu verifikasi`
      : `${bayarMenunggu.length} bukti pembayaran menunggu verifikasi`;
    $("dashboard-banner").hidden = false;
  }

  const total = tipe.reduce((s, t) => s + t.total, 0);
  const kosong = tipe.reduce((s, t) => s + t.sisa, 0);
  const stat = (ikon, nada, label, nilai) => `
    <div class="card stat">
      ${A.kotakIkon(ikon, nada)}
      <div><p class="stat-label">${label}</p><p class="stat-value">${nilai}</p></div>
    </div>`;
  $("statistik").innerHTML = [
    stat("bed-double", "blue", "Total Kamar", total),
    stat("users", "green", "Kamar Terisi", total - kosong),
    stat("door-open", "amber", "Kamar Kosong", kosong),
    stat("calendar-check", "blue", "Reservasi Baru", resMenunggu.length)
  ].join("");

  const tugas = [
    ...resMenunggu.map((r) => ["calendar-check", "blue", `Reservasi baru dari ${r.pengguna?.nama}`, `${r.tipe.nama} ${r.tipe.ringkas} · ${F.tanggal(r.dibuatPada)}`, "reservasi.html", "Tinjau"]),
    ...bayarMenunggu.map((t) => ["credit-card", "amber", `Bukti transfer ${t.pengguna?.nama}`, `Tagihan ${F.periode(t.periode)} · ${F.rupiah(t.jumlah)}`, "pembayaran.html", "Verifikasi"]),
    ...perpMenunggu.map((p) => ["calendar", "blue", `Perpanjangan sewa ${p.pengguna?.nama}`, `${p.durasi} bulan · ${p.tipe.nama}`, "perpanjangan.html", "Tinjau"]),
    ...lapBaru.map((l) => ["wrench", "red", `Laporan kerusakan Kamar ${l.kamar?.nomor || "-"}`, `${l.judul} · ${F.tanggal(l.dibuatPada)}`, `laporan-detail.html?id=${encodeURIComponent(l.id)}`, "Detail"])
  ];
  $("jumlahTugas").outerHTML = tugas.length ? A.badge(`${tugas.length} tugas`, "danger") : A.badge("Tidak ada tugas", "success");
  $("tugas").innerHTML = tugas.length ? tugas.map(([ikon, nada, judul, sub, href, label]) => `
    <div class="task-item">
      ${A.kotakIkon(ikon, nada, "sm")}
      <div class="task-body">
        <p class="task-title">${F.esc(judul)}</p>
        <p class="task-sub">${F.esc(sub)}</p>
      </div>
      <a href="${href}" class="btn btn-secondary btn-sm">${label}</a>
    </div>`).join("") : A.kosong("Tidak ada yang perlu ditindaklanjuti saat ini.");

  const singkat = (t) => `${t.nama} ${t.ringkas.replace("Kamar Mandi", "KM")}`;
  $("okupansi").innerHTML = tipe.map((t) => {
    const terisi = t.total - t.sisa;
    const persen = t.total ? Math.round((terisi / t.total) * 100) : 0;
    return `
      <div class="occ-item">
        <div class="occ-head">
          <span class="occ-name">${F.esc(singkat(t))}</span>
          <span class="occ-count">${terisi}/${t.total} terisi</span>
        </div>
        <div class="progress" role="progressbar" aria-valuenow="${persen}" aria-valuemin="0" aria-valuemax="100" aria-label="${F.esc(singkat(t))}">
          <div class="progress-fill${persen === 100 ? " is-full" : ""}" style="width:${persen}%"></div>
        </div>
      </div>`;
  }).join("");
});
