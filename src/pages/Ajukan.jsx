import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { bankSampah } from '../data/bankSampah.js'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import Chip from '../components/Chip.jsx'
import './Ajukan.css'

/* ------------------------------------------------------------------ */
/* Helper: Format Tanggal Indonesia (contoh: Senin, 5 Oktober 2026)    */
/* ------------------------------------------------------------------ */
function formatTanggalIndo(str) {
  if (!str) return 'Senin, 5 Oktober 2026'
  try {
    const d = new Date(str + 'T00:00:00')
    if (isNaN(d.getTime())) return str
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()]
    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ][d.getMonth()]
    return `${hari}, ${d.getDate()} ${bulan} ${d.getFullYear()}`
  } catch {
    return str
  }
}

export default function Ajukan() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Ambil data bank sampah
  const bank = bankSampah.find((b) => b.id === id) || {
    id: id || 'induk-surabaya',
    nama: 'Bank Sampah Induk Surabaya',
    jenisSampah: ['Plastik', 'Kertas', 'Kardus', 'Botol'],
  }

  // Parameter dari URL query
  const layanan = searchParams.get('layanan') || 'langsung'
  const waktu = searchParams.get('waktu') || '09.00'
  const tanggal = searchParams.get('tanggal') || '2026-10-05'

  // Step 1: Data Diri, Step 2: Data Sampah, Step 3: Konfirmasi
  const [step, setStep] = useState(1)

  // Step 1: Data diri (jika sudah masuk, otomatis terisi data akun)
  const [nama, setNama] = useState(user?.nama || '')
  const [wa, setWa] = useState(user?.wa || '')
  const [alamat, setAlamat] = useState(user?.alamat || '')

  // Step 2: Data sampah (sesuai screenshot 08: Jenis sampah, Perkiraan berat (kg), Catatan)
  const [jenisSampah, setJenisSampah] = useState('Plastik')
  const [berat, setBerat] = useState('3')
  const [catatan, setCatatan] = useState('Sudah dicuci dan dipisah per jenis')

  // Status submit & tiket bukti
  const [tiket, setTiket] = useState(null)

  // Validasi error jika kosong
  const [errors, setErrors] = useState({})

  // Mengunci tombol kirim supaya tidak bisa diklik berkali-kali
  const [sedangKirim, setSedangKirim] = useState(false)

  /* ------------------------------------------------------------------ */
  /* Proteksi Rute: Layanan Penjemputan hanya untuk pengguna yang login */
  /* ------------------------------------------------------------------ */
  if (layanan === 'jemput' && !user) {
    return (
      <main className="ajukan-page">
        <div className="container">
          <div className="ajukan-card" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ffedd5',
                color: '#ea580c',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 16px',
              }}
              aria-hidden="true"
            >
              🔒
            </div>
            <h1 className="ajukan-card__title" style={{ fontSize: '1.375rem', marginBottom: '8px' }}>
              Penjemputan Memerlukan Akun
            </h1>
            <p className="ajukan-card__subtitle" style={{ marginBottom: '24px', lineHeight: '1.55' }}>
              Pengguna yang belum login belum bisa meminta penjemputan. Anda tetap dapat melakukan penyerahan langsung ke lokasi, atau masuk ke akun Anda untuk menjadwalkan penjemputan ke alamat ini.
            </p>
            <div className="ajukan-card__actions" style={{ justifyContent: 'center', gap: '12px' }}>
              <Button to={`/layanan/${bank.id}`} variant="outline">
                Kembali ke Detail
              </Button>
              <Button
                to={`/masuk?redirect=${encodeURIComponent(`/ajukan/${bank.id}?layanan=jemput&waktu=${waktu}&tanggal=${tanggal}`)}&pesan=${encodeURIComponent('Silakan masuk terlebih dahulu untuk mengajukan penjemputan sampah.')}`}
                variant="primary"
              >
                Masuk Sekarang
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  /* ------------------------------------------------------------------ */
  /* Navigasi Step 1 -> Step 2                                          */
  /* ------------------------------------------------------------------ */
  const handleLanjutStep1 = (e) => {
    e.preventDefault()
    const err = {}
    if (!nama.trim()) err.nama = 'Nama lengkap wajib diisi.'
    if (!wa.trim()) err.wa = 'Nomor WhatsApp wajib diisi.'
    if (Object.keys(err).length > 0) {
      setErrors(err)
      return
    }
    setErrors({})
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ------------------------------------------------------------------ */
  /* Navigasi Step 2 -> Step 3                                          */
  /* ------------------------------------------------------------------ */
  const handleLanjutStep2 = (e) => {
    e.preventDefault()
    const err = {}
    if (!jenisSampah.trim()) err.jenisSampah = 'Jenis sampah wajib diisi.'
    if (!berat.trim()) err.berat = 'Perkiraan berat wajib diisi.'
    if (Object.keys(err).length > 0) {
      setErrors(err)
      return
    }
    setErrors({})
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ------------------------------------------------------------------ */
  /* Submit Final: Buat Tiket                                           */
  /* ------------------------------------------------------------------ */
  const handleKirimPengajuan = () => {
    // Cegah klik berulang: kalau sedang mengirim, abaikan
    if (sedangKirim) return
    setSedangKirim(true)

    const nomorAcak = Math.floor(1000 + Math.random() * 9000)
    const kodeTiket = `SP-${bank.id.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}${nomorAcak}`

    const tiketBaru = {
      kode: kodeTiket,
      layanan: bank.nama,
      metode: layanan === 'jemput' ? 'Penjemputan' : 'Penyerahan langsung',
      jadwal: `${formatTanggalIndo(tanggal)}, ${waktu}`,
      nama,
      sampah: `${jenisSampah} · ${berat} kg`,
      catatan,
      alamat: alamat || '(Diserahkan langsung)',
      status: 'Menunggu diproses',
    }

    // Simpan ke localStorage
    try {
      const listLama = JSON.parse(localStorage.getItem('sp_pengajuan_list') || '[]')
      listLama.unshift(tiketBaru)
      localStorage.setItem('sp_pengajuan_list', JSON.stringify(listLama))
    } catch (e) {
      console.warn('Gagal menyimpan tiket', e)
    }

    setTiket(tiketBaru)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ------------------------------------------------------------------ */
  /* Reset: kosongkan semua isian dan kembali ke langkah 1              */
  /* ------------------------------------------------------------------ */
  const handleReset = () => {
    setNama(user?.nama || '')
    setWa(user?.wa || '')
    setAlamat(user?.alamat || '')
    setJenisSampah(bank.jenisSampah?.[0] || 'Plastik')
    setBerat('')
    setCatatan('')
    setErrors({})
    setSedangKirim(false)
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const judulHalaman =
    layanan === 'jemput' ? 'Ajukan penjemputan sampah' : 'Ajukan penyerahan sampah'

  /* ------------------------------------------------------------------ */
  /* Tampilan Bukti Tiket (Setelah Kirim Pengajuan)                      */
  /* ------------------------------------------------------------------ */
  if (tiket) {
    return (
      <main className="ajukan-page">
        <div className="container">
          <div className="ajukan-card ajukan-sukses-box">
            <div className="ajukan-sukses-icon" aria-hidden="true">&#10003;</div>
            <h1 className="ajukan-card__title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
              Pengajuan Berhasil Dikirim!
            </h1>
            <p className="ajukan-card__subtitle" style={{ marginBottom: '20px' }}>
              Pemesanan Anda telah tercatat. Simpan kode tiket berikut sebagai bukti penyerahan sampah.
            </p>

            <div className="ajukan-tiket-card">
              <div className="ajukan-tiket-code-wrap">
                <div>
                  <div style={{ fontSize: '0.6875rem', opacity: 0.9, textTransform: 'uppercase' }}>
                    Kode Tiket
                  </div>
                  <div className="ajukan-tiket-code">{tiket.kode}</div>
                </div>
                <Chip variant="yellow">{tiket.status}</Chip>
              </div>

              <div className="ajukan-konfirmasi-list" style={{ margin: 0 }}>
                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Layanan</span>
                  <span className="ajukan-konfirmasi-row__value">{tiket.layanan}</span>
                </div>
                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Metode</span>
                  <span className="ajukan-konfirmasi-row__value">{tiket.metode}</span>
                </div>
                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Jadwal</span>
                  <span className="ajukan-konfirmasi-row__value">{tiket.jadwal}</span>
                </div>
                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Nama</span>
                  <span className="ajukan-konfirmasi-row__value">{tiket.nama}</span>
                </div>
                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Sampah</span>
                  <span className="ajukan-konfirmasi-row__value">{tiket.sampah}</span>
                </div>
              </div>
            </div>

            <div className="ajukan-card__actions" style={{ justifyContent: 'center', gap: '12px' }}>
              <Button to="/layanan" variant="outline">
                Lihat Layanan Lain
              </Button>
              <Button to="/" variant="primary">
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  /* ------------------------------------------------------------------ */
  /* Tampilan Form Multi-Langkah Sesuai Figma (07, 08, 09)               */
  /* ------------------------------------------------------------------ */
  return (
    <main className="ajukan-page">
      <div className="container">
        {/* Header Tengah: Eyebrow + Judul */}
        <div className="ajukan-header">
          <p className="ajukan-header__eyebrow">Pengajuan layanan</p>
          <h1 className="ajukan-header__title">{judulHalaman}</h1>

          {/* Stepper (1 Data diri — 2 Data sampah — 3 Konfirmasi) */}
          <div className="ajukan-stepper-wrap">
            <ol className="ajukan-stepper">
              <li style={{ display: 'contents' }}>
                <span className={`ajukan-stepper__item${step >= 1 ? ' ajukan-stepper__item--active' : ''}`}>
                  <span className="ajukan-stepper__num">1</span>
                  <span>Data diri</span>
                </span>
                <span className="ajukan-stepper__line" />
              </li>
              <li style={{ display: 'contents' }}>
                <span className={`ajukan-stepper__item${step >= 2 ? ' ajukan-stepper__item--active' : ''}`}>
                  <span className="ajukan-stepper__num">2</span>
                  <span>Data sampah</span>
                </span>
                <span className="ajukan-stepper__line" />
              </li>
              <li style={{ display: 'contents' }}>
                <span className={`ajukan-stepper__item${step >= 3 ? ' ajukan-stepper__item--active' : ''}`}>
                  <span className="ajukan-stepper__num">3</span>
                  <span>Konfirmasi</span>
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Card Formulir Tengah */}
        <div className="ajukan-card">
          {/* ===================== 07 LANGKAH 1: DATA DIRI ===================== */}
          {step === 1 && (
            <form onSubmit={handleLanjutStep1} noValidate>
              <h2 className="ajukan-card__title">Data diri</h2>
              <p className="ajukan-card__subtitle">
                Data ini dipakai untuk konfirmasi pengajuan Anda.
              </p>

              {/* Baris 1: 2 Kolom (Nama lengkap & Nomor WhatsApp) */}
              <div className="ajukan-row-2col">
                <div className={`field${errors.nama ? ' field--error' : ''}`}>
                  <label className="field__label" htmlFor="in-nama">
                    Nama lengkap
                  </label>
                  <input
                    id="in-nama"
                    type="text"
                    className="field__input"
                    value={nama}
                    placeholder="Nama lengkap"
                    onChange={(e) => {
                      setNama(e.target.value)
                      if (errors.nama) setErrors({ ...errors, nama: '' })
                    }}
                  />
                  {errors.nama && <span className="field__error">{errors.nama}</span>}
                </div>

                <div className={`field${errors.wa ? ' field--error' : ''}`}>
                  <label className="field__label" htmlFor="in-wa">
                    Nomor WhatsApp
                  </label>
                  <input
                    id="in-wa"
                    type="tel"
                    className="field__input"
                    value={wa}
                    placeholder="081234567890"
                    onChange={(e) => {
                      setWa(e.target.value)
                      if (errors.wa) setErrors({ ...errors, wa: '' })
                    }}
                  />
                  {errors.wa && <span className="field__error">{errors.wa}</span>}
                </div>
              </div>

              {/* Baris 2: Full Width (Alamat) */}
              <div className="ajukan-field-group">
                <div className="field">
                  <label className="field__label" htmlFor="in-alamat">
                    {layanan === 'jemput'
                      ? 'Alamat penjemputan'
                      : 'Alamat (opsional untuk setor langsung)'}
                  </label>
                  <input
                    id="in-alamat"
                    type="text"
                    className="field__input"
                    placeholder="Jalan, kelurahan, kecamatan"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                  />
                </div>
              </div>

              {/* Tombol Kembali & Lanjutkan */}
              <div className="ajukan-card__actions">
                <button
                  type="button"
                  className="ajukan-btn-kembali"
                  onClick={() => navigate(`/layanan/${bank.id}`)}
                >
                  Kembali
                </button>
                <button type="submit" className="ajukan-btn-lanjutkan">
                  Lanjutkan
                </button>
              </div>
            </form>
          )}

          {/* ===================== 08 LANGKAH 2: DATA SAMPAH ===================== */}
          {step === 2 && (
            <form onSubmit={handleLanjutStep2} noValidate>
              <h2 className="ajukan-card__title">Data sampah</h2>
              <p className="ajukan-card__subtitle">
                Jelaskan jenis dan jumlah sampah yang akan diserahkan.
              </p>

              {/* Baris 1: 2 Kolom (Jenis sampah & Perkiraan berat (kg)) */}
              <div className="ajukan-row-2col">
                <div className={`field${errors.jenisSampah ? ' field--error' : ''}`}>
                  <label className="field__label" htmlFor="in-jenis-sampah">
                    Jenis sampah
                  </label>
                  <select
                    id="in-jenis-sampah"
                    className="ajukan-select"
                    value={jenisSampah}
                    onChange={(e) => {
                      setJenisSampah(e.target.value)
                      if (errors.jenisSampah) setErrors({ ...errors, jenisSampah: '' })
                    }}
                  >
                    {bank.jenisSampah?.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    )) || (
                      <>
                        <option value="Plastik">Plastik</option>
                        <option value="Kertas">Kertas</option>
                        <option value="Kardus">Kardus</option>
                        <option value="Botol">Botol</option>
                      </>
                    )}
                  </select>
                  {errors.jenisSampah && (
                    <span className="field__error">{errors.jenisSampah}</span>
                  )}
                </div>

                <div className={`field${errors.berat ? ' field--error' : ''}`}>
                  <label className="field__label" htmlFor="in-berat">
                    Perkiraan berat (kg)
                  </label>
                  <input
                    id="in-berat"
                    type="number"
                    min="1"
                    className="field__input"
                    value={berat}
                    placeholder="3"
                    onChange={(e) => {
                      setBerat(e.target.value)
                      if (errors.berat) setErrors({ ...errors, berat: '' })
                    }}
                  />
                  {errors.berat && <span className="field__error">{errors.berat}</span>}
                </div>
              </div>

              {/* Baris 2: Full Width (Catatan) */}
              <div className="ajukan-field-group">
                <div className="field">
                  <label className="field__label" htmlFor="in-catatan">
                    Catatan
                  </label>
                  <input
                    id="in-catatan"
                    type="text"
                    className="field__input"
                    placeholder="Sudah dicuci dan dipisah per jenis"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                </div>
              </div>

              {/* Tombol Kembali & Lanjutkan */}
              <div className="ajukan-card__actions">
                <button
                  type="button"
                  className="ajukan-btn-kembali"
                  onClick={() => {
                    setStep(1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Kembali
                </button>
                <button type="submit" className="ajukan-btn-lanjutkan">
                  Lanjutkan
                </button>
              </div>
            </form>
          )}

          {/* ===================== 09 KONFIRMASI ===================== */}
          {step === 3 && (
            <div>
              <h2 className="ajukan-card__title">Konfirmasi pengajuan</h2>
              <p className="ajukan-card__subtitle">
                Periksa kembali sebelum mengirim.
              </p>

              {/* List Data Konfirmasi Sesuai Screenshot 09 */}
              <div className="ajukan-konfirmasi-list">
                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Layanan</span>
                  <span className="ajukan-konfirmasi-row__value">{bank.nama}</span>
                </div>

                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Metode</span>
                  <span className="ajukan-konfirmasi-row__value">
                    {layanan === 'jemput' ? 'Penjemputan' : 'Penyerahan langsung'}
                  </span>
                </div>

                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Jadwal</span>
                  <span className="ajukan-konfirmasi-row__value">
                    {formatTanggalIndo(tanggal)}, {waktu}
                  </span>
                </div>

                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Nama</span>
                  <span className="ajukan-konfirmasi-row__value">{nama}</span>
                </div>

                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Sampah</span>
                  <span className="ajukan-konfirmasi-row__value">
                    {jenisSampah} · {berat} kg
                  </span>
                </div>
              </div>

              {/* Tombol Kembali, Reset & Kirim Pengajuan */}
              <div className="ajukan-card__actions">
                <button
                  type="button"
                  className="ajukan-btn-kembali"
                  onClick={() => {
                    setStep(2)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={sedangKirim}
                >
                  Kembali
                </button>
                <button
                  type="button"
                  className="ajukan-btn-kembali"
                  onClick={handleReset}
                  disabled={sedangKirim}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="ajukan-btn-lanjutkan"
                  onClick={handleKirimPengajuan}
                  disabled={sedangKirim}
                >
                  {sedangKirim ? 'Mengirim...' : 'Kirim pengajuan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}