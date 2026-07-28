"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Globe, BarChart3, Ship, Users, Zap, Heart, Cpu, GitCompare, Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable, type Column } from "@/components/ui/data-table"
import { ChartCard } from "@/components/ui/chart-card"
import { CopyButton } from "@/components/ui/copy-button"
import { API_URL } from "@/lib/api"

const SIDEBAR_ITEMS = [
  { group: "Vue d'ensemble", label: "Tous les pays", href: "/data", icon: Globe },
  { group: "Categories", label: "Economie", href: "/data?cat=economy", icon: BarChart3 },
  { group: "Categories", label: "Commerce", href: "/data?cat=trade", icon: Ship },
  { group: "Categories", label: "Demographie", href: "/data?cat=population", icon: Users },
  { group: "Categories", label: "Energie", href: "/data?cat=energy", icon: Zap },
  { group: "Categories", label: "Sante", href: "/data?cat=health", icon: Heart },
  { group: "Categories", label: "Technologie", href: "/data?cat=technology", icon: Cpu },
  { group: "Outils", label: "Comparer", href: "/compare", icon: GitCompare },
  { group: "Outils", label: "Telecharger", href: "/data?format=csv", icon: Download },
]

const COUNTRY_NAMES: Record<string, string> = {
  bj: "Benin", bf: "Burkina Faso", cv: "Cap-Vert", ci: "Cote d'Ivoire",
  gm: "Gambie", gh: "Ghana", gn: "Guinee", gw: "Guinee-Bissau",
  lr: "Liberia", ml: "Mali", ne: "Niger", ng: "Nigeria",
  sn: "Senegal", sl: "Sierra Leone", tg: "Togo",
}

type HistoryPoint = { year: number; value: number; source?: string; source_url?: string }

export default function IndicatorPage() {
  const params = useParams()
  const countryCode = (params.country as string).toLowerCase()
  const countryCodeUpper = countryCode.toUpperCase()
  const indicator = decodeURIComponent(params.indicator as string)
  const countryName = COUNTRY_NAMES[countryCode] ?? countryCodeUpper

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["indicator-history", countryCode, indicator],
    queryFn: () => fetch(`${API_URL}/v1/economy/${countryCodeUpper}/history?indicator=${indicator}`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const sortedHistory: HistoryPoint[] = useMemo(() => {
    if (!historyData?.data) return []
    return [...historyData.data].sort((a: HistoryPoint, b: HistoryPoint) => a.year - b.year)
  }, [historyData])

  const latestValue = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1] : null
  const previousValue = sortedHistory.length > 1 ? sortedHistory[sortedHistory.length - 2] : null

  const tableData = useMemo(() => {
    return sortedHistory.map((point, i) => {
      const prev = i > 0 ? sortedHistory[i - 1].value : null
      const yoy = prev && prev !== 0 ? ((point.value - prev) / Math.abs(prev)) * 100 : null
      return { year: point.year, value: point.value, yoy, source: point.source ?? "" }
    }).reverse()
  }, [sortedHistory])

  const columns: Column<Record<string, unknown>>[] = [
    { key: "year", header: "Annee", align: "right" },
    { key: "value", header: "Valeur", align: "right", render: (row) => (row.value as number)?.toLocaleString() ?? "-" },
    { key: "yoy", header: "Variation YoY", align: "right", render: (row) => {
      const v = row.yoy as number | null
      if (v === null) return "-"
      const color = v > 0 ? "text-emerald-400" : v < 0 ? "text-red-400" : "text-white/40"
      return <span className={color}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>
    }},
  ]

  const curlExample = `curl "${API_URL}/v1/economy/${countryCodeUpper}/history?indicator=${indicator}" \\
  -H "Authorization: Bearer ek_live_..."`

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Data", href: "/data" },
        { label: countryName, href: `/data/${countryCode}` },
        { label: indicator },
      ]} />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{indicator.replace(/_/g, " ")}</h1>
          <p className="text-sm text-white/40 mt-0.5">{countryName}</p>
        </div>
        {latestValue && (
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{latestValue.value.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">{latestValue.year}</p>
            {latestValue.source && (
              <span className="inline-block mt-1 text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded px-2 py-0.5">
                {latestValue.source}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Derniere valeur" value={latestValue?.value.toLocaleString() ?? "-"} loading={isLoading} />
        <StatCard label="Annee" value={latestValue?.year ?? "-"} loading={isLoading} />
        <StatCard
          label="Variation"
          value={latestValue && previousValue ? `${(((latestValue.value - previousValue.value) / Math.abs(previousValue.value)) * 100).toFixed(1)}%` : "-"}
          trend={latestValue && previousValue ? (latestValue.value >= previousValue.value ? "up" : "down") : undefined}
          loading={isLoading}
        />
        <StatCard label="Observations" value={sortedHistory.length} loading={isLoading} />
      </div>

      <ChartCard title="Historique" subtitle={`${indicator} - ${countryName}`} loading={isLoading}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={sortedHistory}>
            <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip
              contentStyle={{ background: "#0d1028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "rgba(255,255,255,0.5)" }}
              itemStyle={{ color: "#14b8a6" }}
            />
            <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} dot={{ fill: "#14b8a6", r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable columns={columns} data={tableData as unknown as Record<string, unknown>[]} pageSize={20} loading={isLoading} />

      <div className="bg-[#0a0e1f] rounded-xl border border-white/[0.08] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Metadonnees</h3>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <dt className="text-white/30">Source</dt>
          <dd className="text-white/60">{latestValue?.source ?? "-"}</dd>
          <dt className="text-white/30">Indicateur</dt>
          <dd className="text-white/60 font-mono">{indicator}</dd>
          <dt className="text-white/30">Pays</dt>
          <dd className="text-white/60">{countryName} ({countryCodeUpper})</dd>
          <dt className="text-white/30">Observations</dt>
          <dd className="text-white/60">{sortedHistory.length}</dd>
        </dl>
      </div>

      <div className="bg-[#0a0e1f] rounded-xl border border-white/[0.08] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Export</h3>
          <div className="flex gap-2">
            <button className="text-xs px-2.5 py-1 rounded bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">JSON</button>
            <button className="text-xs px-2.5 py-1 rounded bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">CSV</button>
          </div>
        </div>
        <div className="relative">
          <pre className="text-xs text-white/60 font-mono bg-black/30 rounded-lg p-4 overflow-x-auto">
            {curlExample}
          </pre>
          <CopyButton text={curlExample} label="Copier" className="absolute top-2 right-2" />
        </div>
      </div>
    </div>
  )
}
