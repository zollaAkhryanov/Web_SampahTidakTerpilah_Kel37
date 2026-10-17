import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import './Beranda.css'

const langkah = [
  { no: '1', judul: 'Setor langsung', teks: 'Antar sampah terpilah ke lokasi bank sampah.' },
  { no: '2', judul: 'Minta penjemputan', teks: 'Ajukan jemput untuk layanan yang menyediakannya.' },
  { no: '3', judul: 'Lihat semua layanan', teks: 'Bandingkan lokasi dan jenis sampah yang diterima.' },
]

export default function Beranda() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const cari = (e) => {
    e.preventDefault()
    navigate(q.trim() ? `/layanan?q=${encodeURIComponent(q.trim())}` : '/layanan')
  }

  return (
    <main className="beranda">
      <div className="container">
        <section className="hero">
          <div className="hero__text">
            <p className="eyebrow">Informasi dan penyaluran sampah</p>
            <h1 className="hero__title">Setor sampah terpilah ke bank sampah terdekat di Surabaya</h1>
            <p className="muted hero__desc">
              Lihat daftar bank sampah, pilih setor langsung atau jemput, lalu ajukan jadwalnya dari satu tempat.
            </p>
            <div className="hero__actions">
              <Button to="/layanan">Cari layanan</Button>
              <Button to="/tentang" variant="outline">Tentang SampahTidakTerpilah</Button>
            </div>
          </div>
          <div className="hero__photo">Ganti dengan foto asli</div>
        </section>

        <section className="cari">
          <h2 className="h2">Apa yang ingin Anda cari?</h2>
          <form className="cari__form" onSubmit={cari}>
            <input
              className="field__input cari__input"
              placeholder="Cari nama bank sampah atau lokasi"
              aria-label="Cari nama bank sampah atau lokasi"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="btn btn--primary">Cari</button>
          </form>

          <div className="langkah">
            {langkah.map((l) => (
              <article key={l.no} className="langkah__card">
                <span className="langkah__no">{l.no}</span>
                <h3 className="langkah__judul">{l.judul}</h3>
                <p className="muted langkah__teks">{l.teks}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
