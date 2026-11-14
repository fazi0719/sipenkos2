// =========================================================
// Fungsi bersama halaman Masuk & Daftar
// =========================================================

// kotak info "Masuk untuk melanjutkan reservasi Tipe 4 ..."
async function tampilkanInfoReservasi() {
  const { store, ui } = SIPENKOS;
  const tipe = ui.param("tipe") && await store.kamar.tipe(ui.param("tipe"));
  if (!tipe) return;
  const kotak = document.getElementById("infoReservasi");
  const kataKerja = document.body.dataset.judul === "Masuk" ? "Masuk" : "Buat akun";
  kotak.querySelector("p").textContent = `${kataKerja} untuk melanjutkan reservasi ${ui.judulTipe(tipe)}.`;
  kotak.hidden = false;
}

// tombol mata untuk menampilkan / menyembunyikan kata sandi
function pasangLihatSandi() {
  document.querySelectorAll("[data-lihat-sandi]").forEach((b) => {
    const input = document.getElementById(b.dataset.lihatSandi);
    b.addEventListener("click", () => {
      const lihat = input.type === "password";
      input.type = lihat ? "text" : "password";
      b.setAttribute("aria-label", lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
      b.innerHTML = SIPENKOS.ikon(lihat ? "visibility_off" : "visibility");
    });
  });
}
