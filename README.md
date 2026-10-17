# Web_Kelompok37 
Aplikasi web untuk membantu masyarakat menyetor sampah 
langsung atau meminta penjemputan ke bank sampah terdekat.
# Tautan
- Desain figma (modul 5): https://www.figma.com/design/PjhLrvM6CJcfWMplKa4kl8/Modul-5-Web-UIUX---Prototipe?node-id=0-1&p=f&t=YB8i603p5G3pp690-0
- Repository:
- PRD:

# Anggota Dan Kontribusi 
Muhammad Alfian Febrianto []
Silas Torem Bernifu []
Suci Ramadhani []
Widia Andani Rifaat []
Zolla Akhryanov [Inisialisasi proyek, design token, Navbar + hamburger, Beranda, komponen dasar | Upload project Sampah Tidak Terpilah] Done 


# Status Halaman
| Halaman | Rute | Status |
|---|---|---|
| Beranda | / | Selesai (pencarian mengarah ke /layanan?q=...) |
| Login | /masuk | Belum (placeholder) |
| Katalog & Filter | /layanan | Belum (placeholder) |
| Detail & Jadwal | - | Belum |
| Form Langkah 1, 2, Konfirmasi | - | Belum |
| Sukses & Tiket | - | Belum |
| Tentang | /tentang | Belum (placeholder) |

# Fitur yang sudah berjalan
- Navbar responsif dengan menu hamburger yang dapat dibuka-tutup di layar mobile (di bawah 640px)
- Beranda dengan kolom pencarian yang membawa kata kunci ke halaman layanan
- Komponen reusable: Button, Chip, Input, Stepper, Accordion (accordion sudah punya state buka-tutup)
- Data statis 4 bank sampah di src/data/bankSampah.js

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
    └── styles/
        └── global.css          (design token dan gaya komponen)

## Design Token (dari src/styles/global.css)

| Token | Nilai |
| Hijau utama | #0f6b45 (hover #0b5636) |
| Panel hijau muda | #e8f3ee |
| Latar halaman | #f4f7f5 |
| Border | #e1e8e4 |
| Chip kuning | latar #fff2d1, teks #8a5a00 |
| Error | latar #fdeaea, border #d94343 |
| Radius | 10px (kartu besar 14px) |
| Font | Inter |
| Breakpoint | mobile <640px, tablet <900px (Beranda), desktop di atasnya |

**Log Prompt AI**
Detail lengkap ada di docs/log-prompt.md.

# Prompt 1: Struktur proyek, design token, Navbar, Beranda
- Tool: [isi] | Dikerjakan: Zolla Akhryanov
- Input: PDF desain Modul 5
- Hasil AI: proyek Vite + React berjalan, komponen dasar dan Beranda terbentuk
- Perbaikan manual: lihat tabel di bawah

# Prompt 2 dst.
[isi setiap selesai satu halaman]



| Breakpoint | mobile <640px, tablet <900px (Beranda), desktop di atasnya |

