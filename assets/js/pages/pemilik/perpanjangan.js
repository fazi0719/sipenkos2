// =========================================================
// Perpanjangan Sewa (pemilik) — setujui / tolak pengajuan
// Bila penghuni pindah tipe, pemilik memilih nomor kamar baru.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, config, format: F, adminUI: A } = SIPENKOS; // gaya tabel admin kelompok
  const semua = (await store.perpanjangan.semua()).sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada));
  let saring = "menunggu";

  const pindah = (x) => x.kamarLama?.tipeId !== x.tipeId;

  const tampilkan = () => {
    chip.gambar({ menunggu: semua.filter((x) => x.status === "menunggu").length, semua: semua.length });
    const isi = saring === "semua" ? semua : semua.filter((x) => x.status === saring);
    document.getElementById("isiTabel").innerHTML = isi.map((x) => `
      <tr>
        <td class="nowrap">${F.tanggal(x.dibuatPada)}</td>
        <td>
          <div class="person">
            <span class="avatar">${F.esc(A.inisial(x.pengguna.nama))}</span>
            <div><p class="person-name">${F.esc(x.pengguna.nama)}</p><p class="person-sub">Kamar ${F.esc(x.kamarLama?.nomor || "-")}</p></div>
          </div>
        </td>
        <td><p class="cell-main">${x.durasi} bulan · ${F.esc(x.tipe.nama)}${pindah(x) ? " (pindah tipe)" : ""}</p><p class="cell-sub">${x.skema === "dp" ? "DP " + config.aturanBisnis.persenDp + "%" : "Lunas"} · ${F.esc(x.metode)} · ${F.rupiah(x.total)}</p></td>
        <td class="nowrap">${F.rentang(x.mulaiBaru, x.akhirBaru)}</td>
        <td>${A.status("perpanjangan", x.status)}</td>
        <td class="ta-right"><button type="button" class="btn ${x.status === "menunggu" ? "btn-primary" : "btn-secondary"} btn-sm" data-id="${F.esc(x.id)}">${x.status === "menunggu" ? "Tinjau" : "Detail"}</button></td>
      </tr>`).join("");
    document.getElementById("kosong").hidden = isi.length > 0;
  };
  const chip = A.chip(document.getElementById("filter"), [["menunggu", "Menunggu"], ["disetujui", "Disetujui"], ["ditolak", "Ditolak"], ["semua", "Semua"]], (v) => { saring = v; tampilkan(); }, "menunggu");

  const tinjau = async (x) => {
    const unit = x.status === "menunggu" && pindah(x) ? await store.kamar.unitKosong(x.tipeId) : [];
    const perluKamar = x.status === "menunggu" && pindah(x);
    const isi = `
      ${ui.rincian([
        ["Penghuni", F.esc(`${x.pengguna.nama} · Kamar ${x.kamarLama?.nomor}`)],
        ["Tipe", F.esc(ui.judulTipe(x.tipe)) + (pindah(x) ? " (pindah tipe)" : "")],
        ["Durasi", `${x.durasi} bulan`],
        ["Masa sewa baru", F.rentang(x.mulaiBaru, x.akhirBaru)],
        ["Skema · Metode", `${x.skema === "dp" ? "DP " + config.aturanBisnis.persenDp + "%" : "Lunas"} · ${F.esc(x.metode)}`],
        ["Total", `<span class="harga">${F.rupiah(x.total)}</span>`],
        x.skema === "dp" ? ["DP dibayar setelah disetujui", F.rupiah(x.dibayar)] : null,
        ["Diajukan", F.waktu(x.dibuatPada)],
        ["Status", ui.badge("perpanjangan", x.status)],
        x.alasanTolak ? ["Alasan ditolak", F.esc(x.alasanTolak)] : null
      ])}
      ${perluKamar ? (unit.length ? `
        <div class="field">
          <label class="label" for="kamarId">Kamar baru (${F.esc(x.tipe.nama)})</label>
          <div class="input-ikon"><select class="select" id="kamarId" name="kamarId">${unit.map((k) => `<option value="${k.id}">Kamar ${k.nomor}</option>`).join("")}</select>${ikon("expand_more")}</div>
        </div>` : `<div class="kotak-info">${ikon("warning")}<p>Tidak ada kamar ${F.esc(x.tipe.nama)} yang kosong.</p></div>`) : ""}
      ${x.status === "menunggu" ? `<div class="kotak-info"><i data-ikon="info"></i><p>Setelah disetujui, tagihan perpanjangan otomatis dibuat untuk penghuni.</p></div>` : ""}`;

    const bisaSetuju = !perluKamar || unit.length;
    const tombol = x.status === "menunggu"
      ? [{ label: "Tolak", kelas: "tombol--sekunder", nilai: "tolak" }, ...(bisaSetuju ? [{ label: "Setujui", kelas: "tombol--utama", nilai: "kirim", ikon: "check" }] : [])]
      : [{ label: "Tutup", kelas: "tombol--sekunder", nilai: "batal" }];

    const hasil = await ui.dialog({ judul: `Perpanjangan ${x.pengguna.nama}`, isi, tombol });
    try {
      if (hasil instanceof FormData) {
        await store.perpanjangan.setujui(x.id, hasil.get("kamarId"));
        ui.toast("Perpanjangan disetujui");
      } else if (hasil === "tolak") {
        const alasan = await ui.mintaAlasan({ judul: "Tolak perpanjangan", label: "Alasan (dikirim ke penghuni)" });
        if (!alasan) return;
        await store.perpanjangan.tolak(x.id, alasan);
        ui.toast("Pengajuan ditolak", "info");
      } else return;
      window.location.reload();
    } catch (e) {
      ui.gagal(e);
    }
  };

  document.getElementById("isiTabel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (b) tinjau(semua.find((x) => x.id === b.dataset.id));
  });
  tampilkan();
});
