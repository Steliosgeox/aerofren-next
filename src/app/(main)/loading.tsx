export default function Loading() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--theme-bg-solid)]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[var(--theme-glass-border)] border-t-[var(--theme-accent)] animate-spin" />
                <div className="h-4 w-32 bg-[var(--theme-glass-bg)] rounded-md animate-pulse" />
            </div>
        </div>
    );
}
