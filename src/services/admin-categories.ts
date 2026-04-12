/**
 * Admin Categories Service
 * Client-side data access layer for category management.
 * Follows the same pattern as src/services/admin.ts
 */

import { fetchWithAuth, type AuthUser } from '@/services/http';
import type { AdminCategory } from '@/data/types';

export interface AdminCategoriesResult {
  categories: AdminCategory[];
  total: number;
}

export interface CreateCategoryInput {
  slug: string;
  nameEl: string;
  tagEl: string;
  summaryEl: string;
  highlightsEl: [string, string, string];
  image: string;
  order?: number;
  visible?: boolean;
  ctaLabel?: string;
  assignedProductIds?: string[];
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export async function fetchAdminCategories(user: AuthUser): Promise<AdminCategoriesResult> {
  return fetchWithAuth<AdminCategoriesResult>(user, '/api/admin/categories');
}

export async function createAdminCategory(
  user: AuthUser,
  data: CreateCategoryInput,
): Promise<AdminCategory> {
  const result = await fetchWithAuth<{ category: AdminCategory }>(user, '/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return result.category;
}

export async function updateAdminCategory(
  user: AuthUser,
  id: string,
  data: UpdateCategoryInput,
): Promise<AdminCategory> {
  const result = await fetchWithAuth<{ category: AdminCategory }>(
    user,
    `/api/admin/categories/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );
  return result.category;
}

export async function deleteAdminCategory(user: AuthUser, id: string): Promise<boolean> {
  const result = await fetchWithAuth<{ success: boolean }>(user, `/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
  return result.success;
}
