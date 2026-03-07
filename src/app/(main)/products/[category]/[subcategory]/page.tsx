import { permanentRedirect } from "next/navigation";

interface LegacySubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

export function generateStaticParams() {
  return [];
}

export default async function LegacySubcategoryPage({
  params,
}: LegacySubcategoryPageProps) {
  await params;
  permanentRedirect("/products");
}
