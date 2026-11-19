// =========================================================
// Penghuni (pemilik) — daftar penghuni aktif + pencarian
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F } = SIPENKOS; // tampilan mengikuti admin/pages/data-penghuni.php
  const semua = await store.penghuni.daftar();
  const tbody = document.getElementById("isiTabel");

  const tampilkan = (kata = "") => {
    const q = kata.trim().toLowerCase();
    const isi = semua.filter((p) => !q || p.nama.toLowerCase().includes(q) || (p.sewa?.kamar?.nomor || "").includes(q));
    tbody.innerHTML = isi.map((p) => `
      <tr>
        <td>
          <div class="person">
            <span class="avatar">${F.esc(A.inisial(p.nama))}</span>
            <div><p class="person-name">${F.esc(p.nama)}</p><p class="person-sub">${F.esc(p.hp)}</p></div>
          </div>
        </td>
        <td>${F.esc(p.sewa.kamar.nomor)}</td>
        <td class="nowrap">${F.esc(p.sewa.tipe.nama)} ${F.esc(p.sewa.tipe.ringkas)}</td>
        <td class="ta-center nowrap">${F.tanggal(p.sewa.mulai)}</td>
        <td class="ta-right"><button type="button" class="link" data-id="${F.esc(p.id)}">Lihat KTP</button></td>
      </tr>`).join("");
    const kosong = document.getElementById("kosong");
    kosong.hidden = isi.length > 0;
  };

  tbody.addEventListener("click", (e) => {
    const b = e.target.closest("[data-id]");
    if (!b) return;
    const p = semua.find((x) => x.id === b.dataset.id);
    const lunas = p.tagihan.filter((t) => t.status === "lunas").length;
    const nomorWa = p.hp.replace(/^0/, "62");
    ui.dialog({
      judul: p.nama,
      isi: `
        ${ui.rincian([
          ["Kamar", F.esc(`Kamar ${p.sewa.kamar.nomor} · ${ui.judulTipe(p.sewa.tipe)}`)],
          ["Masa sewa", F.rentang(p.sewa.mulai, p.sewa.akhir)],
          ["Email", F.esc(p.email)],
          ["Nomor HP", F.esc(p.hp)],
          ["NIK", F.esc(p.nik)],
          ["Kontak darurat", F.esc(`${p.kontakDarurat.nama} (${p.kontakDarurat.hubungan}) · ${p.kontakDarurat.hp}`)],
          ["Tagihan lunas", `${lunas} dari ${p.tagihan.length}`],
          ["Tunggakan", p.tunggakan.length ? `<span class="badge badge--bahaya">${F.rupiah(p.tunggakan.reduce((s, t) => s + t.jumlah, 0))}</span>` : "-"]
        ])}
        <a class="tombol tombol--wa" href="https://wa.me/${F.esc(nomorWa)}" target="_blank" rel="noopener">${ikon("chat")}Chat WhatsApp</a>`,
      tombol: [{ label: "Tutup", kelas: "tombol--sekunder", nilai: "batal" }]
    });
  });

  document.getElementById("cari").addEventListener("input", (e) => tampilkan(e.target.value));
  tampilkan();
});
