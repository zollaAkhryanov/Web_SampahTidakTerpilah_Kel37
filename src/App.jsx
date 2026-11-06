import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'

// Halaman Beranda diimpor langsung agar render awal (FCP & LCP) instan tanpa request waterfall sekunder
import Beranda from './pages/Beranda.jsx'

// Lazy loading untuk halaman-halaman yang tidak dibutuhkan di tampilan awal
const Login = lazy(() => import('./pages/Login.jsx'))
const Layanan = lazy(() => import('./pages/Layanan.jsx'))
const Detail = lazy(() => import('./pages/Detail.jsx'))
const Ajukan = lazy(() => import('./pages/Ajukan.jsx'))
const Tentang = lazy(() => import('./pages/Tentang.jsx'))

// Fallback pemuat ringan tanpa layout shift
function FallbackPemuat() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat konten..."
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--muted)',
        fontSize: '0.875rem'
      }}
    >
      <span>Memuat...</span>
    </div>
  )
}

// Rute yang tidak menampilkan Navbar
const RUTE_TANPA_NAVBAR = ['/masuk']

function AppShell() {
  const { pathname } = useLocation()
  const tampilkanNavbar = !RUTE_TANPA_NAVBAR.includes(pathname)

  return (
    <>
      {tampilkanNavbar && <Navbar />}
      <Suspense fallback={<FallbackPemuat />}>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/masuk" element={<Login />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/layanan/:id" element={<Detail />} />
          <Route path="/ajukan/:id" element={<Ajukan />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="*" element={<Beranda />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
