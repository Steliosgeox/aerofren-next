"use client";

import Image from "next/image";
import Link from "next/link";
import { Subcategory } from "@/data/types";

interface SubcategoryCardProps {
  subcategory: Subcategory;
  categorySlug: string;
}

export function SubcategoryCard({ subcategory, categorySlug }: SubcategoryCardProps) {
  return (
    <Link
      href={`/products/${categorySlug}/${subcategory.slug}`}
      className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#0066cc] hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <Image
          src={subcategory.image}
          alt={subcategory.nameEl}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 leading-tight mb-1 group-hover:text-[#0066cc] transition-colors line-clamp-2">
          {subcategory.nameEl}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {subcategory.productCount.toLocaleString("el-GR")} προϊόντα
          </p>
          <span className="text-[#0066cc] opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
