import React from "react";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[var(--theme-bg-solid)] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-b border-[var(--theme-glass-border)] pb-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,24rem)]">
          <div className="grid gap-5">
            <div className="h-3 w-44 bg-[var(--theme-glass-border)] animate-pulse" />
            <div className="h-16 w-full max-w-xl bg-[var(--theme-glass-bg)] animate-pulse" />
            <div className="h-5 w-full max-w-2xl bg-[var(--theme-glass-border)]/70 animate-pulse" />
            <div className="h-5 w-4/5 max-w-2xl bg-[var(--theme-glass-border)]/50 animate-pulse" />
          </div>

          <div className="grid gap-4 border border-[var(--theme-glass-border)] bg-[var(--theme-glass-bg)] p-5">
            <div className="h-3 w-40 bg-[var(--theme-glass-border)] animate-pulse" />
            <div className="grid grid-cols-2 gap-4 border-y border-[var(--theme-glass-border)] py-4">
              <div className="h-12 bg-[var(--theme-glass-border)]/60 animate-pulse" />
              <div className="h-12 bg-[var(--theme-glass-border)]/60 animate-pulse" />
            </div>
            <div className="h-5 w-full bg-[var(--theme-glass-border)]/50 animate-pulse" />
            <div className="flex gap-3">
              <div className="h-11 w-28 bg-[var(--theme-glass-border)]/60 animate-pulse" />
              <div className="h-11 w-40 bg-[var(--theme-glass-border)]/40 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="grid auto-rows-[minmax(18rem,auto)] grid-cols-1 gap-4 py-10 md:grid-cols-6 xl:grid-cols-12">
          {[1, 2, 3, 4, 5, 6].map((slotId) => (
            <div
              className={`border border-[var(--theme-glass-border)] bg-[var(--theme-glass-bg)] p-4 ${
                slotId === 1
                  ? "md:col-span-6 xl:col-span-5 xl:row-span-2"
                  : slotId === 2
                    ? "md:col-span-3 xl:col-span-3 xl:row-span-2"
                    : "md:col-span-3 xl:col-span-4"
              }`}
              key={`product-showcase-skeleton-${slotId}`}
            >
              <div className="mb-4 h-3 w-24 bg-[var(--theme-glass-border)] animate-pulse" />
              <div className="mb-4 h-48 bg-[var(--theme-glass-border)]/70 animate-pulse" />
              <div className="h-6 w-3/4 bg-[var(--theme-glass-border)]/80 animate-pulse" />
              <div className="mt-3 h-4 w-full bg-[var(--theme-glass-border)]/50 animate-pulse" />
              <div className="mt-2 h-4 w-5/6 bg-[var(--theme-glass-border)]/40 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
