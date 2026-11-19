// =========================================================
// Laporan Kerusakan (pemilik) — tampilan mengikuti admin/pages/laporan-kerusakan.php
// dan detail-laporan-kerusakan.php (detail berupa modal: ubah status + catatan).
// laporan-detail.html?id=... membuka modal laporan itu secara otomatis.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F, adminUI: A } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  let semua = await store.laporan.semua();
  let saring = "all";
  const LABEL = { baru: ["Belum Dikerjakan", "danger"], diproses: ["Diproses", "info"], selesai: ["Selesai", "success"] };
  const status = (s) => A.badge(...(LABEL[s] || [s, "neutral"]));

  const tampilkan = () => {
    const q = $("cari").value.trim().toLowerCase();
    const baru = semua.filter((l) => l.status === "baru").length;
    $("bannerBaru").hidden = !baru;
    $("jumlahBaru").textContent = `${baru} laporan baru belum dikerjakan`;
    chip.gambar({ all: semua.length, baru, diproses: semua.filter((l) => l.status === "diproses").length, selesai: semua.filter((l) => l.status === "selesai").length });
    const isi = semua.filter((l) => (saring === "all" || l.status === saring)
      && (!q || `${l.pengguna?.nama} ${l.kamar?.nomor} ${l.judul} ${l.kategori}`.toLowerCase().includes(q)));
    $("isiTabel").innerHTML = isi.length ? isi.map((l) => `
      <tr>
        <td class="nowrap">${F.tanggal(l.dibuatPada)}</td>
        <td>
          <div class="person">
            <span class="avatar">${F.esc(A.inisial(l.pengguna?.nama || "-"))}</span>
            <div><p class="person-name">${F.esc(l.pengguna?.nama || "-")}</p><p class="person-sub">Kamar ${F.esc(l.kamar?.nomor || "-")}</p></div>
          </div>
        </td>
        <td><p class="cell-main">${F.esc(l.judul)}</p><p class="cell-sub">${F.esc(l.kategori)}</p></td>
        <td>${status(l.status)}</td>
        <td class="ta-right"><button type="button" class="btn btn-secondary btn-sm" data-id="${F.esc(l.id)}">Detail</button></td>
      </tr>`).join("")
      : `<tr class="table-empty"><td colspan="5">${A.ikon("search")}Tidak ada laporan yang cocok.</td></tr>`;
  };
  const chip = A.chip($("filter"), [["all", "Semua"], ["baru", "Belum Dikerjakan"], ["diproses", "Diproses"], ["selesai", "Selesai"]], (v) => { saring = v; tampilkan(); });

  const buka = (l) => {
    let pilihan = l.status;
    const { el, tutup } = A.modal(`
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Detail Laporan Kerusakan</h2>
          <p class="modal-subtitle">Kamar ${F.esc(l.kamar?.nomor || "-")} · ${F.esc(l.pengguna?.nama || "-")} · ${F.tanggal(l.dibuatPada)}</p>
        </div>
        <button type="button" class="modal-close" data-modal-close aria-label="Tutup">${A.ikon("x")}</button>
      </div>
      <div class="report-layout">
        <div>
          <div class="media">${l.foto ? `<img src="${F.esc(ui.gambar(l.foto))}" alt="Foto kerusakan">` : `<div class="media-placeholder">${A.ikon("wrench")}Tidak ada foto</div>`}</div>
          <p class="media-caption">Foto dari penghuni</p>
        </div>
        <div>
          <div class="detail-list">
            <div class="detail-row"><span class="detail-label">Kategori</span><span class="detail-value">${F.esc(l.kategori)}</span></div>
            <div class="detail-row"><span class="detail-label">Status Saat Ini</span><span class="detail-value">${status(l.status)}</span></div>
          </div>
          <div class="report-desc">
            <p class="report-desc-label">Deskripsi</p>
            <p class="report-desc-text">${F.esc(l.deskripsi)}</p>
          </div>
        </div>
      </div>
      <div class="modal-section">
        <span class="field-label" id="seg-label">Ubah Status</span>
        <div class="segmented" role="radiogroup" aria-labelledby="seg-label">
          ${Object.entries(LABEL).map(([v, [label]]) => `<button type="button" role="radio" data-value="${v}" aria-checked="${v === l.status}"${v === l.status ? ' class="is-active"' : ""}>${label}</button>`).join("")}
        </div>
      </div>
      <div class="modal-section">
        <label class="field-label" for="kr-note">Catatan untuk Penghuni (opsional)</label>
        <textarea class="textarea" id="kr-note" rows="2" placeholder="Tulis catatan untuk penghuni...">${F.esc(l.catatan || "")}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary btn-lg" data-modal-close>Batal</button>
        <button type="button" class="btn btn-primary btn-lg" data-simpan>Simpan Status</button>
      </div>`);
    el.querySelector(".segmented").addEventListener("click", (e) => {
      const b = e.target.closest("[data-value]");
      if (!b) return;
      pilihan = b.dataset.value;
      el.querySelectorAll(".segmented button").forEach((x) => {
        x.classList.toggle("is-active", x === b);
        x.setAttribute("aria-checked", String(x === b));
      });
    });
    el.querySelector("[data-simpan]").addEventListener("click", async (e) => {
      try {
        await ui.sibuk(e.currentTarget, () => store.laporan.ubahStatus(l.id, pilihan, el.querySelector("#kr-note").value));
        semua = await store.laporan.semua();
        tutup();
        tampilkan();
        ui.toast("Status laporan diperbarui. Penghuni mendapat notifikasi.");
      } catch (err) {
        ui.gagal(err);
      }
    });
  };

  $("cari").addEventListener("input", tampilkan);
  $("lihatBaru").addEventListener("click", () => { saring = "baru"; tampilkan(); });
  $("isiTabel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (b) buka(semua.find((l) => l.id === b.dataset.id));
  });
  tampilkan();
  const awal = ui.param("id") && semua.find((l) => l.id === ui.param("id"));
  if (awal) buka(awal);
});
