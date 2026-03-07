import { permanentRedirect } from "next/navigation";

interface LegacyCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export function generateStaticParams() {
  return [];
}

export default async function LegacyCategoryPage({
  params,
}: LegacyCategoryPageProps) {
  await params;
  permanentRedirect("/products");
}
