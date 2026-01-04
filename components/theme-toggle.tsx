"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    const initialTheme = savedTheme || "system"

    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement

    if (newTheme === "dark") {
      root.classList.add("dark")
    } else if (newTheme === "light") {
      root.classList.remove("dark")
    } else if (newTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }

  const toggleTheme = () => {
    // Cycle through: light -> dark -> system -> light
    let newTheme: "light" | "dark" | "system"
    if (theme === "light") {
      newTheme = "dark"
    } else if (theme === "dark") {
      newTheme = "system"
    } else {
      newTheme = "light"
    }

    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  const getDisplayIcon = () => {
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      return prefersDark ? (
        <Sun className="h-4 w-4 text-gray-300" />
      ) : (
        <Moon className="h-4 w-4 text-gray-700" />
      )
    }
    return theme === "light" ? (
      <Moon className="h-4 w-4 text-gray-700" />
    ) : (
      <Sun className="h-4 w-4 text-gray-300" />
    )
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#383838] hover:bg-gray-50 dark:hover:bg-[#292929] transition-colors cursor-pointer shadow-sm"
      aria-label={`Current theme: ${theme}. Click to cycle themes.`}
      title={`Current: ${theme}. Click to cycle.`}
    >
      {getDisplayIcon()}
    </button>
  )
}
