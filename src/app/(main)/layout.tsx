import { Suspense } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { RouteEffects } from "@/components/RouteEffects"
import { RouteScrollShell } from "@/components/RouteScrollShell"
import { ChatProvider } from "@/contexts/ChatContext"
import { NotificationProvider } from "@/contexts/NotificationContext"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const currentYear = new Date().getFullYear()

  return (
    <>
      {/* ============================================
        FIXED BACKGROUNDS - Outside the scroll shell
        These use position: fixed and must stay outside the Lenis root
        ============================================ */}

      {/* Global waves background (z-index: -1) */}
      <div className="waves-background" aria-hidden="true" />

      <ChatProvider>
        <NotificationProvider>
          {/* Route-scoped fixed effects (z-index handled by components) */}
          <Suspense fallback={null}>
            <RouteEffects />
          </Suspense>

          {/* Header - Fixed for accessibility */}
          <Header />

          {/* Lenis scroll shell keeps motion smooth without ScrollSmoother's heavy wrapper */}
          <RouteScrollShell>
            <main className="min-h-screen">{children}</main>
            <Footer currentYear={currentYear} />
          </RouteScrollShell>
        </NotificationProvider>
      </ChatProvider>
    </>
  )
}
