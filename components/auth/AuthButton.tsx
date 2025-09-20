'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/themeContext'
import { BACKGROUND_STYLES } from '@/lib/themes'
import LogoutButton from '@/components/auth/LogoutButton'
import UserProfileButton from '@/components/auth/UserProfileButton'

export default function AuthButton() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = BACKGROUND_STYLES[theme.background]?.className?.includes('dark') || false
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    (user?.user_metadata?.user_name as string | undefined) ||
    user?.email ||
    'User'
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined) ||
    undefined
  const initials = displayName?.trim()?.charAt(0)?.toUpperCase() || 'U'
  const firstName = (displayName || '').split(' ').filter(Boolean)[0] || displayName

  const handleSignIn = () => {
    router.push('/signin')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-12 rounded-xl bg-gradient-to-r from-white/8 to-white/4 border border-white/15 backdrop-blur-sm flex items-center justify-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
        <span className="text-sm font-medium text-white/70">Loading...</span>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 w-full">
        <UserProfileButton
          avatarUrl={avatarUrl}
          initials={initials}
          displayName={displayName}
          firstName={firstName}
          className="flex-1 min-w-0"
        />
        <LogoutButton onClick={handleSignOut} />
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      className="w-full h-12 rounded-xl bg-gradient-to-r from-white/8 to-white/4 border border-white/15 backdrop-blur-sm hover:from-white/12 hover:to-white/6 hover:border-white/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg"
    >
      <LogIn className="h-4 w-4 text-white/80" />
      <span className="text-sm font-medium text-white/90">Sign In</span>
    </button>
  )
}
