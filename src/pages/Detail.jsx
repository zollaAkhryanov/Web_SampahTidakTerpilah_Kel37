import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { bankSampah } from '../data/bankSampah.js'
import Chip from '../components/Chip.jsx'
import Button from '../components/Button.jsx'
import './Detail.css'

/* ------------------------------------------------------------------ */
/* Helper: format tanggal ke Bahasa Indonesia                          */
/* ------------------------------------------------------------------ */
const NAMA_HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni',
                    'Juli','Agustus','September','Oktober','November','Desember']

function formatTanggal(d) {
  return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`
}

/* Slot waktu tersedia */
const SLOT_LANGSUNG = ['09.00', '10.00', '13.00', '14.00']
const SLOT_JEMPUT   = ['08.00', '09.00', '11.00', '14.00', '16.00']

/* ------------------------------------------------------------------ */
/* Komponen utama                                                       */
/* ------------------------------------------------------------------ */
export default function Detail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const bank      = bankSampah.find((b) => b.id === id)

  // Jenis layanan yang dipilih (tab)
  const [layanan, setLayanan] = useState('langsung')
  // Slot waktu yang dipilih
  const [waktu, setWaktu]     = useState(null)
  // Tanggal yang dipilih (default: hari ini)
  const todayISO = new Date().toISOString().split('T')[0]
  const [tanggal, setTanggal] = useState(todayISO)

  /* Jika ID tidak ditemukan */
  if (!bank) {
    return (
      <main className="container page-pad">
        <h1 className="h1">Bank sampah tidak ditemukan</h1>
        <p className="muted">ID yang kamu cari tidak tersedia.</p>
        <Button to="/layanan" variant="outline" className="detail__back-btn">
          Kembali ke Katalog
        </Button>
      </main>
    )
  }

  /* Slot waktu yang ditampilkan sesuai tab */
  const slotAktif = layanan === 'langsung' ? SLOT_LANGSUNG : SLOT_JEMPUT

  /* Jika ganti tab, reset pilihan waktu */
  const gantiLayanan = (jenis) => {
    setLayanan(jenis)
    setWaktu(null)
  }

  /* Lanjutkan ke form */
  const lanjutkan = () => {
    if (!waktu) return
    navigate(`/ajukan/${bank.id}?layanan=${layanan}&waktu=${encodeURIComponent(waktu)}&tanggal=${tanggal}`)
  }

  /* Format tanggal terpilih ke Bahasa Indonesia */
  const tanggalFormatted = (() => {
    const d = new Date(tanggal + 'T00:00:00')
    return formatTanggal(d)
  })()

  /* Cek apakah bank mendukung kedua layanan */
  const adaJemput    = bank.layanan.includes('Jemput')
  const adaLangsung  = bank.layanan.includes('Langsung')

  return (
    <main className="detail-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/layanan" className="detail-breadcrumb__link">Layanan / Katalog</Link>
          <span className="detail-breadcrumb__sep" aria-hidden="true"> / </span>
          <span className="detail-breadcrumb__current">{bank.nama}</span>
        </nav>

        <div className="detail-layout">

          {/* ============ KOLOM KIRI: Info bank ============ */}
          <section className="detail-info" aria-label="Informasi bank sampah">
            {/* Foto placeholder */}
            <div className="detail-info__foto">
              <div className="detail-info__foto-placeholder" aria-hidden="true">
                {bank.nama.split(' ').map(w => w[0]).join('').slice(0, 3)}
              </div>
              <p className="detail-info__foto-label muted">Ganti dengan foto asli</p>
            </div>

            <h1 className="detail-info__nama">{bank.nama}</h1>
            <p className="detail-info__desc muted">{bank.deskripsi}</p>

            {/* Chip jenis sampah */}
            <div className="detail-info__chips">
              {bank.jenisSampah.map((s) => (
                <Chip key={s} variant="green">{s}</Chip>
              ))}
            </div>

            {/* Lokasi */}
            <div className="detail-info__lokasi">
              <p className="detail-info__lokasi-label">Lokasi</p>
              <p className="detail-info__lokasi-val">{bank.lokasi}</p>
            </div>
          </section>

          {/* ============ KOLOM KANAN: Pilih layanan ============ */}
          <section className="detail-jadwal" aria-label="Pilih layanan dan jadwal">
            <h2 className="detail-jadwal__judul">Pilih layanan</h2>

            {/* Tab layanan */}
            <div className="detail-jadwal__tabs" role="group" aria-label="Jenis layanan">
              {adaLangsung && (
                <button
                  id="tab-langsung"
                  type="button"
                  className={'detail-jadwal__tab' + (layanan === 'langsung' ? ' detail-jadwal__tab--active' : '')}
                  aria-pressed={layanan === 'langsung'}
                  onClick={() => gantiLayanan('langsung')}
                >
                  Penyerahan langsung
                </button>
              )}
              {adaJemput && (
                <button
                  id="tab-jemput"
                  type="button"
                  className={'detail-jadwal__tab' + (layanan === 'jemput' ? ' detail-jadwal__tab--active' : '')}
                  aria-pressed={layanan === 'jemput'}
                  onClick={() => gantiLayanan('jemput')}
                >
                  Penjemputan
                </button>
              )}
            </div>

            {/* Tanggal */}
            <div className="detail-jadwal__baris">
              <label className="detail-jadwal__label" htmlFor="jadwal-tanggal">Tanggal</label>
              <input
                id="jadwal-tanggal"
                type="date"
                className="detail-jadwal__date-input"
                value={tanggal}
                min={todayISO}
                onChange={(e) => setTanggal(e.target.value)}
                aria-label="Pilih tanggal"
              />
              <span className="detail-jadwal__date-label muted">{tanggalFormatted}</span>
            </div>

            {/* Waktu */}
            <div className="detail-jadwal__baris">
              <label className="detail-jadwal__label">Waktu</label>
              <div className="detail-jadwal__slot-grid" role="group" aria-label="Pilih waktu">
                {slotAktif.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={'detail-jadwal__slot' + (waktu === s ? ' detail-jadwal__slot--active' : '')}
                    aria-pressed={waktu === s}
                    onClick={() => setWaktu(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="detail-jadwal__info-box" role="note">
              <p className="detail-jadwal__info-judul">
                Poin ditentukan saat sampah ditimbang
              </p>
              <p className="detail-jadwal__info-teks">
                Pastikan sampah sudah dipilah dan dibersihkan sebelum disetor.
              </p>
            </div>

            {/* Tombol lanjutkan */}
            <button
              type="button"
              className={'btn btn--primary btn--block detail-jadwal__lanjut' + (!waktu ? ' detail-jadwal__lanjut--disabled' : '')}
              onClick={lanjutkan}
              disabled={!waktu}
              aria-disabled={!waktu}
            >
              Lanjutkan
            </button>
          </section>

        </div>
      </div>
    </main>
  )
}
