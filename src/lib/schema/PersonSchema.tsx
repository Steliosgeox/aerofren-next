// src/lib/schema/PersonSchema.tsx
export function FounderPersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Βασίλειος Κουτελίδης",
    "alternateName": "Vassilios Koutelidis",
    "jobTitle": "Ιδρυτής",
    "description": "Ίδρυσε την AEROFREN το 1980 και αφιέρωσε 35+ χρόνια στον κλάδο πνευματικών συστημάτων και εξαρτημάτων νερού.",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://aerofren.gr/#organization",
      "name": "AEROFREN",
    },
    "knowsAbout": [
      "Pneumatic Systems",
      "Industrial Fittings",
      "Water Systems",
      "B2B Distribution",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
