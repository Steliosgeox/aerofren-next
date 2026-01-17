"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cb8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06101f] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default:
                    "bg-[#0066cc] text-white shadow-md hover:bg-[#004999] hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5",
                destructive:
                    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-red-500/20",
                outline:
                    "border-2 border-[#0066cc] text-[#0066cc] bg-transparent hover:bg-[#0066cc] hover:text-white hover:shadow-lg hover:shadow-blue-500/20",
                secondary:
                    "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 hover:border-slate-300",
                ghost:
                    "hover:bg-slate-100 hover:text-slate-900",
                link:
                    "text-[#0066cc] underline-offset-4 hover:underline",
                // Glass variants for dark backgrounds
                "glass-primary":
                    "bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg shadow-black/20 hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:-translate-y-0.5",
                "glass-secondary":
                    "bg-white/5 backdrop-blur-sm text-white/90 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20",
                "glass-accent":
                    "bg-[#0066cc]/90 backdrop-blur-md text-white border border-[#3399ff]/30 shadow-lg shadow-blue-500/25 hover:bg-[#0066cc] hover:border-[#3399ff]/50 hover:shadow-[0_8px_30px_rgba(0,102,204,0.4)] hover:-translate-y-0.5",
                "glass-ghost":
                    "bg-transparent text-white/80 hover:bg-white/10 hover:text-white",
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
