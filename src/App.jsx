import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Beranda from './pages/Beranda.jsx'
import Login from './pages/Login.jsx'
import Layanan from './pages/Layanan.jsx'
import Detail from './pages/Detail.jsx'

// Halaman lain ditambahkan per tahap (Detail, Form, Sukses).
function Segera({ judul }) {
  return (
    <main className="container page-pad">
      <h1 className="h1">{judul}</h1>
      <p className="muted">Halaman ini dibuat pada tahap berikutnya.</p>
    </main>
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
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/layanan" element={<Layanan />} />
        <Route path="/layanan/:id" element={<Detail />} />
        <Route path="/tentang" element={<Segera judul="Tentang" />} />
      </Routes>
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

