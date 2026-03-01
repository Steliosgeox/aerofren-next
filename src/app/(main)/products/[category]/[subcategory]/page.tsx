import { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getSubcategoryBySlug } from "@/data/categories";
import { SubcategoryPageContent } from "@/components/catalog/SubcategoryPageContent";

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

export async function generateStaticParams() {
  return categories.flatMap((category) =>
    category.subcategories.map((sub) => ({
      category: category.slug,
      subcategory: sub.slug,
    }))
  );
}

// All subcategories are statically known — reject unknown slugs at routing layer
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category: catSlug, subcategory: subSlug } = await params;
  const result = getSubcategoryBySlug(catSlug, subSlug);

  if (!result) {
    return {
      title: "Υποκατηγορία δεν βρέθηκε | AEROFREN",
    };
  }

  const { category, subcategory } = result;
  return {
    title: `${subcategory.nameEl} | ${category.nameEl} | AEROFREN`,
    description: `${subcategory.nameEl} - ${subcategory.productCount.toLocaleString("el-GR")} προϊόντα. ${category.descriptionEl}`,
    alternates: {
      canonical: `https://aerofren.gr/products/${catSlug}/${subSlug}`,
    },
    openGraph: {
      title: `${subcategory.nameEl} | AEROFREN`,
      description: `${subcategory.nameEl} - ${subcategory.productCount.toLocaleString("el-GR")} προϊόντα`,
      images: [subcategory.image],
    },
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category: catSlug, subcategory: subSlug } = await params;
  const result = getSubcategoryBySlug(catSlug, subSlug);

  if (!result) {
    notFound();
  }

  return (
    <SubcategoryPageContent
      category={result.category}
      subcategory={result.subcategory}
    />
  );
}
