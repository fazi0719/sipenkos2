// =========================================================
// Detail Kamar — galeri, harga, pilihan durasi, tombol reservasi
// Alamat: detail-kamar.html?tipe=4
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, config, ikon, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);

  const tipe = await store.kamar.tipe(ui.param("tipe"));
  if (!tipe) {
    $("tidakAda").hidden = false;
    $("tidakAda").innerHTML = ui.kosong({
      ikon: "meeting_room",
      judul: "Kamar tidak ditemukan",
      pesan: "Tipe kamar yang kamu cari tidak tersedia.",
      aksi: `<a class="tombol tombol--utama" href="kamar.html">Lihat Daftar Kamar</a>`
    });
    return;
  }

  $("isi").hidden = false;
  document.title = `${tipe.nama} · SIPENKOS`;
  $("judul").textContent = ui.judulTipe(tipe);
  $("alamat").textContent = config.kos.alamatLengkap;
  $("status").innerHTML = ui.badgeKetersediaan(tipe);
  $("harga").textContent = F.rupiah(tipe.harga);
  $("deskripsi").textContent = tipe.deskripsi;

  const chip = (f) => `<span class="chip">${ikon(f.ikon)}${F.esc(f.label)}</span>`;
  $("fasilitasKamar").innerHTML = tipe.fasilitas.map(chip).join("");
  $("fasilitasBersama").innerHTML = config.kos.fasilitasBersama.map(chip).join("");

  // ---------- galeri ----------
  const fotoUtama = $("fotoUtama");
  const pilihFoto = (i) => {
    fotoUtama.src = ui.gambar(tipe.galeri[i].src);
    fotoUtama.alt = `${tipe.nama} — ${tipe.galeri[i].label}`;
    $("thumb").querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
  };
  $("thumb").innerHTML = tipe.galeri.map((g, i) => `
    <button type="button" aria-label="Tampilkan foto ${F.esc(g.label)}" aria-pressed="false" data-i="${i}">
      <img src="${F.esc(ui.gambar(g.src))}" alt="" loading="lazy"><span class="label-foto">${F.esc(g.label)}</span>
    </button>`).join("");
  $("thumb").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) pilihFoto(Number(b.dataset.i));
  });
  pilihFoto(0);

  // ---------- durasi ----------
  const pilihanDurasi = [1, 6, 12];
  $("durasi").innerHTML = pilihanDurasi.map((d) => `
    <label class="opsi"><input type="radio" name="durasi" value="${d}"${d === 6 ? " checked" : ""}>${d} Bulan</label>`).join("");

  // ---------- tombol reservasi (beda perilaku per jenis akun) ----------
  const tombol = $("tombolReservasi");
  const catatan = $("catatanReservasi");
  const tujuanFormulir = () => {
    const durasi = document.querySelector("input[name=durasi]:checked").value;
    return `pages/reservasi/formulir.html?tipe=${tipe.id}&durasi=${durasi}`;
  };

  if (!tipe.tersedia) {
    tombol.disabled = true;
    tombol.textContent = "Penuh (Tidak Tersedia)";
    catatan.textContent = "Tanyakan ketersediaan berikutnya lewat WhatsApp pemilik kos.";
  } else if (pengguna?.jenis === "pemilik") {
    tombol.disabled = true;
    catatan.textContent = "Kamu masuk sebagai pemilik kos.";
  } else if (pengguna?.jenis === "penghuni") {
    tombol.textContent = "Perpanjang Sewa";
    catatan.textContent = "Kamu sudah menjadi penghuni. Pindah tipe kamar bisa diajukan saat perpanjangan sewa.";
    tombol.addEventListener("click", () => ui.ke("pages/penghuni/perpanjangan.html"));
  } else if (pengguna) {
    catatan.textContent = `Masuk sebagai ${pengguna.nama}.`;
    tombol.addEventListener("click", () => ui.ke(tujuanFormulir()));
  } else {
    tombol.addEventListener("click", () =>
      ui.ke(`pages/auth/masuk.html?tipe=${tipe.id}&kembali=${encodeURIComponent(tujuanFormulir())}`));
  }
});
