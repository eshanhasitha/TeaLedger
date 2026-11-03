import { createContext, useCallback, useState, type ReactNode } from 'react'
import { SESSION_KEY } from '../utils/constants'

export interface Session {
  name: string
  phone: string
  role: 'Admin'
  signedInAt: string
}

interface Api {
  user: Session | null
  signIn: (phone: string) => Promise<void>
  signOut: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<Api | null>(null)

const read = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

/**
 * Demo-mode auth: keeps a local session so the UI is fully navigable without the API.
 * Swap signIn for authService.login() once the backend endpoint is wired.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(read)

  const signIn = useCallback(async (phone: string) => {
    await new Promise((r) => setTimeout(r, 650))
    const s: Session = { name: 'Estate Admin', phone, role: 'Admin', signedInAt: new Date().toISOString() }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    } catch {
      /* ignore */
    }
    setUser(s)
  }, [])

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}
