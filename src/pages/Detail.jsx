import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { bankSampah } from '../data/bankSampah.js'
import { useAuth } from '../context/AuthContext.jsx'
import Chip from '../components/Chip.jsx'
import Button from '../components/Button.jsx'
import './Detail.css'

/* ------------------------------------------------------------------ */
/* Helper: format tanggal ke Bahasa Indonesia                          */
/* ------------------------------------------------------------------ */
const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatTanggal(d) {
  return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`
}

/* Slot waktu tersedia */
const SLOT_LANGSUNG = ['09.00', '10.00', '13.00', '14.00']
const SLOT_JEMPUT = ['08.00', '09.00', '11.00', '14.00', '16.00']

/* ------------------------------------------------------------------ */
/* Ikon Gembok Konsisten (SVG)                                         */
/* ------------------------------------------------------------------ */
function IconGembok({ className = '', style }) {
  return (
    <svg
      className={className}
      style={style}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Komponen utama                                                      */
/* ------------------------------------------------------------------ */
export default function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const bank = bankSampah.find((b) => b.id === id)

  // Jenis layanan yang dipilih (tab)
  const [layanan, setLayanan] = useState('langsung')
  // Slot waktu yang dipilih
  const [waktu, setWaktu] = useState(null)
  // Tanggal yang dipilih (default: hari ini)
  const todayISO = new Date().toISOString().split('T')[0]
  const [tanggal, setTanggal] = useState(todayISO)

  // Modal dialog kontak & kunci
  const [modalKontak, setModalKontak] = useState(false)
  const [modalKunci, setModalKunci] = useState(false)

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

  /* Handler Hubungi Petugas */
  const handleHubungiPetugas = () => {
    if (!user) {
      setModalKunci(true)
    } else {
      setModalKontak(true)
    }
  }

  /* Lanjutkan ke form */
  const lanjutkan = () => {
    if (!waktu) return
    // Jika layanan jemput dan belum login, tolak dan arahkan ke login
    if (layanan === 'jemput' && !user) {
      navigate(
        `/masuk?redirect=${encodeURIComponent(`/layanan/${bank.id}?layanan=jemput`)}&pesan=${encodeURIComponent('Silakan masuk terlebih dahulu untuk meminta penjemputan sampah.')}`
      )
      return
    }
    navigate(`/ajukan/${bank.id}?layanan=${layanan}&waktu=${encodeURIComponent(waktu)}&tanggal=${tanggal}`)
  }

  /* Format tanggal terpilih ke Bahasa Indonesia */
  const tanggalFormatted = (() => {
    const d = new Date(tanggal + 'T00:00:00')
    return formatTanggal(d)
  })()

  const adaJemput = bank.layanan.includes('Jemput')
  const adaLangsung = bank.layanan.includes('Langsung')

  const nomorWa = bank.kontak ? bank.kontak.replace(/^0/, '62') : '6281234567890'
  const linkWa = `https://wa.me/${nomorWa}?text=${encodeURIComponent(`Halo ${bank.nama}, saya ingin bertanya perihal layanan pengelolaan dan penjemputan sampah.`)}`

  return (
    <main className="detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/layanan" className="detail-breadcrumb__link">
            Layanan / Katalog
          </Link>
          <span className="detail-breadcrumb__sep" aria-hidden="true">
            {' '}
            /{' '}
          </span>
          <span className="detail-breadcrumb__current">{bank.nama}</span>
        </nav>

        <div className="detail-layout">
          {/* ============ KOLOM KIRI: Info bank ============ */}
          <section className="detail-info" aria-label="Informasi bank sampah">
            {/* Foto placeholder */}
            <div className="detail-info__foto">
              <div className="detail-info__foto-placeholder" aria-hidden="true">
                {bank.nama
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 3)}
              </div>
              <p className="detail-info__foto-label muted">Foto resmi unit</p>
            </div>

            <h1 className="detail-info__nama">{bank.nama}</h1>
            <p className="detail-info__desc muted">{bank.deskripsi}</p>

            {/* Chip jenis sampah */}
            <div className="detail-info__chips">
              {bank.jenisSampah.map((s) => (
                <Chip key={s} variant="green">
                  {s}
                </Chip>
              ))}
            </div>

            {/* Lokasi */}
            <div className="detail-info__lokasi">
              <p className="detail-info__lokasi-label">Lokasi</p>
              <p className="detail-info__lokasi-val">{bank.lokasi}</p>
            </div>

            {/* Informasi Kontak & Tombol Hubungi */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <p className="detail-info__lokasi-label">Kontak Pengelola</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: '0 0 10px' }}>
                {bank.petugas || 'Pengurus Unit'} &bull; {bank.jamOperasional || 'Hari Kerja'}
              </p>
              <button
                type="button"
                className={`btn btn--block ${user ? 'btn--primary' : 'btn--outline'}`}
                style={{
                  fontSize: '0.8125rem',
                  height: '38px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: user ? undefined : '#f1f3f2',
                  borderColor: user ? undefined : '#e1e8e4',
                  color: user ? undefined : '#8c9791',
                  cursor: user ? 'pointer' : 'not-allowed',
                }}
                onClick={handleHubungiPetugas}
              >
                {user ? (
                  <>💬 Hubungi Petugas via Chat</>
                ) : (
                  <>
                    <IconGembok /> Hubungi Petugas (Perlu Masuk)
                  </>
                )}
              </button>
            </div>
          </section>

          {/* ============ KOLOM KANAN: Pilih layanan ============ */}
          <section className="detail-jadwal" aria-label="Pilih layanan dan jadwal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="detail-jadwal__judul">Pilih layanan</h2>
              <span className={`detail-user-status ${user ? 'detail-user-status--masuk' : 'detail-user-status--tamu'}`}>
                {user ? `✓ Masuk: ${user.nama.split(' ')[0]}` : 'Mode Tamu'}
              </span>
            </div>

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
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>Penjemputan</span>
                  {!user && <IconGembok style={{ color: 'currentColor' }} />}
                </button>
              )}
            </div>

            {/* KONDISI TAB PENJEMPUTAN BAGI PENGGUNA BELUM LOGIN */}
            {layanan === 'jemput' && !user ? (
              <div className="detail-lock-box" role="alert">
                <div className="detail-lock-box__icon" aria-hidden="true">
                  <IconGembok style={{ width: '22px', height: '22px' }} />
                </div>
                <h3 className="detail-lock-box__title">Penjemputan Khusus Pengguna Masuk</h3>
                <p className="detail-lock-box__desc">
                  Pengguna yang belum login belum bisa meminta penjemputan. Anda tetap dapat melihat katalog dan detail layanan, atau beralih ke Penyerahan Langsung.
                  Silakan masuk terlebih dahulu untuk mengajukan penjemputan ke alamat Anda.
                </p>
                <div className="detail-lock-box__actions">
                  <Button
                    to={`/masuk?redirect=${encodeURIComponent(`/layanan/${bank.id}?layanan=jemput`)}&pesan=${encodeURIComponent('Silakan masuk terlebih dahulu untuk meminta penjemputan sampah.')}`}
                    variant="primary"
                  >
                    Masuk Sekarang
                  </Button>
                  <Button variant="outline" onClick={() => gantiLayanan('langsung')}>
                    Ganti ke Penyerahan Langsung
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Opsi Penjemputan dalam tab penyerahan langsung */}
                {layanan === 'langsung' && adaJemput && (
                  <div className="detail-penjemputan-option">
                    <div className="detail-penjemputan-option__header">
                      <span className="detail-penjemputan-option__icon" aria-hidden="true">
                        🚚
                      </span>
                      <div>
                        <span className="detail-penjemputan-option__title">
                          Tidak sempat antar langsung ke lokasi?
                        </span>
                        <p className="detail-penjemputan-option__desc">
                          {bank.nama} juga menyediakan layanan penjemputan ke rumah
                          {user ? '. Klik tombol berikut untuk meminta penjemputan.' : ' (khusus pengguna yang sudah masuk).'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn--outline detail-penjemputan-option__btn"
                      onClick={() => gantiLayanan('jemput')}
                    >
                      Beralih ke Layanan Jemput &rarr;
                    </button>
                  </div>
                )}

                {/* Tanggal */}
                <div className="detail-jadwal__baris">
                  <label className="detail-jadwal__label" htmlFor="jadwal-tanggal">
                    Tanggal
                  </label>
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
                    {layanan === 'jemput'
                      ? 'Petugas akan menimbang sampah di lokasi penjemputan'
                      : 'Poin ditentukan saat sampah ditimbang di lokasi'}
                  </p>
                  <p className="detail-jadwal__info-teks">
                    Pastikan sampah sudah dipilah dan dibersihkan sebelum disetor atau dijemput.
                  </p>
                </div>

                {/* Tombol lanjutkan */}
                <button
                  type="button"
                  className={
                    'btn btn--primary btn--block detail-jadwal__lanjut' +
                    (!waktu ? ' detail-jadwal__lanjut--disabled' : '')
                  }
                  onClick={lanjutkan}
                  disabled={!waktu}
                  aria-disabled={!waktu}
                >
                  Lanjutkan Pengajuan {layanan === 'jemput' ? 'Penjemputan' : 'Setor Langsung'}
                </button>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Modal Kontak Petugas */}
      {modalKontak && (
        <div className="modal-backdrop" onClick={() => setModalKontak(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog__icon modal-dialog__icon--contact" aria-hidden="true">
              💬
            </div>
            <h3 className="modal-dialog__title">Kontak Petugas Bank Sampah</h3>
            <p className="modal-dialog__desc">
              Hubungi pengelola <strong>{bank.nama}</strong> untuk koordinasi jadwal, jenis sampah khusus, atau konfirmasi penjemputan.
            </p>

            <div className="modal-dialog__info-box">
              <div className="modal-dialog__info-row">
                <span className="modal-dialog__info-label">Bank Sampah:</span>
                <span className="modal-dialog__info-val">{bank.nama}</span>
              </div>
              <div className="modal-dialog__info-row">
                <span className="modal-dialog__info-label">Petugas:</span>
                <span className="modal-dialog__info-val">{bank.petugas || 'Petugas Operasional'}</span>
              </div>
              <div className="modal-dialog__info-row">
                <span className="modal-dialog__info-label">Nomor WhatsApp:</span>
                <span className="modal-dialog__info-val">{bank.kontak || '0812-3456-7890'}</span>
              </div>
              <div className="modal-dialog__info-row">
                <span className="modal-dialog__info-label">Jam Layanan:</span>
                <span className="modal-dialog__info-val">{bank.jamOperasional || 'Senin - Sabtu (08.00 - 15.00)'}</span>
              </div>
            </div>

            <div className="modal-dialog__actions">
              <Button variant="outline" onClick={() => setModalKontak(false)}>
                Tutup
              </Button>
              <a
                href={linkWa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
                style={{ textDecoration: 'none' }}
              >
                Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kunci Login */}
      {modalKunci && (
        <div className="modal-backdrop" onClick={() => setModalKunci(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog__icon modal-dialog__icon--lock" aria-hidden="true">
              <IconGembok style={{ width: '22px', height: '22px' }} />
            </div>
            <h3 className="modal-dialog__title">Silakan masuk terlebih dahulu</h3>
            <p className="modal-dialog__desc">
              Fitur menghubungi pengelola <strong>{bank.nama}</strong> secara langsung hanya tersedia untuk pengguna yang telah masuk ke akun.
            </p>
            <div className="modal-dialog__actions">
              <Button variant="outline" onClick={() => setModalKunci(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setModalKunci(false)
                  navigate(
                    `/masuk?redirect=${encodeURIComponent(`/layanan/${bank.id}`)}&pesan=${encodeURIComponent('Silakan masuk terlebih dahulu untuk menghubungi bank sampah.')}`
                  )
                }}
              >
                Masuk Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
