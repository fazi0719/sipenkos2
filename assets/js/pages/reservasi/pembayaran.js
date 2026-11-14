// =========================================================
// Pembayaran Sewa (langkah 2 dari 3)
// Menampilkan rincian & rekening, lalu mengirim bukti transfer.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  const r = await store.reservasi.milikSaya();
  if (!r) return ui.ke("pages/reservasi/formulir.html");
  if (r.status === "menunggu" || r.status === "diterima") return ui.ke("pages/reservasi/status.html");

  $("langkah").innerHTML = ui.langkahReservasi(2);
  if (r.status === "ditolak") {
    $("infoDitolak").hidden = false;
    $("alasanDitolak").textContent = `Alasan: ${r.alasanTolak}. Silakan unggah ulang bukti transfer.`;
    $("kembali").hidden = true;
  }

  $("rincian").innerHTML = ui.rincian([
    ["Kamar", F.esc(ui.judulTipe(r.tipe))],
    ["Durasi", `${r.durasi} Bulan`],
    ["Mulai", F.tanggal(r.tglMulai)],
    ["Jenis", "Sewa bulan pertama"]
  ]);
  $("total").textContent = F.rupiah(r.tagihanPertama.jumlah);

  const rek = config.kos.rekening;
  $("rekening").innerHTML = `
    <p class="rekening-label">Transfer ke</p>
    <p class="tabel-utama">${F.esc(rek.bank)}</p>
    <div class="rekening-baris">
      <span class="rekening-nomor">${F.esc(rek.nomor)}</span>
      <button type="button" class="tombol tombol--sekunder tombol--kecil" id="salin">${SIPENKOS.ikon("content_copy")}Salin</button>
    </div>
    <p class="kecil muted">a.n. ${F.esc(rek.atasNama)}</p>`;
  $("salin").addEventListener("click", (e) => ui.salin(rek.nomor.replace(/\s/g, ""), e.currentTarget));

  $("bantuanWa").innerHTML = `Ada kendala pembayaran? Hubungi WhatsApp Bu Nining di <a href="${ui.waLink()}" target="_blank" rel="noopener">${F.esc(config.kos.whatsapp)}</a>`;

  const tombol = $("kirim");
  const bukti = ui.unggah($("unggahBukti"), {
    nama: "bukti",
    onUbah: (b) => { tombol.disabled = !b; }
  });

  tombol.addEventListener("click", async () => {
    try {
      await ui.sibuk(tombol, () => store.reservasi.kirimBukti(r.id, bukti.nilai()));
      ui.ke("pages/reservasi/status.html");
    } catch (err) {
      ui.gagal(err);
    }
  });
});
