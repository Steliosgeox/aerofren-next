import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                "flex min-h-[120px] w-full rounded-xl border-2 border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] px-4 py-3 text-base ring-offset-[var(--theme-bg-solid)] placeholder:text-[var(--theme-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--theme-accent)_55%,transparent)] focus-visible:ring-offset-2 focus-visible:border-[var(--theme-accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none text-[var(--theme-text)]",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Textarea.displayName = "Textarea"

export { Textarea }
