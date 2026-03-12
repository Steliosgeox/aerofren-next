export const BUSINESS_NAME = "AEROFREN";

export const FOUNDING_YEAR = 1980;
export const FOUNDING_LABEL_EL = "Από το 1980";

export const BUSINESS_HOURS_OPEN = "09:00";
export const BUSINESS_HOURS_CLOSE = "17:00";
export const BUSINESS_HOURS_TEXT_EL = `${BUSINESS_HOURS_OPEN} - ${BUSINESS_HOURS_CLOSE}`;
export const BUSINESS_WEEKDAY_HOURS_EL = `Δευτέρα - Παρασκευή ${BUSINESS_HOURS_TEXT_EL}`;

export const PRODUCT_COUNT = "10.000+";

export const BUSINESS_PHONE_DISPLAY = "210 3461645";
export const BUSINESS_PHONE_E164 = "+302103461645";
export const BUSINESS_PHONE_HREF = `tel:${BUSINESS_PHONE_E164}`;

export const BUSINESS_EMAIL = "aerofren@gmail.com";
export const BUSINESS_EMAIL_HREF = `mailto:${BUSINESS_EMAIL}`;

export const BUSINESS_ADDRESS_STREET = "Χρυσοστόμου Σμύρνης 26";
export const BUSINESS_ADDRESS_LOCALITY = "Μοσχάτο";
export const BUSINESS_ADDRESS_POSTAL_CODE = "18344";
export const BUSINESS_ADDRESS_REGION = "Αττική";
export const BUSINESS_ADDRESS_COUNTRY = "GR";
export const BUSINESS_ADDRESS_CITY_LINE_EL = "Μοσχάτο 18344, Αθήνα";
export const BUSINESS_ADDRESS_FULL_EL = `${BUSINESS_ADDRESS_STREET}, ${BUSINESS_ADDRESS_CITY_LINE_EL}`;

export const SITE_URL = "https://aerofren.gr";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_URL = `${SITE_URL}/images/logo-light.webp`;
export const FOUNDER_NAME_EL = "Βασίλειος Κουτελίδης";
export const FOUNDER_NAME_LATIN = "Vassilios Koutelidis";

export const RESOURCE_GUIDE_SLUGS = [
  "odigos-epilogis-rakor",
  "plastica-vs-oreichalkos-vs-anoxeidoto",
  "sxediasmos-pneumatikoy-kyklomatos",
] as const;

export type ResourceGuideSlug = (typeof RESOURCE_GUIDE_SLUGS)[number];
