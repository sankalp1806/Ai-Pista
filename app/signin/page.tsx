'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Github, Chrome, Undo2 } from 'lucide-react'
import Image from 'next/image'

export default function SignIn() {
  const { user, signInWithProvider, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSignIn = async (provider: 'google' | 'github') => {
    try {
      await signInWithProvider(provider)
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Image
              src="/brand.svg"
              alt="AI Pista"
              width={64}
              height={64}
              className="mx-auto rounded-lg"
            />
            <h2 className="mt-6 text-3xl font-bold text-white">
              Sign in to Ai Pista
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Choose your preferred sign-in method
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSignIn('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-zinc-700 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              <Chrome size={20} />
              Continue with Google
            </button>

            <button
              onClick={() => handleSignIn('github')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-zinc-700 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              <Github size={20} />
              Continue with GitHub
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-zinc-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center pb-8">
        <button
          onClick={handleBackToHome}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Undo2 size={16} />
          Back to Home
        </button>
      </div>
    </div>
  )
}

