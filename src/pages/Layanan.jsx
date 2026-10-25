import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getBankSampah } from '../services/api.js'
import { bankSampah as staticBankSampah } from '../data/bankSampah.js'
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
/* Komponen Skeleton Card untuk Loading State (Tugas 6)                */
/* ------------------------------------------------------------------ */
function SkeletonKartu() {
  return (
    <article className="kartu-skeleton" aria-hidden="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <div className="skeleton-shimmer skeleton-line skeleton-line--title" />
        <div className="skeleton-chips-wrap">
          <div className="skeleton-shimmer skeleton-chip" />
        </div>
      </div>
      <div className="skeleton-shimmer skeleton-line skeleton-line--location" />
      <div className="skeleton-shimmer skeleton-line skeleton-line--desc-1" />
      <div className="skeleton-shimmer skeleton-line skeleton-line--desc-2" />
      <div className="skeleton-shimmer skeleton-line skeleton-line--btn" />
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Komponen kartu bank sampah                                         */
/* ------------------------------------------------------------------ */
function KartuBankSampah({ bank }) {
  const navigate = useNavigate()
  const layananList = Array.isArray(bank.layanan) ? bank.layanan : ['Langsung']

  return (
    <article className="kartu">
      <div className="kartu__header">
        <h3 className="kartu__nama">{bank.nama}</h3>
        <div className="kartu__chips">
          {layananList.map((l) => (
            <Chip key={l} variant={l === 'Jemput' ? 'yellow' : 'green'}>
              {l}
            </Chip>
          ))}
        </div>
      </div>
      <p className="kartu__lokasi">{bank.lokasi}</p>
      <p className="kartu__deskripsi">{bank.deskripsi}</p>
      <button
        type="button"
        className="kartu__detail"
        onClick={() => navigate(`/layanan/${bank.slug || bank.id}`)}
      >
        Lihat detail
      </button>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Halaman Layanan (Katalog Dinamis & UX States)                       */
/* ------------------------------------------------------------------ */
export default function Layanan() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // State data dari API (Tugas 5)
  const [dataBank, setDataBank] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Query pencarian & filter checkbox (Tugas 5: mengetik/mencentang langsung mengubah daftar)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filterSampah, setFilterSampah] = useState([])
  const [filterLayanan, setFilterLayanan] = useState([])

  /* ---------- Fetch data dari API (Tugas 5 & 6) ---------- */
  const muatData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBankSampah()
      setDataBank(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Fetch error:', err.message)
      setError(err.message || 'Tidak dapat terhubung ke server MockAPI.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    muatData()
  }, [muatData])

  /* ---------- Fallback offline data ---------- */
  const gunakanDataOffline = () => {
    setDataBank(staticBankSampah)
    setError(null)
  }

  /* ---------- Toggle checkbox (langsung bereaksi) ---------- */
  const toggleSampah = (v) => {
    setFilterSampah((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )
  }

  const toggleLayanan = (v) => {
    setFilterLayanan((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )
  }

  /* ---------- Reset semua filter (Tugas 6: Tombol Reset) ---------- */
  const resetFilter = () => {
    setQuery('')
    setFilterSampah([])
    setFilterLayanan([])
    navigate('/layanan', { replace: true })
  }

  /* ---------- Filter hasil dinamis via useMemo (.map ready) ---------- */
  const hasil = useMemo(() => {
    return dataBank.filter((b) => {
      // Filter teks: mengetik langsung memfilter
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        const nama = (b.nama || '').toLowerCase()
        const lokasi = (b.lokasi || '').toLowerCase()
        if (!nama.includes(q) && !lokasi.includes(q)) return false
      }
      // Filter jenis sampah: mencentang langsung memfilter
      if (filterSampah.length > 0) {
        const jenis = Array.isArray(b.jenisSampah) ? b.jenisSampah : []
        if (!filterSampah.every((s) => jenis.includes(s))) return false
      }
      // Filter jenis layanan: mencentang langsung memfilter
      if (filterLayanan.length > 0) {
        const lay = Array.isArray(b.layanan) ? b.layanan : []
        if (!filterLayanan.every((l) => lay.includes(l))) return false
      }
      return true
    })
  }, [dataBank, query, filterSampah, filterLayanan])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/layanan?q=${encodeURIComponent(query.trim())}`, { replace: true })
    } else {
      navigate('/layanan', { replace: true })
    }
  }

  return (
    <main className="layanan-page">
      <div className="container layanan-page__inner">
        {/* ---- Breadcrumb + judul ---- */}
        <header className="layanan-page__head">
          <p className="eyebrow">Layanan</p>
          <h1 className="layanan-page__title">Katalog layanan pengelolaan sampah</h1>
          <p className="muted">
            Pilih tempat penyerahan atau layanan penjemputan sesuai kebutuhan Anda.
          </p>
        </header>

        <div className="layanan-page__body">
          {/* ============ SIDEBAR FILTER (Tugas 5) ============ */}
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

            <Button
              block
              variant="outline"
              className="filter-panel__reset"
              onClick={resetFilter}
            >
              Reset filter
            </Button>
          </aside>

          {/* ============ KONTEN UTAMA (Tugas 5 & 6) ============ */}
          <section className="katalog" aria-label="Hasil pencarian layanan">
            {/* Search bar: Mengetik langsung memfilter */}
            <form className="katalog__cari" onSubmit={handleSearchSubmit} role="search">
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
                {loading
                  ? 'Memuat data...'
                  : error
                  ? 'Gagal memuat'
                  : `${hasil.length} layanan ditemukan`}
              </span>
            </div>

            {/* UX STATE 1: LOADING SKELETON (Tugas 6) */}
            {loading && (
              <div className="katalog__grid" aria-label="Memuat layanan">
                <SkeletonKartu />
                <SkeletonKartu />
                <SkeletonKartu />
                <SkeletonKartu />
              </div>
            )}

            {/* UX STATE 2: ERROR STATE DENGAN TOMBOL COBA LAGI (Tugas 6) */}
            {!loading && error && (
              <div className="katalog__error" role="alert">
                <div className="katalog__error-icon" aria-hidden="true">
                  !
                </div>
                <h3 className="katalog__error-title">Gagal Memuat Data</h3>
                <p className="katalog__error-desc">{error}</p>
                <p
                  className="katalog__error-desc"
                  style={{ fontSize: '0.8125rem', opacity: 0.9 }}
                >
                  Pastikan internet Anda terhubung atau periksa URL di{' '}
                  <code>.env.local</code>.
                </p>
                <div className="katalog__error-actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={muatData}
                  >
                    Coba Lagi
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={gunakanDataOffline}
                  >
                    Gunakan Data Demo (Offline)
                  </button>
                </div>
              </div>
            )}

            {/* UX STATE 3: EMPTY STATE DENGAN TOMBOL RESET (Tugas 6) */}
            {!loading && !error && hasil.length === 0 && (
              <div className="katalog__kosong">
                <div className="katalog__kosong-icon" aria-hidden="true">
                  🔍
                </div>
                <h3 className="katalog__kosong-judul">
                  Tidak ada layanan yang sesuai
                </h3>
                <p>
                  Tidak ada bank sampah yang sesuai dengan pencarian "
                  {query}" atau filter yang dipilih.
                </p>
                <Button variant="outline" onClick={resetFilter}>
                  Reset filter
                </Button>
              </div>
            )}

            {/* DATA BERHASIL DIMUAT DENGAN .map() (Tugas 5) */}
            {!loading && !error && hasil.length > 0 && (
              <div className="katalog__grid">
                {hasil.map((b) => (
                  <KartuBankSampah key={b.id || b.slug} bank={b} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
