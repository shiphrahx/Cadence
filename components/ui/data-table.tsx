"use client"

import { useState, useMemo, ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, ArrowUpDown, Filter } from "lucide-react"

export interface ColumnDef<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => ReactNode
  sortable?: boolean
  className?: string
}

export interface FilterDef<T> {
  id: string
  label: string
  options: { value: string; label: string }[]
  filterFn: (item: T, value: string) => boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  filters?: FilterDef<T>[]
  searchKeys?: (keyof T)[]
  searchPlaceholder?: string
  onRowClick?: (item: T) => void
  onQuickAdd?: () => void
  quickAddLabel?: string
  emptyState?: ReactNode
}

export function DataTable<T extends { id?: number | string }>({
  data,
  columns,
  filters = [],
  searchKeys = [],
  searchPlaceholder = "Search...",
  onRowClick,
  onQuickAdd,
  quickAddLabel = "New item",
  emptyState,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    filters.reduce((acc, filter) => ({ ...acc, [filter.id]: "all" }), {})
  )
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (columnId: string) => {
    if (sortField === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(columnId)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter((item) => {
      // Search filter
      if (searchQuery && searchKeys.length > 0) {
        const matchesSearch = searchKeys.some((key) => {
          const value = item[key]
          return value && String(value).toLowerCase().includes(searchQuery.toLowerCase())
        })
        if (!matchesSearch) return false
      }

      // Custom filters
      for (const filter of filters) {
        const filterValue = filterValues[filter.id]
        if (filterValue && filterValue !== "all") {
          if (!filter.filterFn(item, filterValue)) return false
        }
      }

      return true
    })

    // Sorting
    if (sortField) {
      const column = columns.find((col) => col.id === sortField)
      if (column && column.accessorKey) {
        filtered.sort((a, b) => {
          const aValue = a[column.accessorKey!]
          const bValue = b[column.accessorKey!]

          let comparison = 0
          if (aValue == null) comparison = 1
          else if (bValue == null) comparison = -1
          else if (typeof aValue === "string" && typeof bValue === "string") {
            comparison = aValue.localeCompare(bValue)
          } else if (typeof aValue === "number" && typeof bValue === "number") {
            comparison = aValue - bValue
          } else {
            comparison = String(aValue).localeCompare(String(bValue))
          }

          return sortDirection === "asc" ? comparison : -comparison
        })
      }
    }

    return filtered
  }, [data, searchQuery, searchKeys, filterValues, filters, sortField, sortDirection, columns])

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {searchKeys.length > 0 && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {filters.length > 0 && (
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
        {onQuickAdd && (
          <Button size="sm" onClick={onQuickAdd}>
            <Plus className="h-4 w-4 mr-2" />
            {quickAddLabel}
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#262626] rounded-lg border dark:border-[#383838]">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                {filter.label}:
              </label>
              <select
                value={filterValues[filter.id]}
                onChange={(e) =>
                  setFilterValues({ ...filterValues, [filter.id]: e.target.value })
                }
                className="text-sm border border-gray-300 dark:border-[#383838] dark:bg-[#262626] dark:text-gray-100 rounded-md px-2 py-1"
              >
                <option value="all">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="border dark:border-[#383838] rounded-lg bg-white dark:bg-[#262626] max-md:overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b dark:border-[#383838]">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`text-left p-3 bg-gray-50 dark:bg-[#262626] font-semibold text-sm dark:text-gray-100 ${column.className || ""}`}
                >
                  {column.sortable !== false ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className="flex items-center gap-1 hover:text-primary-600 dark:text-primary-dark-400 dark:hover:text-primary-dark-400 dark:hover:text-primary-400"
                    >
                      {column.header}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className="border-b dark:border-[#383838] hover:bg-gray-50 dark:hover:bg-[#292929] transition-colors cursor-pointer"
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`p-3 text-sm ${column.className || ""}`}
                    >
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                          ? String(item[column.accessorKey] || "")
                          : ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">No items found</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
            {onQuickAdd && filteredAndSortedData.length > 0 && (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <button
                    onClick={onQuickAdd}
                    className="w-full text-left px-3 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#292929] transition-colors flex items-center gap-2 border-t dark:border-[#383838]"
                  >
                    <Plus className="h-4 w-4" />
                    {quickAddLabel}
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
