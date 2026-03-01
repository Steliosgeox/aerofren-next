// src/lib/schema/WebsiteSchema.tsx
export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://aerofren.gr/#website",
    "name": "AEROFREN",
    "url": "https://aerofren.gr",
    "inLanguage": ["el", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://aerofren.gr/products?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    "publisher": {
      "@id": "https://aerofren.gr/#organization",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
