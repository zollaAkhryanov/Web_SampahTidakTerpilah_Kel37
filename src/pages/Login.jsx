import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Input from '../components/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './Login.css'

/* ------------------------------------------------------------------ */
/* Sub-komponen: Form Pengguna Umum                                     */
/* ------------------------------------------------------------------ */
function FormPenggunaUmum({ redirect }) {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ nama: '', wa: '', alamat: '' })
  const [errors, setErrors] = useState({})
  const [showBanner, setShowBanner] = useState(false)
  const [sukses, setSukses] = useState(false)

  const ubah = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Hapus error field yang sedang diketik
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (showBanner) setShowBanner(false)
    if (sukses) setSukses(false)
  }

  const validasi = () => {
    const err = {}
    if (!form.nama.trim()) {
      err.nama = 'Nama lengkap wajib diisi.'
    }
    const waClean = form.wa.trim()
    const waRegex = /^08\d{8,11}$/
    if (!waClean) {
      err.wa = 'Nomor harus diawali 08 dan berisi 10\u201313 angka.'
    } else if (!waRegex.test(waClean)) {
      err.wa = 'Nomor harus diawali 08 dan berisi 10\u201313 angka.'
    }
    if (!form.alamat.trim()) {
      err.alamat = 'Alamat wajib diisi.'
    }
    return err
  }

  const submit = (e) => {
    e.preventDefault()
    const err = validasi()
    if (Object.keys(err).length > 0) {
      setErrors(err)
      setShowBanner(true)
      setSukses(false)
      return
    }
    setErrors({})
    setShowBanner(false)
    // Simpan data ke auth context dan arahkan ke halaman target (atau katalog layanan)
    login({ nama: form.nama, wa: form.wa, alamat: form.alamat, jenis: 'umum' })
    navigate(redirect || '/layanan')
  }

  const lanjutTanpaMasuk = () => {
    navigate(redirect || '/layanan')
  }

  if (sukses) {
    return (
      <div className="login__sukses" role="alert">
        <span className="login__sukses-icon" aria-hidden="true">&#10003;</span>
        <h2 className="login__sukses-judul">Data berhasil disimpan!</h2>
        <p className="login__sukses-teks">
          Halo, <strong>{form.nama}</strong>! Anda telah masuk sebagai Pengguna Umum.
          Silakan jelajahi layanan bank sampah di Surabaya.
        </p>
        <p className="login__sukses-note">
          (Catatan: Ini adalah simulasi antarmuka. Data tersimpan di sesi peramban Anda.)
        </p>
        <Button block onClick={() => navigate(redirect || '/layanan')}>
          Lihat Layanan
        </Button>
        <Button
          block
          variant="outline"
          className="login__sukses-ulang"
          onClick={() => { setSukses(false); setForm({ nama: '', wa: '', alamat: '' }) }}
        >
          Kembali ke Form
        </Button>
      </div>
    )
  }

  return (
    <form className="login__form" onSubmit={submit} noValidate>
      {showBanner && (
        <div className="login__banner-error" role="alert" aria-live="assertive">
          <span className="login__banner-icon" aria-hidden="true">!</span>
          Data belum lengkap. Periksa kolom yang ditandai merah.
        </div>
      )}

      <Input
        id="login-nama"
        name="nama"
        label="Nama Lengkap"
        placeholder="Nama sesuai KTP"
        autoComplete="name"
        value={form.nama}
        onChange={ubah}
        error={errors.nama}
      />

      <Input
        id="login-wa"
        name="wa"
        label="Nomor WhatsApp"
        placeholder="Contoh: 081234567890"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={form.wa}
        onChange={ubah}
        error={errors.wa}
      />

      <Input
        id="login-alamat"
        name="alamat"
        label="Alamat"
        placeholder="Jalan, kelurahan, kecamatan"
        autoComplete="street-address"
        value={form.alamat}
        onChange={ubah}
        error={errors.alamat}
      />

      <div className="login__actions">
        <Button type="submit" block>
          Masuk
        </Button>
        <Button
          type="button"
          variant="outline"
          block
          onClick={lanjutTanpaMasuk}
        >
          Lanjut tanpa masuk
        </Button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-komponen: Form Petugas                                           */
/* ------------------------------------------------------------------ */
function FormPetugas() {
  return (
    <div className="login__petugas-info" role="status">
      <div className="login__petugas-icon" aria-hidden="true">&#128296;</div>
      <p className="login__petugas-teks">
        Fitur login petugas belum tersedia. Sistem autentikasi petugas
        memerlukan backend dan kebijakan akses yang belum ditentukan.
        Hubungi administrator untuk informasi lebih lanjut.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Komponen utama: Halaman Login                                        */
/* ------------------------------------------------------------------ */
export default function Login() {
  const [searchParams] = useSearchParams()
  const [jenis, setJenis] = useState('umum') // 'umum' | 'petugas'

  const redirect = searchParams.get('redirect') || '/layanan'
  const pesan = searchParams.get('pesan')

  return (
    <div className="login-page">
      {/* Kolom kiri: panel hijau muda */}
      <aside className="login__panel" aria-label="Informasi SampahPintar">
        <div className="login__panel-content">
          <div className="login__logo" aria-hidden="true">S</div>
          <h1 className="login__tagline">
            Kelola pengajuan sampah dengan lebih teratur.
          </h1>
          <p className="login__desc">
            Masuk untuk meminta penjemputan sampah terpilah, menghubungi pengurus
            bank sampah di Surabaya, dan memantau status pengajuan Anda.
          </p>
        </div>
      </aside>

      {/* Kolom kanan: form */}
      <main className="login__main" id="main-content">
        <div className="login__card">
          {pesan && (
            <div
              style={{
                background: '#fff8eb',
                border: '1px solid #fed7aa',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#9a3412',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              role="alert"
            >
              <span aria-hidden="true">🔒</span>
              <span>{pesan}</span>
            </div>
          )}

          <h2 className="login__title">Masuk ke SampahPintar</h2>
          <p className="login__subtitle">Isi data berikut untuk melanjutkan.</p>

          {/* Pilihan jenis pengguna */}
          <div className="login__tabs" role="group" aria-label="Pilih jenis pengguna">
            <button
              id="tab-umum"
              type="button"
              className={'login__tab' + (jenis === 'umum' ? ' login__tab--active' : '')}
              aria-pressed={jenis === 'umum'}
              onClick={() => setJenis('umum')}
            >
              Pengguna Umum
            </button>
            <button
              id="tab-petugas"
              type="button"
              className={'login__tab' + (jenis === 'petugas' ? ' login__tab--active' : '')}
              aria-pressed={jenis === 'petugas'}
              onClick={() => setJenis('petugas')}
            >
              Petugas
            </button>
          </div>

          {/* Konten form sesuai jenis */}
          {jenis === 'umum' ? <FormPenggunaUmum redirect={redirect} /> : <FormPetugas />}
        </div>
      </main>
    </div>
  )
}
