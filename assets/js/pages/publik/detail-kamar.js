// =========================================================
// Detail Kamar — tampilan mengikuti calon-penghuni/detail-kamar.php kelompok
// Alamat: detail-kamar.html?tipe=4
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, config, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const EMOJI = { bed: "🛏️", checkroom: "🚪", desk: "🪑", ac_unit: "❄️", shower: "🚿" };

  const tipe = await store.kamar.tipe(ui.param("tipe"));
  const tombol = $("tombolReservasi");
  if (!tipe) {
    $("judul").textContent = "Kamar tidak ditemukan";
    $("deskripsi").textContent = "Tipe kamar yang kamu cari tidak tersedia. Silakan kembali ke daftar kamar.";
    tombol.textContent = "Kembali ke Daftar Kamar";
    tombol.href = "kamar.html";
    return;
  }

  document.title = `${tipe.nama} · SIPENKOS`;
  $("judul").textContent = `${tipe.nama} ${tipe.ringkas}`;
  $("alamat").textContent = config.kos.alamat + ", Malang";
  $("status").textContent = tipe.tersedia ? `Tersedia - sisa ${tipe.sisa}` : "Penuh";
  $("status").className = tipe.tersedia ? "tersedia" : "penuh";
  $("harga").textContent = F.rupiah(tipe.harga);
  $("deskripsi").textContent = tipe.deskripsi;
  $("fotoUtama").src = ui.gambar(tipe.foto);
  $("fotoUtama").alt = `Foto utama ${tipe.nama}`;
  $("galeriTambahan").innerHTML = tipe.galeri.filter((g) => g.src !== tipe.foto).slice(0, 2).map((g) => `
    <figure class="foto-pendukung">
      <img src="${F.esc(ui.gambar(g.src))}" alt="${F.esc(g.label)}" loading="lazy">
      <figcaption>${F.esc(g.label)}</figcaption>
    </figure>`).join("");
  $("fasilitasKamar").innerHTML = tipe.fasilitas.map((f) => `
    <li class="item-fasilitas"><span class="icon">${EMOJI[f.ikon] || "✔️"}</span> <span>${F.esc(f.label)}</span></li>`).join("");

  // ---------- durasi & tombol reservasi ----------
  const tombolDurasi = [...document.querySelectorAll(".btn-durasi")];
  const durasiAwal = Number(ui.param("durasi"));
  let durasi = tipe.tersedia && [1, 6, 12].includes(durasiAwal) ? durasiAwal : null;

  const atur = () => {
    let teks = "Reservasi Sekarang";
    let bisa = true;
    if (!tipe.tersedia) { teks = "Kamar Penuh (Tidak Dapat Direservasi)"; bisa = false; }
    else if (pengguna?.jenis === "pemilik") { bisa = false; }
    else if (pengguna?.jenis === "penghuni") { teks = "Perpanjang Sewa"; }
    else if (!durasi) { teks = "Pilih Durasi Sewa Dulu"; bisa = false; }
    tombol.textContent = teks;
    tombol.classList.toggle("btn-primary", bisa);
    tombol.classList.toggle("btn-disabled", !bisa);
    tombol.setAttribute("aria-disabled", String(!bisa));
    $("boxTotal").hidden = !durasi;
    if (durasi) {
      $("durasiTerpilih").textContent = String(durasi);
      $("totalHargaDurasi").textContent = F.rupiah(tipe.harga * durasi);
    }
    tombolDurasi.forEach((b) => {
      const aktif = Number(b.dataset.durasi) === durasi;
      b.classList.toggle("active", aktif);
      b.setAttribute("aria-pressed", String(aktif));
    });
  };

  if (!tipe.tersedia) tombolDurasi.forEach((b) => { b.disabled = true; });
  else tombolDurasi.forEach((b) => b.addEventListener("click", () => { durasi = Number(b.dataset.durasi); atur(); }));

  if (pengguna?.jenis === "pemilik") $("catatanReservasi").textContent = "Kamu masuk sebagai pemilik kos.";
  else if (pengguna?.jenis === "penghuni") $("catatanReservasi").textContent = "Kamu sudah menjadi penghuni. Pindah tipe kamar bisa diajukan saat perpanjangan sewa.";
  else if (pengguna) $("catatanReservasi").textContent = `Masuk sebagai ${pengguna.nama}.`;

  tombol.addEventListener("click", (e) => {
    e.preventDefault();
    if (tombol.getAttribute("aria-disabled") === "true") return;
    if (pengguna?.jenis === "penghuni") return ui.ke("pages/penghuni/perpanjangan.html");
    const tujuan = `pages/reservasi/formulir.html?tipe=${tipe.id}&durasi=${durasi}`;
    if (pengguna) ui.ke(tujuan);
    else ui.ke(`pages/auth/masuk.html?tipe=${tipe.id}&kembali=${encodeURIComponent(tujuan)}`);
  });
  atur();
});
