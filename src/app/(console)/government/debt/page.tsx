"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { LayoutDashboard, Map, DollarSign, TrendingDown, Star } from "lucide-react"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { API_URL } from "@/lib/api"

const SIDEBAR_ITEMS = [
  { label: "Vue d'ensemble", href: "/government", icon: LayoutDashboard },
  { label: "Par pays", href: "/government/by-country", icon: Map },
  { label: "Budgets", href: "/government/budgets", icon: DollarSign },
  { label: "Dette publique", href: "/government/debt", icon: TrendingDown },
  { label: "Developpement", href: "/government/development", icon: Star },
]

const COUNTRIES: Record<string, string> = {
  BJ: "Benin", BF: "Burkina Faso", CV: "Cap-Vert", CI: "Cote d'Ivoire",
  GM: "Gambie", GH: "Ghana", GN: "Guinee", GW: "Guinee-Bissau",
  LR: "Liberia", ML: "Mali", NE: "Niger", NG: "Nigeria",
  SN: "Senegal", SL: "Sierra Leone", TG: "Togo",
}

type DebtRow = { country_code: string; country: string; debt_pct: number; source: string }

export default function DebtPage() {
  const { setItems, setTitle } = useSidebar()
  useEffect(() => {
    setTitle("FINANCES PUBLIQUES")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const { data: raw, isLoading } = useQuery({
    queryKey: ["government-debt"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=500&latest=true`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const rows = useMemo(() => {
    if (!raw?.data) return []
    const map: Record<string, DebtRow> = {}
    for (const dp of raw.data) {
      const key = dp.metric_key as string
      if (key !== "government_debt_pct_gdp" && key !== "imf_govt_gross_debt_pct_gdp") continue
      if (!map[dp.country_code] || key === "imf_govt_gross_debt_pct_gdp") {
        map[dp.country_code] = {
          country_code: dp.country_code,
          country: COUNTRIES[dp.country_code] ?? dp.country_code,
          debt_pct: dp.value,
          source: dp.source,
        }
      }
    }
    return Object.values(map).sort((a, b) => b.debt_pct - a.debt_pct)
  }, [raw])

  const maxDebt = rows.length > 0 ? rows[0].debt_pct : 100

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Finances publiques", href: "/government" }, { label: "Dette publique" }]} />

      <h1 className="text-2xl font-bold text-white tracking-tight">Dette publique (% PIB)</h1>
      <p className="text-sm text-white/50">Seuil de reference Maastricht : 60%</p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const widthPct = Math.min((row.debt_pct / maxDebt) * 100, 100)
            const color = row.debt_pct > 60 ? "bg-red-500/70" : row.debt_pct > 40 ? "bg-amber-500/70" : "bg-emerald-500/70"
            return (
              <div key={row.country_code} className="bg-[#0d1028] border border-white/[0.08] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Image src={`https://flagcdn.com/20x15/${row.country_code.toLowerCase()}.png`} alt="" width={20} height={15} className="rounded-sm" />
                    <span className="text-sm text-white/80">{row.country}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">{row.debt_pct.toFixed(1)}%</span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`absolute inset-y-0 left-0 rounded-full ${color} transition-all duration-500`} style={{ width: `${widthPct}%` }} />
                  <div className="absolute inset-y-0 left-[60%] w-px bg-white/20 border-l border-dashed border-white/30" style={{ left: `${(60 / maxDebt) * 100}%` }} />
                </div>
                <p className="text-[10px] text-white/30 mt-1">{row.source}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
