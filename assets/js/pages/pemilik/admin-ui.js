// =========================================================
// Potongan HTML gaya admin repo kelompok (admin/css/style.css)
// dipakai semua halaman pemilik.
// =========================================================
(function () {
  const S = window.SIPENKOS;
  const esc = (t) => S.format.esc(t);
  const A = {};

  A.ikon = (nama) => `<i class="icon icon-${nama}" aria-hidden="true"></i>`;
  A.kotakIkon = (nama, nada = "blue", ukuran = "") => `<span class="icon-box${ukuran ? " icon-box-" + ukuran : ""} tone-${nada}">${A.ikon(nama)}</span>`;
  // nada: success · warning · danger · info · neutral
  A.badge = (label, nada = "neutral") => `<span class="badge badge-${nada}"><span class="badge-dot"></span><span class="badge-label">${esc(label)}</span></span>`;
  A.kepala = (judul, sub = "", aksi = "") => `
    <div class="page-header">
      <div>
        <h1 class="page-title">${esc(judul)}</h1>
        ${sub ? `<p class="page-subtitle">${esc(sub)}</p>` : ""}
      </div>
      ${aksi ? `<div class="page-actions">${aksi}</div>` : ""}
    </div>`;

  // badge status per jenis data sipenkos2
  const NADA = {
    reservasi: { draf: ["Belum Dibayar", "neutral"], menunggu: ["Menunggu", "warning"], diterima: ["Diterima", "success"], ditolak: ["Ditolak", "danger"] },
    tagihan: { belum: ["Belum Dibayar", "danger"], menunggu: ["Menunggu", "warning"], lunas: ["Lunas", "success"], ditolak: ["Ditolak", "danger"] },
    perpanjangan: { menunggu: ["Menunggu", "warning"], disetujui: ["Disetujui", "success"], ditolak: ["Ditolak", "danger"] },
    laporan: { baru: ["Baru", "info"], diproses: ["Diproses", "warning"], selesai: ["Selesai", "success"] },
    kamar: { kosong: ["Kosong", "success"], terisi: ["Terisi", "info"], perbaikan: ["Perbaikan", "warning"] }
  };
  A.status = (jenis, status) => {
    const [l, n] = (NADA[jenis] && NADA[jenis][status]) || [status, "neutral"];
    return A.badge(l, n);
  };

  // chip filter: daftar = [[nilai, label]], onUbah(nilai)
  A.chip = (wadah, daftar, onUbah, awal = daftar[0][0]) => {
    let aktif = awal;
    const gambar = (hitung = {}) => {
      wadah.innerHTML = `<div class="chips" role="group" aria-label="Filter status">${daftar.map(([v, l]) =>
        `<button type="button" class="chip${v === aktif ? " is-active" : ""}" aria-pressed="${v === aktif}" data-filter="${esc(v)}">${esc(l)}${hitung[v] != null ? ` (${hitung[v]})` : ""}</button>`).join("")}</div>`;
    };
    wadah.addEventListener("click", (e) => {
      const c = e.target.closest(".chip");
      if (!c) return;
      aktif = c.dataset.filter;
      onUbah(aktif);
    });
    return { gambar, nilai: () => aktif };
  };

  // modal gaya admin (.modal > .modal-dialog). isi = HTML dialog.
  // Mengembalikan { el, tutup }. Tutup lewat [data-modal-close], klik latar, atau Escape.
  A.modal = (isi, kelas = "modal-xl") => {
    const pemicu = document.activeElement;
    const el = document.createElement("div");
    el.className = "modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.innerHTML = `<div class="modal-dialog ${kelas}" tabindex="-1">${isi}</div>`;
    document.body.append(el);
    document.body.classList.add("modal-open");
    const tutup = () => {
      el.remove();
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", esc);
      pemicu?.focus?.();
    };
    const esc = (e) => { if (e.key === "Escape") tutup(); };
    document.addEventListener("keydown", esc);
    el.addEventListener("click", (e) => {
      if (e.target === el || e.target.closest("[data-modal-close]")) tutup();
    });
    el.querySelector(".modal-dialog").focus();
    return { el, tutup };
  };

  // inisial 2 huruf seperti avatar admin kelompok ("Nadia Putri" → "NP")
  A.inisial = (nama = "") => nama.trim().split(/\s+/).slice(0, 2).map((k) => k.charAt(0).toUpperCase()).join("") || "?";

  A.kosong = (teks) => `<div class="empty-state">${esc(teks)}</div>`;
  S.adminUI = A;
})();
