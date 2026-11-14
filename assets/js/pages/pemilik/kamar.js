// =========================================================
// Kamar (pemilik) — ubah harga tipe & status tiap kamar
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  let tipe = await store.kamar.daftarTipe();
  let unit = await store.kamar.daftarUnit();
  let saring = "semua";

  const gambarTipe = () => {
    $("tabelTipe").innerHTML = tipe.map((t) => `
      <tr>
        <td data-label="Tipe"><span class="tabel-utama">${F.esc(t.nama)}</span><span class="tabel-sub">${F.esc(t.ringkas)}</span></td>
        <td data-label="Harga" class="angka">${F.rupiah(t.harga)}</td>
        <td data-label="Terisi" class="angka">${t.total - t.sisa} / ${t.total}</td>
        <td data-label="Ketersediaan">${ui.badgeKetersediaan(t)}</td>
        <td class="aksi"><button type="button" class="tombol tombol--sekunder tombol--kecil" data-ubah-tipe="${t.id}">${ikon("edit")}Ubah</button></td>
      </tr>`).join("");
  };

  const gambarUnit = () => {
    const isi = saring === "semua" ? unit : unit.filter((k) => k.status === saring);
    $("tabelUnit").innerHTML = isi.map((k) => `
      <tr>
        <td data-label="Kamar"><span class="tabel-utama">Kamar ${F.esc(k.nomor)}</span></td>
        <td data-label="Tipe">${F.esc(k.tipe.nama)}</td>
        <td data-label="Status">${ui.badge("kamar", k.status)}</td>
        <td data-label="Penghuni">${k.penghuni ? F.esc(k.penghuni.nama) : '<span class="muted">-</span>'}</td>
        <td class="aksi">${k.status === "terisi" ? "" : `<button type="button" class="tombol tombol--sekunder tombol--kecil" data-unit="${k.id}">${k.status === "kosong" ? "Tandai Perbaikan" : "Tandai Kosong"}</button>`}</td>
      </tr>`).join("");
  };

  ui.filterPil($("filter"), [
    { nilai: "semua", label: `Semua (${unit.length})` },
    { nilai: "kosong", label: "Kosong" },
    { nilai: "terisi", label: "Terisi" },
    { nilai: "perbaikan", label: "Perbaikan" }
  ], (v) => { saring = v; gambarUnit(); });

  $("tabelTipe").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-ubah-tipe]");
    if (!b) return;
    const t = tipe.find((x) => x.id === Number(b.dataset.ubahTipe));
    const data = await ui.dialog({
      judul: `Ubah ${t.nama}`,
      isi: `
        <div class="field">
          <label class="label" for="harga">Harga per bulan (Rp)</label>
          <input class="input" id="harga" name="harga" inputmode="numeric" value="${t.harga}">
        </div>
        <div class="field">
          <label class="label" for="deskripsi">Deskripsi</label>
          <textarea class="textarea" id="deskripsi" name="deskripsi">${F.esc(t.deskripsi)}</textarea>
        </div>
        <p class="bantuan">Harga baru berlaku untuk reservasi & perpanjangan berikutnya. Tagihan yang sudah terbit tidak berubah.</p>`,
      tombol: [{ label: "Batal", kelas: "tombol--batal", nilai: "batal" }, { label: "Simpan", kelas: "tombol--utama", nilai: "kirim" }],
      sebelumKirim: (form) => ui.validasi(form, {
        harga: (v) => (!/^\d+$/.test(v.replace(/\./g, "")) || Number(v.replace(/\./g, "")) < 100000 ? "Isi angka, minimal 100000." : ""),
        deskripsi: (v) => (v.length < 20 ? "Deskripsi minimal 20 huruf." : "")
      })
    });
    if (!data) return;
    try {
      await store.kamar.ubahTipe(t.id, { harga: data.get("harga").replace(/\./g, ""), deskripsi: data.get("deskripsi") });
      tipe = await store.kamar.daftarTipe();
      gambarTipe();
      ui.toast(`${t.nama} diperbarui`);
    } catch (err) {
      ui.gagal(err);
    }
  });

  $("tabelUnit").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-unit]");
    if (!b) return;
    const k = unit.find((x) => x.id === b.dataset.unit);
    try {
      await store.kamar.ubahStatusUnit(k.id, k.status === "kosong" ? "perbaikan" : "kosong");
      [tipe, unit] = await Promise.all([store.kamar.daftarTipe(), store.kamar.daftarUnit()]);
      gambarTipe();
      gambarUnit();
      ui.toast(`Kamar ${k.nomor} diperbarui`);
    } catch (err) {
      ui.gagal(err);
    }
  });

  gambarTipe();
  gambarUnit();
});
