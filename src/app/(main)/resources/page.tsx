// src/app/(main)/resources/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Τεχνικοί Οδηγοί & Resources | AEROFREN",
  description: "Τεχνικοί οδηγοί επιλογής πνευματικών εξαρτημάτων, σχεδίασης κυκλωμάτων, και σύγκρισης υλικών. Industrial guides for pneumatic system design.",
  alternates: { canonical: "https://aerofren.gr/resources" },
  openGraph: {
    title: "Τεχνικοί Οδηγοί & Resources | AEROFREN",
    description: "Τεχνικοί οδηγοί επιλογής πνευματικών εξαρτημάτων, σχεδίασης κυκλωμάτων, και σύγκρισης υλικών.",
    url: "https://aerofren.gr/resources",
    siteName: "AEROFREN",
    locale: "el_GR",
    type: "website",
    images: [{ url: "/images/hero-fittings.jpg", width: 1200, height: 630, alt: "AEROFREN – Εξαρτήματα Νερού & Αέρα" }],
  },
};

const guides = [
  {
    slug: "odigos-epilogis-rakor",
    title: "Οδηγός Επιλογής Πνευματικών Ρακόρ",
    description: "Πώς να επιλέξετε το σωστό τύπο ρακόρ για την εφαρμογή σας.",
    readTime: "5 λεπτά",
  },
  {
    slug: "plastica-vs-oreichalkos-vs-anoxeidoto",
    title: "Πλαστικά vs Ορείχαλκος vs Ανοξείδωτο: Πλήρης Σύγκριση",
    description: "Συγκριτικός πίνακας υλικών ρακόρ για να επιλέξετε το κατάλληλο.",
    readTime: "7 λεπτά",
  },
  {
    slug: "sxediasmos-pneumatikoy-kyklomatos",
    title: "Πώς να Σχεδιάσετε ένα Πνευματικό Κύκλωμα",
    description: "Βήμα-βήμα οδηγός για αρχάριους και έμπειρους τεχνικούς.",
    readTime: "10 λεπτά",
  },
];

export default function ResourcesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Τεχνικοί Οδηγοί</h1>
      <p className="text-muted-foreground mb-8">Technical Resources & Industry Guides</p>
      <div className="grid gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/resources/${guide.slug}`}
            className="border rounded-lg p-6 hover:border-primary transition-colors"
          >
            <h2 className="font-semibold text-xl mb-2">{guide.title}</h2>
            <p className="text-muted-foreground mb-3">{guide.description}</p>
            <span className="text-sm text-primary">Ανάγνωση: {guide.readTime}</span>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026
      </p>
    </main>
  );
}
