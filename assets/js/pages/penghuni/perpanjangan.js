// =========================================================
// Perpanjangan Sewa (Figma frame 18)
// Bila masih ada pengajuan yang menunggu verifikasi, langsung
// diarahkan ke halaman status.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, ikon, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  const terakhir = await store.perpanjangan.terakhirSaya();
  if (terakhir?.status === "menunggu") return ui.ke("pages/penghuni/status-perpanjangan.html");

  const [sewa, semuaTipe] = await Promise.all([store.sewa.saya(), store.kamar.daftarTipe()]);
  const form = $("formPerpanjangan");

  $("infoKamar").textContent = `Kamar ${sewa.kamar.nomor} · ${ui.judulTipe(sewa.tipe)}`;
  $("infoPeriode").textContent = `Masa sewa saat ini ${F.rentang(sewa.mulai, sewa.akhir)}`;

  // tipe: tipe penuh tidak bisa dipilih, kecuali tipe kamar sendiri
  $("pilihanTipe").innerHTML = semuaTipe.map((t) => {
    const milikSendiri = t.id === sewa.tipe.id;
    const bisa = milikSendiri || t.tersedia;
    return `<label class="opsi">
      <input type="radio" name="tipe" value="${t.id}"${milikSendiri ? " checked" : ""}${bisa ? "" : " disabled"}>
      <span>${F.esc(t.nama)}</span>${milikSendiri ? "<small>Kamar saat ini</small>" : bisa ? "" : "<small>Penuh</small>"}
    </label>`;
  }).join("");

  $("pilihanDurasi").innerHTML = config.aturanBisnis.durasiPerpanjangan.map((d) =>
    `<label class="opsi"><input type="radio" name="durasi" value="${d}"${d === 6 ? " checked" : ""}><span>${d} Bulan</span></label>`).join("");
  $("pilihanMetode").innerHTML = config.pilihan.metodeBayar.map((m, i) =>
    `<label class="opsi"><input type="radio" name="metode" value="${m}"${i === 0 ? " checked" : ""}><span>${m}</span></label>`).join("");

  const nilai = () => ({
    tipeId: Number(form.tipe.value),
    durasi: Number(form.durasi.value),
    skema: form.skema.value,
    metode: form.metode.value
  });

  const perbarui = async () => {
    const v = nilai();
    const tipe = semuaTipe.find((t) => t.id === v.tipeId);
    const r = await store.perpanjangan.hitung(v);
    $("catatanPindah").hidden = v.tipeId === sewa.tipe.id;
    const baris = (nama, teks) => `<li>${ikon(nama)}<span>${teks}</span></li>`;
    $("ringkasan").innerHTML = [
      baris("meeting_room", `Tipe kamar: <b>${F.esc(ui.judulTipe(tipe))}</b>`),
      baris("calendar_today", `Masa sewa baru: <b>${F.rentang(r.mulaiBaru, r.akhirBaru)}</b>`),
      baris("payments", `Skema: <b>${v.skema === "dp" ? `DP (Down Payment) ${config.aturanBisnis.persenDp}%` : "Lunas"}</b> · Metode: <b>${F.esc(v.metode)}</b>`),
      baris("receipt_long", `Total biaya: <b>${F.rupiah(r.total)}</b> (${F.rupiah(r.hargaPerBulan)} × ${v.durasi} bulan)`),
      v.skema === "dp" ? baris("check_circle", `Dibayar setelah disetujui: <b class="harga">${F.rupiah(r.dibayar)}</b>, sisa ${F.rupiah(r.sisa)}`) : ""
    ].join("");
  };
  form.addEventListener("change", perbarui);
  await perbarui();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await ui.sibuk(form.querySelector("[type=submit]"), () => store.perpanjangan.ajukan(nilai()));
      ui.ke("pages/penghuni/status-perpanjangan.html");
    } catch (err) {
      ui.gagal(err);
    }
  });
});
