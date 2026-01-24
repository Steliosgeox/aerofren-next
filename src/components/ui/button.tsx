"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--theme-accent)_60%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg-solid)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--theme-accent)] text-white shadow-md hover:bg-[var(--theme-accent-hover)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5",
                destructive:
                    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-red-500/20",
                outline:
                    "border-2 border-[color-mix(in_srgb,var(--theme-accent)_70%,transparent)] text-[var(--theme-accent)] bg-transparent hover:bg-[var(--theme-accent)] hover:text-white hover:shadow-lg hover:shadow-black/20",
                secondary:
                    "bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] text-[var(--theme-text)] border border-[var(--theme-glass-border)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_95%,transparent)] hover:border-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)]",
                ghost:
                    "hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] hover:text-[var(--theme-text)]",
                link:
                    "text-[var(--theme-accent)] underline-offset-4 hover:underline",
                // Glass variants for dark backgrounds
                "glass-primary":
                    "bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] backdrop-blur-md text-[var(--theme-text)] border border-[var(--theme-glass-border)] shadow-lg shadow-black/20 hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_95%,transparent)] hover:border-[color-mix(in_srgb,var(--theme-accent)_25%,transparent)] hover:shadow-xl hover:-translate-y-0.5",
                "glass-secondary":
                    "bg-[color-mix(in_srgb,var(--theme-glass-bg)_75%,transparent)] backdrop-blur-sm text-[var(--theme-text)] border border-[var(--theme-glass-border)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] hover:text-[var(--theme-text)] hover:border-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]",
                "glass-accent":
                    "bg-[color-mix(in_srgb,var(--theme-accent)_90%,transparent)] backdrop-blur-md text-white border border-[color-mix(in_srgb,var(--theme-accent)_45%,transparent)] shadow-lg shadow-black/25 hover:bg-[var(--theme-accent)] hover:border-[color-mix(in_srgb,var(--theme-accent)_60%,transparent)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5",
                "glass-ghost":
                    "bg-transparent text-[var(--theme-text-muted)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_80%,transparent)] hover:text-[var(--theme-text)]",
            },
            size: {
                default: "h-11 px-6 py-2",
                sm: "h-9 px-4 text-xs",
                lg: "h-14 px-10 text-base",
                icon: "h-10 w-10",
                // Hero button size
                hero: "h-14 px-8 text-base font-bold",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
