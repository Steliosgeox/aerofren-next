import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";
import { FOUNDING_LABEL_EL, PRODUCT_COUNT } from "@/lib/constants/aerofren";

export const metadata: Metadata = {
  title: "AEROFREN – Εξαρτήματα Νερού & Αέρα | B2B Προμηθευτής",
  description: `Ηγέτης στα εξαρτήματα νερού και αέρα ${FOUNDING_LABEL_EL.toLowerCase()}. Καινοτόμες λύσεις για τον βιομηχανικό τομέα. ${PRODUCT_COUNT} προϊόντα.`,
  alternates: {
    canonical: "https://aerofren.gr",
  },
};

export default function HomePage() {
  return (
    <main>
      <HomePageClient />
    </main>
  );
}
