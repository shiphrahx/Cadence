"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BadgeSelectOption {
  value: string
  label: string
  className?: string
}

interface BadgeSelectProps {
  value: string
  options: BadgeSelectOption[]
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function BadgeSelect({
  value,
  options,
  onValueChange,
  placeholder = "Select...",
  className,
}: BadgeSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
          "hover:opacity-80",
          selectedOption?.className || "bg-gray-100 text-gray-700"
        )}
      >
        {selectedOption?.label || placeholder}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 min-w-[120px] rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  "relative flex w-full items-center rounded-sm px-2 py-1.5 text-xs outline-none cursor-pointer",
                  "hover:bg-gray-100",
                  "transition-colors"
                )}
              >
                <span className={cn("flex-1", option.className?.includes("text-") && option.className)}>
                  {option.label}
                </span>
                {value === option.value && (
                  <Check className="ml-2 h-3 w-3 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
