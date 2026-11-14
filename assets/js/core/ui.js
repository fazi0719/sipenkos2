// =========================================================
// UI — potongan tampilan yang dipakai ulang di banyak halaman:
// badge, toast, dialog, keadaan kosong, timeline, penunjuk langkah,
// kartu kamar, komponen unggah foto, validasi form, dll.
// Semua teks dari pengguna dilewatkan ke esc() agar aman (anti-XSS).
// =========================================================
(function () {
  const S = (window.SIPENKOS = window.SIPENKOS || {});
  const F = S.format;
  const esc = F.esc;
  const ikon = (...a) => S.ikon(...a);

  const UI = {};

  // ---------- URL & gambar ----------
  UI.param = (nama) => new URLSearchParams(window.location.search).get(nama);

  // gambar demo disimpan sebagai jalur relatif; unggahan sebagai data URL
  UI.gambar = (src) => (!src ? "" : /^(data:|https?:|blob:)/.test(src) ? src : S.url(src));

  UI.ke = (jalur) => { window.location.href = S.url(jalur); };

  // ---------- badge status ----------
  // UI.badge("tagihan", "lunas") -> <span class="badge badge--sukses">Lunas</span>
  UI.badge = (jenis, status, labelLain) => {
    const info = S.config.status[jenis]?.[status] || { label: status, badge: "netral" };
    return `<span class="badge badge--${info.badge}">${esc(labelLain || info.label)}</span>`;
  };

  UI.labelStatus = (jenis, status) => S.config.status[jenis]?.[status]?.label || status;

  // ---------- toast ----------
  UI.toast = (pesan, jenis = "sukses") => {
    let wadah = document.querySelector(".toast-wadah");
    if (!wadah) {
      wadah = document.createElement("div");
      wadah.className = "toast-wadah";
      wadah.setAttribute("role", "status");
      wadah.setAttribute("aria-live", "polite");
      document.body.append(wadah);
    }
    const el = document.createElement("div");
    el.className = `toast toast--${jenis}`;
    el.innerHTML = `${ikon(jenis === "bahaya" ? "error" : jenis === "info" ? "info" : "check_circle")}<span>${esc(pesan)}</span>`;
    wadah.append(el);
    setTimeout(() => el.remove(), 4000);
  };

  // tampilkan error dari store (atau error tak terduga) sebagai toast
  UI.gagal = (error) => {
    console.error(error);
    UI.toast(error instanceof S.GagalStore ? error.message : "Terjadi kesalahan. Coba lagi.", "bahaya");
  };

  // nonaktifkan tombol selama proses async berjalan
  UI.sibuk = async (tombol, proses) => {
    const isiAsli = tombol.innerHTML;
    tombol.disabled = true;
    tombol.setAttribute("aria-busy", "true");
    tombol.textContent = "Memproses…";
    try {
      return await proses();
    } finally {
      tombol.disabled = false;
      tombol.removeAttribute("aria-busy");
      tombol.innerHTML = isiAsli;
    }
  };

  // ---------- dialog ----------
  // UI.dialog({ judul, isi, tombol: [{label, kelas, nilai}], lebar }) -> Promise<nilai | null>
  // Bila ada <form> di isi, nilai = FormData saat tombol bernilai "kirim" ditekan.
  UI.dialog = ({ judul, isi, tombol = [], lebar = false, sebelumKirim }) =>
    new Promise((selesai) => {
      const d = document.createElement("dialog");
      d.className = `dialog${lebar ? " dialog--lebar" : ""}`;
      d.setAttribute("aria-labelledby", "dialogJudul");
      d.innerHTML = `
        <form method="dialog" class="dialog-form" novalidate>
          <div class="dialog-kepala">
            <h2 id="dialogJudul">${esc(judul)}</h2>
            <button type="button" class="tombol tombol--ikon" data-tutup aria-label="Tutup">${ikon("close")}</button>
          </div>
          <div class="dialog-isi">${isi}</div>
          ${tombol.length ? `<div class="dialog-kaki">${tombol.map((t) =>
            `<button type="${t.nilai === "kirim" ? "submit" : "button"}" class="tombol ${t.kelas || "tombol--sekunder"}" data-nilai="${t.nilai}">${t.ikon ? ikon(t.ikon) : ""}${esc(t.label)}</button>`).join("")}</div>` : ""}
        </form>`;
      document.body.append(d);
      S.pasangIkon(d);
      const form = d.querySelector("form");

      const tutup = (nilai) => {
        d.close();
        d.remove();
        selesai(nilai);
      };

      d.addEventListener("cancel", (e) => { e.preventDefault(); tutup(null); });
      d.querySelector("[data-tutup]").addEventListener("click", () => tutup(null));
      d.querySelectorAll(".dialog-kaki button[type=button]").forEach((b) =>
        b.addEventListener("click", () => tutup(b.dataset.nilai === "batal" ? null : b.dataset.nilai)));
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (sebelumKirim && !(await sebelumKirim(form))) return;
        tutup(new FormData(form));
      });

      d.showModal();
      (d.querySelector(".dialog-isi input, .dialog-isi select, .dialog-isi textarea") || d.querySelector(".dialog-kaki .tombol--utama, .dialog-kaki .tombol--bahaya"))?.focus();
    });

  // konfirmasi sederhana -> Promise<boolean>
  UI.konfirmasi = async ({ judul, pesan, label = "Ya, lanjutkan", bahaya = false }) => {
    const hasil = await UI.dialog({
      judul,
      isi: `<p>${esc(pesan)}</p>`,
      tombol: [
        { label: "Batal", kelas: "tombol--batal", nilai: "batal" },
        { label, kelas: bahaya ? "tombol--bahaya" : "tombol--utama", nilai: "ya" }
      ]
    });
    return hasil === "ya";
  };

  // dialog berisi isian alasan (dipakai saat menolak) -> Promise<string | null>
  UI.mintaAlasan = async ({ judul, label = "Alasan", saran = "", tombol = "Tolak" }) => {
    const data = await UI.dialog({
      judul,
      isi: `
        <div class="field">
          <label class="label" for="alasanDialog">${esc(label)}</label>
          <textarea class="textarea" id="alasanDialog" name="alasan" rows="3" required>${esc(saran)}</textarea>
          <p class="pesan-error" id="alasanError" hidden>${ikon("error")}Alasan wajib diisi.</p>
        </div>`,
      tombol: [
        { label: "Batal", kelas: "tombol--batal", nilai: "batal" },
        { label: tombol, kelas: "tombol--bahaya", nilai: "kirim" }
      ],
      sebelumKirim: (form) => {
        const ok = form.alasan.value.trim().length > 0;
        form.alasan.setAttribute("aria-invalid", String(!ok));
        form.querySelector("#alasanError").hidden = ok;
        if (!ok) form.alasan.focus();
        return ok;
      }
    });
    return data ? data.get("alasan").trim() : null;
  };

  // lihat gambar besar (bukti transfer, foto kerusakan)
  UI.lihatGambar = (src, judul = "Pratinjau") =>
    UI.dialog({
      judul,
      lebar: true,
      isi: `<img src="${esc(UI.gambar(src))}" alt="${esc(judul)}" style="width:100%;border-radius:8px">`
    });

  // ---------- potongan HTML ----------
  UI.kosong = ({ ikon: nama = "inbox", judul, pesan = "", aksi = "" }) => `
    <div class="kosong">
      <div class="kosong-ikon">${ikon(nama)}</div>
      <h2>${esc(judul)}</h2>
      ${pesan ? `<p>${esc(pesan)}</p>` : ""}
      ${aksi}
    </div>`;

  // langkah: [{ judul, ket, keadaan: "selesai"|"berjalan"|"belum"|"gagal" }]
  UI.timeline = (langkah) => `
    <ol class="timeline">
      ${langkah.map((l) => {
        const nama = { selesai: "check", berjalan: l.ikon || "schedule", gagal: "close", belum: "radio_button_unchecked" }[l.keadaan];
        return `
          <li class="timeline-item ${l.keadaan}"${l.keadaan === "berjalan" ? ' aria-current="step"' : ""}>
            <span class="timeline-titik">${l.keadaan === "belum" ? "" : ikon(nama)}</span>
            <div>
              <p class="timeline-judul">${esc(l.judul)}</p>
              ${l.ket ? `<p class="timeline-ket">${esc(l.ket)}</p>` : ""}
            </div>
          </li>`;
      }).join("")}
    </ol>`;

  // penunjuk langkah alur reservasi; aktif = 1..3, gagal = nomor langkah yang gagal
  UI.langkahReservasi = (aktif, { gagal = 0, semuaSelesai = false } = {}) => {
    const nama = ["Formulir Reservasi", "Pembayaran", "Menunggu Verifikasi"];
    return `
      <nav class="langkah" aria-label="Langkah reservasi">
        ${nama.map((n, i) => {
          const no = i + 1;
          const keadaan = gagal === no ? "gagal" : semuaSelesai || no < aktif ? "selesai" : no === aktif ? "aktif" : "";
          const isi = keadaan === "selesai" ? ikon("check") : keadaan === "gagal" ? ikon("close") : no;
          return `${i ? `<span class="langkah-panah">${ikon("arrow_forward")}</span>` : ""}
            <span class="langkah-item ${keadaan}"${keadaan === "aktif" ? ' aria-current="step"' : ""}>
              <span class="langkah-nomor">${isi}</span>${n}
            </span>`;
        }).join("")}
      </nav>`;
  };

  // [["Kamar", "Tipe 4"], ...] -> <dl class="rincian">
  UI.rincian = (baris) => `
    <dl class="rincian">
      ${baris.filter(Boolean).map(([l, n]) => `<div><dt>${esc(l)}</dt><dd>${n}</dd></div>`).join("")}
    </dl>`;

  UI.badgeKetersediaan = (tipe) => tipe.tersedia
    ? `<span class="badge badge--sukses">Tersedia · sisa ${tipe.sisa}</span>`
    : '<span class="badge badge--bahaya">Penuh</span>';

  UI.judulTipe = (tipe) => `${tipe.nama} Kamar ${tipe.ringkas}`;

  UI.kartuKamar = (tipe) => `
    <article class="kartu-kamar${tipe.tersedia ? "" : " penuh"}">
      <div class="kartu-kamar-foto">
        <img src="${esc(UI.gambar(tipe.foto))}" alt="Foto ${esc(tipe.nama)}" loading="lazy">
        ${UI.badgeKetersediaan(tipe)}
      </div>
      <h3>${esc(tipe.nama)} ${esc(tipe.ringkas)}</h3>
      <p>${esc(tipe.deskripsi)}</p>
      <div class="kartu-kamar-harga">
        <span>Biaya sewa</span>
        <strong>${F.rupiah(tipe.harga)}</strong> <small>/ bulan</small>
      </div>
      ${tipe.tersedia
        ? `<a class="tombol tombol--sekunder tombol--penuh" href="${S.url("pages/publik/detail-kamar.html?tipe=" + tipe.id)}">Lihat Detail</a>`
        : '<button class="tombol tombol--penuh" type="button" disabled>Penuh (Tidak Tersedia)</button>'}
    </article>`;

  // daftar aturan kos per kelompok (dipakai Tentang, Kebijakan, dan halaman pemilik)
  UI.aturanHTML = (kelompok) => kelompok.map((g) => `
    <div class="aturan-kelompok">
      <h3>${esc(g.judul)}</h3>
      <ol>${g.isi.map((a) => `<li>${esc(a)}</li>`).join("")}</ol>
    </div>`).join("");

  // ---------- grafik batang sederhana (tanpa pustaka) ----------
  // data: [{ label: "Jan", nilai: 950000 }, ...]
  UI.grafikBatang = (wadah, data) => {
    const maks = Math.max(...data.map((d) => d.nilai), 1);
    wadah.setAttribute("aria-label", "Grafik pendapatan: " + data.map((d) => `${d.label} ${F.rupiah(d.nilai)}`).join(", "));
    wadah.innerHTML = data.map((d) => `
      <div class="grafik-kolom">
        <div class="grafik-batang" style="height:${Math.max(1, (d.nilai / maks) * 85)}%"><span>${d.nilai ? F.ringkas(d.nilai) : ""}</span></div>
        <span class="grafik-label">${esc(d.label)}</span>
      </div>`).join("");
  };

  // ---------- detail tagihan (dialog) ----------
  UI.dialogTagihan = (t) => UI.dialog({
    judul: `${t.jenis} · ${F.periode(t.periode)}`,
    isi: `
      ${UI.rincian([
        t.pengguna ? ["Penghuni", esc(t.pengguna.nama)] : null,
        ["Jumlah", `<span class="harga">${F.rupiah(t.jumlah)}</span>`],
        ["Jatuh Tempo", F.tanggal(t.jatuhTempo)],
        ["Status", UI.badge("tagihan", t.status)],
        t.dikirimPada ? ["Bukti Dikirim", F.waktu(t.dikirimPada)] : null,
        t.dibayarPada ? ["Dikonfirmasi", F.waktu(t.dibayarPada)] : null,
        t.metode ? ["Metode", esc(t.metode)] : null,
        t.alasanTolak ? ["Alasan Ditolak", esc(t.alasanTolak)] : null
      ])}
      ${t.bukti ? `<img class="pratinjau-bukti" src="${esc(UI.gambar(t.bukti))}" alt="Bukti transfer">` : ""}`,
    tombol: [{ label: "Tutup", kelas: "tombol--sekunder", nilai: "batal" }]
  });

  // ---------- laporan kerusakan (dipakai penghuni & pemilik) ----------
  UI.ikonKategori = (kategori = "") =>
    /air|mandi/i.test(kategori) ? "water_drop" : /listrik/i.test(kategori) ? "bolt" : "build";

  UI.timelineLaporan = (l) => {
    const diterima = l.status !== "baru";
    const selesai = l.status === "selesai";
    return UI.timeline([
      { judul: "Laporan dikirim", ket: F.waktu(l.dibuatPada), keadaan: "selesai" },
      { judul: "Diterima pemilik kos", ket: diterima ? F.waktu(l.diterimaPada) : "Menunggu ditinjau pemilik kos", keadaan: diterima ? "selesai" : "berjalan" },
      { judul: selesai ? "Sudah diperbaiki" : "Sedang diperbaiki", ket: selesai ? "Perbaikan sudah dikerjakan" : diterima ? "Teknisi telah ditugaskan" : "Menunggu jadwal perbaikan", keadaan: selesai ? "selesai" : diterima ? "berjalan" : "belum", ikon: "build" },
      { judul: "Selesai", ket: selesai ? F.waktu(l.selesaiPada) : "Menunggu konfirmasi perbaikan", keadaan: selesai ? "selesai" : "belum" }
    ]);
  };

  // isi halaman detail laporan: judul + badge, info, deskripsi, foto, riwayat
  UI.detailLaporan = (l, { tambahanKanan = "" } = {}) => `
    <div class="kepala-halaman">
      <div class="judul-dengan-badge"><h1>${esc(l.judul)}</h1>${UI.badge("laporan", l.status)}</div>
      <p class="kecil muted">ID Tiket: #${esc(l.id)}</p>
    </div>
    <div class="grid-2 grid-atas">
      <section class="kartu tumpuk" aria-label="Informasi laporan">
        <dl class="panel info-tiga">
          <div><dt>Kategori</dt><dd>${esc(l.kategori)}</dd></div>
          <div><dt>Lokasi</dt><dd>${l.kamar ? "Kamar " + esc(l.kamar.nomor) : "-"}</dd></div>
          <div><dt>Tanggal Lapor</dt><dd>${F.tanggal(l.dibuatPada)}</dd></div>
        </dl>
        <div>
          <h2 class="label">Deskripsi</h2>
          <p class="teks-panjang">${esc(l.deskripsi)}</p>
        </div>
        ${l.foto ? `<div><h2 class="label">Foto Kerusakan</h2><button type="button" class="tombol-gambar" data-lihat-foto><img src="${esc(UI.gambar(l.foto))}" alt="Foto kerusakan ${esc(l.judul)}"></button></div>` : ""}
        <p class="kecil muted baris-ikon">${ikon("info", "kecil")}Pengajuan dibuat oleh ${esc(l.pengguna?.nama || "-")} (Penghuni Kamar ${esc(l.kamar?.nomor || "-")})</p>
      </section>
      <section class="kartu tumpuk" aria-labelledby="judulRiwayat">
        <h2 class="kartu-judul" id="judulRiwayat">Riwayat Penanganan</h2>
        ${UI.timelineLaporan(l)}
        ${l.catatan ? `<div class="kotak-info">${ikon("description")}<div><p class="label-kecil">Catatan Pengelola</p><p class="teks-panjang">${esc(l.catatan)}</p></div></div>` : ""}
        ${tambahanKanan}
      </section>
    </div>`;

  UI.waLink = (pesan = "") => `${S.config.kos.whatsappLink}${pesan ? "?text=" + encodeURIComponent(pesan) : ""}`;

  UI.salin = async (teks, tombol) => {
    try {
      await navigator.clipboard.writeText(teks);
      UI.toast("Disalin ke papan klip");
    } catch (e) {
      UI.toast("Tidak bisa menyalin otomatis. Salin manual: " + teks, "info");
    }
    tombol?.focus();
  };

  // ---------- validasi form ----------
  // aturan: { namaField: (nilai, form) => "pesan error" | "" }
  UI.validasi = (form, aturan) => {
    let pertama = null;
    Object.entries(aturan).forEach(([nama, cek]) => {
      const field = form.elements[nama];
      const nilai = field?.type === "checkbox" ? field.checked : (field?.value ?? "").trim();
      const pesan = cek(nilai, form);
      UI.tandaiError(field, pesan);
      if (pesan && !pertama) pertama = field;
    });
    pertama?.focus();
    return !pertama;
  };

  UI.tandaiError = (field, pesan) => {
    if (!field) return;
    const wadah = field.closest(".field") || field.parentElement;
    let el = wadah.querySelector(".pesan-error");
    if (!el) {
      el = document.createElement("p");
      el.className = "pesan-error";
      el.id = (field.id || field.name) + "Error";
      wadah.append(el);
    }
    field.setAttribute("aria-invalid", pesan ? "true" : "false");
    if (pesan) field.setAttribute("aria-describedby", el.id);
    el.innerHTML = pesan ? `${ikon("error")}${esc(pesan)}` : "";
    el.hidden = !pesan;
  };

  // hapus pesan error saat field diubah
  UI.bersihkanErrorSaatIsi = (form) => {
    form.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") UI.tandaiError(e.target, "");
    });
    form.addEventListener("change", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") UI.tandaiError(e.target, "");
    });
  };

  // ---------- komponen unggah foto ----------
  // UI.unggah(wadahEl, { nama, teks, onUbah }) -> { nilai(), kosongkan(), tandaiError(pesan) }
  // nilai() = { nama, ukuran, data } (data = data URL JPEG yang sudah diperkecil)
  UI.unggah = (wadah, { nama = "foto", teks = "Klik atau seret file ke sini", onUbah } = {}) => {
    const maksMB = S.config.aturanBisnis.maksUkuranFotoMB;
    let berkas = null;

    const gambarKosong = () => {
      wadah.innerHTML = `
        <label class="unggah">
          <input type="file" name="${nama}" accept="image/jpeg,image/png">
          <span class="unggah-ikon">${ikon("upload")}</span>
          <strong>${esc(teks)}</strong>
          <span>PNG/JPG maks. ${maksMB} MB</span>
        </label>
        <p class="pesan-error" hidden></p>`;
      const label = wadah.querySelector(".unggah");
      const input = wadah.querySelector("input");
      input.addEventListener("change", () => proses(input.files[0]));
      ["dragenter", "dragover"].forEach((j) => label.addEventListener(j, (e) => { e.preventDefault(); label.classList.add("seret"); }));
      ["dragleave", "drop"].forEach((j) => label.addEventListener(j, (e) => { e.preventDefault(); label.classList.remove("seret"); }));
      label.addEventListener("drop", (e) => proses(e.dataTransfer.files[0]));
    };

    const gambarTerisi = () => {
      wadah.innerHTML = `
        <div class="berkas">
          <img class="berkas-gambar" src="${esc(berkas.data)}" alt="">
          <div class="berkas-info">
            <p class="berkas-nama">${esc(berkas.nama)}</p>
            <p class="berkas-meta">${F.ukuranBerkas(berkas.ukuran)} <span class="ok">${ikon("check_circle", "kecil")}Terunggah</span></p>
          </div>
          <button type="button" class="tombol tombol--sekunder tombol--kecil" data-ganti>${ikon("sync")}Ganti</button>
        </div>`;
      wadah.querySelector("[data-ganti]").addEventListener("click", () => {
        berkas = null;
        gambarKosong();
        onUbah?.(null);
        wadah.querySelector("input").click();
      });
    };

    const tampilError = (pesan) => {
      const el = wadah.querySelector(".pesan-error");
      const label = wadah.querySelector(".unggah");
      if (!el) return;
      el.innerHTML = pesan ? `${ikon("error")}${esc(pesan)}` : "";
      el.hidden = !pesan;
      label?.setAttribute("aria-invalid", String(!!pesan));
    };

    const proses = async (file) => {
      if (!file) return;
      if (!["image/jpeg", "image/png"].includes(file.type)) return tampilError("Format file harus JPG atau PNG.");
      if (file.size > maksMB * 1024 * 1024) return tampilError(`Ukuran file maksimal ${maksMB} MB.`);
      try {
        berkas = { nama: file.name, ukuran: file.size, data: await perkecil(file) };
        gambarTerisi();
        onUbah?.(berkas);
      } catch (e) {
        tampilError("File tidak bisa dibaca. Coba file lain.");
      }
    };

    gambarKosong();
    return {
      nilai: () => berkas,
      kosongkan: () => { berkas = null; gambarKosong(); },
      tandaiError: tampilError
    };
  };

  // perkecil foto (maks 1200px, JPEG 80%) supaya muat di localStorage
  const perkecil = (file) => new Promise((ok, gagal) => {
    const baca = new FileReader();
    baca.onerror = gagal;
    baca.onload = () => {
      const img = new Image();
      img.onerror = gagal;
      img.onload = () => {
        const skala = Math.min(1, 1200 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * skala);
        c.height = Math.round(img.height * skala);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        ok(c.toDataURL("image/jpeg", 0.8));
      };
      img.src = baca.result;
    };
    baca.readAsDataURL(file);
  });

  // ---------- filter pil ----------
  // UI.filterPil(wadahEl, [{nilai, label}], onPilih)
  UI.filterPil = (wadah, pilihan, onPilih, awal = pilihan[0].nilai) => {
    wadah.classList.add("filter");
    wadah.setAttribute("role", "group");
    wadah.innerHTML = pilihan.map((p) =>
      `<button type="button" class="filter-pil" data-nilai="${esc(p.nilai)}" aria-pressed="${p.nilai === awal}">${esc(p.label)}</button>`).join("");
    wadah.addEventListener("click", (e) => {
      const b = e.target.closest(".filter-pil");
      if (!b) return;
      wadah.querySelectorAll(".filter-pil").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      onPilih(b.dataset.nilai);
    });
  };

  S.ui = UI;
})();
