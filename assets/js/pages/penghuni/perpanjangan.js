// =========================================================
// Perpanjangan Sewa (Figma frame 18) — tampilan mengikuti
// penghuni/perpanjangan-sewa.php kelompok: formulir selalu tampil,
// pengajuan sebelumnya ditampilkan sebagai info + tautan ke status.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  const [terakhir, sewa, semuaTipe] = await Promise.all([
    store.perpanjangan.terakhirSaya(), store.sewa.saya(), store.kamar.daftarTipe()
  ]);
  const form = $("formPerpanjangan");
  if (!sewa) { $("emptyState").hidden = false; return; }

  const masihMenunggu = terakhir?.status === "menunggu";
  if (terakhir) {
    const PESAN_INFO = {
      menunggu: ["menunggu_verifikasi", "Kamu masih punya pengajuan perpanjangan yang menunggu verifikasi pemilik kos. Pengajuan baru bisa dibuat setelah pengajuan ini diputuskan."],
      disetujui: ["disetujui", "Pengajuan perpanjangan terakhir kamu sudah disetujui pemilik kos."],
      ditolak: ["ditolak", "Pengajuan perpanjangan terakhir kamu ditolak. Kamu bisa mengajukan ulang lewat formulir di bawah."]
    };
    const [kelas, pesan] = PESAN_INFO[terakhir.status] || PESAN_INFO.menunggu;
    $("infoPengajuanPesan").textContent = pesan;
    $("infoPengajuan").className = `info-pengajuan info-pengajuan--${kelas}`;
    $("infoPengajuan").hidden = false;
  }

  $("infoKamar").textContent = `Kamar ${sewa.kamar.nomor} · ${ui.judulTipe(sewa.tipe)}`;
  $("infoPeriode").textContent = `Masa sewa saat ini ${F.rentang(sewa.mulai, sewa.akhir)}`;

  // tipe penuh tidak bisa dipilih, kecuali tipe kamar sendiri
  $("pilihanTipe").innerHTML = semuaTipe.map((t) => {
    const milikSendiri = t.id === sewa.tipe.id;
    const bisa = milikSendiri || t.tersedia;
    return `<label class="opsi${bisa ? "" : " nonaktif"}" title="${F.esc(ui.judulTipe(t))}${bisa ? "" : " (penuh)"}">
      <input type="radio" name="tipe" value="${t.id}"${milikSendiri ? " checked" : ""}${bisa ? "" : " disabled"}>
      <span>${F.esc(t.nama)}</span>${bisa ? "" : "<small>Penuh</small>"}
    </label>`;
  }).join("");

  const nilai = () => ({
    tipeId: Number(form.tipe.value),
    durasi: Number(form.durasi.value),
    skema: form.skema.value,
    metode: form.metode.value === "cash" ? "Cash" : "Transfer"
  });

  const perbarui = async () => {
    const v = nilai();
    const tipe = semuaTipe.find((t) => t.id === v.tipeId);
    const r = await store.perpanjangan.hitung(v);
    $("ringTipe").textContent = tipe.nama;
    $("ringMasa").textContent = F.rentang(r.mulaiBaru, r.akhirBaru);
    $("ringSkema").textContent = v.skema === "dp" ? "DP (Down Payment)" : "Lunas";
    $("ringMetode").textContent = v.metode;
    $("ringTotal").textContent = F.rupiah(r.total);
    $("ringDpBaris").hidden = v.skema !== "dp";
    $("ringDp").textContent = F.rupiah(r.dibayar);
  };
  form.addEventListener("change", perbarui);

  const tombol = form.querySelector("[type=submit]");
  if (masihMenunggu) {
    tombol.disabled = true;
    tombol.title = "Masih ada pengajuan yang menunggu verifikasi";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (masihMenunggu) return;
    try {
      await ui.sibuk(tombol, () => store.perpanjangan.ajukan(nilai()));
      ui.ke("pages/penghuni/status-perpanjangan.html");
    } catch (err) {
      ui.gagal(err);
    }
  });

  form.hidden = false;
  await perbarui();
});
