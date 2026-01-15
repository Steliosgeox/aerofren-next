"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/data/categories";
import { ChevronRight } from "lucide-react";

interface CategorySidebarProps {
  currentCategory?: string;
}

export function CategorySidebar({ currentCategory }: CategorySidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-28">
      <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-[#0066cc] rounded-full" />
        Κατηγορίες
      </h3>

      <nav className="space-y-1">
        <Link
          href="/products"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/products"
              ? "bg-[#0066cc]/10 text-[#0066cc]"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          Όλες οι Κατηγορίες
        </Link>

        {categories.map((category) => {
          const isActive = currentCategory === category.slug;
          const categoryPath = `/products/${category.slug}`;
          const isInCategory = pathname.startsWith(categoryPath);

          return (
            <div key={category.id}>
              <Link
                href={categoryPath}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive || isInCategory
                    ? "bg-[#0066cc]/10 text-[#0066cc]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <span className="truncate">{category.nameEl}</span>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${isInCategory ? "rotate-90" : ""
                    }`}
                />
              </Link>

              {/* Subcategories - show when in this category */}
              {isInCategory && category.subcategories.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                  {category.subcategories.map((sub) => {
                    const subPath = `/products/${category.slug}/${sub.slug}`;
                    const isSubActive = pathname === subPath;

                    return (
                      <Link
                        key={sub.id}
                        href={subPath}
                        className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isSubActive
                            ? "bg-[#0066cc]/10 text-[#0066cc]"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          }`}
                      >
                        {sub.nameEl}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick Contact */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-500 mb-2">Χρειάζεστε βοήθεια;</p>
        <a
          href="tel:2103461645"
          className="flex items-center gap-2 text-[#0066cc] font-bold hover:underline"
        >
          210 3461645
        </a>
      </div>
    </aside>
  );
}
