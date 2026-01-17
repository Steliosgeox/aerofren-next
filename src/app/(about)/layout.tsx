import { Header } from "@/components/Header"

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {/*
        NO SmoothScrollProvider:
        This layout enables native browser scrolling, which is required
        for CSS Scroll-Driven Animations (animation-timeline: scroll/view)
      */}
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
    </>
  )
}
