import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white shadow hover:bg-primary bg-primary-dark bg-[#84ffc4] hover:bg-[#66ffb8] text-gray-900",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500 bg-red-700 hover:bg-red-600",
        outline:
          "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 border-[#383838] bg-[#212121] hover:bg-[#292929] text-gray-200",
        secondary:
          "bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-100 bg-[#292929] text-gray-200 hover:bg-[#333333]",
        ghost: "hover:bg-gray-100 hover:bg-[#292929]",
        link: "text-primary underline-offset-4 hover:underline cursor-pointer text-primary-dark-400",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
