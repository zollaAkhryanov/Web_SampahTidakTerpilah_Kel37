import { bankSampah as staticBankSampah } from '../data/bankSampah.js'

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim()

/**
 * Membersihkan dan melengkapi baseUrl
 * Jika user hanya memasukkan ID proyek (misal: 6ade29f74e88f1bba4a4fd3a), otomatis dijadikan full URL MockAPI
 */
function cleanBase(url) {
  let u = (url || '').trim().replace(/\/+$/, '')

  // Jika user hanya memasukkan ID proyek (24 karakter hex tanpa https:// dan tanpa .mockapi.io)
  if (/^[a-f0-9]{24}$/i.test(u)) {
    u = `https://${u}.mockapi.io`
  } else if (!u.startsWith('http://') && !u.startsWith('https://')) {
    if (u.includes('.mockapi.io')) {
      u = `https://${u}`
    } else if (u.startsWith('6ade') || u.length >= 20) {
      u = `https://${u}.mockapi.io`
    }
  }

  u = u.replace(/\/bank_sampah\/?$/i, '')
  u = u.replace(/\/banksampah\/?$/i, '')
  u = u.replace(/\/bank-sampah\/?$/i, '')
  return u
}

/**
 * Mengambil daftar bank sampah dari MockAPI.io
 * Cerdas menangani variasi URL (dengan atau tanpa /api/v1, atau jika user menyalin URL resource langsung)
 */
export async function getBankSampah() {
  if (!API_BASE_URL || API_BASE_URL.includes('67xxxxxxxxx')) {
    throw new Error('URL MockAPI belum dikonfigurasi di .env.local atau variabel lingkungan.')
  }

  const base = cleanBase(API_BASE_URL)

  // Buat kandidat endpoint yang mungkin
  const candidates = [
    `${base}/bank_sampah`,
  ]

  // Jika URL mengandung /api/v1, siapkan kandidat tanpa /api/v1
  if (base.includes('/api/v1')) {
    candidates.push(`${base.replace('/api/v1', '')}/bank_sampah`)
  } else {
    // Jika tidak mengandung /api/v1, siapkan kandidat dengan /api/v1
    candidates.push(`${base}/api/v1/bank_sampah`)
  }

  // Tambahkan variasi penamaan resource (tanpa underscore atau dengan dash)
  candidates.push(`${base}/banksampah`)
  candidates.push(`${base}/bank-sampah`)

  let lastStatus = 404
  let lastUrl = candidates[0]

  for (const url of candidates) {
    try {
      lastUrl = url
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          return data
        }
      } else {
        lastStatus = res.status
      }
    } catch {
      // Coba kandidat berikutnya
    }
  }

  throw new Error(`Gagal mengambil data dari server (HTTP ${lastStatus}). Endpoint yang dicoba: ${lastUrl}`)
}

/**
 * Mengambil satu bank sampah berdasarkan id atau slug
 */
export async function getBankSampahById(id) {
  if (API_BASE_URL && !API_BASE_URL.includes('67xxxxxxxxx')) {
    const base = cleanBase(API_BASE_URL)
    const candidates = [
      `${base}/bank_sampah/${id}`,
      base.includes('/api/v1') ? `${base.replace('/api/v1', '')}/bank_sampah/${id}` : `${base}/api/v1/bank_sampah/${id}`
    ]

    for (const url of candidates) {
      try {
        const res = await fetch(url)
        if (res.ok) {
          return await res.json()
        }
      } catch {
        // Coba kandidat berikutnya
      }
    }

    // Jika gagal by id langsung, coba ambil seluruh list lalu filter
    try {
      const list = await getBankSampah()
      const found = list.find((b) => String(b.id) === String(id) || b.slug === id)
      if (found) return found
    } catch {
      // Fallback
    }
  }

  // Fallback ke data statis lokal jika offline
  return staticBankSampah.find((b) => b.id === id || String(b.id) === String(id)) || null
}

/**
 * Mengirim pengajuan baru ke endpoint /pengajuan di MockAPI.
 * Mengembalikan data yang tersimpan (termasuk `id` dari server).
 * Melempar Error jika gagal, supaya UI bisa menampilkan pesan error (bukan sukses palsu).
 */
export async function postPengajuan(dataPengajuan) {
  if (!API_BASE_URL || API_BASE_URL.includes('67xxxxxxxxx')) {
    throw new Error('Alamat API belum dikonfigurasi (VITE_API_URL).')
  }

  const base = cleanBase(API_BASE_URL)
  const candidates = [
    `${base}/pengajuan`,
    base.includes('/api/v1')
      ? `${base.replace('/api/v1', '')}/pengajuan`
      : `${base}/api/v1/pengajuan`,
  ]

  let lastStatus = 0
  for (const url of candidates) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(dataPengajuan),
        signal: controller.signal,
      })
      if (res.ok) {
        return await res.json()
      }
      lastStatus = res.status
    } catch {
      // Jaringan putus / timeout: coba kandidat berikutnya
    } finally {
      clearTimeout(timer)
    }
  }

  throw new Error(
    lastStatus
      ? `Server menolak pengajuan (HTTP ${lastStatus}).`
      : 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
  )
}
