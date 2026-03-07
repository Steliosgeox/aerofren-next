import { Header } from "@/components/Header"
import LenisProvider from "@/components/LenisProvider"

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {/*
        Lenis enabled here for the cinematic SVG thread effect.
        The new AboutCinematicPage uses GSAP ScrollTrigger (not CSS
        Scroll-Driven Animations), so Lenis is safe and desirable.
      */}
      <LenisProvider>
        <main style={{ minHeight: '100vh' }}>
          {children}
        </main>
      </LenisProvider>
    </>
  )
}
