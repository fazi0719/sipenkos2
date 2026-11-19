// =========================================================
// Buat Laporan Kerusakan (Figma frame 21)
// Tampilan mengikuti penghuni/buat-laporan-kerusakan.php kelompok.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const form = $("formLaporan");
  const sewa = await store.sewa.saya();
  const MAKS = config.aturanBisnis.maksUkuranFotoMB * 1024 * 1024;
  let foto = null;

  $("lokasi").value = sewa ? `Kamar ${sewa.kamar.nomor}` : "Kamar kamu";

  const error = (id, pesan) => {
    const el = $(id + "Error");
    el.hidden = !pesan;
    if (pesan) el.textContent = pesan;
    const field = $(id);
    if (field) field.setAttribute("aria-invalid", pesan ? "true" : "false");
  };
  ["kategori", "judul", "deskripsi"].forEach((id) => $(id).addEventListener("input", () => error(id, "")));

  const pakaiFoto = async (file) => {
    error("foto", "");
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) return error("foto", "Format foto harus JPG atau PNG.");
    if (file.size > MAKS) return error("foto", `Ukuran foto maksimal ${config.aturanBisnis.maksUkuranFotoMB} MB.`);
    try {
      foto = await ui.perkecil(file);
      $("pratinjauGambar").src = foto;
      $("pratinjauNama").textContent = file.name;
      $("pratinjau").hidden = false;
      $("areaUnggah").hidden = true;
    } catch {
      error("foto", "Foto tidak bisa dibaca. Coba foto lain.");
    }
  };
  $("foto").addEventListener("change", (e) => pakaiFoto(e.target.files[0]));
  const area = $("areaUnggah");
  ["dragenter", "dragover"].forEach((n) => area.addEventListener(n, (e) => { e.preventDefault(); area.classList.add("seret"); }));
  ["dragleave", "drop"].forEach((n) => area.addEventListener(n, () => area.classList.remove("seret")));
  area.addEventListener("drop", (e) => { e.preventDefault(); pakaiFoto(e.dataTransfer.files[0]); });
  $("hapusFoto").addEventListener("click", () => {
    foto = null;
    $("foto").value = "";
    $("pratinjau").hidden = true;
    $("areaUnggah").hidden = false;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const kategori = $("kategori").value;
    const judul = $("judul").value.trim();
    const deskripsi = $("deskripsi").value.trim();
    error("kategori", kategori ? "" : "Pilih kategori kerusakan.");
    error("judul", judul.length >= 5 ? "" : "Tulis judul kerusakan (minimal 5 huruf).");
    error("deskripsi", deskripsi.length >= 10 ? "" : "Jelaskan detail kerusakannya (minimal 10 huruf).");
    const salah = form.querySelector('[aria-invalid="true"]');
    if (salah) return salah.focus();
    try {
      const l = await ui.sibuk(form.querySelector("[type=submit]"), () => store.laporan.buat({ kategori, judul, deskripsi, foto }));
      ui.ke(`pages/penghuni/laporan-detail.html?id=${encodeURIComponent(l.id)}`);
    } catch (err) {
      ui.gagal(err);
    }
  });
});
