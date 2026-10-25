import { bankSampah as staticBankSampah } from '../data/bankSampah.js'

export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

/**
 * Mengambil daftar bank sampah dari MockAPI.io (/bank_sampah)
 */
export async function getBankSampah() {
  if (!API_BASE_URL || API_BASE_URL.includes('67xxxxxxxxx')) {
    // Jika user belum mengisi URL MockAPI yang valid, simulasikan fetch atau lempar error
    // jika ingin menguji error state/koneksi
    throw new Error('URL MockAPI belum dikonfigurasi di .env.local atau .env.example')
  }

  const response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/bank_sampah`, {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Gagal mengambil data dari server (HTTP ${response.status})`)
  }

  const data = await response.json()
  return data
}

/**
 * Mengambil satu bank sampah berdasarkan id atau slug
 */
export async function getBankSampahById(id) {
  if (API_BASE_URL && !API_BASE_URL.includes('67xxxxxxxxx')) {
    try {
      const response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/bank_sampah/${id}`)
      if (response.ok) {
        return await response.json()
      }
    } catch {
      // Jika fetch by id gagal (misal id adalah slug string bukan number), cari dari list
      try {
        const list = await getBankSampah()
        const found = list.find((b) => String(b.id) === String(id) || b.slug === id)
        if (found) return found
      } catch {
        // Fallback ke data statis
      }
    }
  }

  // Fallback ke data lokal jika API offline/tidak tersedia
  return staticBankSampah.find((b) => b.id === id || String(b.id) === String(id)) || null
}

/**
 * Mengirim pengajuan baru ke endpoint /pengajuan di MockAPI
 */
export async function postPengajuan(dataPengajuan) {
  if (API_BASE_URL && !API_BASE_URL.includes('67xxxxxxxxx')) {
    try {
      const response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/pengajuan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataPengajuan),
      })
      if (!response.ok) {
        console.warn('Gagal simpan ke MockAPI:', response.statusText)
      } else {
        return await response.json()
      }
    } catch (err) {
      console.warn('Jaringan offline, pengajuan hanya disimpan di localStorage', err)
    }
  }
  return dataPengajuan
}
