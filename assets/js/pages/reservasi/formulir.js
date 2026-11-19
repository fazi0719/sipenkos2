// =========================================================
// Formulir Reservasi (langkah 1 dari 3) — tampilan mengikuti
// calon-penghuni/form-sewa.php kelompok. Alamat: formulir.html?tipe=4&durasi=6
// Menyimpan reservasi berstatus "draf" lalu lanjut ke Pembayaran.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const EMOJI = { bed: "🛏️", checkroom: "🚪", desk: "🪑", ac_unit: "❄️", shower: "🚿" };

  const milik = await store.reservasi.milikSaya();
  if (milik && ["menunggu", "diterima"].includes(milik.status)) return ui.ke("pages/reservasi/status.html");

  const tipeId = ui.param("tipe") || milik?.tipeId;
  const tipe = tipeId && await store.kamar.tipe(tipeId);
  if (!tipe || !tipe.tersedia) {
    $("belumPilih").hidden = false;
    if (tipe) $("belumPilihJudul").textContent = "Tipe kamar ini sedang penuh";
    return;
  }
  $("isiFormulir").hidden = false;

  const form = $("formSewa");
  const kembaliKe = `../publik/detail-kamar.html?tipe=${tipe.id}`;
  $("kembali").href = kembaliKe;
  $("batal").href = kembaliKe;

  if (milik?.status === "ditolak" && milik.alasanTolak) {
    $("pesanPenolakan").textContent = `Reservasi sebelumnya ditolak: ${milik.alasanTolak}`;
    $("pesanPenolakan").hidden = false;
  }

  $("kamarGambar").src = ui.gambar(tipe.foto);
  $("kamarGambar").alt = `Foto ${tipe.nama} ${tipe.ringkas}`;
  $("tipeKamar").textContent = `${tipe.nama} ${tipe.ringkas}`;
  $("hargaKamar").textContent = F.rupiah(tipe.harga);
  $("fasilitasKamar").innerHTML = tipe.fasilitas.map((f) =>
    `<li class="item-fasilitas"><span class="icon">${EMOJI[f.ikon] || "✔️"}</span> <span>${F.esc(f.label)}</span></li>`).join("");

  const besok = F.keISO(F.tambahHari(new Date(), 1));
  form.tglMulai.min = besok;
  form.tglMulai.value = milik?.tglMulai || F.keISO(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
  const durasi = Number(ui.param("durasi") || milik?.durasi || 6);
  $("durasiSewa").value = `${durasi} Bulan`;
  if (milik?.kontakDarurat) {
    form.kontakNama.value = milik.kontakDarurat.nama;
    form.kontakHubungan.value = milik.kontakDarurat.hubungan;
    form.kontakHp.value = milik.kontakDarurat.hp;
  }
  form.kontakHp.addEventListener("input", () => { form.kontakHp.value = form.kontakHp.value.replace(/\D/g, ""); });

  $("rincianBiayaList").innerHTML = [
    ["Harga sewa per bulan", F.rupiah(tipe.harga), ""],
    ["Durasi sewa", `${durasi} bulan`, ""],
    ["Total harga sewa", F.rupiah(tipe.harga * durasi), "bold-item"]
  ].map(([l, v, k]) => `<div class="rincian-item ${k}"><span>${l}</span><span>${v}</span></div>`).join("");

  ui.bersihkanErrorSaatIsi(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = ui.validasi(form, {
      tglMulai: (v) => (!v ? "Pilih tanggal mulai kos." : v < besok ? "Tanggal mulai paling cepat besok." : ""),
      kontakNama: (v) => (v.length < 3 ? "Isi nama kontak darurat." : ""),
      kontakHubungan: (v) => (!v ? "Isi hubungan dengan kontak darurat." : ""),
      kontakHp: (v) => (!/^08\d{8,12}$/.test(v) ? "Nomor diawali 08, 10–14 digit." : ""),
      ktp: () => (form.ktp.files[0] || milik?.ktp?.data ? "" : "Unggah foto KTP.")
    });
    if (!valid) return;
    try {
      const file = form.ktp.files[0];
      const ktp = file ? { nama: file.name, ukuran: file.size, data: await ui.perkecil(file) } : milik.ktp;
      await ui.sibuk($("btnKirimPengajuan"), () => store.reservasi.buat({
        tipeId: tipe.id, tglMulai: form.tglMulai.value, durasi,
        kontakNama: form.kontakNama.value, kontakHubungan: form.kontakHubungan.value, kontakHp: form.kontakHp.value, ktp
      }));
      ui.ke("pages/reservasi/pembayaran.html");
    } catch (err) {
      ui.gagal(err);
    }
  });
});
