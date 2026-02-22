import { Building2, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ContactCardConfig, ContactFormState } from "@/components/contact/types";

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
    primary: "info@aerofren.gr",
    secondary: "Απάντηση εντός 24 ωρών",
    href: "mailto:info@aerofren.gr",
  },
  {
    icon: MapPin,
    title: "Διεύθυνση",
    primary: "Χρυσοστόμου Σμύρνης 26",
    secondary: "Μοσχάτο 18344, Αθήνα",
    href: "https://maps.google.com/?q=Χρυσοστόμου+Σμύρνης+26+Μοσχάτο",
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

export const CONTACT_MAP_URL =
  "https://maps.google.com/?q=Χρυσοστόμου+Σμύρνης+26+Μοσχάτο";
