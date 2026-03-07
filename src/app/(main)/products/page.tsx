import { Metadata } from "next";
import { ProductsPageContent } from "@/components/catalog/ProductsPageContent";
import { getProductShowcaseCount } from "@/data/product-showcase";

const productCount = getProductShowcaseCount();

export const metadata: Metadata = {
  title: "Προϊόντα για Δίκτυα Αέρα & Νερού | AEROFREN",
  description:
    `Εξερευνήστε ${productCount} επιλεγμένα προϊόντα AEROFREN για δίκτυα αέρα και νερού και επικοινωνήστε μαζί μας για άμεση εξυπηρέτηση.`,
  alternates: {
    canonical: "https://aerofren.gr/products",
  },
  openGraph: {
    title: "Προϊόντα για Δίκτυα Αέρα & Νερού | AEROFREN",
    description:
      "Premium δημόσια παρουσίαση προϊόντων με contact-first εξυπηρέτηση για επαγγελματίες.",
  },
};

export default function ProductsPage() {
  return <ProductsPageContent />;
}
