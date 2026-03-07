import { Building2, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ContactCardConfig, ContactFormState } from "@/components/contact/types";

export const CONTACT_ADDRESS_LINE_1 = "Χρυσοστόμου Σμύρνης 26";
export const CONTACT_ADDRESS_LINE_2 = "Μοσχάτο 18344, Αθήνα";
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
    primary: "210 3461645",
    secondary: "Δευτέρα - Παρασκευή",
    href: "tel:2103461645",
  },
  {
    icon: Mail,
    title: "E-mail",
    primary: "aerofren@gmail.com",
    secondary: "Απάντηση εντός 24 ωρών",
    href: "mailto:aerofren@gmail.com",
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
    primary: "08:00 - 16:00",
    secondary: "Σάββατο - Κυριακή: Κλειστά",
  },
  {
    icon: Building2,
    title: "Επωνυμία",
    primary: "AEROFREN",
    secondary: "Κουτελίδου Αικατερίνη Β.",
    tags: ["Μόνο B2B", "Από το 1990"],
  },
];

export const CONTACT_ICON_BG =
  "from-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] to-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)]";
