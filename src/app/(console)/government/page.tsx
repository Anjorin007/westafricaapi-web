"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Map, DollarSign, TrendingDown, Star } from "lucide-react"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable, type Column } from "@/components/ui/data-table"
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

type GovRow = Record<string, unknown> & {
  country_code: string
  country: string
  revenue: number | null
  expenditure: number | null
  deficit_gdp: number | null
  hdi: number | null
}

export default function GovernmentPage() {  const { data: raw, isLoading } = useQuery({
    queryKey: ["government-overview"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=500&latest=true`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const { rows, medianDeficit, surplusCount, deficitCount } = useMemo(() => {
    if (!raw?.data) return { rows: [], medianDeficit: 0, surplusCount: 0, deficitCount: 0 }
    const byCountry: Record<string, Record<string, number>> = {}
    for (const dp of raw.data) {
      const key = dp.metric_key as string
      if (!key.match(/^(budget|tax_revenue|government|imf_govt|undp_hdi)/)) continue
      if (!byCountry[dp.country_code]) byCountry[dp.country_code] = {}
      byCountry[dp.country_code][key] = dp.value
    }
    const rows: GovRow[] = Object.entries(byCountry).map(([code, m]) => ({
      country_code: code,
      country: COUNTRIES[code] ?? code,
      revenue: m["tax_revenue_pct_gdp"] ?? m["government_revenue_pct_gdp"] ?? null,
      expenditure: m["government_expenditure_pct_gdp"] ?? null,
      deficit_gdp: m["budget_deficit_pct_gdp"] ?? m["imf_govt_net_lending_pct_gdp"] ?? null,
      hdi: m["undp_hdi"] ?? null,
    }))
    const deficits = rows.filter((r) => r.deficit_gdp != null).map((r) => r.deficit_gdp!)
    deficits.sort((a, b) => a - b)
    const median = deficits.length > 0 ? deficits[Math.floor(deficits.length / 2)] : 0
    return {
      rows: rows.sort((a, b) => (a.deficit_gdp ?? 0) - (b.deficit_gdp ?? 0)),
      medianDeficit: median,
      surplusCount: deficits.filter((d) => d > 0).length,
      deficitCount: deficits.filter((d) => d < 0).length,
    }
  }, [raw])

  const columns: Column<GovRow>[] = [
    {
      key: "country",
      header: "Pays",
      render: (row) => (
        <Link href={`/government/${row.country_code.toLowerCase()}`} className="flex items-center gap-2 hover:text-teal-400 transition-colors">
          <Image src={`https://flagcdn.com/20x15/${row.country_code.toLowerCase()}.png`} alt="" width={20} height={15} className="rounded-sm" />
          <span>{row.country}</span>
        </Link>
      ),
    },
    { key: "revenue", header: "Recettes (% PIB)", align: "right", render: (r) => r.revenue != null ? `${r.revenue.toFixed(1)}%` : "-" },
    { key: "expenditure", header: "Depenses (% PIB)", align: "right", render: (r) => r.expenditure != null ? `${r.expenditure.toFixed(1)}%` : "-" },
    {
      key: "deficit_gdp",
      header: "Deficit/PIB",
      align: "right",
      render: (r) => r.deficit_gdp != null ? (
        <span className={r.deficit_gdp >= 0 ? "text-emerald-400" : "text-red-400"}>
          {r.deficit_gdp > 0 ? "+" : ""}{r.deficit_gdp.toFixed(1)}%
        </span>
      ) : "-",
    },
    { key: "hdi", header: "IDH", align: "right", render: (r) => r.hdi != null ? r.hdi.toFixed(3) : "-" },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Finances publiques" }]} />

      <h1 className="text-2xl font-bold text-white tracking-tight">Finances publiques CEDEAO</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Mediane deficit/PIB" value={`${medianDeficit.toFixed(1)}%`} loading={isLoading} />
        <StatCard label="Pays avec surplus" value={surplusCount} trend="up" loading={isLoading} />
        <StatCard label="Pays avec deficit" value={deficitCount} trend="down" loading={isLoading} />
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pageSize={15} />
    </div>
  )
}
