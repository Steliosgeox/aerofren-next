"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/admin";
import { AdminCategoryCard } from "./AdminCategoryCard";
import { AddCategoryCard } from "./AddCategoryCard";
import { CategoryEditModal, type CategoryFormData } from "./CategoryEditModal";
import { CategoryDeleteModal } from "./CategoryDeleteModal";
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/services/admin-categories";
import { HttpError } from "@/services/http";
import type { AdminCategory } from "@/data/types";

const PAGE_SIZE = 20;

function SkeletonCard() {
  return (
    <div className="min-h-[30rem] animate-pulse border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_60%,transparent)]">
      <div className="flex items-start justify-between px-5 pb-4 pt-5">
        <div className="grid gap-2">
          <div className="h-2.5 w-24 bg-[color-mix(in_srgb,var(--theme-accent)_16%,transparent)]" />
          <div className="h-2 w-8 bg-white/10" />
        </div>
        <div className="h-10 w-10 bg-white/10" />
      </div>
      <div className="px-5">
        <div className="h-[16rem] border border-[var(--theme-glass-border)] bg-white/5" />
      </div>
      <div className="grid gap-3 px-5 pb-6 pt-5">
        <div className="h-7 w-3/5 bg-white/10" />
        <div className="h-4 w-full bg-white/5" />
        <div className="h-4 w-4/5 bg-white/5" />
      </div>
      <div className="flex items-center justify-between border-t border-[var(--theme-glass-border)] px-5 py-4">
        <div className="h-2 w-28 bg-white/10" />
        <div className="h-2 w-2 bg-white/10" />
      </div>
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Σελιδοποίηση κατηγοριών"
      className="mt-8 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="inline-flex min-h-10 items-center gap-2 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] px-4 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
        aria-label="Προηγούμενη σελίδα"
      >
        ←
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          aria-current={p === page ? "page" : undefined}
          className={`inline-flex min-h-10 min-w-10 items-center justify-center border text-sm font-semibold transition-[border-color,background] duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] ${
            p === page
              ? "border-[color-mix(in_srgb,var(--theme-accent)_48%,transparent)] bg-[color-mix(in_srgb,var(--theme-accent)_18%,transparent)] text-[var(--theme-accent)]"
              : "border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] text-[var(--theme-text)] hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)]"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className="inline-flex min-h-10 items-center gap-2 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] px-4 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
        aria-label="Επόμενη σελίδα"
      >
        →
      </button>
    </nav>
  );
}

export function AdminCategoriesPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<AdminCategory | null>(null);

  const load = useCallback(
    async (quiet = false) => {
      if (!user) return;
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);
      try {
        const result = await fetchAdminCategories(user);
        setCategories(result.categories);
      } catch (err) {
        const msg =
          err instanceof HttpError
            ? `Σφάλμα ${err.status}: ${err.message}`
            : err instanceof Error
            ? err.message
            : "Αποτυχία φόρτωσης κατηγοριών";
        setLoadError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user],
  );

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditMode("create");
    setEditingCategory(null);
    setShowEditModal(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditMode("edit");
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const openDelete = (category: AdminCategory) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleSave = async (data: CategoryFormData) => {
    if (!user) return;
    if (editMode === "create") {
      await createAdminCategory(user, {
        ...data,
        highlightsEl: data.highlightsEl,
      });
    } else if (editingCategory) {
      await updateAdminCategory(user, editingCategory.id, data);
    }
    setShowEditModal(false);
    await load(true);
  };

  const handleDelete = async (category: AdminCategory) => {
    if (!user) return;
    await deleteAdminCategory(user, category.id);
    setShowDeleteModal(false);
    setDeletingCategory(null);
    await load(true);
  };

  // Pagination
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const usePagination = sorted.length > PAGE_SIZE;
  const totalPages = usePagination ? Math.ceil(sorted.length / PAGE_SIZE) : 1;
  const visibleCategories = usePagination
    ? sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : sorted;

  return (
    <AdminLayout
      title="Κατηγορίες"
      headerRight={
        <button
          type="button"
          aria-label="Ανανέωση"
          onClick={() => load(true)}
          disabled={isRefreshing || isLoading}
          className="inline-flex h-10 w-10 items-center justify-center border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] text-[var(--theme-text)] transition-[border-color,background,opacity] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      }
    >
      {/* Section header — matches ProductsPageContent exactly */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.25),transparent)]" />
        <div className="mb-8 flex flex-col gap-3 pt-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[var(--theme-accent)]">
              Διαχείριση Καταλόγου
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,3.4vw,3rem)] font-semibold tracking-[-0.04em] text-[var(--theme-text)]">
              Κατηγορίες Προϊόντων
            </h2>
          </div>
          <p className="max-w-[40ch] text-sm leading-7 text-[var(--theme-text-muted)]">
            Κάντε κλικ σε μια κατηγορία για επεξεργασία, ή χρησιμοποιήστε τα εικονίδια για
            γρήγορες ενέργειες.
          </p>
        </div>
      </div>

      {/* Error state */}
      {loadError && !isLoading && (
        <div className="mb-6 border border-[color-mix(in_srgb,#ef4444_28%,transparent)] bg-[color-mix(in_srgb,#ef4444_8%,transparent)] px-5 py-4">
          <p className="text-sm text-red-400">{loadError}</p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-2 text-[0.8rem] font-semibold text-[var(--theme-accent)] underline underline-offset-2 hover:no-underline"
          >
            Δοκιμάστε ξανά
          </button>
        </div>
      )}

      {/* Category grid — exact same layout as ProductsPageContent */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
          : visibleCategories.map((category, index) => (
              <AdminCategoryCard
                key={category.id}
                category={category}
                index={usePagination ? (page - 1) * PAGE_SIZE + index : index}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}

        {/* Add card — only show when not loading */}
        {!isLoading && <AddCategoryCard onAdd={openCreate} />}
      </div>

      {/* Pagination — only above 20 categories */}
      {usePagination && (
        <PaginationControls page={page} totalPages={totalPages} onPage={setPage} />
      )}

      {/* Edit / Create modal */}
      <CategoryEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        mode={editMode}
        category={editingCategory}
        onSave={handleSave}
      />

      {/* Delete modal */}
      <CategoryDeleteModal
        isOpen={showDeleteModal}
        category={deletingCategory}
        onClose={() => { setShowDeleteModal(false); setDeletingCategory(null); }}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
