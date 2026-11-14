// =========================================================
// Formulir Reservasi (langkah 1 dari 3)
// Alamat: formulir.html?tipe=4&durasi=6
// Menyimpan reservasi berstatus "draf" lalu lanjut ke Pembayaran.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, ikon, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  // reservasi yang sedang diproses tidak boleh dibuat ulang
  const milik = await store.reservasi.milikSaya();
  if (milik && ["menunggu", "diterima"].includes(milik.status)) return ui.ke("pages/reservasi/status.html");

  const tipeId = ui.param("tipe") || milik?.tipeId;
  const tipe = tipeId && await store.kamar.tipe(tipeId);
  $("langkah").innerHTML = ui.langkahReservasi(1);

  if (!tipe || !tipe.tersedia) {
    $("belumPilih").hidden = false;
    $("belumPilih").innerHTML = `<div class="kartu">${ui.kosong({
      ikon: "meeting_room",
      judul: tipe ? "Tipe kamar ini sedang penuh" : "Pilih kamar terlebih dahulu",
      pesan: "Lihat daftar kamar lalu tekan Reservasi Sekarang pada kamar yang kamu inginkan.",
      aksi: `<a class="tombol tombol--utama" href="../publik/kamar.html">Lihat Daftar Kamar</a>`
    })}</div>`;
    return;
  }

  const form = $("formReservasi");
  form.hidden = false;
  const kembaliKe = `../publik/detail-kamar.html?tipe=${tipe.id}`;
  $("kembali").href = kembaliKe;
  $("batal").href = kembaliKe;

  // ---------- kamar pilihan ----------
  $("fotoKamar").src = ui.gambar(tipe.foto);
  $("fotoKamar").alt = `Foto ${tipe.nama}`;
  $("namaKamar").textContent = ui.judulTipe(tipe);
  $("hargaKamar").textContent = F.rupiah(tipe.harga);
  $("fasilitasKamar").innerHTML = tipe.fasilitas.map((f) => `<span class="chip">${ikon(f.ikon)}${F.esc(f.label)}</span>`).join("");

  // ---------- isian ----------
  const besok = F.keISO(F.tambahHari(new Date(), 1));
  form.tglMulai.min = besok;
  form.tglMulai.value = milik?.tglMulai || F.keISO(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));

  const durasiAwal = Number(ui.param("durasi") || milik?.durasi || 6);
  const daftarDurasi = [...new Set([...config.aturanBisnis.durasiSewa, durasiAwal])].sort((a, b) => a - b);
  form.durasi.innerHTML = daftarDurasi.map((d) => `<option value="${d}"${d === durasiAwal ? " selected" : ""}>${d} Bulan</option>`).join("");
  form.kontakHubungan.innerHTML = config.pilihan.hubunganDarurat.map((h) => `<option>${h}</option>`).join("");

  if (milik?.kontakDarurat) {
    form.kontakNama.value = milik.kontakDarurat.nama;
    form.kontakHubungan.value = milik.kontakDarurat.hubungan;
    form.kontakHp.value = milik.kontakDarurat.hp;
  }
  form.kontakHp.addEventListener("input", () => { form.kontakHp.value = form.kontakHp.value.replace(/\D/g, ""); });

  const ktp = ui.unggah($("unggahKtp"), { nama: "ktp", teks: "Klik atau seret foto KTP ke sini" });

  // ---------- rincian harga ----------
  const hitung = () => {
    const durasi = Number(form.durasi.value);
    $("rincian").innerHTML = ui.rincian([
      ["Sewa Kamar", `${F.rupiah(tipe.harga)} / bulan`],
      ["Durasi", `${durasi} Bulan`],
      ["Masa Sewa", form.tglMulai.value ? F.rentang(form.tglMulai.value, F.akhirSewa(form.tglMulai.value, durasi)) : "-"],
      ["Total Biaya Sewa", `<span class="harga">${F.rupiah(tipe.harga * durasi)}</span> <span class="muted kecil">untuk ${durasi} bulan</span>`]
    ]);
    $("dibayarSekarang").textContent = F.rupiah(tipe.harga);
  };
  form.addEventListener("change", hitung);
  hitung();

  // ---------- kirim ----------
  ui.bersihkanErrorSaatIsi(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = ui.validasi(form, {
      tglMulai: (v) => (!v ? "Pilih tanggal mulai kos." : v < besok ? "Tanggal mulai paling cepat besok." : ""),
      kontakNama: (v) => (v.length < 3 ? "Isi nama kontak darurat." : ""),
      kontakHp: (v) => (!/^08\d{8,12}$/.test(v) ? "Nomor diawali 08, 10–14 digit." : ""),
      setuju: (v) => (!v ? "Kamu perlu menyetujui aturan kos." : "")
    });
    const berkasKtp = ktp.nilai() || (milik?.ktp?.data ? milik.ktp : null);
    ktp.tandaiError(berkasKtp ? "" : "Unggah foto KTP.");
    if (!valid || !berkasKtp) return;

    try {
      await ui.sibuk(form.querySelector("[type=submit]"), () => store.reservasi.buat({
        tipeId: tipe.id,
        tglMulai: form.tglMulai.value,
        durasi: form.durasi.value,
        kontakNama: form.kontakNama.value,
        kontakHubungan: form.kontakHubungan.value,
        kontakHp: form.kontakHp.value,
        ktp: berkasKtp
      }));
      ui.ke("pages/reservasi/pembayaran.html");
    } catch (err) {
      ui.gagal(err);
    }
  });
});
