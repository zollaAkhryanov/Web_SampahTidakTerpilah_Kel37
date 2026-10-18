import React from "react";
import "./Tentang.css";

export default function Tentang() {
  return (
    <main className="tentang-page">
      <div className="tentang-container">

        {/* Bagian judul */}
        <section className="tentang-intro">
          <span className="tentang-label">
            Tentang platform
          </span>

          <h1>Tentang SampahPintar</h1>

          <p>
            Platform informasi dan penyaluran sampah.
            Pengguna bisa menemukan bank sampah di Surabaya,
            memilih setor langsung atau jemput, dan mengajukan
            jadwal tanpa harus datang untuk bertanya.
          </p>
        </section>

        {/* Bagian untuk siapa */}
        <section className="tentang-section">
          <h2>Untuk siapa</h2>

          <div className="tentang-users">
            <div className="tentang-card">
              <h3>Masyarakat dan pengguna umum</h3>
              <p>
                Mencari tempat menyetor sampah terpilah
                dan mengajukan jadwal.
              </p>
            </div>

            <div className="tentang-card">
              <h3>Petugas dan pengelola bank sampah</h3>
              <p>
                Menerima dan menindaklanjuti pengajuan
                setoran atau penjemputan.
              </p>
            </div>
          </div>
        </section>

        {/* Bagian layanan */}
        <section className="tentang-section">
          <h2>Layanan kami</h2>

          <div className="tentang-services">
            <div className="tentang-service-card">
              <div className="tentang-number">1</div>
              <h3>Daftar bank sampah</h3>
              <p>
                Lokasi dan jenis sampah yang diterima.
              </p>
            </div>

            <div className="tentang-service-card">
              <div className="tentang-number">2</div>
              <h3>Jadwal setor</h3>
              <p>
                Pilih tanggal dan jam yang sesuai.
              </p>
            </div>

            <div className="tentang-service-card">
              <div className="tentang-number">3</div>
              <h3>Penjemputan</h3>
              <p>
                Tersedia di layanan yang membukanya.
              </p>
            </div>
          </div>
        </section>

        {/* Bagian informasi pengembang */}
        <section className="tentang-footer">
          <h4>Dikembangkan oleh Kelompok 37</h4>
          <p>
            Web UI/UX Developer Course. Data lokasi
            bersumber dari ANTARA Jatim dan ITS News;
            verifikasi jam operasional langsung ke
            pengelola sebelum rilis.
          </p>
        </section>

      </div>
    </main>
  );
}