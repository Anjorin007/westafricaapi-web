"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const modules = [
  { label: "Data", href: "/data" },
  { label: "Markets", href: "/markets" },
  { label: "Tenders", href: "/tenders" },
  { label: "Trade", href: "/trade" },
  { label: "Government", href: "/government" },
  { label: "Elections", href: "/elections" },
]

export function TopBar() {
  const pathname = usePathname()

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-[#0a0e1f]/95 backdrop-blur border-b border-white/[0.08] shrink-0">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-sm font-bold text-white bg-gradient-to-br from-indigo-500 to-teal-400 rounded px-1.5 py-0.5">
          WA
        </span>
        <span className="text-sm font-medium text-white/70 hidden sm:inline">
          WestAfrica API
        </span>
      </Link>

      <nav className="flex items-center gap-0.5">
        {modules.map((m) => {
          const isActive = pathname.startsWith(m.href)
          return (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {m.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/docs"
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Docs
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          API Live
        </div>
      </div>
    </header>
  )
}
