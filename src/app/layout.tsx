import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import localFont from "next/font/local"
import { Playfair_Display, DM_Sans } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import StyledComponentsRegistry from "@/lib/registry"
import { AuthWrapper } from "@/components/AuthWrapper"
import ErrorBoundary from "@/components/ui/ErrorBoundary"
import FpsOverlay from "@/components/FpsOverlay"
import PageVisibilityHandler from "@/components/PageVisibilityHandler"
import { CookieConsentProvider } from "@/components/cookies/CookieConsentProvider"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { OrganizationSchema } from "@/lib/schema/OrganizationSchema"
import { WebsiteSchema } from "@/lib/schema/WebsiteSchema"
import {
  BUSINESS_ADDRESS_CITY_LINE_EL,
  BUSINESS_NAME,
  FOUNDING_LABEL_EL,
  PRODUCT_COUNT,
  SITE_URL,
} from "@/lib/constants/aerofren"

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

// Cinematic editorial serif — Greek + Latin — used on the About/video pages
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
})

// Clean humanist sans — Latin-ext — used as body on the About/video pages
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS_NAME} – Εξαρτήματα Νερού & Αέρα | B2B Προμηθευτής`,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description:
    `Ο αποκλειστικός B2B συνεργάτης του επαγγελματία σε εξαρτήματα νερού, φίλτρανσης και πνευματικών συστημάτων. ${FOUNDING_LABEL_EL}, ${PRODUCT_COUNT} προϊόντα. ${BUSINESS_ADDRESS_CITY_LINE_EL}.`,
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    title: `${BUSINESS_NAME} – Εξαρτήματα Νερού & Αέρα`,
    description: `Ο κορυφαίος B2B προμηθευτής εξαρτημάτων νερού και αέρα στην Ελλάδα. ${FOUNDING_LABEL_EL}.`,
    url: SITE_URL,
    siteName: BUSINESS_NAME,
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
    title: `${BUSINESS_NAME} – Εξαρτήματα Νερού & Αέρα`,
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
  // Glass stays enabled by default. Set NEXT_PUBLIC_PERF_NO_BLUR=1 to force solid fallbacks.
  const perfNoBlur = process.env.NEXT_PUBLIC_PERF_NO_BLUR === "1"
  return (
    <html lang="el" suppressHydrationWarning>
      <body
        className={`${ttNorms.variable} ${ttNormsMono.variable} ${playfair.variable} ${dmSans.variable} ${ttNorms.className} ${perfNoBlur ? "perf-no-blur" : ""}`}
        suppressHydrationWarning
      >
        {nonce ? (
          <Script id="webpack-nonce" strategy="beforeInteractive" nonce={nonce}>
            {`window.__webpack_nonce__ = ${JSON.stringify(nonce)};`}
          </Script>
        ) : null}
        <OrganizationSchema nonce={nonce} />
        <WebsiteSchema nonce={nonce} />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          themes={["dark", "dim", "light"]}
        >
          <ErrorBoundary>
            <AuthWrapper>
              <StyledComponentsRegistry nonce={nonce}>
                <CookieConsentProvider>
                  <GoogleAnalytics />
                  {children}
                  <FpsOverlay />
                  <PageVisibilityHandler />
                </CookieConsentProvider>
              </StyledComponentsRegistry>
            </AuthWrapper>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
