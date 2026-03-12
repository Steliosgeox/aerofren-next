import { Building2, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ContactCardConfig, ContactFormState } from "@/components/contact/types";
import {
  BUSINESS_ADDRESS_CITY_LINE_EL,
  BUSINESS_ADDRESS_STREET,
  BUSINESS_EMAIL,
  BUSINESS_EMAIL_HREF,
  BUSINESS_HOURS_TEXT_EL,
  BUSINESS_NAME,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_HREF,
  FOUNDING_LABEL_EL,
} from "@/lib/constants/aerofren";

export const CONTACT_ADDRESS_LINE_1 = BUSINESS_ADDRESS_STREET;
export const CONTACT_ADDRESS_LINE_2 = BUSINESS_ADDRESS_CITY_LINE_EL;
const CONTACT_MAP_QUERY = encodeURIComponent(
  `${CONTACT_ADDRESS_LINE_1}, ${CONTACT_ADDRESS_LINE_2}`
);

export const CONTACT_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${CONTACT_MAP_QUERY}`;
export const CONTACT_MAP_EMBED_URL = `https://www.google.com/maps?output=embed&q=${CONTACT_MAP_QUERY}`;
export const CONTACT_MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${CONTACT_MAP_QUERY}`;

export const INITIAL_FORM_DATA: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
  honeypot: "",
};

export const CONTACT_CARDS: ContactCardConfig[] = [
  {
    icon: Phone,
    title: "Τηλέφωνο",
    primary: BUSINESS_PHONE_DISPLAY,
    secondary: "Δευτέρα - Παρασκευή",
    href: BUSINESS_PHONE_HREF,
  },
  {
    icon: Mail,
    title: "E-mail",
    primary: BUSINESS_EMAIL,
    secondary: "Απάντηση εντός 24 ωρών",
    href: BUSINESS_EMAIL_HREF,
  },
  {
    icon: MapPin,
    title: "Διεύθυνση",
    primary: CONTACT_ADDRESS_LINE_1,
    secondary: CONTACT_ADDRESS_LINE_2,
    href: CONTACT_MAP_URL,
  },
  {
    icon: Clock,
    title: "Ωράριο",
    primary: BUSINESS_HOURS_TEXT_EL,
    secondary: "Σάββατο - Κυριακή: Κλειστά",
  },
  {
    icon: Building2,
    title: "Επωνυμία",
    primary: BUSINESS_NAME,
    secondary: "Κουτελίδου Αικατερίνη Β.",
    tags: ["Μόνο B2B", FOUNDING_LABEL_EL],
  },
];

export const CONTACT_ICON_BG =
  "from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] to-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)]";
