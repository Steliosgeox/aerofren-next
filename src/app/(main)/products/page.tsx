import { Metadata } from "next";
import { ProductsPageContent } from "@/components/catalog/ProductsPageContent";
import { catalogCategories } from "@/data/catalog-taxonomy";
import { PRODUCT_COUNT } from "@/lib/constants/aerofren";

export const metadata: Metadata = {
  title: "Προϊόντα για Δίκτυα Αέρα & Νερού | AEROFREN",
  description:
    `Εξερευνήστε ${catalogCategories.length} canonical κατηγορίες προϊόντων AEROFREN για δίκτυα αέρα και νερού και δείτε γκάμα άνω των ${PRODUCT_COUNT} προϊόντων.`,
  alternates: {
    canonical: "https://aerofren.gr/products",
  },
  openGraph: {
    title: "Προϊόντα για Δίκτυα Αέρα & Νερού | AEROFREN",
    description:
      "Canonical κατηγορίες προϊόντων και contact-first εξυπηρέτηση για επαγγελματίες.",
  },
};

export default function ProductsPage() {
  return <ProductsPageContent />;
}
