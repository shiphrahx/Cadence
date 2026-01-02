"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Remove any existing dark class first to ensure clean state
    document.documentElement.classList.remove("dark")

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const initialTheme = savedTheme || "light" // Default to light, ignore system preference

    setTheme(initialTheme)

    // Only add dark class if explicitly set to dark
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#383838] hover:bg-gray-50 dark:hover:bg-[#292929] transition-colors cursor-pointer shadow-sm"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-gray-700" />
      ) : (
        <Sun className="h-4 w-4 text-gray-300" />
      )}
    </button>
  )
}
