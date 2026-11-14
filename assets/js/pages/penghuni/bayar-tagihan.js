// =========================================================
// Bayar Tagihan — alamat: bayar-tagihan.html?id=TGH-...
// Tampilan kanan berubah: unggah bukti · menunggu konfirmasi · lunas
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, ikon, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  let t = await store.tagihan.ambil(ui.param("id"));

  if (!t) {
    $("tidakAda").hidden = false;
    $("tidakAda").innerHTML = `<div class="kartu">${ui.kosong({ ikon: "receipt_long", judul: "Tagihan tidak ditemukan", aksi: '<a class="tombol tombol--utama" href="tagihan.html">Lihat Tagihan</a>' })}</div>`;
    return;
  }
  $("isi").hidden = false;

  $("rincian").innerHTML = ui.rincian([
    ["Periode", F.periode(t.periode)],
    ["Jenis", F.esc(t.jenis)],
    ["Kamar", t.kamar ? `Kamar ${F.esc(t.kamar.nomor)}` : "-"],
    ["Jatuh tempo", F.tanggal(t.jatuhTempo)]
  ]);
  $("total").textContent = F.rupiah(t.jumlah);

  const rek = config.kos.rekening;
  $("rekening").innerHTML = `
    <p class="rekening-label">Transfer ke</p>
    <p class="tabel-utama">${F.esc(rek.bank)}</p>
    <div class="rekening-baris">
      <span class="rekening-nomor">${F.esc(rek.nomor)}</span>
      <button type="button" class="tombol tombol--sekunder tombol--kecil" id="salin">${ikon("content_copy")}Salin</button>
    </div>
    <p class="kecil muted">a.n. ${F.esc(rek.atasNama)}</p>`;
  $("salin").addEventListener("click", (e) => ui.salin(rek.nomor.replace(/\s/g, ""), e.currentTarget));

  const kanan = $("panelKanan");

  const tampilkanTerkirim = () => {
    const lunas = t.status === "lunas";
    $("judulKanan").textContent = lunas ? "Pembayaran Lunas" : "Bukti Terkirim";
    kanan.innerHTML = `
      <div class="kotak-status kotak-status--${lunas ? "sukses" : "peringatan"}">
        <div class="kotak-status-teks">
          ${ui.badge("tagihan", t.status)}
          <p>${lunas
            ? `Pembayaran dikonfirmasi pemilik kos pada ${F.waktu(t.dibayarPada)}.`
            : `Bukti pembayaran terkirim · ${F.waktu(t.dikirimPada)}. Pemilik kos akan mengonfirmasi pembayaran kamu.`}</p>
        </div>
      </div>
      ${t.bukti ? `<img class="pratinjau-bukti" src="${F.esc(ui.gambar(t.bukti))}" alt="Bukti transfer">` : ""}
      <a class="tombol tombol--sekunder" href="tagihan.html">Kembali ke Tagihan</a>`;
  };

  const tampilkanUnggah = () => {
    kanan.innerHTML = `
      ${t.status === "ditolak" ? `<div class="kotak-status kotak-status--bahaya"><div class="kotak-status-teks">${ui.badge("tagihan", "ditolak")}<p>Alasan: ${F.esc(t.alasanTolak)}. Silakan unggah ulang bukti transfer.</p></div></div>` : ""}
      <div id="unggahBukti"></div>
      <button type="button" class="tombol tombol--utama tombol--penuh" id="kirim" disabled>${ikon("send")}Kirim Bukti Pembayaran</button>
      <p class="bantuan teks-tengah">Ada kendala pembayaran? Hubungi WhatsApp Bu Nining di <a href="${ui.waLink()}" target="_blank" rel="noopener">${F.esc(config.kos.whatsapp)}</a></p>`;
    const tombol = $("kirim");
    const bukti = ui.unggah($("unggahBukti"), { nama: "bukti", onUbah: (b) => { tombol.disabled = !b; } });
    tombol.addEventListener("click", async () => {
      try {
        await ui.sibuk(tombol, () => store.tagihan.kirimBukti(t.id, bukti.nilai()));
        t = await store.tagihan.ambil(t.id);
        tampilkanTerkirim();
        ui.toast("Bukti pembayaran terkirim");
      } catch (err) {
        ui.gagal(err);
      }
    });
  };

  if (t.status === "belum" || t.status === "ditolak") tampilkanUnggah();
  else tampilkanTerkirim();
});
