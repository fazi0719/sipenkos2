// =========================================================
// Kamar (pemilik) — ubah harga tipe & status tiap kamar
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F, adminUI: A } = SIPENKOS; // tampilan mengikuti admin/pages/monitor-kamar.php
  const $ = (id) => document.getElementById(id);
  let tipe = await store.kamar.daftarTipe();
  let unit = await store.kamar.daftarUnit();
  let saring = "semua";

  const gambarTipe = () => {
    const total = tipe.reduce((x, t) => x + t.total, 0);
    const kosong = tipe.reduce((x, t) => x + t.sisa, 0);
    const stat = (ikon, nada, label, nilai) => `
      <div class="card stat stat-row">
        ${A.kotakIkon(ikon, nada, "lg")}
        <div><p class="stat-label">${label}</p><p class="stat-value">${nilai}</p></div>
      </div>`;
    $("statistik").innerHTML = stat("bed-double", "blue", "Total Kamar", total) + stat("users", "green", "Kamar Terisi", total - kosong) + stat("door-open", "amber", "Kamar Kosong", kosong);
    $("tabelTipe").innerHTML = tipe.map((t) => `
      <tr>
        <td class="nowrap">${F.esc(t.nama)} ${F.esc(t.ringkas)}</td>
        <td class="nowrap">${F.rupiah(t.harga)}</td>
        <td>${t.total}</td>
        <td>${t.total - t.sisa}</td>
        <td>${t.sisa}</td>
        <td class="ta-center">${t.tersedia ? A.badge(`Tersedia · sisa ${t.sisa}`, "success") : A.badge("Penuh", "danger")}</td>
      </tr>`).join("");
  };

  const gambarUnit = () => {
    const isi = saring === "semua" ? unit : unit.filter((k) => k.status === saring);
    chip.gambar({ semua: unit.length, kosong: unit.filter((k) => k.status === "kosong").length, terisi: unit.filter((k) => k.status === "terisi").length, perbaikan: unit.filter((k) => k.status === "perbaikan").length });
    $("tabelUnit").innerHTML = isi.map((k) => `
      <tr>
        <td class="nowrap">Kamar ${F.esc(k.nomor)}</td>
        <td class="nowrap">${F.esc(k.tipe.nama)} ${F.esc(k.tipe.ringkas)}</td>
        <td>${A.status("kamar", k.status)}</td>
        <td>${k.penghuni ? F.esc(k.penghuni.nama) : "-"}</td>
        <td class="ta-right">${k.status === "terisi" ? "" : `<button type="button" class="btn btn-secondary btn-sm" data-unit="${k.id}">${k.status === "kosong" ? "Tandai Perbaikan" : "Tandai Kosong"}</button>`}</td>
      </tr>`).join("");
  };

  const chip = A.chip($("filter"), [["semua", "Semua"], ["kosong", "Kosong"], ["terisi", "Terisi"], ["perbaikan", "Perbaikan"]], (v) => { saring = v; gambarUnit(); });

  $("ubahHarga").addEventListener("click", async () => {
    const pilih = await ui.dialog({
      judul: "Pilih tipe kamar",
      isi: `<div class="field"><label class="label" for="tipeId">Tipe kamar</label><select class="select" id="tipeId" name="tipeId">${tipe.map((t) => `<option value="${t.id}">${F.esc(t.nama)} ${F.esc(t.ringkas)}</option>`).join("")}</select></div>`,
      tombol: [{ label: "Batal", kelas: "tombol--batal", nilai: "batal" }, { label: "Lanjut", kelas: "tombol--utama", nilai: "kirim" }]
    });
    if (!(pilih instanceof FormData)) return;
    const t = tipe.find((x) => x.id === Number(pilih.get("tipeId")));
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
