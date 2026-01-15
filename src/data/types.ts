// AEROFREN Product Catalog Type Definitions

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameEl: string;
  description: string;
  descriptionEl: string;
  image: string;
  icon: string;
  color: string;
  productCount: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  slug: string;
  nameEn: string;
  nameEl: string;
  description?: string;
  descriptionEl?: string;
  image: string;
  productCount: number;
  parentCategory: string;
}

export interface Product {
  id: string;
  sku: string;
  nameEn: string;
  nameEl: string;
  description: string;
  descriptionEl: string;
  image: string;
  images?: string[];
  category: string;
  subcategory: string;
  specifications?: Record<string, string>;
  brand?: string;
  inStock?: boolean;
}

export interface QuoteRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  products?: {
    productId: string;
    productName: string;
    quantity?: number;
  }[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

// Helper type for category icons
export type CategoryIconName =
  | 'plug'
  | 'wrench'
  | 'link'
  | 'tube'
  | 'valve'
  | 'gauge'
  | 'cog'
  | 'cylinder'
  | 'wind'
  | 'package'
  | 'droplet'
  | 'tool';
