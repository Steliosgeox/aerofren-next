import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Chatbot } from "@/components/Chatbot"
import { BackToTop } from "@/components/BackToTop"
import SmoothScrollProvider from "@/components/SmoothScrollProvider"
import ScrollFrameAnimation from "@/components/ScrollFrameAnimation"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* ============================================
        FIXED BACKGROUNDS - Outside smooth scroll
        These use position: fixed and must be outside SmoothScrollProvider
        ============================================ */}

      {/* Global waves background (z-index: -1) */}
      <div className="waves-background" aria-hidden="true" />

      {/* Scroll-controlled frame animation (z-index: 0) */}
      <ScrollFrameAnimation />

      {/* Header - Fixed for accessibility */}
      <Header />

      {/* ScrollSmoother wrapper for buttery smooth scrolling */}
      <SmoothScrollProvider>
        <main className="min-h-screen">{children}</main>
        <Footer />
      </SmoothScrollProvider>

      {/* Chatbot - Fixed position, outside smooth scroll */}
      <Chatbot />

      {/* Back to Top - Fixed position, centered, outside smooth scroll */}
      <BackToTop />
    </>
  )
}
