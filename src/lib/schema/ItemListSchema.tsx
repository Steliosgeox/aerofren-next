interface ItemListSchemaProps {
  name: string;
  description: string;
  url: string;
  items: Array<{
    name: string;
    url: string;
    description?: string;
    image?: string;
  }>;
  nonce?: string | null;
}

export function ItemListSchema({ name, description, url, items, nonce }: ItemListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "url": url,
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "url": item.url,
      "item": {
        "@type": "WebPage",
        "url": item.url,
        "name": item.name,
        ...(item.description ? { "description": item.description } : {}),
        ...(item.image ? { "image": item.image } : {}),
      },
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
