"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"

export function Sidebar() {
  const { items, title } = useSidebar()
  const pathname = usePathname()

  const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
    const group = item.group || "_default"
    if (!acc[group]) acc[group] = []
    acc[group].push(item)
    return acc
  }, {})

  const groupKeys = Object.keys(groups)

  return (
    <aside className="w-56 shrink-0 bg-[#080b1a] border-r border-white/[0.06] overflow-y-auto">
      {title && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {title}
          </span>
        </div>
      )}

      {groupKeys.length === 0 && (
        <div className="flex items-center justify-center h-full opacity-20">
          <span className="text-xs text-white/40">No module selected</span>
        </div>
      )}

      <nav className="px-2 py-1 space-y-0.5">
        {groupKeys.map((group, gi) => (
          <div key={group}>
            {group !== "_default" && (
              <div className="px-2 pt-4 pb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/20">
                  {group}
                </span>
              </div>
            )}
            {gi > 0 && group === "_default" && (
              <div className="my-2 border-t border-white/[0.06]" />
            )}
            {groups[group].map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
