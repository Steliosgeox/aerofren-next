import {
  FOUNDER_ID,
  FOUNDER_NAME_EL,
  FOUNDER_NAME_LATIN,
  FOUNDING_LABEL_EL,
  FOUNDING_YEAR,
  ORGANIZATION_ID,
} from "@/lib/constants/aerofren";

export function FounderPersonSchema({ nonce }: { nonce?: string | null } = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,
    "name": FOUNDER_NAME_EL,
    "alternateName": FOUNDER_NAME_LATIN,
    "jobTitle": "Ιδρυτής",
    "description": `Ίδρυσε την AEROFREN το ${FOUNDING_YEAR} και καθόρισε την τεχνική πορεία της εταιρείας ${FOUNDING_LABEL_EL.toLowerCase()} στον κλάδο πνευματικών συστημάτων και εξαρτημάτων νερού.`,
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
