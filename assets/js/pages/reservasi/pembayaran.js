// =========================================================
// Pembayaran Sewa (langkah 2 dari 3) — tampilan mengikuti
// calon-penghuni/pembayaran.php kelompok. Aturan bayar tetap sipenkos2:
// sewa bulan pertama, transfer bank, bukti diperiksa pemilik kos.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  const r = await store.reservasi.milikSaya();
  if (!r) return ui.ke("pages/reservasi/formulir.html");
  if (r.status === "menunggu" || r.status === "diterima") return ui.ke("pages/reservasi/status.html");

  if (r.status === "ditolak") {
    $("infoDitolak").textContent = `Bukti pembayaran ditolak. Alasan: ${r.alasanTolak}. Silakan unggah ulang bukti transfer.`;
    $("infoDitolak").hidden = false;
  }
  $("kembali").href = `formulir.html?tipe=${r.tipe.id}&durasi=${r.durasi}`;

  $("paymentSummary").innerHTML = [
    ["Kamar", `${r.tipe.nama} ${r.tipe.ringkas}`],
    ["Durasi Sewa", `${r.durasi} bulan`],
    ["Tanggal Mulai", F.tanggal(r.tglMulai)]
  ].map(([l, v]) => `<div class="rincian-item"><span>${F.esc(l)}</span><span>${F.esc(v)}</span></div>`).join("");

  const total = r.tipe.harga * r.durasi;
  $("paymentAmount").textContent = F.rupiah(r.tagihanPertama.jumlah);
  $("remainingAmount").textContent = F.rupiah(total - r.tagihanPertama.jumlah);
  $("remainingPayment").hidden = total <= r.tagihanPertama.jumlah;

  const rek = config.kos.rekening;
  $("copyAccount").addEventListener("click", (e) => ui.salin(rek.nomor.replace(/\s/g, ""), e.currentTarget));

  // ---------- unggah bukti ----------
  const MAKS = config.aturanBisnis.maksUkuranFotoMB * 1024 * 1024;
  const input = $("paymentProof");
  const tombol = $("submitPayment");
  let bukti = null;
  const kosongkan = () => {
    bukti = null;
    input.value = "";
    $("filePreview").hidden = true;
    $("uploadEmpty").hidden = false;
    tombol.disabled = true;
  };
  const pakai = async (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) return ui.toast("Format bukti harus JPG atau PNG.", "bahaya");
    if (file.size > MAKS) return ui.toast(`Ukuran file maksimal ${config.aturanBisnis.maksUkuranFotoMB} MB.`, "bahaya");
    bukti = { nama: file.name, ukuran: file.size, data: await ui.perkecil(file) };
    $("fileName").textContent = file.name;
    $("fileSize").textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    $("previewGambar").src = bukti.data;
    $("previewGambar").hidden = false;
    $("fileIcon").hidden = true;
    $("filePreview").hidden = false;
    $("uploadEmpty").hidden = true;
    tombol.disabled = false;
  };
  input.addEventListener("change", () => pakai(input.files[0]));
  const area = $("uploadArea");
  ["dragenter", "dragover"].forEach((n) => area.addEventListener(n, (e) => { e.preventDefault(); area.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach((n) => area.addEventListener(n, () => area.classList.remove("dragover")));
  area.addEventListener("drop", (e) => { e.preventDefault(); pakai(e.dataTransfer.files[0]); });
  $("removeFile").addEventListener("click", kosongkan);

  $("paymentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!bukti) return;
    try {
      await ui.sibuk(tombol, () => store.reservasi.kirimBukti(r.id, bukti));
      ui.ke("pages/reservasi/status.html");
    } catch (err) {
      ui.gagal(err);
    }
  });
});
