"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { LayoutDashboard, Map, DollarSign, TrendingDown, Star } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { ChartCard } from "@/components/ui/chart-card"
import { CopyButton } from "@/components/ui/copy-button"
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
  bj: "Benin", bf: "Burkina Faso", cv: "Cap-Vert", ci: "Cote d'Ivoire",
  gm: "Gambie", gh: "Ghana", gn: "Guinee", gw: "Guinee-Bissau",
  lr: "Liberia", ml: "Mali", ne: "Niger", ng: "Nigeria",
  sn: "Senegal", sl: "Sierra Leone", tg: "Togo",
}

type IndicatorRow = Record<string, unknown> & { metric_key: string; value: number; year: number; source: string }

export default function GovernmentCountryPage() {
  const params = useParams<{ country: string }>()
  const code = params.country.toLowerCase()
  const countryName = COUNTRIES[code] ?? code.toUpperCase()

  const { setItems, setTitle } = useSidebar()
  useEffect(() => {
    setTitle("FINANCES PUBLIQUES")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const { data: raw, isLoading } = useQuery({
    queryKey: ["government-country", code],
    queryFn: () => fetch(`${API_URL}/v1/data?country=${code.toUpperCase()}&latest=true&limit=100`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const { revenue, expenditure, deficit, hdi, indicators, chartData } = useMemo(() => {
    if (!raw?.data) return { revenue: null, expenditure: null, deficit: null, hdi: null, indicators: [], chartData: [] }
    const map: Record<string, { value: number; year: number; source: string }> = {}
    for (const dp of raw.data) {
      const key = dp.metric_key as string
      if (key.match(/^(budget|tax_revenue|government|imf_govt|undp_hdi)/)) {
        map[key] = { value: dp.value, year: dp.year, source: dp.source }
      }
    }
    const indicators: IndicatorRow[] = Object.entries(map).map(([k, v]) => ({ metric_key: k, ...v }))
    const rev = map["tax_revenue_pct_gdp"]?.value ?? map["government_revenue_pct_gdp"]?.value ?? null
    const exp = map["government_expenditure_pct_gdp"]?.value ?? null
    const chartData = rev != null && exp != null ? [{ name: "Budget", Recettes: rev, Depenses: exp }] : []
    return {
      revenue: rev,
      expenditure: exp,
      deficit: map["budget_deficit_pct_gdp"]?.value ?? map["imf_govt_net_lending_pct_gdp"]?.value ?? null,
      hdi: map["undp_hdi"]?.value ?? null,
      indicators,
      chartData,
    }
  }, [raw])

  const curlCmd = `curl -H "Authorization: Bearer YOUR_KEY" \\\n  "${API_URL}/v1/data?country=${code.toUpperCase()}&latest=true"`

  const columns: Column<IndicatorRow>[] = [
    { key: "metric_key", header: "Indicateur", render: (r) => <span className="font-mono text-xs">{r.metric_key}</span> },
    { key: "value", header: "Valeur", align: "right", render: (r) => r.value.toFixed(2) },
    { key: "year", header: "Annee", align: "right", render: (r) => String(r.year) },
    { key: "source", header: "Source", render: (r) => <span className="text-white/30 text-xs">{r.source}</span> },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Finances publiques", href: "/government" }, { label: countryName }]} />

      <div className="flex items-center gap-3">
        <Image src={`https://flagcdn.com/32x24/${code}.png`} alt={countryName} width={32} height={24} className="rounded-sm" />
        <h1 className="text-2xl font-bold text-white tracking-tight">{countryName}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Recettes (% PIB)" value={revenue != null ? `${revenue.toFixed(1)}%` : "-"} loading={isLoading} />
        <StatCard label="Depenses (% PIB)" value={expenditure != null ? `${expenditure.toFixed(1)}%` : "-"} loading={isLoading} />
        <StatCard
          label="Deficit/PIB"
          value={deficit != null ? `${deficit.toFixed(1)}%` : "-"}
          trend={deficit != null ? (deficit >= 0 ? "up" : "down") : undefined}
          loading={isLoading}
        />
        <StatCard label="IDH" value={hdi != null ? hdi.toFixed(3) : "-"} loading={isLoading} />
      </div>

      {chartData.length > 0 && (
        <ChartCard title="Recettes vs Depenses" subtitle="% du PIB">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Recettes" fill="#14b8a6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Depenses" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <DataTable columns={columns} data={indicators} loading={isLoading} />

      <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">API</h3>
          <CopyButton text={curlCmd} label="Copier" />
        </div>
        <pre className="text-xs text-white/60 font-mono bg-black/30 rounded-lg p-3 overflow-x-auto">{curlCmd}</pre>
      </div>
    </div>
  )
}
