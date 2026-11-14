// =========================================================
// FORMAT — fungsi bantu untuk angka, tanggal, dan teks.
// Tidak menyentuh data maupun tampilan; murni mengubah nilai.
// =========================================================
(function () {
  const S = (window.SIPENKOS = window.SIPENKOS || {});

  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
    "Agustus", "September", "Oktober", "November", "Desember"];
  const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const pad = (n) => String(n).padStart(2, "0");

  // "2026-11-01" -> Date lokal (tanpa geser zona waktu)
  const keTanggal = (nilai) => {
    if (!nilai) return null;
    if (nilai instanceof Date) return new Date(nilai.getTime());
    const teks = String(nilai);
    const t = /^\d{4}-\d{2}-\d{2}$/.test(teks) ? new Date(`${teks}T00:00:00`) : new Date(teks);
    return Number.isNaN(t.getTime()) ? null : t;
  };

  S.format = {
    BULAN,

    // 950000 -> "Rp 950.000"
    rupiah(angka) {
      return "Rp " + Math.round(Number(angka) || 0).toLocaleString("id-ID");
    },

    // angka ringkas untuk grafik: 1500000 -> "1,5 jt"
    ringkas(angka) {
      const n = Number(angka) || 0;
      if (n >= 1e6) return (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
      if (n >= 1e3) return (n / 1e3).toLocaleString("id-ID", { maximumFractionDigits: 0 }) + " rb";
      return String(n);
    },

    keTanggal,

    // Date -> "2026-11-01"
    keISO(tanggal) {
      const t = keTanggal(tanggal);
      return t ? `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}` : "";
    },

    // "01 Nov 2026"
    tanggal(nilai) {
      const t = keTanggal(nilai);
      return t ? `${pad(t.getDate())}\u00a0${BULAN_PENDEK[t.getMonth()]}\u00a0${t.getFullYear()}` : "-";
    },

    // "1 November 2026"
    tanggalPanjang(nilai) {
      const t = keTanggal(nilai);
      return t ? `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}` : "-";
    },

    // "25 Okt 2026, 19.20"
    waktu(nilai) {
      const t = keTanggal(nilai);
      if (!t) return "-";
      return `${pad(t.getDate())} ${BULAN_PENDEK[t.getMonth()]} ${t.getFullYear()}, ${pad(t.getHours())}.${pad(t.getMinutes())}`;
    },

    // "01 Nov 2026 – 30 Apr 2027"
    rentang(mulai, akhir) {
      return `${S.format.tanggal(mulai)} – ${S.format.tanggal(akhir)}`;
    },

    // "2026-10" -> "Oktober 2026"
    periode(kode) {
      const [th, bl] = String(kode).split("-").map(Number);
      return th && bl ? `${BULAN[bl - 1]} ${th}` : "-";
    },

    // Date -> "2026-10"
    kodePeriode(tanggal) {
      const t = keTanggal(tanggal);
      return t ? `${t.getFullYear()}-${pad(t.getMonth() + 1)}` : "";
    },

    // tambah N bulan dengan aman (31 Jan + 1 bulan = 28/29 Feb)
    tambahBulan(tanggal, jumlah) {
      const hasil = keTanggal(tanggal);
      const hari = hasil.getDate();
      hasil.setDate(1);
      hasil.setMonth(hasil.getMonth() + Number(jumlah));
      const akhirBulan = new Date(hasil.getFullYear(), hasil.getMonth() + 1, 0).getDate();
      hasil.setDate(Math.min(hari, akhirBulan));
      return hasil;
    },

    tambahHari(tanggal, jumlah) {
      const t = keTanggal(tanggal);
      t.setDate(t.getDate() + Number(jumlah));
      return t;
    },

    // akhir sewa = mulai + durasi bulan - 1 hari
    akhirSewa(mulai, durasi) {
      return S.format.tambahHari(S.format.tambahBulan(mulai, durasi), -1);
    },

    // "5 menit lalu", "2 hari lalu"
    relatif(nilai) {
      const t = keTanggal(nilai);
      if (!t) return "";
      const detik = Math.round((Date.now() - t.getTime()) / 1000);
      if (detik < 60) return "Baru saja";
      if (detik < 3600) return `${Math.floor(detik / 60)} menit lalu`;
      if (detik < 86400) return `${Math.floor(detik / 3600)} jam lalu`;
      if (detik < 86400 * 7) return `${Math.floor(detik / 86400)} hari lalu`;
      return S.format.tanggal(t);
    },

    // 1258291 -> "1,2 MB"
    ukuranBerkas(byte) {
      const n = Number(byte) || 0;
      if (n >= 1048576) return (n / 1048576).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " MB";
      return Math.max(1, Math.round(n / 1024)) + " KB";
    },

    // "Nana Putri" -> "N"
    inisial(nama = "") {
      return String(nama).trim().charAt(0).toUpperCase() || "?";
    },

    // nama sapaan: "Nana Putri" -> "Nana", "Bu Nining" -> "Bu Nining"
    namaDepan(nama = "") {
      const kata = String(nama).trim().split(/\s+/);
      return /^(bu|ibu|pak|bapak|mbak|mas)$/i.test(kata[0]) ? kata.slice(0, 2).join(" ") : kata[0] || "";
    },

    // amankan teks sebelum dimasukkan ke innerHTML
    esc(teks) {
      return String(teks ?? "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    }
  };
})();
