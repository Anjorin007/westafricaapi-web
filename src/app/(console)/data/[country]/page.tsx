"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import Image from "next/image"
import Link from "next/link"
import { Globe, BarChart3, Ship, Users, Zap, Heart, Cpu, GitCompare, Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable, type Column } from "@/components/ui/data-table"
import { ChartCard } from "@/components/ui/chart-card"
import { CopyButton } from "@/components/ui/copy-button"
import { API_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

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

const TABS = [
  { key: "economy", label: "Economie" },
  { key: "trade", label: "Commerce" },
  { key: "population", label: "Demographie" },
  { key: "energy", label: "Energie" },
  { key: "technology", label: "Technologie" },
  { key: "all", label: "Tous" },
]

const CATEGORY_MAP: Record<string, string> = {
  economy: "economy",
  trade: "trade",
  population: "population",
  energy: "energy",
  technology: "technology",
}

const COUNTRY_META: Record<string, { name: string; zone: string | null; currency: string; language: string }> = {
  bj: { name: "Benin", zone: "UEMOA", currency: "XOF", language: "Francais" },
  bf: { name: "Burkina Faso", zone: "UEMOA", currency: "XOF", language: "Francais" },
  cv: { name: "Cap-Vert", zone: null, currency: "CVE", language: "Portugais" },
  ci: { name: "Cote d'Ivoire", zone: "UEMOA", currency: "XOF", language: "Francais" },
  gm: { name: "Gambie", zone: null, currency: "GMD", language: "Anglais" },
  gh: { name: "Ghana", zone: null, currency: "GHS", language: "Anglais" },
  gn: { name: "Guinee", zone: null, currency: "GNF", language: "Francais" },
  gw: { name: "Guinee-Bissau", zone: "UEMOA", currency: "XOF", language: "Portugais" },
  lr: { name: "Liberia", zone: null, currency: "LRD", language: "Anglais" },
  ml: { name: "Mali", zone: "UEMOA", currency: "XOF", language: "Francais" },
  ne: { name: "Niger", zone: "UEMOA", currency: "XOF", language: "Francais" },
  ng: { name: "Nigeria", zone: null, currency: "NGN", language: "Anglais" },
  sn: { name: "Senegal", zone: "UEMOA", currency: "XOF", language: "Francais" },
  sl: { name: "Sierra Leone", zone: null, currency: "SLE", language: "Anglais" },
  tg: { name: "Togo", zone: "UEMOA", currency: "XOF", language: "Francais" },
}

type DataRow = {
  metric_key: string
  value: number
  year: number
  source: string
  unit?: string
  category?: string
}

export default function CountryPage() {
  const params = useParams()
  const countryCode = (params.country as string).toLowerCase()
  const countryCodeUpper = countryCode.toUpperCase()
  const meta = COUNTRY_META[countryCode]

  const { setItems, setTitle } = useSidebar()
  const [tab, setTab] = useQueryState("tab", { defaultValue: "economy" })

  useEffect(() => {
    setTitle("DATA EXPLORER")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const { data: allData, isLoading } = useQuery({
    queryKey: ["country-data", countryCode],
    queryFn: () => fetch(`${API_URL}/v1/data?country=${countryCodeUpper}&latest=true&limit=100`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const { data: historyData } = useQuery({
    queryKey: ["country-history", countryCode, tab],
    queryFn: () => {
      if (tab === "all") return null
      const indicator = tab === "economy" ? "NY.GDP.MKTP.KD.ZG" : `SP.POP.TOTL`
      return fetch(`${API_URL}/v1/economy/${countryCodeUpper}/history?indicator=${indicator}`).then((r) => r.json())
    },
    staleTime: 5 * 60 * 1000,
    enabled: tab !== "all",
  })

  const filteredData: DataRow[] = useMemo(() => {
    if (!allData?.data) return []
    if (tab === "all") return allData.data
    return allData.data.filter((d: DataRow) => {
      if (!d.category) return tab === "economy"
      return d.category === CATEGORY_MAP[tab]
    })
  }, [allData, tab])

  const topStats = useMemo(() => {
    if (!filteredData.length) return []
    return filteredData.slice(0, 4)
  }, [filteredData])

  const chartData = useMemo(() => {
    if (!historyData?.data) return []
    return historyData.data
      .map((d: { year: number; value: number }) => ({ year: d.year, value: d.value }))
      .sort((a: { year: number }, b: { year: number }) => a.year - b.year)
  }, [historyData])

  const columns: Column<DataRow>[] = [
    { key: "metric_key", header: "Indicateur", render: (row) => (
      <Link href={`/data/${countryCode}/${row.metric_key}`} className="text-teal-400 hover:underline">
        {row.metric_key}
      </Link>
    )},
    { key: "value", header: "Valeur", align: "right", render: (row) => row.value?.toLocaleString() ?? "-" },
    { key: "unit", header: "Unite", render: (row) => row.unit ?? "-" },
    { key: "year", header: "Annee", align: "right" },
    { key: "source", header: "Source" },
  ]

  const curlExample = `curl ${API_URL}/v1/economy/${countryCodeUpper} \\
  -H "Authorization: Bearer ek_live_..."`

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Data", href: "/data" }, { label: meta?.name ?? countryCodeUpper }]} />

      <div className="flex items-center gap-4">
        <Image
          src={`https://flagcdn.com/48x36/${countryCode}.png`}
          alt={meta?.name ?? countryCode}
          width={48}
          height={36}
          className="rounded-sm"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{meta?.name ?? countryCodeUpper}</h1>
          <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
            <span className="font-mono">{countryCodeUpper}</span>
            {meta?.zone && <span className="bg-white/5 px-1.5 py-0.5 rounded">{meta.zone}</span>}
            <span>{meta?.currency}</span>
            <span>{meta?.language}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-px overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-all duration-200",
              tab === t.key
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-white/40 hover:text-white/70"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCard key={i} label="" value="" loading />)
          : topStats.map((s) => (
              <StatCard
                key={s.metric_key}
                label={s.metric_key.replace(/_/g, " ").slice(0, 30)}
                value={s.value?.toLocaleString() ?? "-"}
                unit={s.unit}
              />
            ))}
      </div>

      {chartData.length > 0 && (
        <ChartCard title="Historique" subtitle={tab === "economy" ? "PIB croissance (%)" : "Population"}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: "#0d1028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                itemStyle={{ color: "#14b8a6" }}
              />
              <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <DataTable<DataRow> columns={columns} data={filteredData} loading={isLoading} pageSize={15} />

      <div className="bg-[#0a0e1f] rounded-xl border border-white/[0.08] p-5 space-y-3">
        <h3 className="text-sm font-medium text-white">Reference API</h3>
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
