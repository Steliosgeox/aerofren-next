import { ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from "@/lib/constants/aerofren";

export function WebsiteSchema({ nonce }: { nonce?: string | null } = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    "name": "AEROFREN",
    "url": SITE_URL,
    "inLanguage": ["el", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/products?q={search_term_string}`,
      },
    },
    "publisher": {
      "@id": ORGANIZATION_ID,
    },
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
