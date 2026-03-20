import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import {
  BUSINESS_NAME,
  FOUNDING_LABEL_EL,
  PRODUCT_COUNT,
  SITE_URL,
} from "@/lib/constants/aerofren";

export const metadata: Metadata = {
  title: {
    absolute: `${BUSINESS_NAME} | B2B Προμηθευτής για Εξαρτήματα Νερού, Φίλτρα & Πνευματικά`,
  },
  description: `${BUSINESS_NAME}: B2B προμηθευτής για εξαρτήματα νερού, φίλτρα, ρακόρ και πνευματικά. ${FOUNDING_LABEL_EL}, ${PRODUCT_COUNT} προϊόντα. Μοσχάτο, Αθήνα.`,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${BUSINESS_NAME} | B2B Εξαρτήματα Νερού & Αέρα`,
    description: `${BUSINESS_NAME}: φίλτρα νερού, ρακόρ, πνευματικά και τεχνικές λύσεις εφαρμογής για επαγγελματίες. ${FOUNDING_LABEL_EL} με ${PRODUCT_COUNT} προϊόντα.`,
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    locale: "el_GR",
    type: "website",
    images: [
      {
        url: "/images/hero-fittings.jpg",
        width: 1200,
        height: 630,
        alt: `${BUSINESS_NAME} - B2B εξαρτήματα νερού και αέρα`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} | B2B Εξαρτήματα Νερού & Αέρα`,
    description: `${BUSINESS_NAME}: φίλτρα νερού, ρακόρ και πνευματικά για επαγγελματικές εγκαταστάσεις.`,
    images: ["/images/hero-fittings.jpg"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
