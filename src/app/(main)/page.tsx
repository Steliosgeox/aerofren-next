import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "AEROFREN – Εξαρτήματα Νερού & Αέρα | B2B Προμηθευτής",
  description: "Ηγέτης στα εξαρτήματα νερού και αέρα από το 1980. Καινοτόμες λύσεις για τον βιομηχανικό τομέα. 120.000+ προϊόντα, 45+ χρόνια εμπειρίας.",
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
