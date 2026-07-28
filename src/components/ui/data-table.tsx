"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  align?: "left" | "right"
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  pageSize?: number
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyMessage = "Aucune donnee disponible",
  pageSize = 10,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(data.length / pageSize)
  const pageData = data.slice(page * pageSize, (page + 1) * pageSize)

  if (loading) {
    return (
      <div className="bg-[#0a0e1f] rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 border-b border-white/5 flex items-center px-4">
              <div className="h-3 w-full max-w-48 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#0a0e1f] rounded-xl border border-white/[0.08] p-8 text-center text-sm text-white/40">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="bg-[#0a0e1f] rounded-xl border border-white/[0.08] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-2.5 text-xs font-medium text-white/40 uppercase tracking-wider",
                  col.align === "right" ? "text-right" : "text-left"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 text-white/70",
                    col.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.08] text-xs text-white/40">
          <span>
            {page * pageSize + 1} a {Math.min((page + 1) * pageSize, data.length)} de {data.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
