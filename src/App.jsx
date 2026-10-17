import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Beranda from './pages/Beranda.jsx'

// Halaman lain ditambahkan per tahap (Login, Katalog, Detail, Form, Sukses).
function Segera({ judul }) {
  return (
    <main className="container page-pad">
      <h1 className="h1">{judul}</h1>
      <p className="muted">Halaman ini dibuat pada tahap berikutnya.</p>
    </main>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/masuk" element={<Segera judul="Masuk" />} />
        <Route path="/layanan" element={<Segera judul="Layanan" />} />
        <Route path="/tentang" element={<Segera judul="Tentang" />} />
      </Routes>
    </>
  )
}
