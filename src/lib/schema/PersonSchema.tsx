import { FOUNDING_YEAR, FOUNDER_ID, ORGANIZATION_ID, YEARS_OF_EXPERIENCE } from "@/lib/constants/aerofren";

export function FounderPersonSchema({ nonce }: { nonce?: string | null } = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,
    "name": "Βασίλειος Κουτελίδης",
    "alternateName": "Vassilios Koutelidis",
    "jobTitle": "Ιδρυτής",
    "description": `Ίδρυσε την AEROFREN το ${FOUNDING_YEAR} και αφιέρωσε ${YEARS_OF_EXPERIENCE}+ χρόνια στον κλάδο πνευματικών συστημάτων και εξαρτημάτων νερού.`,
    "worksFor": {
      "@id": ORGANIZATION_ID,
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
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
