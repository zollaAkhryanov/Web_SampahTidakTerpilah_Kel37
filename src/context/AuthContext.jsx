import { createContext, useContext, useState, useCallback } from 'react'

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */
const AuthContext = createContext(null)

/* ------------------------------------------------------------------ */
/* Provider                                                             */
/* ------------------------------------------------------------------ */
export function AuthProvider({ children }) {
  // Baca state awal dari localStorage (agar tetap login setelah refresh)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('sp_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // Login: simpan data ke state + localStorage
  const login = useCallback((data) => {
    localStorage.setItem('sp_user', JSON.stringify(data))
    setUser(data)
  }, [])

  // Logout: hapus data
  const logout = useCallback(() => {
    localStorage.removeItem('sp_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return ctx
}
