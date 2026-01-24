"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbItem } from "@/data/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm py-4">
      <Link
        href="/"
        className="flex items-center gap-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-accent)] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Αρχική</span>
      </Link>

      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-[var(--theme-text-muted)]" />
          {index === items.length - 1 ? (
            <span className="font-medium text-[var(--theme-text)]">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-[var(--theme-text-muted)] hover:text-[var(--theme-accent)] transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
