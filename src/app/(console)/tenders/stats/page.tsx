"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, MapPin, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { ChartCard } from "@/components/ui/chart-card"
import { DataTable, type Column } from "@/components/ui/data-table"

const API_URL = "https://ecowas-api.onrender.com"

const SIDEBAR_ITEMS = [
  { label: "Tous les marches", href: "/tenders", icon: FileText },
  { label: "Par pays", href: "/tenders/by-country", icon: MapPin },
  { label: "Statistiques", href: "/tenders/stats", icon: BarChart3 },
]

const COUNTRIES: Record<string, string> = {
  BJ: "Benin", BF: "Burkina Faso", CV: "Cap-Vert", CI: "Cote d'Ivoire",
  GM: "Gambie", GH: "Ghana", GN: "Guinee", GW: "Guinee-Bissau",
  LR: "Liberia", ML: "Mali", NE: "Niger", NG: "Nigeria",
  SN: "Senegal", SL: "Sierra Leone", TG: "Togo",
}

type RankRow = {
  rank: number
  country: string
  volume: string
  open: number
}

export default function TendersStatsPage() {  const { data: allData, isLoading } = useQuery({
    queryKey: ["data", "tenders-stats"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=500&latest=true`).then((r) => r.json()),
  })

  const indicators = allData?.data ?? allData?.results ?? []
  const tenderIndicators = indicators.filter((d: Record<string, unknown>) =>
    String(d.metric_key ?? d.indicator_code ?? "").includes("tenders")
  )

  const countryMap = new Map<string, { open: number; awarded: number; published: number; volume: number }>()

  tenderIndicators.forEach((d: Record<string, unknown>) => {
    const cc = String(d.country_code ?? d.country ?? "").toUpperCase()
    if (!cc || !COUNTRIES[cc]) return
    const key = String(d.metric_key ?? d.indicator_code ?? "")
    const val = Number(d.value ?? 0)
    if (!countryMap.has(cc)) countryMap.set(cc, { open: 0, awarded: 0, published: 0, volume: 0 })
    const entry = countryMap.get(cc)!
    if (key.includes("open")) entry.open = val
    else if (key.includes("awarded")) entry.awarded = val
    else if (key.includes("published")) entry.published = val
    else if (key.includes("volume")) entry.volume = val
  })

  const sorted = Array.from(countryMap.entries())
    .map(([cc, vals]) => ({ cc, name: COUNTRIES[cc], ...vals }))
    .sort((a, b) => b.volume - a.volume)

  const chartData = sorted.map((s) => ({ name: s.name, volume: s.volume }))

  const topOpen = sorted.reduce((best, cur) => (cur.open > (best?.open ?? 0) ? cur : best), sorted[0])
  const avgRatio = sorted.length > 0
    ? Math.round(sorted.reduce((s, c) => s + (c.published > 0 ? c.awarded / c.published : 0), 0) / sorted.length * 100)
    : 0

  const columns: Column<RankRow>[] = [
    { key: "rank", header: "#" },
    { key: "country", header: "Pays" },
    { key: "volume", header: "Volume", align: "right" },
    { key: "open", header: "Ouverts", align: "right" },
  ]

  const tableData: RankRow[] = sorted.map((s, i) => ({
    rank: i + 1,
    country: s.name,
    volume: s.volume > 0 ? s.volume.toLocaleString("fr-FR") : "-",
    open: s.open,
  }))

  return (
    <div className="space-y-8 p-6">
      <Breadcrumbs items={[{ label: "Marches publics", href: "/tenders" }, { label: "Statistiques" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white">Statistiques</h1>
        <p className="text-sm text-white/50 mt-1">Volumes et classements des marches publics CEDEAO</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Plus de marches ouverts" value={topOpen?.name ?? "-"} loading={isLoading} />
        <StatCard label="Ratio attribution moyen" value={avgRatio ? `${avgRatio}%` : "-"} loading={isLoading} />
        <StatCard label="Pays avec donnees" value={sorted.length || "-"} loading={isLoading} />
      </div>

      <ChartCard title="Volume par pays" subtitle="Classement decroissant" loading={isLoading}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" stroke="#ffffff20" tick={{ fill: "#ffffff60", fontSize: 10 }} />
              <YAxis type="category" dataKey="name" stroke="#ffffff20" tick={{ fill: "#ffffff60", fontSize: 11 }} width={75} />
              <Tooltip contentStyle={{ background: "#0d1028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#14b8a6" }} />
              <Bar dataKey="volume" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <DataTable columns={columns} data={tableData} loading={isLoading} pageSize={15} emptyMessage="Aucune donnee disponible" />
    </div>
  )
}
