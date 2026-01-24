import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import localFont from "next/font/local"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import StyledComponentsRegistry from "@/lib/registry"
import { AuthWrapper } from "@/components/AuthWrapper"
import ErrorBoundary from "@/components/ui/ErrorBoundary"
import FpsOverlay from "@/components/FpsOverlay"
import PageVisibilityHandler from "@/components/PageVisibilityHandler"

const ttNorms = localFont({
  src: "../fonts/TTNormsProVariable.ttf",
  variable: "--font-tt-norms",
  display: "swap",
})

const ttNormsMono = localFont({
  src: "../fonts/TTNormsProMonoVariable.ttf",
  variable: "--font-tt-norms-mono",
  display: "swap",
})

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const nonce = (await headers()).get("x-nonce")
  const perfNoBlur = process.env.NEXT_PUBLIC_PERF_NO_BLUR === "1"
  return (
    <html lang="el" suppressHydrationWarning>
      <body
        className={`${ttNorms.variable} ${ttNormsMono.variable} ${ttNorms.className} ${perfNoBlur ? "perf-no-blur" : ""}`}
        suppressHydrationWarning
      >
        {nonce ? (
          <Script id="webpack-nonce" strategy="beforeInteractive" nonce={nonce}>
            {`window.__webpack_nonce__ = ${JSON.stringify(nonce)};`}
          </Script>
        ) : null}
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          themes={["dark", "dim", "light"]}
        >
          <ErrorBoundary>
            <AuthWrapper>
              <StyledComponentsRegistry nonce={nonce}>
                {children}
                <FpsOverlay />
                <PageVisibilityHandler />
              </StyledComponentsRegistry>
            </AuthWrapper>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
