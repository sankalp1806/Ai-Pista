import type { Metadata } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import Script from "next/script"
import Link from "next/link"

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Press — Ai Pista",
  description: "Press kit, logos, and boilerplate for Ai Pista.",
  alternates: { canonical: "/press" },
  openGraph: {
    title: "Press — Ai Pista",
    description: "Press kit, logos, and boilerplate for Ai Pista.",
    url: "https://aipista.app/press",
    siteName: "Ai Pista",
    images: [{ url: "https://aipista.app/og.png", width: 1200, height: 630, alt: "Ai Pista" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Press — Ai Pista",
    description: "Press kit, logos, and boilerplate for Ai Pista.",
    images: ["https://aipista.app/og.png"],
  },
}

export default function PressPage() {
  return (
    <main className={`relative min-h-screen overflow-hidden bg-[#0a0a0a] pb-24 ${ibmMono.className}`}>
      {/* Breadcrumbs JSON-LD for richer SERP */}
      <Script id="press-breadcrumbs" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://aipista.app/" },
            { "@type": "ListItem", position: 2, name: "Press", item: "https://aipista.app/press" },
          ],
        })}
      </Script>

      {/* Background vignette / gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_120%,rgba(244,63,94,0.18)_0%,rgba(244,63,94,0.06)_35%,transparent_70%)]" />

      <section className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8 sm:py-16 md:py-20">
        {/* Page label + Home breadcrumb */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-6">
          <Link href="/" className="hover:text-zinc-200 transition underline underline-offset-4 decoration-zinc-700/60 hover:decoration-zinc-400">Home</Link>
          <span className="mx-2 text-zinc-600">/</span>
          <span>Press</span>
        </p>

        {/* Title */}
        <h1 className="text-zinc-100 text-3xl sm:text-4xl md:text-5xl leading-tight mb-4">AI Pista Press Kit</h1>
        <p className="text-zinc-300/90 text-sm sm:text-base leading-relaxed max-w-3xl">
          AI Pista lets you chat with and compare <span className="font-semibold text-zinc-100">300+ AI models</span> — OpenAI, Claude,
          Gemini, Perplexity, DeepSeek, Grok, and more — side‑by‑side in one place.
        </p>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />

        {/* Boilerplate */}
        <h2 className="text-[11px] tracking-[0.22em] uppercase text-zinc-400 mb-3">Boilerplate</h2>
        <p className="text-zinc-300/90 text-sm sm:text-base leading-relaxed max-w-3xl">
          AI Pista is an elegant, fast AI chat assistant that makes it easy to compare responses
          across 300+ models in one interface, so you can think, write, and build faster.
          Learn more at <a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="https://aipista.app" target="_blank" rel="noreferrer">aipista.app</a>.
        </p>

        {/* Assets */}
        <div className="mt-10">
          <h2 className="text-[11px] tracking-[0.22em] uppercase text-zinc-400 mb-3">Brand assets</h2>
          <ul className="space-y-2 text-zinc-300/90 text-sm sm:text-base">
            <li><a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="/brand.svg" download>Logo (SVG)</a></li>
            <li><a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="/brand.png" download>Social image (PNG, 1200×630)</a></li>
            <li><a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="/Web_logo.svg" download>App mark (SVG, dark)</a></li>
            <li><a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="/Web_logo_light.svg" download>App mark (SVG, light)</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="mt-10">
          <h2 className="text-[11px] tracking-[0.22em] uppercase text-zinc-400 mb-3">Contact</h2>
          <ul className="space-y-2 text-zinc-300/90 text-sm sm:text-base">
            <li>Email: <a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="mailto:press@aipista.app">press@aipista.app</a></li>
            <li>Portfolio: <a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="https://sankalp-portfolio.framer.website/" target="_blank" rel="noreferrer">sankalp-portfolio.framer.website/</a></li>
          </ul>
        </div>
      </section>
    </main>
  )
}
