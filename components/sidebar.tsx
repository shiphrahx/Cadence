"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  UserCircle,
  FolderKanban,
  Calendar,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "People", href: "/people", icon: UserCircle },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Meetings", href: "/meetings", icon: Calendar },
  { name: "Career Goals", href: "/career-goals", icon: Target },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-white dark:bg-[#212121] dark:border-[#383838] transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b dark:border-[#383838]">
        <Link href="/" className={cn(
          "flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#292929] transition-colors flex-1",
          isOpen ? "px-6" : "px-3 justify-center"
        )}>
          <Image
            src="/icon_02.png"
            alt="Cadence"
            width={35}
            height={35}
            className="h-[35px] w-[35px] object-contain rounded-lg flex-shrink-0"
          />
          {isOpen && <span className="text-xl font-semibold dark:text-gray-100">Cadence</span>}
        </Link>
        {isOpen && (
          <button
            onClick={onToggle}
            className="px-3 h-full hover:bg-gray-100 dark:hover:bg-[#292929] transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4 relative">
        {!isOpen && (
          <button
            onClick={onToggle}
            className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-[#292929] rounded-md px-2 py-2 text-sm font-medium transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5 dark:text-gray-400" />
          </button>

        )}
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-[#292929] dark:text-primary-400"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#292929] dark:hover:text-gray-100",
                !isOpen && "justify-center"
              )}
              title={!isOpen ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t dark:border-[#383838] p-4">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-[#292929] dark:text-primary-400"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#292929] dark:hover:text-gray-100",
                !isOpen && "justify-center"
              )}
              title={!isOpen ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && item.name}
            </Link>
          )
        })}
      </div>

      {/* User Profile */}
      <div className="border-t dark:border-[#383838] p-4">
        <button className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#292929]",
          !isOpen && "justify-center"
        )}
        title={!isOpen ? "User Profile" : undefined}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-400 flex-shrink-0">
            <span className="text-sm font-semibold">U</span>
          </div>
          {isOpen && (
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">User</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">View profile</div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
