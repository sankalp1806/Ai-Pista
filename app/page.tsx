
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import GithubStar from '@/components/app/GithubStar'
import SupportDropdown from '@/components/support-dropdown'
import { Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CustomCrowd } from '@/components/Footer'

export default function StartupSprintLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [avatars, setAvatars] = useState<string[]>([
    'https://pbs.twimg.com/profile_images/1907258802032017408/P_dJGcQ1_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1926037627091755008/dzPn54GG_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1925153197645307904/0paEJX5m_400x400.jpg',
    'https://pbs.twimg.com/profile_images/1920662418704760832/hqkfQwIk_400x400.jpg',
  ])
  const [usersCount, setUsersCount] = useState<number | null>(2670)

  // no email/waitlist form on the landing page

  // Load total users from Supabase (profiles table) and latest avatars
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Initial total users count
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        if (!cancelled && typeof count === 'number') {
          setUsersCount(count)
        }

        // Fetch latest avatars
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .not('avatar_url', 'is', null)
          .order('updated_at', { ascending: false })
          .limit(12)
        if (!error && data && !cancelled) {
          const urls = (data
            .map((d: { avatar_url?: string | null }) => d.avatar_url || '')
            .filter(Boolean) as string[])
          // Merge with defaults, dedupe, cap to 8
          const merged = Array.from(new Set([...urls, ...avatars]))
          setAvatars(merged.slice(0, 8))
        }
      } catch {
        // Silently ignore; keep defaults
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime: keep users count in sync with inserts/deletes
  useEffect(() => {
    try {
      const channel = supabase
        .channel('realtime:profiles-count')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
          setUsersCount((c) => (typeof c === 'number' ? c + 1 : c))
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, () => {
          setUsersCount((c) => (typeof c === 'number' && c > 0 ? c - 1 : c))
        })
        // Updates typically don't change count, but if you soft-delete/restore, re-fetch
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, async () => {
          const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
          if (typeof count === 'number') setUsersCount(count)
        })
        .subscribe()
      return () => {
        try { supabase.removeChannel(channel) } catch {}
      }
    } catch {
      // noop
    }
  }, [])

  return (
    <>
    <div
      className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat overflow-x-hidden no-scrollbar"
      style={{ backgroundImage: "url('https://i.postimg.cc/vHqJkv1Q/Chat-GPT-Image-Aug-24-2025-01-01-36-PM.png')" }}
    >

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 pt-7 relative max-w-7xl mx-auto z-20">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Web_logo.svg" alt="Ai Pista" className="h-10 md:h-12 lg:h-14 w-auto" />
        </div>

        <div className="hidden md:flex items-center gap-8">
        </div>

        <div className="hidden md:flex items-center gap-3">
          <GithubStar owner="sankalp1806" repo="Ai-Pista" theme="dark" />
          <SupportDropdown inline theme={'dark'} />
        </div>

        <button
          className="md:hidden w-10 h-10 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-900/80 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-20">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            className="absolute top-5 right-5 w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
            <Link href="/compare" className="text-white text-2xl hover:text-gray-300 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Compare</Link>
            <div className="flex flex-col items-center gap-3 mt-8 w-64">
              <Link
                href="/compare"
                className="inline-flex w-full items-center justify-center px-6 py-3 rounded-full font-semibold tracking-wide bg-red-600 text-white hover:bg-red-500 transition-colors shadow"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Compare Models
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 relative z-10">

        {/* Main Heading */}
        <div className="text-center mb-8 ">
          <h1 className="text-3xl md:text-8xl font-semibold tracking-tight text-white mb-2">Why Choose Only 6 AI</h1>
          <h2 className="text-3xl md:text-8xl font-semibold tracking-tight text-white/80">When You Can Command Them All?</h2>
        </div>

        {/* Subtext */}
        <p className="text-white/50 text-lg md:text-2xl text-center tracking-tight max-w-2xl mb-12">
          Yeah you guess it right
          <br />
          We are better than that AI Pasta
        </p>

        {/* Primary CTAs */}
        <div className="w-full max-w-md">
          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full">
            <Link
              href="/compare"
              className="inline-flex items-center justify-center w-full sm:w-auto sm:min-w-[170px] px-6 py-3 rounded-full font-semibold tracking-wide bg-red-600 text-white hover:bg-red-500 transition-colors shadow"
            >
              Compare Models
            </Link>
          </div>
        </div>


        {/* Social + Creator avatar */}
        <div className="flex items-center gap-3 mt-8">
          {/* Creator avatar only */}
          <a
            href="https://x.com/byteHumi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sankalp on X"
            className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-white/30 transition-all"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Sankalp" className="w-full h-full object-cover" />
          </a>

          {/* Social icons */}
          <a
            href="https://x.com/byteHumi"
             target="_blank"
            className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-gray-900/80 transition-colors"
          >
            <img src="https://i.postimg.cc/HLTCxTsr/twitter.png" className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/sankalp1806/"
             target="_blank"
            className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-gray-900/80 transition-colors"
          >
            <img src="https://i.postimg.cc/1XRcSWrf/icons8-github-1500.png" className="w-5 h-5 " />
          </a>
        </div>

        {/* Backed by Runable badge */}
        <div className="mt-6 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3 border border-white/20">
            <span className="text-white/80 text-sm font-medium">Backed by</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">Sankalp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Large AI PISTA text with reflection */}
    <div className="bg-black py-8 md:py-16 overflow-hidden relative">
      {/* Background reflection */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "url('https://i.postimg.cc/vHqJkv1Q/Chat-GPT-Image-Aug-24-2025-01-01-36-PM.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom', // Use bottom part for reflection
          transform: 'scaleY(-1)', // Flip vertically
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)'
        }}
      />
      {/* Marquee with text */}
      <div className="animate-marquee whitespace-nowrap flex relative z-10">
        <h1
          className="text-[clamp(2.25rem,18vw,20rem)] text-white uppercase tracking-[0.06em] leading-none select-none"
          style={{ fontFamily: 'Impact, "Arial Black", "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Bold", sans-serif', fontWeight: 900, fontStretch: 'condensed' }}
        >
          &nbsp;AI PISTA&nbsp;
        </h1>
        <h1
          className="text-[clamp(2.25rem,18vw,20rem)] text-white uppercase tracking-[0.06em] leading-none select-none"
          style={{ fontFamily: 'Impact, "Arial Black", "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Bold", sans-serif', fontWeight: 900, fontStretch: 'condensed' }}
        >
          &nbsp;AI PISTA&nbsp;
        </h1>
      </div>
    </div>
    </>
  )
}
