import type { LucideIcon } from "lucide-react";

export type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  honeypot: string;
};

export type ContactCardConfig = {
  icon: LucideIcon;
  title: string;
  primary: string;
  secondary: string;
  href?: string;
  tags?: string[];
};
