import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white shadow hover:bg-primary dark:bg-primary-700 dark:hover:bg-primary-600",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600",
        outline:
          "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 dark:border-[#383838] dark:bg-[#212121] dark:hover:bg-[#292929] dark:text-gray-200",
        secondary:
          "bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-100 dark:bg-[#292929] dark:text-gray-200 dark:hover:bg-[#333333]",
        ghost: "hover:bg-gray-100 dark:hover:bg-[#292929]",
        link: "text-primary underline-offset-4 hover:underline cursor-pointer dark:text-primary-400",
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
