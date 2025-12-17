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
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "People", href: "/people", icon: UserCircle },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Meetings", href: "/meetings", icon: Calendar },
  { name: "Career Goals", href: "/career", icon: Target },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <Link href="/" className="flex h-16 items-center gap-3 border-b px-6 hover:bg-gray-50 transition-colors">
        <Image
          src="/icon_02.png"
          alt="Cadence"
          width={50}
          height={50}
          className="h-[50px] w-[50px] object-contain rounded-lg"
        />
        <span className="text-xl font-semibold">Cadence</span>
      </Link>

      {/* Search */}
      <div className="border-b p-4">
        <button className="flex w-full items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100">
          <Search className="h-4 w-4" />
          <span>Search</span>
          <kbd className="ml-auto rounded border bg-white px-1.5 py-0.5 text-xs">⌘K</kbd>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t p-4">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* User Profile */}
      <div className="border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <span className="text-sm font-semibold">U</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900">User</div>
            <div className="text-xs text-gray-500">View profile</div>
          </div>
        </button>
      </div>
    </div>
  )
}
