import { FOUNDING_YEAR, ORGANIZATION_ID, SITE_URL, YEARS_OF_EXPERIENCE, PRODUCT_COUNT } from "@/lib/constants/aerofren";

export function OrganizationSchema({ nonce }: { nonce?: string | null } = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": ORGANIZATION_ID,
        "name": "AEROFREN",
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/images/logo-light.webp`,
          "width": 200,
          "height": 60,
        },
        "description": `B2B προμηθευτής πνευματικών εξαρτημάτων και συστημάτων νερού από το ${FOUNDING_YEAR}. ${YEARS_OF_EXPERIENCE}+ χρόνια εμπειρίας, ${PRODUCT_COUNT} προϊόντα.`,
        "foundingDate": String(FOUNDING_YEAR),
        "telephone": "+302103461645",
        "email": "aerofren@gmail.com",
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
          "Europe",
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
          "minValue": 10,
          "maxValue": 50,
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
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
