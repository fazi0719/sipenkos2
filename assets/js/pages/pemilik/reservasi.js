// =========================================================
// Reservasi (pemilik) — tinjau data & bukti, lalu terima / tolak
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F } = SIPENKOS;
  let semua = await store.reservasi.semua();
  let saring = "menunggu";

  const tampilkan = () => {
    const isi = saring === "semua" ? semua : semua.filter((r) => r.status === saring);
    document.getElementById("isiTabel").innerHTML = isi.map((r) => `
      <tr>
        <td data-label="Pemohon"><span class="tabel-utama">${F.esc(r.pengguna.nama)}</span><span class="tabel-sub">${F.esc(r.pengguna.hp)}</span></td>
        <td data-label="Tipe Kamar">${F.esc(r.tipe.nama)}${r.kamar ? ` · Kamar ${F.esc(r.kamar.nomor)}` : ""}</td>
        <td data-label="Mulai · Durasi">${F.tanggal(r.tglMulai)} · ${r.durasi} bln</td>
        <td data-label="Bukti Dikirim">${r.tagihanPertama?.dikirimPada ? F.waktu(r.tagihanPertama.dikirimPada) : "-"}</td>
        <td data-label="Status">${ui.badge("reservasi", r.status)}</td>
        <td class="aksi"><button type="button" class="tombol ${r.status === "menunggu" ? "tombol--utama" : "tombol--sekunder"} tombol--kecil" data-id="${F.esc(r.id)}">${r.status === "menunggu" ? "Tinjau" : "Detail"}</button></td>
      </tr>`).join("");
    const kosong = document.getElementById("kosong");
    kosong.hidden = isi.length > 0;
    kosong.innerHTML = ui.kosong({ ikon: "how_to_reg", judul: saring === "menunggu" ? "Tidak ada reservasi yang menunggu" : "Tidak ada reservasi" });
  };

  const tinjau = async (r) => {
    const unit = r.status === "menunggu" ? await store.kamar.unitKosong(r.tipeId) : [];
    const isi = `
      <div class="grid-2">
        <div>
          <h3 class="label">Data Pemohon</h3>
          ${ui.rincian([
            ["Nama", F.esc(r.pengguna.nama)],
            ["NIK", F.esc(r.pengguna.nik)],
            ["HP", F.esc(r.pengguna.hp)],
            ["Email", F.esc(r.pengguna.email)],
            ["Kontak darurat", F.esc(`${r.kontakDarurat.nama} (${r.kontakDarurat.hubungan})`)],
            ["HP darurat", F.esc(r.kontakDarurat.hp)]
          ])}
        </div>
        <div>
          <h3 class="label">Reservasi</h3>
          ${ui.rincian([
            ["Tipe", F.esc(ui.judulTipe(r.tipe))],
            ["Mulai", F.tanggal(r.tglMulai)],
            ["Durasi", `${r.durasi} bulan`],
            ["Dibayar", `<span class="harga">${F.rupiah(r.tagihanPertama.jumlah)}</span>`],
            ["Status", ui.badge("reservasi", r.status)],
            r.alasanTolak ? ["Alasan ditolak", F.esc(r.alasanTolak)] : null
          ])}
        </div>
      </div>
      <div class="grid-2">
        <div><h3 class="label">Bukti Transfer</h3>${r.tagihanPertama.bukti ? `<img class="pratinjau-bukti" src="${F.esc(ui.gambar(r.tagihanPertama.bukti))}" alt="Bukti transfer">` : '<p class="muted">Belum ada</p>'}</div>
        <div><h3 class="label">Foto KTP</h3>${r.ktp?.data ? `<img class="pratinjau-bukti" src="${F.esc(r.ktp.data)}" alt="Foto KTP">` : `<p class="muted kecil">${F.esc(r.ktp?.nama || "Tidak ada")} (data contoh)</p>`}</div>
      </div>
      ${r.status === "menunggu" ? (unit.length ? `
        <div class="field">
          <label class="label" for="kamarId">Tempatkan di kamar</label>
          <div class="input-ikon"><select class="select" id="kamarId" name="kamarId">${unit.map((k) => `<option value="${k.id}">Kamar ${k.nomor}</option>`).join("")}</select>${ikon("expand_more")}</div>
        </div>` : `<div class="kotak-info">${ikon("warning")}<p>Tidak ada kamar ${F.esc(r.tipe.nama)} yang kosong. Kosongkan kamar dulu di menu Kamar atau tolak reservasi ini.</p></div>`) : ""}`;

    const tombol = r.status === "menunggu"
      ? [{ label: "Tolak", kelas: "tombol--sekunder", nilai: "tolak" }, ...(unit.length ? [{ label: "Terima Reservasi", kelas: "tombol--utama", nilai: "kirim", ikon: "check" }] : [])]
      : [{ label: "Tutup", kelas: "tombol--sekunder", nilai: "batal" }];

    const hasil = await ui.dialog({ judul: `Reservasi ${r.pengguna.nama}`, isi, tombol, lebar: true });
    try {
      if (hasil instanceof FormData) {
        await store.reservasi.terima(r.id, hasil.get("kamarId"));
        ui.toast(`Reservasi ${r.pengguna.nama} diterima`);
      } else if (hasil === "tolak") {
        const alasan = await ui.mintaAlasan({ judul: "Tolak reservasi", label: "Alasan penolakan (dikirim ke pemohon)", saran: "Bukti transfer tidak terbaca" });
        if (!alasan) return;
        await store.reservasi.tolak(r.id, alasan);
        ui.toast("Reservasi ditolak", "info");
      } else return;
      window.location.reload();
    } catch (e) {
      ui.gagal(e);
    }
  };

  ui.filterPil(document.getElementById("filter"), [
    { nilai: "menunggu", label: `Menunggu (${semua.filter((r) => r.status === "menunggu").length})` },
    { nilai: "diterima", label: "Diterima" },
    { nilai: "ditolak", label: "Ditolak" },
    { nilai: "semua", label: "Semua" }
  ], (v) => { saring = v; tampilkan(); }, "menunggu");

  document.getElementById("isiTabel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (b) tinjau(semua.find((r) => r.id === b.dataset.id));
  });
  tampilkan();
});
