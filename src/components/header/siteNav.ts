import type { LucideIcon } from "lucide-react";
import { Home, Info, Package, Phone } from "lucide-react";

export interface SiteNavItem {
  name: string;
  mobileLabel: string;
  path: string;
  Icon: LucideIcon;
  hasDropdown?: boolean;
}

export const SITE_NAV_ITEMS: readonly SiteNavItem[] = [
  {
    name: "Αρχική",
    mobileLabel: "Αρχική",
    path: "/",
    Icon: Home,
  },
  {
    name: "Προϊόντα",
    mobileLabel: "Προϊόντα",
    path: "/products",
    Icon: Package,
    hasDropdown: true,
  },
  {
    name: "Ποιοι είμαστε",
    mobileLabel: "Σχετικά",
    path: "/about",
    Icon: Info,
  },
  {
    name: "Επικοινωνία",
    mobileLabel: "Επαφή",
    path: "/contact",
    Icon: Phone,
  },
] as const;
