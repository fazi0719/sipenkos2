// =========================================================
// Notifikasi — dipakai semua role.
//   penghuni & calon : tampilan penghuni/notifikasi.php kelompok
//   pemilik          : tampilan admin/pages/notifikasi.php kelompok
// =========================================================
SIPENKOS.halaman(async ({ pengguna }) => {
  const { store, ui, format: F } = SIPENKOS;
  const wadah = document.getElementById("wadahNotifikasi");
  let semua = await store.notifikasi.milikSaya();

  const buka = async (id, href) => {
    await store.notifikasi.tandaiDibaca(id);
    if (href && href !== "#") window.location.href = href;
  };

  // ---------- versi admin (pemilik) ----------
  if (pengguna.jenis === "pemilik") {
    const JENIS = {
      how_to_reg: ["reservasi", "Reservasi", "calendar-check", "blue", "info"],
      payments: ["pembayaran", "Pembayaran", "credit-card", "amber", "warning"],
      build: ["kerusakan", "Kerusakan", "wrench", "red", "danger"],
      event_repeat: ["perpanjangan", "Perpanjangan", "calendar", "blue", "info"]
    };
    const jenis = (n) => JENIS[n.ikon] || ["lainnya", "Info", "bell", "gray", "neutral"];
    let filter = "all";

    wadah.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Notifikasi</h1>
          <p class="page-subtitle">Riwayat pemberitahuan aktivitas dan pengajuan terbaru dari penghuni</p>
        </div>
        <div class="page-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-mark-all>Tandai Semua Dibaca</button>
        </div>
      </div>
      <div class="list-section">
        <div class="toolbar">
          <div class="chips" role="group" aria-label="Filter status">
            ${[["all", "Semua"], ["unread", "Belum Dibaca"], ["reservasi", "Reservasi"], ["pembayaran", "Pembayaran"], ["kerusakan", "Kerusakan"]]
              .map(([f, l], i) => `<button type="button" class="chip${i ? "" : " is-active"}" aria-pressed="${!i}" data-filter="${f}" data-label="${l}">${l}</button>`).join("")}
          </div>
        </div>
        <div class="card notif-list" id="daftar"></div>
      </div>`;

    const daftar = wadah.querySelector("#daftar");
    const tampilkan = () => {
      const belum = semua.filter((n) => !n.dibaca).length;
      wadah.querySelectorAll(".chip").forEach((c) => {
        const f = c.dataset.filter;
        c.textContent = f === "all" ? `Semua (${semua.length})` : f === "unread" ? `Belum Dibaca (${belum})` : c.dataset.label;
        c.classList.toggle("is-active", f === filter);
        c.setAttribute("aria-pressed", String(f === filter));
      });
      const isi = semua.filter((n) => filter === "all" || (filter === "unread" ? !n.dibaca : jenis(n)[0] === filter));
      daftar.innerHTML = isi.length ? isi.map((n) => {
        const [, label, ik, tone, badge] = jenis(n);
        return `
          <div class="notif-item${n.dibaca ? "" : " is-unread"}" role="link" tabindex="0" data-id="${F.esc(n.id)}" data-href="${n.tautan ? SIPENKOS.url(n.tautan) : "#"}">
            <span class="icon-box tone-${tone}"><i class="icon icon-${ik}" aria-hidden="true"></i></span>
            <div class="notif-body">
              <p class="notif-text">${F.esc(n.judul)}: ${F.esc(n.isi)}</p>
              <p class="notif-time"><i class="icon icon-clock" aria-hidden="true"></i>${F.tanggal(n.waktu)} · ${F.waktu(n.waktu).split(", ")[1]}</p>
            </div>
            <span class="badge badge-${badge}"><span class="badge-dot"></span><span class="badge-label">${label}</span></span>
            <span class="notif-unread-dot" aria-label="${n.dibaca ? "Sudah dibaca" : "Belum dibaca"}"></span>
          </div>`;
      }).join("") : '<div class="notif-empty">Tidak ada notifikasi pada kategori ini.</div>';
      wadah.querySelector("[data-mark-all]").disabled = belum === 0;
    };

    wadah.querySelector(".chips").addEventListener("click", (e) => {
      const c = e.target.closest(".chip");
      if (c) { filter = c.dataset.filter; tampilkan(); }
    });
    const pilih = (el) => el && buka(el.dataset.id, el.dataset.href);
    daftar.addEventListener("click", (e) => pilih(e.target.closest(".notif-item")));
    daftar.addEventListener("keydown", (e) => { if (e.key === "Enter") pilih(e.target.closest(".notif-item")); });
    wadah.querySelector("[data-mark-all]").addEventListener("click", async () => {
      await store.notifikasi.tandaiSemua();
      semua = await store.notifikasi.milikSaya();
      document.querySelector(".a-notif-dot")?.remove();
      tampilkan();
    });
    tampilkan();
    return;
  }

  // ---------- versi penghuni / calon ----------
  const IKON = {
    "jatuh-tempo": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    kerusakan: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
    tagihan: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    pembayaran: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>'
  };
  const tipe = (n) => n.ikon === "build" ? "kerusakan"
    : ["check_circle", "payments"].includes(n.ikon) ? "pembayaran"
    : /jatuh tempo/i.test(n.judul) ? "jatuh-tempo" : "tagihan";

  wadah.innerHTML = `
    <div class="notif-heading">
      <h1>Notifikasi</h1>
      <button type="button" class="btn-tandai-semua" id="tandaiSemua">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
        Tandai semua sudah dibaca
      </button>
    </div>
    <div class="notif-card">
      <div class="notif-daftar" id="daftarNotifikasi" aria-live="polite"></div>
    </div>`;

  const daftarEl = wadah.querySelector("#daftarNotifikasi");
  const tombolSemua = wadah.querySelector("#tandaiSemua");
  const tampilkan = () => {
    tombolSemua.hidden = !semua.some((n) => !n.dibaca);
    daftarEl.innerHTML = semua.length ? semua.map((n) => `
      <a class="notif-item tipe-${tipe(n)}${n.dibaca ? "" : " belum-dibaca"}" href="${n.tautan ? SIPENKOS.url(n.tautan) : "#"}" data-id="${F.esc(n.id)}">
        <span class="notif-ikon"><svg viewBox="0 0 24 24" aria-hidden="true">${IKON[tipe(n)]}</svg></span>
        <div class="notif-isi">
          <p class="notif-judul">${F.esc(n.judul)}${n.dibaca ? "" : '<span class="notif-titik" aria-label="Belum dibaca"></span>'}</p>
          ${n.isi ? `<p class="notif-pesan">${F.esc(n.isi)}</p>` : ""}
        </div>
        <time class="notif-tanggal" datetime="${F.esc(n.waktu)}">${F.tanggal(n.waktu)}</time>
      </a>`).join("") : '<p class="notif-kosong">Belum ada notifikasi.</p>';
  };
  daftarEl.addEventListener("click", (e) => {
    const a = e.target.closest("a.notif-item");
    if (!a) return;
    e.preventDefault();
    buka(a.dataset.id, a.getAttribute("href"));
  });
  tombolSemua.addEventListener("click", async () => {
    await store.notifikasi.tandaiSemua();
    semua = await store.notifikasi.milikSaya();
    document.querySelectorAll(".k-header-dot, .k-badge-dot").forEach((el) => (el.hidden = true));
    tampilkan();
  });
  tampilkan();
});
