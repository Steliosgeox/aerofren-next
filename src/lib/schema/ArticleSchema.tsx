import { ORGANIZATION_ID } from "@/lib/constants/aerofren";

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  nonce?: string | null;
}

export function ArticleSchema({
  title,
  description,
  url,
  datePublished,
  dateModified,
  nonce,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": title,
    "description": description,
    "url": url,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@id": ORGANIZATION_ID,
    },
    "publisher": {
      "@id": ORGANIZATION_ID,
    },
    "inLanguage": ["el", "en"],
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
