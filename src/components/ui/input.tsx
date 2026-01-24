import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl border-2 border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] px-4 py-2 text-base ring-offset-[var(--theme-bg-solid)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--theme-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--theme-accent)_55%,transparent)] focus-visible:ring-offset-2 focus-visible:border-[var(--theme-accent)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 text-[var(--theme-text)]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
