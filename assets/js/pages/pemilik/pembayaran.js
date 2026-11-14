// =========================================================
// Verifikasi Pembayaran (pemilik)
// Menunggu → periksa bukti → Konfirmasi Lunas / Tolak
// Belum dibayar → bisa dicatat lunas bila dibayar tunai (Cash)
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F } = SIPENKOS;
  const semua = await store.tagihan.semua();
  let saring = "menunggu";

  const tampilkan = () => {
    const isi = saring === "semua" ? semua
      : saring === "belum" ? semua.filter((t) => ["belum", "ditolak"].includes(t.status))
      : semua.filter((t) => t.status === saring);
    document.getElementById("isiTabel").innerHTML = isi.map((t) => `
      <tr>
        <td data-label="Penghuni"><span class="tabel-utama">${F.esc(t.pengguna?.nama || "-")}</span><span class="tabel-sub">${t.kamar ? "Kamar " + F.esc(t.kamar.nomor) : ""}</span></td>
        <td data-label="Tagihan">${F.periode(t.periode)}<span class="tabel-sub">${F.esc(t.jenis)}</span></td>
        <td data-label="Jumlah" class="angka">${F.rupiah(t.jumlah)}</td>
        <td data-label="Jatuh Tempo">${F.tanggal(t.jatuhTempo)}</td>
        <td data-label="Status">${ui.badge("tagihan", t.status)}</td>
        <td class="aksi"><button type="button" class="tombol ${t.status === "menunggu" ? "tombol--utama" : "tombol--sekunder"} tombol--kecil" data-id="${F.esc(t.id)}">${t.status === "menunggu" ? "Periksa" : "Detail"}</button></td>
      </tr>`).join("");
    const kosong = document.getElementById("kosong");
    kosong.hidden = isi.length > 0;
    kosong.innerHTML = ui.kosong({ ikon: "payments", judul: saring === "menunggu" ? "Tidak ada bukti yang perlu diperiksa" : "Tidak ada tagihan" });
  };

  const periksa = async (t) => {
    const bolehCash = ["belum", "ditolak"].includes(t.status);
    const isi = `
      ${ui.rincian([
        ["Penghuni", F.esc(`${t.pengguna?.nama} · Kamar ${t.kamar?.nomor || "-"}`)],
        ["Tagihan", F.esc(`${t.jenis} · ${F.periode(t.periode)}`)],
        ["Jumlah", `<span class="harga">${F.rupiah(t.jumlah)}</span>`],
        ["Jatuh tempo", F.tanggal(t.jatuhTempo)],
        ["Status", ui.badge("tagihan", t.status)],
        t.dikirimPada ? ["Bukti dikirim", F.waktu(t.dikirimPada)] : null,
        t.dibayarPada ? ["Dikonfirmasi", F.waktu(t.dibayarPada)] : null,
        t.alasanTolak ? ["Alasan ditolak", F.esc(t.alasanTolak)] : null
      ])}
      ${t.bukti ? `<img class="pratinjau-bukti" src="${F.esc(ui.gambar(t.bukti))}" alt="Bukti transfer">` : ""}
      ${bolehCash ? '<div class="kotak-info"><i data-ikon="info"></i><p>Penghuni membayar tunai? Catat sebagai lunas dengan metode Cash.</p></div>' : ""}`;
    const tombol = t.status === "menunggu"
      ? [{ label: "Belum Sesuai", kelas: "tombol--sekunder", nilai: "tolak" }, { label: "Konfirmasi Lunas", kelas: "tombol--utama", nilai: "lunas", ikon: "check" }]
      : bolehCash
        ? [{ label: "Tutup", kelas: "tombol--batal", nilai: "batal" }, { label: "Catat Lunas (Cash)", kelas: "tombol--utama", nilai: "cash" }]
        : [{ label: "Tutup", kelas: "tombol--sekunder", nilai: "batal" }];

    const hasil = await ui.dialog({ judul: "Pembayaran Tagihan", isi, tombol });
    try {
      if (hasil === "lunas") {
        await store.tagihan.konfirmasi(t.id);
        ui.toast("Pembayaran dikonfirmasi lunas");
      } else if (hasil === "cash") {
        if (!(await ui.konfirmasi({ judul: "Catat pembayaran tunai?", pesan: `${t.pengguna?.nama} sudah membayar ${F.rupiah(t.jumlah)} secara tunai.`, label: "Catat Lunas" }))) return;
        await store.tagihan.konfirmasi(t.id, { metode: "Cash" });
        ui.toast("Pembayaran tunai dicatat");
      } else if (hasil === "tolak") {
        const alasan = await ui.mintaAlasan({ judul: "Bukti belum sesuai", label: "Alasan (dikirim ke penghuni)", saran: "Nominal transfer tidak sesuai tagihan", tombol: "Kirim" });
        if (!alasan) return;
        await store.tagihan.tolak(t.id, alasan);
        ui.toast("Penghuni diminta mengunggah ulang bukti", "info");
      } else return;
      window.location.reload();
    } catch (e) {
      ui.gagal(e);
    }
  };

  ui.filterPil(document.getElementById("filter"), [
    { nilai: "menunggu", label: `Menunggu (${semua.filter((t) => t.status === "menunggu").length})` },
    { nilai: "belum", label: "Belum Dibayar" },
    { nilai: "lunas", label: "Lunas" },
    { nilai: "semua", label: "Semua" }
  ], (v) => { saring = v; tampilkan(); }, "menunggu");

  document.getElementById("isiTabel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (b) periksa(semua.find((t) => t.id === b.dataset.id));
  });
  tampilkan();
});
