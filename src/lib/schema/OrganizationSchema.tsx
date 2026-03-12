import {
  BUSINESS_ADDRESS_COUNTRY,
  BUSINESS_ADDRESS_LOCALITY,
  BUSINESS_ADDRESS_POSTAL_CODE,
  BUSINESS_ADDRESS_REGION,
  BUSINESS_ADDRESS_STREET,
  BUSINESS_EMAIL,
  BUSINESS_HOURS_CLOSE,
  BUSINESS_HOURS_OPEN,
  BUSINESS_NAME,
  BUSINESS_PHONE_E164,
  FOUNDING_LABEL_EL,
  FOUNDING_YEAR,
  LOGO_URL,
  ORGANIZATION_ID,
  PRODUCT_COUNT,
  SITE_URL,
} from "@/lib/constants/aerofren";

export function OrganizationSchema({ nonce }: { nonce?: string | null } = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": ORGANIZATION_ID,
        "name": BUSINESS_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": LOGO_URL,
          "width": 200,
          "height": 60,
        },
        "description": `B2B προμηθευτής πνευματικών εξαρτημάτων και συστημάτων νερού, ${FOUNDING_LABEL_EL.toLowerCase()}, με γκάμα άνω των ${PRODUCT_COUNT} προϊόντων.`,
        "foundingDate": String(FOUNDING_YEAR),
        "telephone": BUSINESS_PHONE_E164,
        "email": BUSINESS_EMAIL,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": BUSINESS_ADDRESS_STREET,
          "addressLocality": BUSINESS_ADDRESS_LOCALITY,
          "addressRegion": BUSINESS_ADDRESS_REGION,
          "postalCode": BUSINESS_ADDRESS_POSTAL_CODE,
          "addressCountry": BUSINESS_ADDRESS_COUNTRY,
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
            "opens": BUSINESS_HOURS_OPEN,
            "closes": BUSINESS_HOURS_CLOSE,
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
