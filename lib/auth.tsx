'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Dev-only bypass: pretend authenticated
  const BYPASS = process.env.NEXT_PUBLIC_BYPASS_AUTH === '1' && process.env.NODE_ENV !== 'production'

  useEffect(() => {
    setLoading(true)
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000001',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'dev@local',
      phone: '',
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: { provider: 'bypass', providers: ['bypass'] },
      user_metadata: { name: 'Dev User' },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_anonymous: false,
    } as unknown as User

    setUser(BYPASS ? mockUser : null)
    setSession(null)
    setLoading(false)
  }, [BYPASS])

  const signInWithProvider = async (provider: 'google' | 'github') => {
    if (BYPASS) return;
    console.warn(`[Auth] signInWithProvider(${provider}) called but Supabase is removed.`)
  }

  const signOut = async () => {
    if (BYPASS) return;
    console.warn('[Auth] signOut called but Supabase is removed.')
  }

  const value = {
    user,
    session,
    loading,
    signInWithProvider,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
