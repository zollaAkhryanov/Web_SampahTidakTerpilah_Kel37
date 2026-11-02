import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { bankSampah } from '../data/bankSampah.js'
import Chip from '../components/Chip.jsx'
import Button from '../components/Button.jsx'
import './Layanan.css'

/* ------------------------------------------------------------------ */
/* Konstanta filter                                                     */
/* ------------------------------------------------------------------ */
const JENIS_SAMPAH = ['Plastik', 'Kertas', 'Kardus', 'Botol']
const JENIS_LAYANAN = [
  { nilai: 'Langsung', label: 'Penyerahan langsung' },
  { nilai: 'Jemput',   label: 'Penjemputan' },
]

/* ------------------------------------------------------------------ */
/* Komponen kartu bank sampah                                           */
/* ------------------------------------------------------------------ */
function KartuBankSampah({ bank }) {
  const navigate = useNavigate()

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
      <button
        type="button"
        className="kartu__detail"
        onClick={() => navigate(`/layanan/${bank.id}`)}
      >
        Lihat detail
      </button>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Halaman Layanan                                                      */
/* ------------------------------------------------------------------ */
export default function Layanan() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Query dari Beranda (search bar)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [queryAktif, setQueryAktif] = useState(searchParams.get('q') || '')

  // State filter (belum diterapkan sampai klik "Terapkan filter")
  const [filterSampah, setFilterSampah]   = useState([])
  const [filterLayanan, setFilterLayanan] = useState([])
  const [filterAktif, setFilterAktif]     = useState({ sampah: [], layanan: [] })

  /* ---------- toggle checkbox ---------- */
  const toggleSampah = (v) =>
    setFilterSampah((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])

  const toggleLayanan = (v) =>
    setFilterLayanan((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])

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
    // Sinkronkan URL agar bisa di-share
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
        ) return false
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

  return (
    <main className="layanan-page">
      <div className="container layanan-page__inner">
        {/* ---- Breadcrumb + judul ---- */}
        <header className="layanan-page__head">
          <p className="eyebrow">Layanan</p>
          <h1 className="layanan-page__title">Katalog layanan pengelolaan sampah</h1>
          <p className="muted">Pilih tempat penyerahan atau layanan penjemputan sesuai kebutuhan Anda.</p>
        </header>

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

            <Button block onClick={terapkan}>Terapkan filter</Button>
            <Button block variant="outline" className="filter-panel__reset" onClick={reset}>Reset</Button>
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
                  <KartuBankSampah key={b.id} bank={b} />
                ))}
              </div>
            ) : (
              <div className="katalog__kosong">
                <p>Tidak ada layanan yang sesuai dengan pencarian atau filter Anda.</p>
                <Button variant="outline" onClick={reset}>Reset filter</Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
