import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { bankSampah } from '../data/bankSampah.js'
import { useAuth } from '../context/AuthContext.jsx'
import Chip from '../components/Chip.jsx'
import Button from '../components/Button.jsx'
import './Layanan.css'

/* ------------------------------------------------------------------ */
/* Konstanta filter                                                   */
/* ------------------------------------------------------------------ */
const JENIS_SAMPAH = ['Plastik', 'Kertas', 'Kardus', 'Botol']
const JENIS_LAYANAN = [
  { nilai: 'Langsung', label: 'Penyerahan langsung' },
  { nilai: 'Jemput', label: 'Penjemputan' },
]

/* ------------------------------------------------------------------ */
/* Komponen Kartu Bank Sampah                                         */
/* ------------------------------------------------------------------ */
/* Ikon Gembok Konsisten (SVG)                                         */
/* ------------------------------------------------------------------ */
function IconGembok({ className = '' }) {
  return (
    <svg
      className={className}
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
/* Komponen Kartu Bank Sampah                                         */
/* ------------------------------------------------------------------ */
function KartuBankSampah({ bank, user, onAksiTerkunci, onBukaKontak }) {
  const navigate = useNavigate()

  const handleMintaJemput = () => {
    if (!user) {
      onAksiTerkunci('jemput', bank)
    } else {
      navigate(`/layanan/${bank.id}?layanan=jemput`)
    }
  }

  const handleHubungi = () => {
    if (!user) {
      onAksiTerkunci('hubungi', bank)
    } else {
      onBukaKontak(bank)
    }
  }

  return (
    <article className="kartu">
      <div className="kartu__header">
        <h3 className="kartu__nama">{bank.nama}</h3>
        <div className="kartu__chips">
          {bank.layanan.map((l) => (
            <Chip key={l} variant={l === 'Jemput' ? 'yellow' : 'green'}>
              {l}
            </Chip>
          ))}
        </div>
      </div>
      <p className="kartu__lokasi">{bank.lokasi}</p>
      <p className="kartu__deskripsi">{bank.deskripsi}</p>

      {/* Bagian Bawah: Link Lihat Detail + Baris 2 Tombol Sejajar */}
      <div className="kartu__footer">
        <button
          type="button"
          className="kartu__detail"
          onClick={() => navigate(`/layanan/${bank.id}`)}
        >
          Lihat detail &rarr;
        </button>

        <div className="kartu__btn-row">
          {/* Tombol Hubungi (Outline: latar putih, border & teks hijau tua) */}
          <button
            type="button"
            className={`kartu__btn kartu__btn--hubungi${!user ? ' kartu__btn--locked' : ''}`}
            onClick={handleHubungi}
            aria-label={user ? `Hubungi ${bank.nama}` : `Hubungi ${bank.nama} (Silakan masuk terlebih dahulu)`}
          >
            {!user && <IconGembok className="kartu__btn-icon-lock" />}
            <span>Hubungi</span>
          </button>

          {/* Tombol Jemput (Solid: latar hijau tua, teks putih) */}
          <button
            type="button"
            className={`kartu__btn kartu__btn--jemput${!user ? ' kartu__btn--locked' : ''}`}
            onClick={handleMintaJemput}
            aria-label={user ? `Minta penjemputan dari ${bank.nama}` : `Minta penjemputan dari ${bank.nama} (Silakan masuk terlebih dahulu)`}
          >
            {!user && <IconGembok className="kartu__btn-icon-lock" />}
            <span>Jemput</span>
          </button>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Modal Peringatan Akses Terkunci (Untuk Pengguna Tamu)              */
/* ------------------------------------------------------------------ */
function ModalAksiTerkunci({ modalData, onClose, onLogin }) {
  if (!modalData?.open) return null

  const isJemput = modalData.jenis === 'jemput'
  const bank = modalData.bank

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-dialog__icon modal-dialog__icon--lock" aria-hidden="true">
          <IconGembok style={{ width: '22px', height: '22px' }} />
        </div>
        <h3 className="modal-dialog__title">Silakan masuk terlebih dahulu</h3>
        <p className="modal-dialog__desc">
          {isJemput ? (
            <>
              Permintaan penjemputan sampah ke alamat Anda dari <strong>{bank?.nama || 'Bank Sampah'}</strong> hanya tersedia untuk pengguna yang telah masuk.
            </>
          ) : (
            <>
              Fitur menghubungi petugas <strong>{bank?.nama || 'Bank Sampah'}</strong> secara langsung hanya tersedia untuk pengguna yang telah masuk.
            </>
          )}
        </p>

        <div className="modal-dialog__actions">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" onClick={onLogin}>
            Masuk Sekarang
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Modal Hubungi Petugas (Untuk Pengguna yang Sudah Login)            */
/* ------------------------------------------------------------------ */
function ModalHubungiPetugas({ modalData, onClose }) {
  if (!modalData?.open || !modalData?.bank) return null
  const bank = modalData.bank
  const nomorWa = bank.kontak ? bank.kontak.replace(/^0/, '62') : '6281234567890'
  const linkWa = `https://wa.me/${nomorWa}?text=${encodeURIComponent(`Halo ${bank.nama}, saya ingin menanyakan informasi penyetoran / penjemputan sampah.`)}`

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
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
            <span className="modal-dialog__info-label">WhatsApp:</span>
            <span className="modal-dialog__info-val">{bank.kontak || '0812-3456-7890'}</span>
          </div>
          <div className="modal-dialog__info-row">
            <span className="modal-dialog__info-label">Jam Layanan:</span>
            <span className="modal-dialog__info-val">{bank.jamOperasional || 'Senin - Sabtu (08.00 - 15.00)'}</span>
          </div>
        </div>

        <div className="modal-dialog__actions">
          <Button variant="outline" onClick={onClose}>
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
  )
}

/* ------------------------------------------------------------------ */
/* Halaman Utama Layanan                                              */
/* ------------------------------------------------------------------ */
export default function Layanan() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  // State Modal
  const [modalKunci, setModalKunci] = useState({ open: false, jenis: 'jemput', bank: null })
  const [modalKontak, setModalKontak] = useState({ open: false, bank: null })

  // Query dari Beranda (search bar)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [queryAktif, setQueryAktif] = useState(searchParams.get('q') || '')

  // State filter
  const [filterSampah, setFilterSampah] = useState([])
  const [filterLayanan, setFilterLayanan] = useState([])
  const [filterAktif, setFilterAktif] = useState({ sampah: [], layanan: [] })

  /* ---------- toggle checkbox ---------- */
  const toggleSampah = (v) =>
    setFilterSampah((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))

  const toggleLayanan = (v) =>
    setFilterLayanan((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))

  /* ---------- terapkan / reset ---------- */
  const terapkan = () =>
    setFilterAktif({ sampah: filterSampah, layanan: filterLayanan })

  const reset = () => {
    setFilterSampah([])
    setFilterLayanan([])
    setFilterAktif({ sampah: [], layanan: [] })
  }

  /* ---------- cari ---------- */
  const cari = (e) => {
    e.preventDefault()
    setQueryAktif(query.trim())
    if (query.trim()) {
      navigate(`/layanan?q=${encodeURIComponent(query.trim())}`, { replace: true })
    } else {
      navigate('/layanan', { replace: true })
    }
  }

  /* ---------- filter hasil ---------- */
  const hasil = useMemo(() => {
    return bankSampah.filter((b) => {
      // Filter teks
      if (queryAktif) {
        const q = queryAktif.toLowerCase()
        if (
          !b.nama.toLowerCase().includes(q) &&
          !b.lokasi.toLowerCase().includes(q)
        )
          return false
      }
      // Filter jenis sampah
      if (filterAktif.sampah.length > 0) {
        if (!filterAktif.sampah.every((s) => b.jenisSampah.includes(s))) return false
      }
      // Filter jenis layanan
      if (filterAktif.layanan.length > 0) {
        if (!filterAktif.layanan.every((l) => b.layanan.includes(l))) return false
      }
      return true
    })
  }, [queryAktif, filterAktif])

  const bukaAksiTerkunci = (jenis, bank) => {
    setModalKunci({ open: true, jenis, bank })
  }

  const prosesLogin = () => {
    const bankId = modalKunci.bank?.id || ''
    const jenis = modalKunci.jenis || 'jemput'
    const pesan =
      jenis === 'jemput'
        ? 'Silakan masuk terlebih dahulu untuk meminta penjemputan sampah.'
        : 'Silakan masuk terlebih dahulu untuk menghubungi bank sampah.'

    const redirectTarget = bankId
      ? `/layanan/${bankId}?layanan=${jenis}`
      : '/layanan'

    setModalKunci({ open: false, jenis: 'jemput', bank: null })
    navigate(`/masuk?redirect=${encodeURIComponent(redirectTarget)}&pesan=${encodeURIComponent(pesan)}`)
  }

  return (
    <main className="layanan-page">
      <div className="container layanan-page__inner">
        {/* ---- Breadcrumb + judul ---- */}
        <header className="layanan-page__head">
          <p className="eyebrow">Layanan</p>
          <h1 className="layanan-page__title">Katalog layanan pengelolaan sampah</h1>
          <p className="muted">Pilih tempat penyerahan atau layanan penjemputan sesuai kebutuhan Anda.</p>
        </header>

        {/* ============ BANNER STATUS PENGGUNA (LOGIN VS BELUM) ============ */}
        {user ? (
          <div className="layanan-auth-banner layanan-auth-banner--logged-in" role="status">
            <div className="layanan-auth-banner__text">
              <span className="layanan-auth-banner__badge">Status: Masuk sebagai {user.nama}</span>
              <p className="layanan-auth-banner__title">Akses Penuh: Penjemputan Sampah & Kontak Petugas Aktif</p>
              <p className="layanan-auth-banner__desc">
                Anda dapat langsung memilih layanan penjemputan ke alamat Anda atau menghubungi petugas bank sampah via chat.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--green-dark)',
                background: '#e0f3ea',
                padding: '6px 12px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              ✓ Fitur Jemput Aktif
            </span>
          </div>
        ) : (
          <div className="layanan-auth-banner layanan-auth-banner--guest" role="note">
            <div className="layanan-auth-banner__text">
              <span className="layanan-auth-banner__badge">Mode Tamu (Belum Masuk)</span>
              <p className="layanan-auth-banner__title">Ingin Minta Penjemputan atau Hubungi Petugas?</p>
              <p className="layanan-auth-banner__desc">
                Anda dapat melihat seluruh katalog dan detail penyerahan langsung. <strong>Masuk ke akun Anda</strong> untuk mengaktifkan permintaan penjemputan ke rumah dan chat langsung dengan petugas.
              </p>
            </div>
            <Button
              to={`/masuk?redirect=/layanan&pesan=${encodeURIComponent('Silakan masuk terlebih dahulu untuk mengakses penjemputan sampah dan kontak petugas.')}`}
              variant="primary"
              className="layanan-auth-banner__btn"
            >
              Masuk Sekarang
            </Button>
          </div>
        )}

        <div className="layanan-page__body">
          {/* ============ SIDEBAR FILTER ============ */}
          <aside className="filter-panel" aria-label="Panel filter">
            <h2 className="filter-panel__judul">Filter</h2>

            {/* Jenis sampah */}
            <fieldset className="filter-panel__group">
              <legend className="filter-panel__legend">Jenis sampah</legend>
              {JENIS_SAMPAH.map((s) => (
                <label key={s} className="filter-panel__opsi">
                  <input
                    type="checkbox"
                    className="filter-panel__check"
                    checked={filterSampah.includes(s)}
                    onChange={() => toggleSampah(s)}
                  />
                  {s}
                </label>
              ))}
            </fieldset>

            {/* Jenis layanan */}
            <fieldset className="filter-panel__group">
              <legend className="filter-panel__legend">Jenis layanan</legend>
              {JENIS_LAYANAN.map((l) => (
                <label key={l.nilai} className="filter-panel__opsi">
                  <input
                    type="checkbox"
                    className="filter-panel__check"
                    checked={filterLayanan.includes(l.nilai)}
                    onChange={() => toggleLayanan(l.nilai)}
                  />
                  {l.label}
                </label>
              ))}
            </fieldset>

            <Button block onClick={terapkan}>
              Terapkan filter
            </Button>
            <Button block variant="outline" className="filter-panel__reset" onClick={reset}>
              Reset
            </Button>
          </aside>

          {/* ============ KONTEN UTAMA ============ */}
          <section className="katalog" aria-label="Hasil pencarian layanan">
            {/* Search bar */}
            <form className="katalog__cari" onSubmit={cari} role="search">
              <input
                className="field__input katalog__cari-input"
                type="search"
                placeholder="Cari nama bank sampah atau lokasi"
                aria-label="Cari nama bank sampah atau lokasi"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn--primary katalog__cari-btn">
                Cari
              </button>
            </form>

            {/* Info hasil */}
            <div className="katalog__info">
              <h2 className="katalog__info-judul">Hasil layanan</h2>
              <span className="katalog__info-jumlah">
                {hasil.length} layanan ditemukan
              </span>
            </div>

            {/* Grid kartu */}
            {hasil.length > 0 ? (
              <div className="katalog__grid">
                {hasil.map((b) => (
                  <KartuBankSampah
                    key={b.id}
                    bank={b}
                    user={user}
                    onAksiTerkunci={bukaAksiTerkunci}
                    onBukaKontak={(bank) => setModalKontak({ open: true, bank })}
                  />
                ))}
              </div>
            ) : (
              <div className="katalog__kosong">
                <p>Tidak ada layanan yang sesuai dengan pencarian atau filter Anda.</p>
                <Button variant="outline" onClick={reset}>
                  Reset filter
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal Dialogs */}
      <ModalAksiTerkunci
        modalData={modalKunci}
        onClose={() => setModalKunci({ open: false, jenis: 'jemput', bank: null })}
        onLogin={prosesLogin}
      />
      <ModalHubungiPetugas
        modalData={modalKontak}
        onClose={() => setModalKontak({ open: false, bank: null })}
      />
    </main>
  )
}
