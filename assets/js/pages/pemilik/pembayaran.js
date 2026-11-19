// =========================================================
// Verifikasi Pembayaran (pemilik)
// Menunggu → periksa bukti → Konfirmasi Lunas / Tolak
// Belum dibayar → bisa dicatat lunas bila dibayar tunai (Cash)
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F, adminUI: A } = SIPENKOS; // tampilan mengikuti admin/pages/verifikasi-pembayaran.php
  const semua = (await store.tagihan.semua()).sort((a, b) => (b.dikirimPada || b.jatuhTempo).localeCompare(a.dikirimPada || a.jatuhTempo));
  let saring = "all";
  const LABEL = { menunggu: ["Menunggu", "warning"], lunas: ["Terverifikasi", "success"], ditolak: ["Ditolak", "danger"], belum: ["Belum Dibayar", "neutral"] };

  const cocok = (t, f) => f === "all" ? ["menunggu", "lunas", "ditolak"].includes(t.status)
    : f === "terverifikasi" ? t.status === "lunas" : t.status === f;
  const tampilkan = () => {
    const q = document.getElementById("cari").value.trim().toLowerCase();
    const hitung = Object.fromEntries(["all", "menunggu", "terverifikasi", "ditolak", "belum"].map((f) => [f, semua.filter((t) => cocok(t, f)).length]));
    chip.gambar(hitung);
    const isi = semua.filter((t) => cocok(t, saring) && (!q || `${t.pengguna?.nama} ${t.kamar?.nomor}`.toLowerCase().includes(q)));
    document.getElementById("isiTabel").innerHTML = isi.map((t) => {
      const [label, nada] = LABEL[t.status] || LABEL.belum;
      return `
      <tr>
        <td class="nowrap">${t.dikirimPada ? F.tanggal(t.dikirimPada) : "-"}</td>
        <td>
          <div class="person">
            <span class="avatar">${F.esc(A.inisial(t.pengguna?.nama || "-"))}</span>
            <div><p class="person-name">${F.esc(t.pengguna?.nama || "-")}</p><p class="person-sub">${t.kamar ? "Kamar " + F.esc(t.kamar.nomor) : "-"}</p></div>
          </div>
        </td>
        <td class="nowrap">${F.periode(t.periode)} · ${F.rupiah(t.jumlah)}</td>
        <td>${A.badge(label, nada)}</td>
        <td><div class="row-actions">${t.status === "menunggu"
          ? `<button type="button" class="btn btn-primary btn-sm" data-id="${F.esc(t.id)}">Verifikasi</button>`
          : `<button type="button" class="btn btn-secondary btn-sm" data-id="${F.esc(t.id)}">${t.status === "belum" ? "Catat Cash" : "Detail"}</button>`}</div></td>
      </tr>`;
    }).join("");
    document.getElementById("kosong").hidden = isi.length > 0;
  };
  const chip = A.chip(document.getElementById("filter"),
    [["all", "Semua"], ["menunggu", "Menunggu"], ["terverifikasi", "Terverifikasi"], ["ditolak", "Ditolak"], ["belum", "Belum Dibayar"]],
    (v) => { saring = v; tampilkan(); }, "all");
  document.getElementById("cari").addEventListener("input", () => tampilkan());

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

  document.getElementById("isiTabel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (b) periksa(semua.find((t) => t.id === b.dataset.id));
  });
  tampilkan();
});
