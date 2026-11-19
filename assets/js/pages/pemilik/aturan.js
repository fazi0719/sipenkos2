// =========================================================
// Kebijakan & Aturan Kos (pemilik) — tampilan mengikuti admin/pages/aturan-kos.php
// Satu aturan = judul + deskripsi (disimpan sebagai satu kelompok berisi satu aturan).
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, format: F, adminUI: A } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  let aturan = await store.aturan.ambil();
  const rata = () => aturan.kelompok.flatMap((g) => g.isi.map((teks) => ({ judul: g.judul, teks })));

  const baris = (r, i) => `
    <div class="rule-edit">
      <span class="rule-num">${i + 1}</span>
      <div class="rule-fields"><input class="input" type="text" value="${F.esc(r.judul)}" placeholder="Judul aturan" aria-label="Judul aturan ${i + 1}" data-judul>
      <textarea class="textarea" rows="1" placeholder="Deskripsi aturan" aria-label="Deskripsi aturan ${i + 1}" data-teks>${F.esc(r.teks)}</textarea></div>
      <button type="button" class="icon-btn" data-hapus aria-label="Hapus aturan ${i + 1}">${A.ikon("x")}</button>
    </div>`;

  const mode = (ubah) => {
    $("aksiLihat").hidden = ubah;
    $("aksiUbah").hidden = !ubah;
    $("rulesLihat").hidden = ubah;
    $("rulesUbah").hidden = !ubah;
    $("rules").dataset.mode = ubah ? "edit" : "view";
  };

  const tampilkan = () => {
    const daftar = rata();
    $("jumlah").textContent = `${daftar.length} aturan`;
    $("diperbarui").textContent = `Aturan ini tampil di halaman Kebijakan penghuni${aturan.diperbarui ? " · Terakhir diperbarui " + F.tanggal(aturan.diperbarui) : ""}`;
    $("rulesLihat").innerHTML = daftar.map((r, i) => `
      <div class="rule">
        <span class="rule-num">${i + 1}</span>
        <div class="rule-body"><p class="rule-title">${F.esc(r.judul)}</p><p class="rule-text">${F.esc(r.teks)}</p></div>
      </div>`).join("");
    $("baris").innerHTML = daftar.map(baris).join("");
  };

  $("ubah").addEventListener("click", () => { tampilkan(); mode(true); });
  $("batal").addEventListener("click", () => { tampilkan(); mode(false); });
  $("tambah").addEventListener("click", () => {
    $("baris").insertAdjacentHTML("beforeend", baris({ judul: "", teks: "" }, $("baris").children.length));
    $("baris").lastElementChild.querySelector("input").focus();
  });
  $("baris").addEventListener("click", (e) => {
    if (e.target.closest("[data-hapus]")) e.target.closest(".rule-edit").remove();
  });
  $("simpan").addEventListener("click", async (e) => {
    const isi = [...$("baris").children].map((el) => ({ judul: el.querySelector("[data-judul]").value.trim(), teks: el.querySelector("[data-teks]").value.trim() }));
    const salah = isi.findIndex((r) => !r.judul || !r.teks);
    if (salah > -1) {
      ui.toast(`Aturan nomor ${salah + 1} belum lengkap.`, "bahaya");
      $("baris").children[salah].querySelector(isi[salah].judul ? "[data-teks]" : "[data-judul]").focus();
      return;
    }
    try {
      aturan = await ui.sibuk(e.currentTarget, () => store.aturan.simpan(isi.map((r) => ({ judul: r.judul, isi: [r.teks] }))));
      tampilkan();
      mode(false);
      ui.toast("Aturan kos disimpan");
    } catch (err) {
      ui.gagal(err);
    }
  });
  tampilkan();
});
