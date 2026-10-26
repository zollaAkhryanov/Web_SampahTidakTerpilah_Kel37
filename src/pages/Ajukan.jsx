import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bankSampah } from '../data/bankSampah.js'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import Chip from '../components/Chip.jsx'
import Input from '../components/Input.jsx'
import { postPengajuan, getBankSampahById } from '../services/api.js'
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

/* ------------------------------------------------------------------ */
/* Validasi per kolom (mengembalikan pesan error, atau '' jika valid)   */
/* Semua nilai di-trim dulu sebelum dicek.                              */
/* ------------------------------------------------------------------ */
const REGEX_NAMA = /^[\p{L}][\p{L}\s.'-]*$/u
const REGEX_WA = /^(\+62|62|0)8[1-9][0-9]{7,11}$/

const validator = {
  nama: (v) => {
    const t = v.trim()
    if (!t) return 'Nama lengkap wajib diisi.'
    if (t.length < 3) return 'Nama minimal 3 karakter.'
    if (t.length > 60) return 'Nama maksimal 60 karakter.'
    if (!REGEX_NAMA.test(t)) return 'Nama hanya boleh berisi huruf, spasi, titik, atau tanda hubung.'
    return ''
  },
  wa: (v) => {
    const t = v.trim().replace(/[\s-]/g, '')
    if (!t) return 'Nomor WhatsApp wajib diisi.'
    if (!REGEX_WA.test(t)) return 'Format nomor tidak valid. Contoh: 081234567890.'
    return ''
  },
  alamat: (v, { wajib }) => {
    const t = v.trim()
    if (!t) return wajib ? 'Alamat penjemputan wajib diisi.' : ''
    if (t.length < 10) return 'Alamat terlalu singkat. Tulis jalan, kelurahan, dan kecamatan.'
    if (t.length > 200) return 'Alamat maksimal 200 karakter.'
    return ''
  },
  jenisSampah: (v) => (!v.trim() ? 'Pilih jenis sampah.' : ''),
  berat: (v) => {
    const t = String(v).trim().replace(',', '.')
    if (!t) return 'Perkiraan berat wajib diisi.'
    const n = Number(t)
    if (Number.isNaN(n)) return 'Berat harus berupa angka.'
    if (n < 1) return 'Berat minimal 1 kg.'
    if (n > 500) return 'Berat maksimal 500 kg per pengajuan.'
    return ''
  },
  catatan: (v) => (v.trim().length > 200 ? 'Catatan maksimal 200 karakter.' : ''),
}

const FIELD_STEP = { 1: ['nama', 'wa', 'alamat'], 2: ['jenisSampah', 'berat', 'catatan'] }

export default function Ajukan() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Data bank sampah: awalnya dari data lokal, lalu diperbarui dari API
  const bankFallback = bankSampah.find((b) => b.id === id) || {
    id: id || 'induk-surabaya',
    nama: 'Bank Sampah Induk Surabaya',
    jenisSampah: ['Plastik', 'Kertas', 'Kardus', 'Botol'],
  }
  const [bank, setBank] = useState(bankFallback)

  useEffect(() => {
    let batal = false
    getBankSampahById(id)
      .then((data) => {
        if (!batal && data) setBank({ ...bankFallback, ...data })
      })
      .catch(() => {})
    return () => {
      batal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Parameter dari URL query
  const layanan = searchParams.get('layanan') || 'langsung'
  const waktu = searchParams.get('waktu') || '09.00'
  const tanggal = searchParams.get('tanggal') || '2026-10-05'
  const wajibAlamat = layanan === 'jemput'

  // Step 1: Data Diri, Step 2: Data Sampah, Step 3: Konfirmasi
  const [step, setStep] = useState(1)

  // Nilai form (kosong di awal, kecuali user sudah login)
  const [values, setValues] = useState({
    nama: user?.nama || '',
    wa: user?.wa || '',
    alamat: user?.alamat || '',
    jenisSampah: '',
    berat: '',
    catatan: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [tiket, setTiket] = useState(null)

  const cek = (name, nilai = values[name]) => validator[name](nilai, { wajib: wajibAlamat })

  const ubah = (name) => (e) => {
    const nilai = e.target.value
    setValues((v) => ({ ...v, [name]: nilai }))
    // Hapus error saat user mulai memperbaiki
    if (errors[name]) setErrors((er) => ({ ...er, [name]: cek(name, nilai) }))
  }

  // Validasi saat kolom ditinggalkan; spasi di pinggir dibersihkan
  const saatBlur = (name) => () => {
    const bersih = values[name].trim()
    if (bersih !== values[name]) setValues((v) => ({ ...v, [name]: bersih }))
    setErrors((er) => ({ ...er, [name]: cek(name, bersih) }))
  }

  const validasiStep = (nomor) => {
    const err = {}
    FIELD_STEP[nomor].forEach((name) => {
      const pesan = cek(name)
      if (pesan) err[name] = pesan
    })
    setErrors(err)
    if (Object.keys(err).length > 0) {
      // Fokus ke kolom pertama yang salah
      const pertama = FIELD_STEP[nomor].find((n) => err[n])
      document.getElementById(`in-${pertama}`)?.focus()
      return false
    }
    // Simpan versi yang sudah di-trim
    setValues((v) => {
      const bersih = { ...v }
      FIELD_STEP[nomor].forEach((n) => (bersih[n] = bersih[n].trim()))
      return bersih
    })
    return true
  }

  const naikStep = (nomor) => {
    setStep(nomor)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLanjutStep1 = (e) => {
    e.preventDefault()
    if (validasiStep(1)) naikStep(2)
  }

  const handleLanjutStep2 = (e) => {
    e.preventDefault()
    if (validasiStep(2)) naikStep(3)
  }

  /* ------------------------------------------------------------------ */
  /* Submit Final: POST ke MockAPI, lalu buat tiket dari data tersimpan  */
  /* ------------------------------------------------------------------ */
  const handleKirimPengajuan = async () => {
    if (submitting) return
    // Validasi ulang semua kolom sebelum dikirim
    if (!validasiStep(1)) return naikStep(1)
    if (!validasiStep(2)) return naikStep(2)

    const payload = {
      bankId: bank.id,
      layanan: bank.nama,
      metode: layanan === 'jemput' ? 'Penjemputan' : 'Penyerahan langsung',
      jadwal: `${formatTanggalIndo(tanggal)}, ${waktu}`,
      nama: values.nama.trim(),
      wa: values.wa.trim().replace(/[\s-]/g, ''),
      jenisSampah: values.jenisSampah,
      beratKg: Number(String(values.berat).trim().replace(',', '.')),
      sampah: `${values.jenisSampah} · ${values.berat} kg`,
      catatan: values.catatan.trim(),
      alamat: values.alamat.trim() || '(Diserahkan langsung)',
      status: 'Menunggu diproses',
      dibuatPada: new Date().toISOString(),
    }

    setSubmitting(true)
    try {
      const tersimpan = await postPengajuan(payload)

      // Kode tiket dibuat dari ID data yang tersimpan di server
      const nomor = String(tersimpan?.id ?? Date.now().toString().slice(-5)).padStart(4, '0')
      const kode = `SP-${String(bank.id).substring(0, 3).toUpperCase()}-${nomor}`
      const tiketBaru = { ...payload, ...tersimpan, kode }

      // Cache lokal sebagai riwayat
      try {
        const listLama = JSON.parse(localStorage.getItem('sp_pengajuan_list') || '[]')
        listLama.unshift(tiketBaru)
        localStorage.setItem('sp_pengajuan_list', JSON.stringify(listLama))
      } catch (err) {
        console.warn('Gagal menyimpan riwayat lokal', err)
      }

      toast.success('Pengajuan berhasil dikirim!')
      setTiket(tiketBaru)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(err.message || 'Pengajuan gagal dikirim. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const salinKode = async () => {
    try {
      await navigator.clipboard.writeText(tiket.kode)
      toast.success('Kode tiket disalin.')
    } catch {
      toast.error('Tidak bisa menyalin. Salin kode secara manual.')
    }
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
              <button type="button" className="ajukan-btn-salin" onClick={salinKode}>
                Salin kode tiket
              </button>

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

            <div className="ajukan-card__actions ajukan-card__actions--sukses">
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
                <span className={`ajukan-stepper__item${step >= 1 ? ' ajukan-stepper__item--active' : ''}${step === 1 ? ' ajukan-stepper__item--current' : ''}`}>
                  <span className="ajukan-stepper__num">1</span>
                  <span className="ajukan-stepper__label">Data diri</span>
                </span>
                <span className="ajukan-stepper__line" />
              </li>
              <li style={{ display: 'contents' }}>
                <span className={`ajukan-stepper__item${step >= 2 ? ' ajukan-stepper__item--active' : ''}${step === 2 ? ' ajukan-stepper__item--current' : ''}`}>
                  <span className="ajukan-stepper__num">2</span>
                  <span className="ajukan-stepper__label">Data sampah</span>
                </span>
                <span className="ajukan-stepper__line" />
              </li>
              <li style={{ display: 'contents' }}>
                <span className={`ajukan-stepper__item${step >= 3 ? ' ajukan-stepper__item--active' : ''}${step === 3 ? ' ajukan-stepper__item--current' : ''}`}>
                  <span className="ajukan-stepper__num">3</span>
                  <span className="ajukan-stepper__label">Konfirmasi</span>
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
                <Input
                  id="in-nama"
                  label="Nama lengkap"
                  type="text"
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  value={values.nama}
                  onChange={ubah('nama')}
                  onBlur={saatBlur('nama')}
                  error={errors.nama}
                />
                <Input
                  id="in-wa"
                  label="Nomor WhatsApp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="081234567890"
                  value={values.wa}
                  onChange={ubah('wa')}
                  onBlur={saatBlur('wa')}
                  error={errors.wa}
                />
              </div>

              {/* Baris 2: Full Width (Alamat) */}
              <div className="ajukan-field-group">
                <Input
                  id="in-alamat"
                  label={wajibAlamat ? 'Alamat penjemputan' : 'Alamat (opsional untuk setor langsung)'}
                  type="text"
                  autoComplete="street-address"
                  placeholder="Jalan, kelurahan, kecamatan"
                  value={values.alamat}
                  onChange={ubah('alamat')}
                  onBlur={saatBlur('alamat')}
                  error={errors.alamat}
                />
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
                  <label className="field__label" htmlFor="in-jenisSampah">
                    Jenis sampah
                  </label>
                  <select
                    id="in-jenisSampah"
                    className="ajukan-select"
                    value={values.jenisSampah}
                    aria-invalid={errors.jenisSampah ? 'true' : undefined}
                    onChange={ubah('jenisSampah')}
                    onBlur={saatBlur('jenisSampah')}
                  >
                    <option value="">Pilih jenis sampah</option>
                    {(bank.jenisSampah || ['Plastik', 'Kertas', 'Kardus', 'Botol']).map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                  {errors.jenisSampah && (
                    <span className="field__error" role="alert">{errors.jenisSampah}</span>
                  )}
                </div>

                <Input
                  id="in-berat"
                  label="Perkiraan berat (kg)"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="500"
                  step="any"
                  placeholder="3"
                  value={values.berat}
                  onChange={ubah('berat')}
                  onBlur={saatBlur('berat')}
                  error={errors.berat}
                />
              </div>

              {/* Baris 2: Full Width (Catatan) */}
              <div className="ajukan-field-group">
                <Input
                  id="in-catatan"
                  label="Catatan (opsional)"
                  type="text"
                  placeholder="Sudah dicuci dan dipisah per jenis"
                  value={values.catatan}
                  onChange={ubah('catatan')}
                  onBlur={saatBlur('catatan')}
                  error={errors.catatan}
                />
              </div>

              {/* Tombol Kembali & Lanjutkan */}
              <div className="ajukan-card__actions">
                <button
                  type="button"
                  className="ajukan-btn-kembali"
                  onClick={() => naikStep(1)}
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
                  <span className="ajukan-konfirmasi-row__value">{values.nama}</span>
                </div>

                <div className="ajukan-konfirmasi-row">
                  <span className="ajukan-konfirmasi-row__label">Sampah</span>
                  <span className="ajukan-konfirmasi-row__value">
                    {values.jenisSampah} · {values.berat} kg
                  </span>
                </div>
              </div>

              {/* Tombol Kembali & Kirim Pengajuan */}
              <div className="ajukan-card__actions">
                <button
                  type="button"
                  className="ajukan-btn-kembali"
                  disabled={submitting}
                  onClick={() => naikStep(2)}
                >
                  Kembali
                </button>
                <button
                  type="button"
                  className="ajukan-btn-lanjutkan"
                  onClick={handleKirimPengajuan}
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="ajukan-spinner" aria-hidden="true" /> Mengirim...
                    </>
                  ) : (
                    'Kirim pengajuan'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
