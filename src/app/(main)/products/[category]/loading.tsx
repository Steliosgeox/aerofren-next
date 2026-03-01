import React from "react";

export default function CategoryLoading() {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Category Header Skeleton */}
            <div className="mb-8 border-b border-[var(--theme-glass-border)] pb-8">
                <div className="h-6 w-32 bg-[var(--theme-glass-border)] rounded animate-pulse mb-6" />
                <div className="h-10 w-64 bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] rounded-lg animate-pulse mb-4" />
                <div className="h-4 w-96 bg-[var(--theme-glass-bg)] rounded-md animate-pulse" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((slotId) => (
                    <div
                        key={`category-skeleton-${slotId}`}
                        className="flex flex-col bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] rounded-2xl overflow-hidden h-[360px]"
                    >
                        {/* Image placeholder */}
                        <div className="h-48 w-full bg-[var(--theme-glass-border)] animate-pulse" />

                        {/* Content placeholder */}
                        <div className="p-4 flex flex-col gap-3 flex-1">
                            <div className="h-5 w-3/4 bg-[var(--theme-glass-border)] rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-[var(--theme-glass-border)]/50 rounded animate-pulse" />

                            <div className="mt-auto h-10 w-full bg-[var(--theme-glass-border)]/80 rounded-lg animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
