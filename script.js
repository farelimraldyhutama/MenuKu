/* =====================================================
   MenuKu - TAHAP 3: JAVASCRIPT (OTAK / LOGIKA)
   =====================================================
   JavaScript membuat halaman "hidup": membaca data menu,
   menampilkan kartu, menyaring, menghitung total, dan
   menyusun pesan WhatsApp.

   Alur besar program ini:
   1. Siapkan pengaturan dan "wadah data" (variabel)
   2. Ambil elemen HTML yang akan dikendalikan
   3. Fungsi-fungsi kecil (masing-masing satu tugas)
   4. Pasang "pendengar" aksi pengguna (klik, ketik)
   5. Jalankan program

   Daftar isi:
   1. Pengaturan dan data
   2. Mengambil elemen HTML
   3. Fungsi bantu
   4. Menampilkan menu
   5. Keranjang
   6. Patungan dan WhatsApp
   7. Pendengar aksi
   8. Memulai program
   ===================================================== */


/* =====================================================
   1. PENGATURAN DAN DATA
   ===================================================== */

// GANTI dengan nomor WhatsApp cafe.
// Format: kode negara tanpa "+" dan tanpa angka 0 di depan.
// Contoh: 0812-3456-7890 ditulis "6281234567890".
const NOMOR_WA = "6281234567890";

// Batas harga untuk filter "Di bawah Rp20.000"
const BATAS_HEMAT = 20000;

// "let" = variabel yang nilainya boleh berubah nanti.
let dataMenu = [];            // isi menu.json akan disimpan di sini
let kategoriAktif = "semua";  // kategori yang sedang dipilih

// Keranjang berbentuk objek: kunci = id menu, nilai = jumlah.
// Contoh isinya: { "es-teh": 2, "nasi-goreng": 1 }
let keranjang = {};


/* =====================================================
   2. MENGAMBIL ELEMEN HTML
   document.getElementById("nama") mencari elemen yang
   punya id tersebut. Hasilnya disimpan di variabel
   supaya tidak perlu mencari berulang-ulang.
   "const" = variabel yang nilainya tetap.
   ===================================================== */
const elNomorMeja     = document.getElementById("nomor-meja");
const elKolomCari     = document.getElementById("kolom-cari");
const elTombolKategori = document.getElementById("tombol-kategori");
const elFilterHemat   = document.getElementById("filter-hemat");
const elFilterPedas   = document.getElementById("filter-tanpa-pedas");
const elFilterLaris   = document.getElementById("filter-terlaris");
const elDaftarMenu    = document.getElementById("daftar-menu");
const elPesanKosong   = document.getElementById("pesan-kosong");
const elDaftarKeranjang = document.getElementById("daftar-keranjang");
const elKeranjangKosong = document.getElementById("keranjang-kosong");
const elTotalHarga    = document.getElementById("total-harga");
const elJumlahOrang   = document.getElementById("jumlah-orang");
const elHasilPatungan = document.getElementById("hasil-patungan");
const elTombolWA      = document.getElementById("tombol-wa");


/* =====================================================
   3. FUNGSI BANTU
   Fungsi = kumpulan perintah yang diberi nama. Tulis sekali,
   panggil kapan saja dengan namaNya().
   ===================================================== */

// Mengubah angka 18000 menjadi teks "Rp18.000"
function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

// Mengamankan teks sebelum dimasukkan ke HTML.
// Ini mencegah karakter seperti < > " merusak halaman.
function aman(teks) {
  const pembungkus = document.createElement("div");
  pembungkus.textContent = teks;   // textContent otomatis "menetralkan" HTML
  return pembungkus.innerHTML;
}

// Mencari satu menu berdasarkan id-nya
function cariMenu(id) {
  return dataMenu.find((item) => item.id === id);
}

// Menghitung total harga semua isi keranjang
function hitungTotal() {
  let total = 0;
  // Object.entries mengubah objek menjadi daftar pasangan [id, jumlah]
  for (const [id, jumlah] of Object.entries(keranjang)) {
    const menu = cariMenu(id);
    if (menu) {
      total += menu.harga * jumlah;
    }
  }
  return total;
}


/* =====================================================
   4. MENAMPILKAN MENU
   ===================================================== */

// Memilih menu mana yang boleh tampil, sesuai pencarian dan filter.
// filter() menyaring daftar: hanya item yang "lolos" semua syarat yang dipertahankan.
function ambilMenuTersaring() {
  const kataKunci = elKolomCari.value.trim().toLowerCase();

  return dataMenu.filter((item) => {
    // Setiap baris di bawah adalah satu syarat: true = lolos
    const cocokKategori =
      kategoriAktif === "semua" || item.kategori === kategoriAktif;

    const cocokKata =
      item.nama.toLowerCase().includes(kataKunci) ||
      item.deskripsi.toLowerCase().includes(kataKunci);

    // Jika kotak centang TIDAK dicentang, syaratnya otomatis lolos
    const cocokHemat = !elFilterHemat.checked || item.harga < BATAS_HEMAT;
    const cocokPedas = !elFilterPedas.checked || item.pedas === false;
    const cocokLaris = !elFilterLaris.checked || item.terlaris === true;

    // Item tampil hanya jika SEMUA syarat terpenuhi
    return cocokKategori && cocokKata && cocokHemat && cocokPedas && cocokLaris;
  });
}

// Membuat HTML untuk satu kartu menu.
// Backtick ` ` memungkinkan teks banyak baris, dan ${...} menyisipkan nilai.
// Strukturnya sama persis dengan kartu contoh di index.html.
function buatKartu(item) {
  // onerror: jika foto belum ada, sembunyikan gambar rusaknya
  return `
    <article class="kartu">
      <img class="kartu__foto"
           src="${aman(item.foto)}"
           alt="${aman(item.nama)}"
           loading="lazy"
           onerror="this.style.opacity='0'">
      <div class="kartu__isi">
        <h3 class="kartu__nama">${aman(item.nama)}</h3>
        <p class="kartu__deskripsi">${aman(item.deskripsi)}</p>
        <p class="kartu__harga">${formatRupiah(item.harga)}</p>
        <button type="button" class="tombol tombol--tambah"
                data-id="${aman(item.id)}">Tambah</button>
      </div>
    </article>
  `;
}

// Menampilkan kartu-kartu ke halaman
function tampilkanMenu() {
  const hasil = ambilMenuTersaring();

  // map() mengubah tiap menu menjadi teks HTML, join("") menyambungnya
  elDaftarMenu.innerHTML = hasil.map(buatKartu).join("");

  // Tampilkan pesan "tidak ditemukan" hanya jika hasilnya kosong
  elPesanKosong.hidden = hasil.length > 0;
}


/* =====================================================
   5. KERANJANG
   ===================================================== */

// Menambah atau mengurangi jumlah satu menu.
// perubahan = +1 (tambah) atau -1 (kurang)
function ubahJumlah(id, perubahan) {
  const jumlahBaru = (keranjang[id] || 0) + perubahan;
  // "|| 0" artinya: jika belum ada di keranjang, anggap 0

  if (jumlahBaru <= 0) {
    delete keranjang[id];          // jumlah habis: hapus dari keranjang
  } else {
    keranjang[id] = jumlahBaru;
  }

  tampilkanKeranjang();
}

// Menampilkan isi keranjang, total, patungan, dan tautan WhatsApp
function tampilkanKeranjang() {
  const daftarId = Object.keys(keranjang);

  // Buat baris HTML untuk setiap item di keranjang
  elDaftarKeranjang.innerHTML = daftarId
    .map((id) => {
      const menu = cariMenu(id);
      const jumlah = keranjang[id];
      return `
        <li class="keranjang__item">
          <span class="keranjang__nama">${aman(menu.nama)}</span>
          <span class="keranjang__jumlah">
            <button type="button" class="tombol tombol--kecil"
                    data-aksi="kurang" data-id="${aman(id)}"
                    aria-label="Kurangi ${aman(menu.nama)}">-</button>
            <span>${jumlah}</span>
            <button type="button" class="tombol tombol--kecil"
                    data-aksi="tambah" data-id="${aman(id)}"
                    aria-label="Tambah ${aman(menu.nama)}">+</button>
          </span>
          <span class="keranjang__subtotal">${formatRupiah(menu.harga * jumlah)}</span>
        </li>
      `;
    })
    .join("");

  // Pesan "belum ada pesanan" tampil hanya jika keranjang kosong
  elKeranjangKosong.hidden = daftarId.length > 0;

  elTotalHarga.textContent = formatRupiah(hitungTotal());

  hitungPatungan();
  perbaruiTautanWA();
}


/* =====================================================
   6. PATUNGAN DAN WHATSAPP
   ===================================================== */

// Membagi total ke jumlah orang
function hitungPatungan() {
  let jumlahOrang = parseInt(elJumlahOrang.value, 10);
  // parseInt mengubah teks jadi angka bulat.
  // Jika kosong atau salah (NaN) atau kurang dari 1, pakai 1.
  if (isNaN(jumlahOrang) || jumlahOrang < 1) {
    jumlahOrang = 1;
  }

  // Math.ceil membulatkan ke atas, agar total tidak kurang saat patungan
  const perOrang = Math.ceil(hitungTotal() / jumlahOrang);
  elHasilPatungan.textContent = formatRupiah(perOrang);
}

// Menyusun teks pesanan lalu memasukkannya ke tautan WhatsApp
function susunPesanWA() {
  const nomorMeja = elNomorMeja.textContent;
  const baris = [];                       // tempat mengumpulkan baris teks

  baris.push("Halo, saya mau pesan:");
  baris.push("Meja: " + nomorMeja);
  baris.push("");                         // baris kosong sebagai pemisah

  for (const [id, jumlah] of Object.entries(keranjang)) {
    const menu = cariMenu(id);
    baris.push(`- ${jumlah}x ${menu.nama}`);
  }

  baris.push("");
  baris.push("Total: " + formatRupiah(hitungTotal()));

  // "\n" = pindah baris
  return baris.join("\n");
}

function perbaruiTautanWA() {
  // encodeURIComponent mengubah teks agar aman ditaruh di alamat web
  const pesan = encodeURIComponent(susunPesanWA());
  elTombolWA.href = `https://wa.me/${NOMOR_WA}?text=${pesan}`;
}


/* =====================================================
   7. PENDENGAR AKSI (EVENT LISTENER)
   addEventListener("jenis aksi", fungsi) artinya:
   "kalau aksi ini terjadi, jalankan fungsi itu".
   ===================================================== */

// Mengetik di kolom pencarian: tampilkan ulang menu
elKolomCari.addEventListener("input", tampilkanMenu);

// Mencentang/melepas kotak filter: tampilkan ulang menu
elFilterHemat.addEventListener("change", tampilkanMenu);
elFilterPedas.addEventListener("change", tampilkanMenu);
elFilterLaris.addEventListener("change", tampilkanMenu);

// Menekan tombol kategori.
// Kita pasang SATU pendengar di pembungkusnya (bukan di tiap tombol).
// Teknik ini disebut "event delegation".
elTombolKategori.addEventListener("click", (event) => {
  // closest() mencari tombol .chip terdekat dari tempat yang diklik
  const tombol = event.target.closest(".chip");
  if (!tombol) return;                    // klik di tempat lain: abaikan

  kategoriAktif = tombol.dataset.kategori; // membaca atribut data-kategori

  // Pindahkan tanda "aktif" ke tombol yang baru ditekan
  elTombolKategori
    .querySelectorAll(".chip")
    .forEach((chip) => chip.classList.remove("chip--aktif"));
  tombol.classList.add("chip--aktif");

  tampilkanMenu();
});

// Menekan tombol "Tambah" pada kartu menu (juga memakai event delegation,
// karena kartu dibuat ulang setiap kali menu disaring)
elDaftarMenu.addEventListener("click", (event) => {
  const tombol = event.target.closest(".tombol--tambah");
  if (!tombol) return;
  ubahJumlah(tombol.dataset.id, +1);
});

// Menekan tombol "+" atau "-" di keranjang
elDaftarKeranjang.addEventListener("click", (event) => {
  const tombol = event.target.closest("button[data-aksi]");
  if (!tombol) return;

  const perubahan = tombol.dataset.aksi === "tambah" ? +1 : -1;
  ubahJumlah(tombol.dataset.id, perubahan);
});

// Mengubah jumlah orang patungan
elJumlahOrang.addEventListener("input", hitungPatungan);

// Menekan tombol WhatsApp
elTombolWA.addEventListener("click", (event) => {
  if (Object.keys(keranjang).length === 0) {
    event.preventDefault();               // batalkan pembukaan tautan
    alert("Keranjang masih kosong. Tambahkan menu dulu ya.");
  }
});


/* =====================================================
   8. MEMULAI PROGRAM
   ===================================================== */

// Membaca nomor meja dari alamat web.
// Contoh alamat: .../index.html?meja=5  -> nomor meja = "5"
function isiNomorMeja() {
  const parameter = new URLSearchParams(window.location.search);
  elNomorMeja.textContent = parameter.get("meja") || "-";
}

// Mengambil menu.json lalu menampilkan semuanya.
// "async/await" = menunggu proses yang butuh waktu (mengambil berkas)
// selesai dulu sebelum lanjut ke baris berikutnya.
async function mulai() {
  isiNomorMeja();

  try {
    const respons = await fetch("menu.json");

    // respons.ok bernilai false jika berkasnya tidak ditemukan (error 404)
    if (!respons.ok) {
      throw new Error("Berkas menu.json tidak ditemukan");
    }

    dataMenu = await respons.json();      // ubah teks JSON menjadi data JavaScript
    tampilkanMenu();
    tampilkanKeranjang();
  } catch (error) {
    // Jika ada masalah, tampilkan pesan yang jelas dan catat di Console
    console.error("Gagal memuat menu:", error);
    elDaftarMenu.innerHTML = "";
    elPesanKosong.textContent =
      "Menu gagal dimuat. Buka lewat Live Server atau GitHub Pages, bukan klik dua kali berkasnya.";
    elPesanKosong.hidden = false;
  }
}

mulai();
