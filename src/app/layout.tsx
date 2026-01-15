import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Chatbot } from "@/components/Chatbot"
import StyledComponentsRegistry from "@/lib/registry"
import SmoothScrollProvider from "@/components/SmoothScrollProvider"
import ScrollFrameAnimation from "@/components/ScrollFrameAnimation"
import AmbientParticles from "@/components/ui/AmbientParticles"

const inter = Inter({ subsets: ["latin", "greek"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://aerofren.gr"),
  title: {
    default: "AEROFREN – Εξαρτήματα Νερού & Αέρα | B2B Προμηθευτής",
    template: "%s | AEROFREN",
  },
  description:
    "Ο αποκλειστικός B2B συνεργάτης του επαγγελματία σε εξαρτήματα νερού, φίλτρανσης και πνευματικών συστημάτων. 35+ χρόνια εμπειρίας, 10.000+ προϊόντα. Μοσχάτο, Αθήνα.",
  keywords: [
    "εξαρτήματα νερού",
    "φίλτρα νερού",
    "πνευματικά εργαλεία",
    "ρακόρ",
    "βαλβίδες",
    "σωλήνες",
    "ταχυσύνδεσμοι",
    "B2B",
    "χονδρική",
    "Μοσχάτο",
    "Αθήνα",
    "AEROFREN",
  ],
  authors: [{ name: "AEROFREN" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AEROFREN – Εξαρτήματα Νερού & Αέρα",
    description: "Ο κορυφαίος B2B προμηθευτής εξαρτημάτων νερού και αέρα στην Ελλάδα. 35+ χρόνια εμπειρίας.",
    url: "https://aerofren.gr",
    siteName: "AEROFREN",
    locale: "el_GR",
    type: "website",
    images: [
      {
        url: "/images/hero-fittings.jpg",
        width: 1200,
        height: 630,
        alt: "AEROFREN - Εξαρτήματα Νερού & Αέρα",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AEROFREN – Εξαρτήματα Νερού & Αέρα",
    description: "Ο κορυφαίος B2B προμηθευτής εξαρτημάτων νερού και αέρα στην Ελλάδα.",
    images: ["/images/hero-fittings.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="el">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          {/* ============================================
              FIXED BACKGROUNDS - Outside smooth scroll
              These use position: fixed and must be outside SmoothScrollProvider
              ============================================ */}

          {/* Global waves background (z-index: -1) */}
          <div className="waves-background" aria-hidden="true" />

          {/* Scroll-controlled frame animation (z-index: 0) */}
          <ScrollFrameAnimation />

          {/* Ambient floating particles (z-index: -1) */}
          <AmbientParticles />

          {/* Header - Fixed for accessibility */}
          <Header />

          {/* ScrollSmoother wrapper for buttery smooth scrolling */}
          <SmoothScrollProvider>
            <main className="pt-[100px] min-h-screen">{children}</main>
            <Footer />
          </SmoothScrollProvider>

          {/* Chatbot - Fixed position, outside smooth scroll */}
          <Chatbot />
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}


