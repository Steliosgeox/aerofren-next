import { Metadata } from "next";
import { getTotalProductCount } from "@/data/categories";
import { ProductsPageContent } from "@/components/catalog/ProductsPageContent";

export const metadata: Metadata = {
  title: "Κατάλογος Προϊόντων | AEROFREN",
  description:
    "Ανακαλύψτε την πλήρη γκάμα εξαρτημάτων νερού και αέρα της AEROFREN. Ρακόρ, βαλβίδες, σωλήνες, πνευματικά εξαρτήματα και πολλά άλλα.",
  openGraph: {
    title: "Κατάλογος Προϊόντων | AEROFREN",
    description:
      "Πλήρης κατάλογος εξαρτημάτων νερού και αέρα. B2B προμηθευτής στην Ελλάδα.",
  },
};

export default function ProductsPage() {
  const totalProducts = getTotalProductCount();

  return <ProductsPageContent totalProducts={totalProducts} />;
}
