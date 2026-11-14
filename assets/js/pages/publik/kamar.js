// =========================================================
// Daftar Kamar — kartu tipe kamar dengan filter AC / kamar mandi
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui } = SIPENKOS;
  const semua = await store.kamar.daftarTipe();

  const SARINGAN = {
    semua: () => true,
    ac: (t) => t.ac,
    nonac: (t) => !t.ac,
    dalam: (t) => t.kamarMandiDalam,
    luar: (t) => !t.kamarMandiDalam
  };

  const tampilkan = (kunci) => {
    const hasil = semua.filter(SARINGAN[kunci]);
    document.getElementById("daftarTipe").innerHTML = hasil.map(ui.kartuKamar).join("");
    const kosong = document.getElementById("kosong");
    kosong.hidden = hasil.length > 0;
    kosong.innerHTML = ui.kosong({ ikon: "meeting_room", judul: "Tidak ada kamar yang cocok", pesan: "Coba pilih filter lain." });
  };

  ui.filterPil(document.getElementById("filter"), [
    { nilai: "semua", label: `Semua (${semua.length})` },
    { nilai: "ac", label: "AC" },
    { nilai: "nonac", label: "Non-AC" },
    { nilai: "dalam", label: "Kamar Mandi Dalam" },
    { nilai: "luar", label: "Kamar Mandi Luar" }
  ], tampilkan);

  document.getElementById("tanyaWa").href = ui.waLink("Halo Bu Nining, saya ingin bertanya tentang kamar kos.");
  tampilkan("semua");
});
