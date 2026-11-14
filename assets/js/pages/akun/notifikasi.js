// =========================================================
// Notifikasi — daftar, saring belum dibaca, tandai dibaca
// Dipakai semua role (penghuni, calon, pemilik).
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F } = SIPENKOS;
  const daftar = document.getElementById("daftar");
  let semua = await store.notifikasi.milikSaya();
  let saring = "semua";

  const tampilkan = () => {
    const isi = saring === "belum" ? semua.filter((n) => !n.dibaca) : semua;
    daftar.innerHTML = isi.length
      ? isi.map((n) => `
        <a class="item${n.dibaca ? "" : " belum-dibaca"}" href="${n.tautan ? SIPENKOS.url(n.tautan) : "#"}" data-id="${F.esc(n.id)}">
          <span class="item-ikon">${ikon(n.ikon || "notifications")}</span>
          <div>
            <p class="item-judul">${F.esc(n.judul)}${n.dibaca ? "" : '<span class="sr-only"> (belum dibaca)</span>'}</p>
            <p class="item-ket">${F.esc(n.isi)}</p>
          </div>
          <div class="item-kanan"><span class="item-ket nowrap">${F.relatif(n.waktu)}</span></div>
        </a>`).join("")
      : `<div class="kartu">${ui.kosong({ ikon: "notifications", judul: saring === "belum" ? "Semua sudah dibaca" : "Belum ada notifikasi" })}</div>`;
    document.getElementById("tandaiSemua").disabled = !semua.some((n) => !n.dibaca);
  };

  ui.filterPil(document.getElementById("filter"), [
    { nilai: "semua", label: "Semua" },
    { nilai: "belum", label: "Belum dibaca" }
  ], (v) => { saring = v; tampilkan(); });

  // klik item: tandai dibaca dulu, baru buka tautannya
  daftar.addEventListener("click", async (e) => {
    const a = e.target.closest("a.item");
    if (!a) return;
    e.preventDefault();
    await store.notifikasi.tandaiDibaca(a.dataset.id);
    if (a.getAttribute("href") !== "#") window.location.href = a.href;
    else { semua = await store.notifikasi.milikSaya(); tampilkan(); }
  });

  document.getElementById("tandaiSemua").addEventListener("click", async () => {
    await store.notifikasi.tandaiSemua();
    semua = await store.notifikasi.milikSaya();
    document.querySelector(".lonceng .titik")?.remove();
    document.querySelectorAll('.menu-item[href$="notifikasi.html"] .menu-hitung').forEach((el) => el.remove());
    tampilkan();
    ui.toast("Semua notifikasi ditandai sudah dibaca");
  });

  tampilkan();
});
