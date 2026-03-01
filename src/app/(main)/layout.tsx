import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { RouteEffects } from "@/components/RouteEffects"
import { RouteScrollShell } from "@/components/RouteScrollShell"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const currentYear = new Date().getFullYear()

  return (
    <>
      {/* ============================================
        FIXED BACKGROUNDS - Outside smooth scroll
        These use position: fixed and must be outside SmoothScrollProvider
        ============================================ */}

      {/* Global waves background (z-index: -1) */}
      <div className="waves-background" aria-hidden="true" />

      {/* Route-scoped fixed effects (z-index handled by components) */}
      <RouteEffects />

      {/* Header - Fixed for accessibility */}
      <Header />

      {/* ScrollSmoother wrapper for buttery smooth scrolling */}
      <RouteScrollShell>
        <main className="min-h-screen">{children}</main>
        <Footer currentYear={currentYear} />
      </RouteScrollShell>
    </>
  )
}
