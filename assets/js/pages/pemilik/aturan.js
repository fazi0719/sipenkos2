// =========================================================
// Kebijakan & Aturan Kos (pemilik) — ubah isi aturan
// Satu kelompok = satu judul + daftar aturan (satu per baris).
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const daftar = $("daftarKelompok");
  let aturan = await store.aturan.ambil();

  const kartuKelompok = (g = { judul: "", isi: [] }) => {
    const i = daftar.children.length + 1;
    const el = document.createElement("section");
    el.className = "kartu form";
    el.innerHTML = `
      <div class="kartu-kepala">
        <div class="field isi-lentur">
          <label class="label" for="judul${i}">Judul kelompok</label>
          <input class="input" id="judul${i}" name="judul" value="${F.esc(g.judul)}" placeholder="Contoh: Tamu">
        </div>
        <button type="button" class="tombol tombol--ikon" data-hapus aria-label="Hapus kelompok">${ikon("delete")}</button>
      </div>
      <div class="field">
        <label class="label" for="isi${i}">Daftar aturan</label>
        <textarea class="textarea" id="isi${i}" name="isi" rows="4">${F.esc(g.isi.join("\n"))}</textarea>
      </div>`;
    el.querySelector("[data-hapus]").addEventListener("click", async () => {
      if (await ui.konfirmasi({ judul: "Hapus kelompok ini?", pesan: "Aturan di dalamnya ikut terhapus setelah disimpan.", label: "Hapus", bahaya: true })) el.remove();
    });
    daftar.append(el);
    return el;
  };

  const tampilkan = () => {
    $("diperbarui").textContent = aturan.diperbarui ? `Terakhir diperbarui ${F.waktu(aturan.diperbarui)}` : "";
    daftar.innerHTML = "";
    aturan.kelompok.forEach(kartuKelompok);
  };

  $("tambahKelompok").addEventListener("click", () => kartuKelompok().querySelector("input").focus());

  $("formAturan").addEventListener("submit", async (e) => {
    e.preventDefault();
    const kelompok = [...daftar.children].map((el) => ({
      judul: el.querySelector("[name=judul]").value.trim(),
      isi: el.querySelector("[name=isi]").value.split("\n").map((s) => s.trim()).filter(Boolean)
    }));
    const salah = [...daftar.children].find((el, i) => !kelompok[i].judul || !kelompok[i].isi.length);
    if (salah) {
      const judul = salah.querySelector("[name=judul]");
      ui.tandaiError(judul, !judul.value.trim() ? "Judul wajib diisi." : "");
      ui.tandaiError(salah.querySelector("[name=isi]"), salah.querySelector("[name=isi]").value.trim() ? "" : "Tulis minimal satu aturan.");
      salah.querySelector("[aria-invalid=true]")?.focus();
      return;
    }
    try {
      aturan = await ui.sibuk(e.submitter, () => store.aturan.simpan(kelompok));
      tampilkan();
      ui.toast("Aturan kos disimpan");
    } catch (err) {
      ui.gagal(err);
    }
  });

  tampilkan();
});
