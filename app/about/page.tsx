import type { Metadata } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import Script from "next/script"
import Link from "next/link"
import { Sparkles } from "lucide-react"

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "About — Ai Pista",
  description:
    "Learn about Ai Pista, the AI chat that lets you compare 300+ models in one place. Built by Niladri Hazra.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Ai Pista",
    description:
      "Learn about Ai Pista, the AI chat that lets you compare 300+ models in one place.",
    url: "https://aipista.app/about",
    siteName: "Ai Pista",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ai Pista" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — AI Pista",
    description:
      "Learn about Ai Pista, the AI chat that lets you compare 300+ models in one place.",
    images: ["/og.png"],
  },
}

export default function AboutPage() {
  return (
    <main className={`relative min-h-screen overflow-hidden bg-[#0a0a0a] pb-24 ${ibmMono.className}`}>
      {/* Breadcrumbs JSON-LD for richer SERP */}
      <Script id="about-breadcrumbs" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://aipista.app/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "About",
              item: "https://aipista.app/about",
            },
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
          <span>About</span>
        </p>

        {/* Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/10 p-3 rounded-lg border border-white/10">
            <Sparkles className="w-6 h-6 text-zinc-100" />
          </div>
          <h1 className="text-zinc-100 text-3xl sm:text-4xl md:text-5xl leading-tight">
            AI Pista
          </h1>
        </div>
        <p className="text-zinc-300/90 text-sm sm:text-base leading-relaxed max-w-3xl">
          Chat with and compare <span className="font-semibold text-zinc-100">300+ AI models</span> — OpenAI, Claude,
          Gemini, Perplexity, DeepSeek, Grok, and more — side‑by‑side in one place.
          Built for creators, builders, and teams who want faster, clearer answers.
        </p>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />

        {/* Founder */}
        <h2 className="text-[11px] tracking-[0.22em] uppercase text-zinc-400 mb-3">Built by Niladri Hazra</h2>
        <p className="text-zinc-300/90 text-sm sm:text-base leading-relaxed max-w-3xl mb-4">
          Hi, I’m Niladri. I’m building Ai Pista to make multi‑model workflows simple and fast.
          Follow along on X and GitHub, and feel free to reach out.
        </p>

        {/* Contacts */}
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
          <li>
            <a
              className="inline-flex w-full items-center justify-between rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 transition"
              href="https://x.com/byteHumi" target="_blank" rel="noreferrer"
            >
              X / @byteHumi <span className="text-zinc-500">↗</span>
            </a>
          </li>
          <li>
            <a
              className="inline-flex w-full items-center justify-between rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 transition"
              href="https://github.com/sankalp1806/Ai-Pista" target="_blank" rel="noreferrer"
            >
              GitHub <span className="text-zinc-500">↗</span>
            </a>
          </li>
          <li>
            <a
              className="inline-flex w-full items-center justify-between rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900 hover:border-zinc-700 transition"
              href="mailto:niladrivit@gmail.com"
            >
              Email
            </a>
          </li>
        </ul>

        {/* Features */}
        <div className="mt-12">
          <h2 className="text-[11px] tracking-[0.22em] uppercase text-zinc-400 mb-3">What makes Ai Pista different</h2>
          <ul className="space-y-2 text-zinc-300/90 text-sm sm:text-base">
            <li className="flex gap-3"><span className="text-zinc-500">→</span> Compare answers from multiple models in a single view</li>
            <li className="flex gap-3"><span className="text-zinc-500">→</span> Organize by projects; keep context flowing</li>
            <li className="flex gap-3"><span className="text-zinc-500">→</span> Works with OpenRouter, Gemini, and more providers</li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-[11px] tracking-[0.22em] uppercase text-zinc-400 mb-3">FAQ</h2>
          <div className="space-y-6 text-zinc-300/90 text-sm sm:text-base">
            <div>
              <p className="text-zinc-200 mb-1">What is Ai Pista?</p>
              <p>Ai Pista is an AI chat app that lets you compare responses from <strong>300+ models</strong> in one UI.</p>
            </div>
            <div>
              <p className="text-zinc-200 mb-1">Is Ai Pista free?</p>
              <p>There’s a free experience with limitations. You can connect your own API keys for full power and control.</p>
            </div>
            <div>
              <p className="text-zinc-200 mb-1">Which models are supported?</p>
              <p>OpenAI, Claude, Gemini, Perplexity, DeepSeek, Grok, and many more via OpenRouter and native providers.</p>
            </div>
            <div>
              <p className="text-zinc-200 mb-1">How is it different from a single-model chat?</p>
              <p>It’s built for side‑by‑side comparison, fast iteration, and project organization—so you can pick the best answer quickly.</p>
            </div>
            <div>
              <p className="text-zinc-200 mb-1">Who built Ai Pista?</p>
              <p>Ai Pista is built by Niladri Hazra. See the contact links above or our <a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="/press">Press</a> page.</p>
            </div>
          </div>
        </div>

        {/* FAQ JSON-LD */}
        <Script id="about-faq" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is Ai Pista?",
                acceptedAnswer: { "@type": "Answer", text: "Ai Pista is an AI chat app that lets you compare responses from 300+ models in one UI." }
              },
              {
                "@type": "Question",
                name: "Is Ai Pista free?",
                acceptedAnswer: { "@type": "Answer", text: "There’s a free experience with limitations. You can connect your own API keys for full power and control." }
              },
              {
                "@type": "Question",
                name: "Which models are supported?",
                acceptedAnswer: { "@type": "Answer", text: "OpenAI, Claude, Gemini, Perplexity, DeepSeek, Grok, and many more via OpenRouter and native providers." }
              },
              {
                "@type": "Question",
                name: "How is it different from a single-model chat?",
                acceptedAnswer: { "@type": "Answer", text: "It’s built for side-by-side comparison, fast iteration, and project organization—so you can pick the best answer quickly." }
              },
              {
                "@type": "Question",
                name: "Who built Ai Pista?",
                acceptedAnswer: { "@type": "Answer", text: "Ai Pista is built by Niladri Hazra. See the contact links on the About page or the Press page for more." }
              }
            ]
          })}
        </Script>

        {/* Press */}
        <div className="mt-12">
          <h2 className="text-[11px] tracking-[0.22em] uppercase text-zinc-400 mb-3">Press & media</h2>
          <p className="text-zinc-300/90 text-sm sm:text-base">
            Looking to cover Ai Pista? See our <a className="underline decoration-zinc-600 hover:decoration-zinc-400" href="/press">Press</a> page for brand assets and a short boilerplate.
          </p>
        </div>
      </section>
    </main>
  )
}
