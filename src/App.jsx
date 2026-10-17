import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Beranda from './pages/Beranda.jsx'
import Login from './pages/Login.jsx'

// Halaman lain ditambahkan per tahap (Katalog, Detail, Form, Sukses).
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

export default function App() {
  const { pathname } = useLocation()
  const tampilkanNavbar = !RUTE_TANPA_NAVBAR.includes(pathname)

  return (
    <>
      {tampilkanNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/layanan" element={<Segera judul="Layanan" />} />
        <Route path="/tentang" element={<Segera judul="Tentang" />} />
      </Routes>
    </>
  )
}
