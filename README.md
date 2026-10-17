# Web_Kelompok37 
Aplikasi web untuk membantu masyarakat menyetor sampah 
langsung atau meminta penjemputan ke bank sampah terdekat.
# Tautan
- Desain figma (modul 5): https://www.figma.com/design/PjhLrvM6CJcfWMplKa4kl8/Modul-5-Web-UIUX---Prototipe?node-id=0-1&p=f&t=YB8i603p5G3pp690-0
- Repository:https://github.com/zollaAkhryanov/Web_SampahTidakTerpilah_Kel37.git
- PRD:

# Anggota Dan Kontribusi 
- Zolla Akhryanov [Inisialisasi proyek, Navbar + hamburger, Beranda, komponen dasar | Upload project Sampah Tidak Terpilah] Done 
- Muhammad Alfian Febrianto []
- Silas Torem Bernifu []
- Suci Ramadhani [Implementasi halaman Login, form pengguna umum, pilihan jenis pengguna, validasi input, dan desain responsif] Done
- Widia Andani Rifaat []

# Status Halaman
| Halaman | Rute | Status |
|---|---|---|
| Beranda | / | Selesai (pencarian mengarah ke /layanan?q=...) |
| Login | /masuk | Selesai |
| Katalog & Filter | /layanan | Selesai) |
| Detail & Jadwal | - | Selesai |
| Form Langkah 1, 2, Konfirmasi | - | Belum |
| Sukses & Tiket | - | Belum |
| Tentang | /tentang | Belum (placeholder) |

# Fitur yang sudah berjalan
- Navbar responsif dengan menu hamburger yang dapat dibuka-tutup di layar mobile (di bawah 640px)
- Beranda dengan kolom pencarian yang membawa kata kunci ke halaman layanan
- Komponen reusable: Button, Chip, Input, Stepper, Accordion (accordion sudah punya state buka-tutup)
- Data statis 4 bank sampah di src/data/bankSampah.js
- Halaman Login dengan form Pengguna Umum dan pilihan jenis pengguna.
- Validasi nama lengkap, nomor WhatsApp, dan alamat.
- Pesan error pada field yang belum valid.
- Tombol Masuk dan Lanjut tanpa masuk.
- Layout Login responsif untuk mobile, tablet, dan desktop.
- Detail Bank Sampah: Menampilkan nama bank sampah, deskripsi, foto atau logo, lokasi, dan kategori sampah yang diterima.
- Jadwal Layanan: Menyediakan pilihan metode layanan berupa penyerahan langsung dan penjemputan, pilihan tanggal, serta pilihan waktu.
- Informasi Layanan: Menampilkan ketentuan penimbangan sampah sebelum layanan dilanjutkan.
- Navigasi Layanan: Menyediakan tombol Lanjutkan untuk meneruskan proses layanan.

# Cara Menjalankan Lokal
1. Pasang Node.js (versi 18 ke atas)
2. Clone repo: git clone 
3. Masuk folder: cd sampah-tidak-terpilah
4. Pasang dependensi: npm install
5. Jalankan: npm run dev
6. Buka alamat yang muncul

# Struktur Folder
```
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                 (routing)
    ├── components/
    │   ├── Accordion.jsx
    │   ├── Button.jsx
    │   ├── Chip.jsx
    │   ├── Input.jsx
    │   ├── Navbar.jsx / Navbar.css
    │   └── Stepper.jsx
    ├── data/
    │   └── bankSampah.js
    ├── pages/
    │   └── Beranda.jsx / Beranda.css
    │   └── Login.jsx / Login.css
    │   └── Layanan.jsx / Layanan.css
    │   └── Detail.jsx / Detail.css 
    └── styles/
        └── global.css          (design token dan gaya komponen)


# Log Prompt AI
Detail lengkap ada di docs/log-prompt.md.

# Prompt 1: Struktur proyek, design token, Navbar, Beranda
- Tool: Cloude | Dikerjakan: Zolla Akhryanov
- Prompt: Kamu adalah front-end developer. Ubah desain Figma terlampir menjadi
website "SampahPintar": aplikasi web untuk menyetor atau meminta jemput
sampah ke bank sampah di Surabaya.

TEKNOLOGI
- Vite + React, react-router-dom, CSS biasa (tanpa backend)
- Data bank sampah disimpan sebagai array statis di src/data/bankSampah.js
- Kode rapi, komponen dipisah per file

DESIGN TOKEN (ikuti desain, jangan diubah)
- Warna utama: hijau tua #0F6B45
- Latar panel: hijau sangat muda #E8F3EE, latar halaman abu-hijau terang
- Kartu: putih, border tipis, sudut membulat
- Font: Inter, judul tebal
- Chip status: hijau muda (aktif), kuning (Menunggu diproses)
- Input error: border dan latar merah muda
- Button: solid hijau dan outline hijau

KOMPONEN GLOBAL
Navbar (logo S + "SampahPintar", menu Beranda/Layanan/Tentang, tombol Masuk),
Button, Chip, Input, Stepper, Accordion

ATURAN
- Tampilan harus semirip mungkin dengan desain (tata letak, proporsi, spasi)
- Wajib responsif: mobile (<640px), tablet, desktop
- Di mobile, navbar menjadi menu hamburger yang bisa dibuka-tutup
- Jangan menambah fitur di luar desain

Kerjakan per halaman. Mulai dengan struktur proyek + Navbar + Beranda.
- Input: PDF desain Modul 5
- Hasil AI: proyek Vite + React berjalan, komponen dasar dan Beranda terbentuk


# Prompt 2: Implementasi Halaman Login SampahPintar
- Tool: Claude | Dikerjakan: Suci Ramadhani
- Prompt: Bertindak sebagai frontend developer dan lanjutkan pengembangan website
SampahPintar dari proyek React yang sudah tersedia. Buat halaman Login dengan
mengacu pada screenshot desain yang diberikan agar tampilannya konsisten
dengan halaman lainnya.

TEKNOLOGI
- Menggunakan React, Vite, react-router-dom, dan CSS biasa
- Memanfaatkan struktur folder serta komponen yang telah dibuat sebelumnya
- Tidak menggunakan backend untuk implementasi ini

KOMPONEN HALAMAN LOGIN
- Pilihan tipe pengguna antara Pengguna Umum dan Petugas
- Form Pengguna Umum yang berisi nama lengkap, nomor WhatsApp, dan alamat
- Validasi untuk memastikan data yang dimasukkan sesuai ketentuan
- Notifikasi kesalahan apabila terdapat data yang kosong atau tidak valid
- Tombol Masuk dan Lanjut tanpa masuk

DESAIN DAN RESPONSIVITAS
- Menyesuaikan layout dengan referensi desain Login
- Menggunakan palet warna hijau SampahPintar dan gaya komponen yang sudah tersedia
- Menjaga konsistensi ukuran teks, jarak antarelemen, border, dan bentuk tombol
- Memastikan halaman dapat digunakan pada perangkat mobile, tablet, maupun desktop

KETENTUAN PENGERJAAN
- Menambahkan halaman Login pada rute /masuk
- Mempertahankan fungsi halaman lain yang sudah selesai
- Menggunakan kembali komponen yang relevan jika memungkinkan
- Memastikan form dan tombol dapat diuji tanpa memerlukan backend

- Input: Screenshot referensi halaman Login
- Hasil AI: Halaman Login diintegrasikan ke dalam proyek SampahPintar dengan form
pengguna umum, pilihan tipe pengguna, validasi data, serta penyesuaian tampilan
responsif sesuai implementasi yang dihasilkan.


# Prompt 3: Implementasi Halaman Detail dan Jadwal SampahPintar

- Tool: Claude | Dikerjakan: Suci Ramadhani
- Prompt: Lanjutkan pengembangan website SampahPintar berdasarkan struktur proyek React yang sudah tersedia. Implementasikan halaman Detail dan Jadwal layanan bank sampah dengan mengacu pada screenshot desain yang diberikan.

TEKNOLOGI
- Menggunakan React, Vite, react-router-dom, dan CSS biasa.
- Memanfaatkan struktur folder dan komponen yang sudah tersedia.
- Tidak menggunakan backend untuk implementasi ini.

KOMPONEN HALAMAN DETAIL
- Menampilkan informasi bank sampah yang dipilih, seperti nama, deskripsi, lokasi, dan kategori sampah yang diterima.
- Menampilkan foto atau logo bank sampah.
- Menyediakan tampilan informasi lokasi bank sampah secara jelas.
- Menyesuaikan tata letak informasi dengan desain referensi.

KOMPONEN HALAMAN JADWAL
- Menyediakan pilihan metode layanan, yaitu Penyerahan Langsung dan Penjemputan.
- Menampilkan pilihan tanggal layanan.
- Menyediakan pilihan waktu layanan yang tersedia.
- Menampilkan informasi mengenai ketentuan penimbangan sampah.
- Menyediakan tombol Lanjutkan untuk meneruskan proses pemesanan layanan.

DESAIN DAN RESPONSIVITAS
- Mengikuti referensi desain yang diberikan.
- Menggunakan palet warna hijau SampahPintar dan gaya komponen yang sudah tersedia.
- Menjaga konsistensi tipografi, jarak antar elemen, border, dan tombol.
- Memastikan halaman dapat digunakan pada perangkat mobile, tablet, maupun desktop.

KETENTUAN PENGERJAAN
- Mengintegrasikan halaman dengan routing proyek yang sudah tersedia.
- Memastikan pilihan metode, tanggal, dan waktu dapat digunakan pada antarmuka.
- Mempertahankan fungsi halaman lain yang sudah selesai.
- Menggunakan kembali komponen yang relevan jika memungkinkan.
- Tidak mengklaim proses pemesanan tersimpan ke server karena implementasi belum menggunakan backend.

- Input: Screenshot referensi halaman Detail dan Jadwal layanan SampahPintar.
- Hasil AI: Implementasi antarmuka Detail dan Jadwal layanan bank sampah yang mengikuti desain referensi, dengan informasi bank sampah, pilihan metode layanan, tanggal, waktu, ketentuan penimbangan, dan tombol Lanjutkan.


# Prompt 4 dst
[isi setiap selesai satu halaman]

| Breakpoint | mobile <640px, tablet <900px (Beranda), desktop di atasnya 
