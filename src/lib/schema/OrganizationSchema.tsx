// src/lib/schema/OrganizationSchema.tsx
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "WholesaleStore"],
        "@id": "https://aerofren.gr/#organization",
        "name": "AEROFREN",
        "url": "https://aerofren.gr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://aerofren.gr/images/logo-light.webp",
          "width": 200,
          "height": 60,
        },
        "description": "B2B προμηθευτής πνευματικών εξαρτημάτων και συστημάτων νερού. B2B supplier of pneumatic and water system components.",
        "foundingDate": "1980",
        "telephone": "+302103461645",
        "email": "info@aerofren.gr",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Χρυσοστόμου Σμύρνης 26",
          "addressLocality": "Μοσχάτο",
          "addressRegion": "Αττική",
          "postalCode": "18344",
          "addressCountry": "GR",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "37.9371",
          "longitude": "23.6903",
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:00",
            "closes": "17:00",
          },
        ],
        "areaServed": [
          { "@type": "Country", "name": "Greece" },
          { "@type": "Continent", "name": "Europe" },
        ],
        "knowsAbout": [
          "Pneumatic Systems",
          "Water Fittings",
          "Industrial Components",
          "Push-in Fittings",
          "Compression Fittings",
          "Flow Control Valves",
          "Air Preparation Units",
        ],
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "value": "10-50",
        },
        "sameAs": [
          "https://www.linkedin.com/company/aerofren",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
