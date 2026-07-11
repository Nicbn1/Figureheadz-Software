import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-display tracking-wide uppercase transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 comic-border active:translate-y-1 active:translate-x-1 active:shadow-none hover:-translate-y-1 hover:-translate-x-1",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-foreground shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_hsl(213_100%_50%)] hover:bg-primary hover:text-white",
        primary:
          "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_hsl(48_100%_50%)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]",
        outline:
          "bg-background shadow-[4px_4px_0px_0px_#000] hover:bg-accent hover:text-accent-foreground hover:shadow-[6px_6px_0px_0px_#000]",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2 text-xl",
        sm: "h-10 px-4 text-lg",
        lg: "h-16 px-10 text-3xl",
        icon: "h-12 w-12",
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
