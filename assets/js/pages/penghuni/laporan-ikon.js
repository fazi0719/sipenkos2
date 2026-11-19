// =========================================================
// Ikon & helper bersama halaman Laporan Kerusakan penghuni
// (sama dengan assets/js/penghuni/laporan-kerusakan.js repo kelompok)
// =========================================================
(function () {
  const svg = (isi) => `<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">${isi}</svg>`;
  const IKON = {
    centang: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    jam: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    kunciInggris: svg('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
    jamPasir: svg('<path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/>'),
    panah: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    air: svg('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
    listrik: svg('<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>')
  };
  IKON.lainnya = IKON.kunciInggris;
  const LABEL = { baru: "Baru", diproses: "Diproses", selesai: "Selesai" };

  SIPENKOS.laporanK = {
    IKON,
    label: (s) => LABEL[s] || s,
    kelasStatus: (s) => `badge-status badge-status--${s}`,
    ikonKategori: (k = "") => (/air|mandi/i.test(k) ? IKON.air : /listrik/i.test(k) ? IKON.listrik : IKON.lainnya)
  };
})();
