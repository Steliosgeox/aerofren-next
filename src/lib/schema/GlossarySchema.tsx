import { SITE_URL } from "@/lib/constants/aerofren";

interface GlossaryTerm {
  name: string;
  description: string;
  alternateName?: string;
}

export function GlossarySchema({ terms, nonce }: { terms: GlossaryTerm[]; nonce?: string | null }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "AEROFREN Γλωσσάριο Πνευματικών & Υδραυλικών",
    "description": "Τεχνικοί ορισμοί για πνευματικά συστήματα, εξαρτήματα σύνδεσης, βαλβίδες, και συστήματα νερού.",
    "url": `${SITE_URL}/glossary`,
    "hasDefinedTerm": terms.map((term) => ({
      "@type": "DefinedTerm",
      "name": term.name,
      "description": term.description,
      ...(term.alternateName ? { "alternateName": term.alternateName } : {}),
      "inDefinedTermSet": `${SITE_URL}/glossary`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
