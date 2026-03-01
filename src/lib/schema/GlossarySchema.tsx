// src/lib/schema/GlossarySchema.tsx
interface GlossaryTerm {
  name: string;
  description: string;
  alternateName?: string;
}

export function GlossarySchema({ terms }: { terms: GlossaryTerm[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "AEROFREN Γλωσσάριο Πνευματικών & Υδραυλικών",
    "description": "Τεχνικοί ορισμοί για πνευματικά συστήματα, εξαρτήματα σύνδεσης, βαλβίδες, και συστήματα νερού.",
    "url": "https://aerofren.gr/glossary",
    "hasDefinedTerm": terms.map((term) => ({
      "@type": "DefinedTerm",
      "name": term.name,
      "description": term.description,
      "alternateName": term.alternateName,
      "inDefinedTermSet": "https://aerofren.gr/glossary",
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
