// =========================================================
// SHELL — memasang kerangka halaman & memeriksa hak akses.
//
// Setiap halaman cukup menulis atribut di <body>, contoh:
//   <body data-layout="akun" data-akses="penghuni" data-menu="tagihan" data-judul="Tagihan">
//
//   data-layout : tamu | auth | alur | akun          (lihat layout.css)
//   data-akses  : publik | tamu | calon | penghuni | pemilik | masuk
//                 (boleh lebih dari satu, dipisah spasi: "calon penghuni")
//                 tamu  = hanya untuk yang BELUM masuk (halaman Masuk/Daftar)
//                 masuk = siapa pun yang sudah masuk
//   data-menu   : kunci menu yang aktif (lihat config.js -> menu)
//   data-judul  : judul tab browser
//
// Lalu skrip halaman menulis:
//   SIPENKOS.halaman(async ({ pengguna }) => { ...isi halaman... });
// Fungsi itu baru dijalankan SETELAH kerangka terpasang & akses lolos.
// =========================================================
(function () {
  const S = (window.SIPENKOS = window.SIPENKOS || {});
  const { config, store, ui, format: F } = S;
  const esc = F.esc;
  const ikon = (...a) => S.ikon(...a);

  let lanjutkan;
  const siap = new Promise((r) => { lanjutkan = r; });

  // dipanggil oleh skrip halaman
  S.halaman = (fungsi) => {
    siap.then(async (konteks) => {
      try {
        await fungsi(konteks);
      } catch (e) {
        ui.gagal(e);
      }
    });
  };

  // ---------- potongan kerangka ----------
  const logo = (putih = false, href = "index.html") => `
    <a class="logo${putih ? " logo--putih" : ""}" href="${S.url(href)}" aria-label="SIPENKOS Kos Bu Nining, ke beranda">
      <span class="logo-nama">SIPENK${ikon("home")}S</span>
      <span class="logo-pemisah" aria-hidden="true"></span>
      <span class="logo-kos">${esc(config.kos.nama)}</span>
    </a>`;

  const berandaAkun = (p) => {
    if (!p) return "index.html";
    if (p.jenis === "calon") return p.punyaReservasi ? config.beranda.calon : config.beranda.calonBaru;
    return config.beranda[p.jenis];
  };

  const headerTamu = (p, menuAktif) => `
    <header class="header header--tamu">
      <div class="wadah header-isi">
        ${logo()}
        <nav class="menu-tamu" aria-label="Menu utama">
          ${config.menuTamu.map((m) =>
            `<a href="${S.url(m.href)}"${m.kunci === menuAktif ? ' aria-current="page"' : ""}>${m.label}</a>`).join("")}
        </nav>
        <div class="header-aksi">
          ${p
            ? `<a class="tombol tombol--utama" href="${S.url(berandaAkun(p))}"><span class="avatar avatar--mini">${esc(F.inisial(p.nama))}</span>Akun Saya</a>`
            : `<a class="tombol tombol--sekunder" href="${S.url("pages/auth/daftar.html")}">Daftar</a>
               <a class="tombol tombol--utama" href="${S.url("pages/auth/masuk.html")}">Masuk</a>`}
        </div>
        <button type="button" class="tombol tombol--ikon tombol-menu" aria-label="Buka menu" aria-expanded="false" data-buka-menu-tamu>${ikon("menu")}</button>
      </div>
    </header>`;

  const footer = () => {
    const k = config.kos;
    return `
      <footer class="footer">
        <div class="wadah footer-isi">
          ${logo(true)}
          <p class="footer-baris">${ikon("shield")}Hunian terpercaya &amp; dikelola langsung oleh pemilik</p>
          <p>${esc(k.nama)} · ${esc(k.kota)}</p>
          <p class="footer-kontak">
            <span class="footer-baris">${ikon("location_on")}${esc(k.alamat)}</span>
            <a class="footer-baris" href="${ui.waLink()}" target="_blank" rel="noopener">${ikon("chat")}WhatsApp ${esc(k.whatsapp)}</a>
            <span class="footer-baris">${ikon("schedule")}Jam bertamu ${esc(k.jamBertamu)}</span>
          </p>
          <p class="footer-hak">© 2026 SIPENKOS · ${esc(k.nama)} Malang</p>
        </div>
      </footer>`;
  };

  const headerAkun = (p, { denganMenu, adaNotif }) => `
    <header class="header header--akun">
      <div class="${denganMenu ? "" : "wadah "}header-isi">
        ${denganMenu ? `<button type="button" class="tombol tombol--ikon tombol-menu" aria-label="Buka menu" aria-expanded="false" aria-controls="sidebar" data-buka-sidebar>${ikon("menu")}</button>` : ""}
        ${logo(false, berandaAkun(p))}
        <div class="header-aksi">
          <a class="tombol tombol--ikon lonceng" href="${S.url("pages/akun/notifikasi.html")}" aria-label="Notifikasi${adaNotif ? " (ada yang belum dibaca)" : ""}">
            ${ikon("notifications")}${adaNotif ? '<span class="titik"></span>' : ""}
          </a>
          <span class="header-pemisah" aria-hidden="true"></span>
          <div class="profil">
            <button type="button" class="profil-tombol" aria-haspopup="menu" aria-expanded="false" data-profil>
              <span class="avatar">${esc(F.inisial(p.nama))}</span>
              <span class="profil-nama">${esc(F.namaDepan(p.nama))}</span>
              ${ikon("expand_more")}
            </button>
            <div class="profil-menu" role="menu" hidden>
              <div class="profil-menu-info">
                <strong>${esc(p.nama)}</strong>
                <span>${esc(p.email)}</span>
              </div>
              <a role="menuitem" href="${S.url("pages/akun/profil.html")}">${ikon("person")}Profil</a>
              <a role="menuitem" href="${S.url("index.html")}">${ikon("home")}Lihat Halaman Kos</a>
              <button role="menuitem" type="button" class="keluar" data-keluar>${ikon("logout")}Keluar</button>
            </div>
          </div>
        </div>
      </div>
    </header>`;

  const sidebar = (p, menuAktif, hitungan) => {
    const daftar = config.menu[p.jenis] || [];
    return `
      <aside class="sidebar" id="sidebar" aria-label="Menu ${p.jenis === "pemilik" ? "pemilik kos" : "penghuni"}">
        <div class="sidebar-logo">${logo(false, berandaAkun(p))}</div>
        <nav class="sidebar-nav">
          ${daftar.map((m) => m.judul
            ? `<p class="sidebar-judul">${esc(m.judul)}</p>`
            : `<a class="menu-item" href="${S.url(m.href)}"${m.kunci === menuAktif ? ' aria-current="page"' : ""}>
                ${ikon(m.ikon)}<span>${esc(m.label)}</span>
                ${m.hitung && hitungan[m.hitung] ? `<span class="menu-hitung" aria-label="${hitungan[m.hitung]} baru">${hitungan[m.hitung]}</span>` : ""}
              </a>`).join("")}
        </nav>
        <div class="sidebar-bawah">
          <button type="button" class="menu-item keluar" data-keluar>${ikon("logout")}<span>Keluar</span></button>
        </div>
      </aside>`;
  };

  // =========================================================
  // KERANGKA VERSI KELOMPOK — meniru tampilan repo PBL-Sipenkos.
  //   kelompok : halaman publik, auth, calon, penghuni (gaya calon-penghuni & penghuni)
  //   admin    : halaman pemilik (gaya admin/ zaaGallagher)
  // Kelas diberi awalan k- / a- agar tidak bentrok dengan CSS sipenkos2.
  // =========================================================
  const rumahSvg = `<svg class="a-logo-rumah" viewBox="0 0 18 16" aria-hidden="true"><path d="M2 7.2 9 1.6l7 5.6V14.4H2Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M7 14.4V9.6h4v4.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
  const lucide = (nama) => `<i class="a-ikon" style="--ikon:url('${S.url(`assets/icons/lucide/${nama}.svg`)}')" aria-hidden="true"></i>`;

  const logoK = (href = "index.html") => `
    <a class="k-logo" href="${S.url(href)}" aria-label="SIPENKOS Kos Bu Nining, ke beranda">
      <span class="k-logo-judul"><span>SIPENK</span>${rumahSvg}<span>S</span></span>
      <span class="k-logo-divider" aria-hidden="true"></span><span class="k-logo-pendukung">${esc(config.kos.nama)}</span>
    </a>`;

  const headerTamuK = (p, menuAktif, tanpaMenu = false) => `
    <header class="k-navbar">
      <div class="k-container k-navbar-container">
        ${logoK()}
        <button type="button" class="k-navbar-toggle" aria-label="Buka menu" aria-expanded="false" data-buka-menu-tamu>${lucide("menu")}</button>
        <div class="k-navbar-panel">
        ${tanpaMenu ? "" : `<nav class="k-menu" aria-label="Menu utama">
          ${config.menuTamu.map((m) =>
            `<a class="k-nav${m.kunci === menuAktif ? " active" : ""}" href="${S.url(m.href)}"${m.kunci === menuAktif ? ' aria-current="page"' : ""}>${m.label}</a>`).join("")}
        </nav>`}
        <div class="k-nav-actions-wrapper">
          ${p
            ? `<div class="k-user-profile">
                 <a class="k-btn-icon-notif" href="${S.url("pages/akun/notifikasi.html")}" title="Notifikasi" aria-label="Notifikasi">🔔<span class="k-badge-dot"></span></a>
                 <a class="k-user-info" href="${S.url("pages/akun/profil.html")}" title="Profil">
                   <span class="k-user-avatar">${esc(F.inisial(p.nama).charAt(0))}</span>
                   <span class="k-user-name">${esc(F.namaDepan(p.nama))}</span>
                 </a>
                 <button type="button" class="k-btn k-btn-outline k-btn-sm" data-keluar>Keluar</button>
               </div>`
            : `<div class="k-nav-actions">
                 <a class="k-btn k-btn-outline" href="${S.url("pages/auth/daftar.html")}">Daftar</a>
                 <a class="k-btn k-btn-primary" href="${S.url("pages/auth/masuk.html")}">Masuk</a>
               </div>`}
        </div>
        </div>
      </div>
    </header>`;

  const footerK = () => {
    const k = config.kos;
    return `
      <footer class="k-footer">
        <div>
          <div class="k-footer-logo"><span>SIPENK</span>${rumahSvg}<span>S</span></div>
          <p class="k-footer-tagline">🛡️ Hunian terpercaya &amp; dikelola langsung oleh pemilik</p>
          <p class="k-footer-location">${esc(k.nama)} · ${esc(k.kota)}</p>
          <div class="k-kontak">
            <span>📍 ${esc(k.alamat)}</span>
            <a href="${ui.waLink()}" target="_blank" rel="noopener">💬 WhatsApp ${esc(k.whatsapp)}</a>
            <span>⏰ Jam bertamu ${esc(k.jamBertamu)}</span>
          </div>
          <p class="k-copyright">© 2026 SIPENKOS - ${esc(k.nama)} Malang</p>
        </div>
      </footer>`;
  };

  // kerangka akun penghuni & pemilik (sidebar.php + navbar.php admin kelompok)
  const kerangkaAdmin = (p, menuAktif, adaNotif) => `
    <aside class="a-sidebar" id="sidebar" aria-label="Menu ${p.jenis === "pemilik" ? "pemilik kos" : "penghuni"}">
      <nav class="a-sidebar-nav">
        ${(config.menuKelompok[p.jenis] || []).map((m) =>
          `<a href="${S.url(m.href)}" class="a-nav-link${m.kunci === menuAktif ? " is-active" : ""}"${m.kunci === menuAktif ? ' aria-current="page"' : ""}>${lucide(m.lucide)}<span>${esc(m.label)}</span></a>`).join("")}
      </nav>
      <div class="a-sidebar-footer">
        <button type="button" class="a-nav-link a-nav-link-danger" data-keluar>${lucide("log-out")}<span>Keluar</span></button>
      </div>
    </aside>
    <div class="a-sidebar-backdrop" data-tutup-sidebar></div>
    <div class="a-app-body">
      <header class="a-topbar">
        <div class="a-topbar-left">
          <button type="button" class="a-icon-btn a-sidebar-toggle" data-buka-sidebar aria-label="Buka menu" aria-expanded="false" aria-controls="sidebar">${lucide("menu")}</button>
          <a href="${S.url(berandaAkun(p))}" class="a-logo" aria-label="SIPENKOS - Dashboard"><span>SIPENK</span>${rumahSvg}<span>S</span></a>
          <span class="a-topbar-divider a-topbar-divider-sm"></span>
          <span class="a-topbar-kos">${esc(config.kos.nama)}</span>
        </div>
        <div class="a-topbar-right">
          <a href="${S.url("pages/akun/notifikasi.html")}" class="a-icon-btn a-notif-btn" aria-label="Notifikasi">${lucide("bell")}${adaNotif ? '<span class="a-notif-dot"></span>' : ""}</a>
          <span class="a-topbar-divider"></span>
          <a class="a-profile-btn" href="${S.url("pages/akun/profil.html")}" title="Profil">
            <span class="a-profile-avatar">${esc(F.inisial(p.nama).charAt(0))}</span>
            <span class="a-profile-name">${esc(p.jenis === "pemilik" ? p.nama : F.namaDepan(p.nama))}</span>
          </a>
        </div>
      </header>
    </div>`;

  // ---------- perilaku interaktif kerangka ----------
  const pasangPerilaku = () => {
    // keluar
    document.querySelectorAll("[data-keluar]").forEach((b) => b.addEventListener("click", async () => {
      const ya = await ui.konfirmasi({ judul: "Keluar dari akun?", pesan: "Kamu perlu masuk lagi untuk membuka halaman akun.", label: "Keluar", bahaya: true });
      if (!ya) return;
      await store.auth.keluar();
      ui.ke("index.html");
    }));

    // menu profil (dropdown)
    const tombolProfil = document.querySelector("[data-profil]");
    if (tombolProfil) {
      const menu = tombolProfil.nextElementSibling;
      const atur = (buka) => {
        menu.hidden = !buka;
        tombolProfil.setAttribute("aria-expanded", String(buka));
      };
      tombolProfil.addEventListener("click", (e) => { e.stopPropagation(); atur(menu.hidden); });
      document.addEventListener("click", (e) => { if (!menu.contains(e.target)) atur(false); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { atur(false); tombolProfil.focus(); } });
    }

    // sidebar versi HP
    const tombolSidebar = document.querySelector("[data-buka-sidebar]");
    const sb = document.getElementById("sidebar");
    if (tombolSidebar && sb) {
      let tirai;
      const atur = (buka) => {
        sb.classList.toggle("terbuka", buka);
        document.body.classList.toggle("sidebar-open", buka);
        tombolSidebar.setAttribute("aria-expanded", String(buka));
        if (buka && !document.querySelector("[data-tutup-sidebar]")) {
          tirai = document.createElement("div");
          tirai.className = "tirai";
          tirai.addEventListener("click", () => atur(false));
          document.body.append(tirai);
          sb.querySelector("a, button")?.focus();
        } else {
          tirai?.remove();
        }
      };
      tombolSidebar.addEventListener("click", () => atur(!sb.classList.contains("terbuka")));
      document.querySelector("[data-tutup-sidebar]")?.addEventListener("click", () => atur(false));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sb.classList.contains("terbuka")) { atur(false); tombolSidebar.focus(); } });
    }

    // menu navbar versi HP (publik, masuk, alur reservasi)
    const tombolTamu = document.querySelector("[data-buka-menu-tamu]");
    if (tombolTamu) {
      const header = tombolTamu.closest(".k-navbar, .header");
      const atur = (buka) => {
        header.classList.toggle("terbuka", buka);
        tombolTamu.setAttribute("aria-expanded", String(buka));
        tombolTamu.setAttribute("aria-label", buka ? "Tutup menu" : "Buka menu");
        tombolTamu.innerHTML = lucide(buka ? "x" : "menu");
      };
      tombolTamu.addEventListener("click", () => atur(!header.classList.contains("terbuka")));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("terbuka")) { atur(false); tombolTamu.focus(); } });
    }
  };

  // ---------- pemeriksaan akses ----------
  // mengembalikan jalur tujuan bila harus dialihkan, atau null bila boleh
  const periksaAkses = (akses, p) => {
    if (akses.includes("publik")) return null;
    if (akses.includes("tamu")) return p ? berandaAkun(p) : null;
    if (!p) {
      const kembali = window.location.href.replace(config.ROOT, "");
      return `pages/auth/masuk.html?kembali=${encodeURIComponent(kembali)}`;
    }
    if (akses.includes("masuk") || akses.includes(p.jenis)) return null;
    return berandaAkun(p);
  };

  // ---------- jalankan ----------
  const mulai = async () => {
    const body = document.body;
    const { layout = "tamu", akses = "publik", menu = "", judul = "" } = body.dataset;
    const main = document.querySelector("main");
    main.id = "konten";
    main.classList.add("halaman");

    const sesi = await store.auth.sesi();
    if (sesi && sesi.jenis === "calon") {
      sesi.punyaReservasi = !!(await store.reservasi.milikSaya());
    }

    const alihkan = periksaAkses(akses.split(/\s+/), sesi);
    if (alihkan) {
      window.location.replace(S.url(alihkan));
      return;
    }

    document.title = judul ? `${judul} · SIPENKOS` : "SIPENKOS · Kos Bu Nining Malang";
    const lewati = `<a class="lewati" href="#konten">Lewati ke konten utama</a>`;

    // tema tampilan: pemilik = gaya admin kelompok, selain itu gaya penghuni/calon kelompok
    const tema = sesi && sesi.jenis === "pemilik" ? "admin" : "kelompok";
    body.classList.add(`tema-${tema}`, `layout-${layout}`);
    const hitunganK = sesi && (layout === "akun" || layout === "alur") ? await store.hitungan.menu() : {};
    const adaNotifK = (hitunganK.notifikasi || 0) > 0;
    // halaman akun calon penghuni & alur reservasi memakai navbar + footer seperti status-reservasi.php
    const pakaiNavbar = layout === "tamu" || layout === "alur" || (layout === "akun" && (!sesi || sesi.jenis === "calon"));
    body.classList.add(layout === "akun" && !pakaiNavbar ? "kerangka-sidebar" : "kerangka-navbar");

    if (pakaiNavbar) {
      // data-lebar="penuh" : halaman mengatur .container sendiri (mis. Beranda dengan gambar selebar layar)
      main.classList.add(...(body.dataset.lebar === "penuh" ? ["halaman--penuh"] : ["k-container", "k-halaman"]));
      // halaman alur reservasi & akun calon: navbar tanpa menu (seperti status-reservasi.php)
      main.insertAdjacentHTML("beforebegin", lewati + headerTamuK(sesi, menu, layout !== "tamu" && !!sesi));
      main.insertAdjacentHTML("afterend", footerK());
    } else if (layout === "akun") {
      // penghuni & pemilik: sidebar + header yang sama (gaya admin kelompok)
      const kerangka = document.createElement("div");
      kerangka.className = "a-app";
      kerangka.innerHTML = kerangkaAdmin(sesi, menu, adaNotifK);
      main.replaceWith(kerangka);
      main.classList.add("a-main");
      kerangka.querySelector(".a-app-body").append(main);
      kerangka.insertAdjacentHTML("beforebegin", lewati);
    } else if (layout === "tamu") {
      main.classList.add("wadah");
      main.insertAdjacentHTML("beforebegin", lewati + headerTamu(sesi, menu));
      main.insertAdjacentHTML("afterend", footer());
    } else if (layout === "auth" && tema === "kelompok") {
      // halaman Masuk/Daftar versi kelompok: kartu & tautan kembali sudah ada di HTML halaman
      main.classList.add("halaman--penuh");
    } else if (layout === "auth") {
      const wadah = document.createElement("div");
      wadah.className = "kerangka-auth";
      main.replaceWith(wadah);
      wadah.append(main);
      // dari tombol Reservasi Sekarang (?tipe=) kembali ke Detail Kamar; selain itu ke Beranda
      const tipe = ui.param("tipe");
      const kembali = tipe
        ? { href: `pages/publik/detail-kamar.html?tipe=${encodeURIComponent(tipe)}`, teks: "Kembali ke Detail Kamar" }
        : { href: "index.html", teks: "Kembali ke Beranda" };
      wadah.insertAdjacentHTML("beforeend", `
        <footer class="auth-bawah">
          <a class="tautan-kembali" href="${S.url(kembali.href)}">${ikon("arrow_back")}${kembali.teks}</a>
          <span>© 2026 SIPENKOS · ${esc(config.kos.nama)} Malang</span>
        </footer>`);
    } else {
      const hitungan = await store.hitungan.menu();
      const adaNotif = hitungan.notifikasi > 0;
      if (layout === "alur") {
        main.classList.add("wadah");
        main.insertAdjacentHTML("beforebegin", lewati + headerAkun(sesi, { denganMenu: false, adaNotif }));
      } else {
        const kerangka = document.createElement("div");
        kerangka.className = "kerangka-akun";
        kerangka.innerHTML = sidebar(sesi, menu, hitungan) + '<div class="area-utama"></div>';
        main.replaceWith(kerangka);
        const area = kerangka.querySelector(".area-utama");
        area.innerHTML = headerAkun(sesi, { denganMenu: true, adaNotif });
        area.append(main);
        kerangka.insertAdjacentHTML("beforebegin", lewati);
      }
    }

    S.pasangIkon(document);
    pasangPerilaku();
    body.classList.add("siap");
    lanjutkan({ pengguna: sesi });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mulai);
  } else {
    mulai();
  }
})();
