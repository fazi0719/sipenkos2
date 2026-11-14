// =========================================================
// Detail Laporan (pemilik) — ubah status & tulis catatan untuk penghuni
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, config, format: F } = SIPENKOS;
  const wadah = document.getElementById("isiLaporan");
  const l = await store.laporan.ambil(ui.param("id"));

  if (!l) {
    wadah.innerHTML = `<div class="kartu">${ui.kosong({ ikon: "build", judul: "Laporan tidak ditemukan", aksi: '<a class="tombol tombol--utama" href="laporan.html">Lihat Semua Laporan</a>' })}</div>`;
    return;
  }
  document.title = `${l.judul} · SIPENKOS`;

  const pilihan = Object.entries(config.status.laporan);
  const formTindakLanjut = `
    <form class="form panel" id="formStatus" novalidate>
      <h3 class="label">Tindak Lanjut</h3>
      <fieldset class="fieldset">
        <legend class="sr-only">Status laporan</legend>
        <div class="opsi-grid">${pilihan.map(([nilai, info]) =>
          `<label class="opsi"><input type="radio" name="status" value="${nilai}"${nilai === l.status ? " checked" : ""}><span>${info.label}</span></label>`).join("")}</div>
      </fieldset>
      <div class="field">
        <label class="label" for="catatan">Catatan untuk penghuni</label>
        <textarea class="textarea" id="catatan" name="catatan" rows="3" placeholder="Contoh: Tukang dijadwalkan datang besok pukul 10.00">${F.esc(l.catatan || "")}</textarea>
      </div>
      <div class="kaki-form"><button type="submit" class="tombol tombol--utama">Simpan</button></div>
    </form>`;

  const gambar = (data) => {
    wadah.innerHTML = ui.detailLaporan(data, { tambahanKanan: formTindakLanjut });
    SIPENKOS.pasangIkon(wadah);
    wadah.querySelector("[data-lihat-foto]")?.addEventListener("click", () => ui.lihatGambar(data.foto, "Foto Kerusakan"));
    const form = wadah.querySelector("#formStatus");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const baru = await ui.sibuk(form.querySelector("[type=submit]"), () =>
          store.laporan.ubahStatus(data.id, form.status.value, form.catatan.value));
        ui.toast("Status laporan diperbarui. Penghuni mendapat notifikasi.");
        gambar(baru);
      } catch (err) {
        ui.gagal(err);
      }
    });
  };
  gambar(l);
});
