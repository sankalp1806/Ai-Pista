import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compare AI Models — Open Fiesta",
  description:
    "Side-by-side compare answers from 300+ AI models (OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more) in one place.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare AI Models — Open Fiesta",
    description:
      "Side-by-side compare answers from 300+ AI models (OpenAI, Gemini, Claude, Perplexity, DeepSeek, Grok, and more) in one place.",
    url: "https://openfiesta.app/compare",
    images: [
      { url: "/brand.png", width: 1200, height: 630, alt: "Open Fiesta" },
    ],
  },
  twitter: {
    title: "Compare AI Models — Open Fiesta",
    description:
      "Side-by-side compare answers from 300+ AI models in one place.",
    images: ["/brand.png"],
    card: "summary_large_image",
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}
