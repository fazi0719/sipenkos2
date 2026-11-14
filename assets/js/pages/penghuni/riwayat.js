// =========================================================
// Riwayat Pembayaran — pembayaran lunas per tahun
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const lunas = (await store.tagihan.milikSaya())
    .filter((t) => t.status === "lunas")
    .sort((a, b) => b.dibayarPada.localeCompare(a.dibayarPada));

  const daftarTahun = [...new Set(lunas.map((t) => t.dibayarPada.slice(0, 4)))];
  if (!daftarTahun.length) daftarTahun.push(String(new Date().getFullYear()));
  $("tahun").innerHTML = daftarTahun.map((th) => `<option>${th}</option>`).join("");

  const tampilkan = () => {
    const th = $("tahun").value;
    const isi = lunas.filter((t) => t.dibayarPada.startsWith(th));
    $("isiTabel").innerHTML = isi.map((t) => `
      <tr>
        <td data-label="Tanggal Bayar">${F.tanggal(t.dibayarPada)}</td>
        <td data-label="Periode"><span class="tabel-utama">${F.periode(t.periode)}</span></td>
        <td data-label="Jenis">${F.esc(t.jenis)}</td>
        <td data-label="Jumlah" class="angka">${F.rupiah(t.jumlah)}</td>
        <td data-label="Metode">${F.esc(t.metode || "-")}</td>
        <td data-label="Status">${ui.badge("tagihan", t.status)}</td>
        <td class="aksi">${t.bukti ? `<button type="button" class="tombol tombol--teks kecil" data-bukti="${F.esc(t.id)}">Lihat</button>` : "-"}</td>
      </tr>`).join("");
    $("kosong").hidden = isi.length > 0;
    $("kosong").innerHTML = ui.kosong({ ikon: "history", judul: "Belum ada pembayaran", pesan: `Belum ada pembayaran lunas di tahun ${th}.` });
    const total = isi.reduce((s, t) => s + t.jumlah, 0);
    $("ringkasTahun").textContent = isi.length ? `${isi.length} pembayaran · total ${F.rupiah(total)} di tahun ${th}` : "";
  };

  $("tahun").addEventListener("change", tampilkan);
  $("isiTabel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-bukti]");
    if (b) ui.dialogTagihan(lunas.find((t) => t.id === b.dataset.bukti));
  });
  tampilkan();
});
