// =========================================================
// Data Reservasi (pemilik) — tampilan mengikuti admin/pages/data-reservasi.php
// Terima = pilih kamar lalu konfirmasi · Tolak = isi alasan.
// =========================================================
SIPENKOS.halaman(async () => {
  const { store, ui, ikon, format: F, adminUI: A } = SIPENKOS;
  const $ = (id) => document.getElementById(id);
  const semua = (await store.reservasi.semua()).sort((a, b) => b.dibuatPada.localeCompare(a.dibuatPada));

  const tampilkan = () => {
    const q = $("cari").value.trim().toLowerCase();
    const isi = semua.filter((r) => !q || `${r.pengguna.nama} ${r.pengguna.hp} ${r.tipe.nama} ${r.tipe.ringkas}`.toLowerCase().includes(q));
    $("isiTabel").innerHTML = isi.map((r) => `
      <tr>
        <td class="nowrap">${F.tanggal(r.dibuatPada)}</td>
        <td>
          <div class="person">
            <span class="avatar">${F.esc(A.inisial(r.pengguna.nama))}</span>
            <div><p class="person-name">${F.esc(r.pengguna.nama)}</p><p class="person-sub">${F.esc(r.pengguna.hp)}</p></div>
          </div>
        </td>
        <td class="cell-wrap col-type">${F.esc(r.tipe.nama)} ${F.esc(r.tipe.ringkas)}</td>
        <td class="nowrap">${r.durasi} Bulan</td>
        <td><button type="button" class="link link-icon" data-ktp="${F.esc(r.id)}">${A.ikon("id-card")}Lihat KTP</button></td>
        <td>${r.status === "menunggu"
          ? `<div class="status-actions"><button type="button" class="btn btn-primary btn-sm" data-terima="${F.esc(r.id)}">Terima</button><button type="button" class="btn btn-danger-outline btn-sm" data-tolak="${F.esc(r.id)}">Tolak</button></div>`
          : A.status("reservasi", r.status)}</td>
      </tr>`).join("");
    $("kosong").hidden = isi.length > 0;
  };

  const terima = async (r) => {
    const unit = await store.kamar.unitKosong(r.tipeId);
    if (!unit.length) return ui.toast(`Tidak ada kamar ${r.tipe.nama} yang kosong. Kosongkan kamar dulu di Monitor Kamar.`, "bahaya");
    const hasil = await ui.dialog({
      judul: `Terima reservasi ${r.pengguna.nama}`,
      isi: `
        ${ui.rincian([
          ["Tipe", F.esc(ui.judulTipe(r.tipe))],
          ["Mulai", F.tanggal(r.tglMulai)],
          ["Durasi", `${r.durasi} bulan`],
          ["Dibayar", F.rupiah(r.tagihanPertama.jumlah)]
        ])}
        ${r.tagihanPertama.bukti ? `<img class="pratinjau-bukti" src="${F.esc(ui.gambar(r.tagihanPertama.bukti))}" alt="Bukti transfer">` : ""}
        <div class="field">
          <label class="label" for="kamarId">Tempatkan di kamar</label>
          <div class="input-ikon"><select class="select" id="kamarId" name="kamarId">${unit.map((k) => `<option value="${k.id}">Kamar ${k.nomor}</option>`).join("")}</select>${ikon("expand_more")}</div>
        </div>`,
      tombol: [{ label: "Batal", kelas: "tombol--sekunder", nilai: "batal" }, { label: "Terima Reservasi", kelas: "tombol--utama", nilai: "kirim" }]
    });
    if (!(hasil instanceof FormData)) return;
    await store.reservasi.terima(r.id, hasil.get("kamarId"));
    ui.toast(`Reservasi ${r.pengguna.nama} diterima`);
    window.location.reload();
  };

  const tolak = async (r) => {
    const alasan = await ui.mintaAlasan({ judul: "Tolak reservasi", label: "Alasan penolakan (dikirim ke pemohon)", saran: "Bukti transfer tidak terbaca" });
    if (!alasan) return;
    await store.reservasi.tolak(r.id, alasan);
    ui.toast("Reservasi ditolak", "info");
    window.location.reload();
  };

  $("cari").addEventListener("input", tampilkan);
  $("isiTabel").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const r = semua.find((x) => x.id === (b.dataset.terima || b.dataset.tolak || b.dataset.ktp));
    try {
      if (b.dataset.terima) await terima(r);
      else if (b.dataset.tolak) await tolak(r);
      else if (r.ktp?.data) ui.lihatGambar(r.ktp.data, `KTP ${r.pengguna.nama}`);
      else ui.toast(`Foto KTP ${r.pengguna.nama} tidak tersedia (data contoh).`, "info");
    } catch (err) {
      ui.gagal(err);
    }
  });
  tampilkan();
});
