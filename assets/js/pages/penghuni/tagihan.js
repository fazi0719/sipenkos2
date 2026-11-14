// =========================================================
// Tagihan — tabel tagihan dengan filter status
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F } = SIPENKOS;
  const semua = await store.tagihan.milikSaya();
  const tbody = document.getElementById("isiTabel");
  const kosong = document.getElementById("kosong");

  const aksi = (t) => (t.status === "belum" || t.status === "ditolak")
    ? `<a class="tombol tombol--utama tombol--kecil" href="bayar-tagihan.html?id=${encodeURIComponent(t.id)}">Bayar</a>`
    : `<button type="button" class="tombol tombol--sekunder tombol--kecil" data-detail="${F.esc(t.id)}">Detail</button>`;

  const tampilkan = (saring) => {
    const isi = saring === "semua" ? semua : semua.filter((t) => saring === "belum" ? ["belum", "ditolak"].includes(t.status) : t.status === saring);
    tbody.innerHTML = isi.map((t) => `
      <tr>
        <td data-label="Periode"><span class="tabel-utama">${F.periode(t.periode)}</span></td>
        <td data-label="Jenis">${F.esc(t.jenis)}</td>
        <td data-label="Jumlah" class="angka">${F.rupiah(t.jumlah)}</td>
        <td data-label="Jatuh Tempo">${F.tanggal(t.jatuhTempo)}</td>
        <td data-label="Status">${ui.badge("tagihan", t.status)}</td>
        <td class="aksi">${aksi(t)}</td>
      </tr>`).join("");
    kosong.hidden = isi.length > 0;
    kosong.innerHTML = ui.kosong({ ikon: "receipt_long", judul: "Tidak ada tagihan", pesan: "Tidak ada tagihan dengan status ini." });
  };

  ui.filterPil(document.getElementById("filter"), [
    { nilai: "semua", label: "Semua" },
    { nilai: "belum", label: "Belum Dibayar" },
    { nilai: "menunggu", label: "Menunggu Konfirmasi" },
    { nilai: "lunas", label: "Lunas" }
  ], tampilkan);

  tbody.addEventListener("click", (e) => {
    const b = e.target.closest("[data-detail]");
    if (b) ui.dialogTagihan(semua.find((t) => t.id === b.dataset.detail));
  });

  tampilkan("semua");
});
