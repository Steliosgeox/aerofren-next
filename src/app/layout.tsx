import type { Metadata } from "next"
import { Inter, Manrope } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import StyledComponentsRegistry from "@/lib/registry"
import { AuthWrapper } from "@/components/AuthWrapper"
import ErrorBoundary from "@/components/ui/ErrorBoundary"

const inter = Inter({ subsets: ["latin", "greek"] })
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "600", "800"],
  variable: "--font-manrope"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="el" suppressHydrationWarning>
      <body className={`${inter.className} ${manrope.variable}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          themes={["dark", "dim", "light"]}
        >
          <ErrorBoundary>
            <AuthWrapper>
              <StyledComponentsRegistry>
                {children}
              </StyledComponentsRegistry>
            </AuthWrapper>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}

