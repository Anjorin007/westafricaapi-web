"use client"

import { useEffect, useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Globe, BarChart3, Ship, Users, Zap, Heart, Cpu, GitCompare, Download, Search } from "lucide-react"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
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

const CATEGORIES = [
  { key: "all", label: "Tous" },
  { key: "economy", label: "Economie" },
  { key: "trade", label: "Commerce" },
  { key: "population", label: "Demographie" },
  { key: "energy", label: "Energie" },
  { key: "health", label: "Sante" },
  { key: "technology", label: "Technologie" },
]

const COUNTRIES = [
  { code: "BJ", name: "Benin", zone: "UEMOA" },
  { code: "BF", name: "Burkina Faso", zone: "UEMOA" },
  { code: "CV", name: "Cap-Vert", zone: null },
  { code: "CI", name: "Cote d'Ivoire", zone: "UEMOA" },
  { code: "GM", name: "Gambie", zone: null },
  { code: "GH", name: "Ghana", zone: null },
  { code: "GN", name: "Guinee", zone: null },
  { code: "GW", name: "Guinee-Bissau", zone: "UEMOA" },
  { code: "LR", name: "Liberia", zone: null },
  { code: "ML", name: "Mali", zone: "UEMOA" },
  { code: "NE", name: "Niger", zone: "UEMOA" },
  { code: "NG", name: "Nigeria", zone: null },
  { code: "SN", name: "Senegal", zone: "UEMOA" },
  { code: "SL", name: "Sierra Leone", zone: null },
  { code: "TG", name: "Togo", zone: "UEMOA" },
]

export default function DataExplorerPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const { data: overview, isLoading } = useQuery({
    queryKey: ["data-overview"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=500&latest=true`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => fetch(`${API_URL}/v1/platform/stats`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const countryStats = useMemo(() => {
    if (!overview?.data) return {}
    const map: Record<string, Record<string, { value: number; year: number }>> = {}
    for (const dp of overview.data) {
      if (!map[dp.country_code]) map[dp.country_code] = {}
      map[dp.country_code][dp.metric_key] = { value: dp.value, year: dp.year }
    }
    return map
  }, [overview])

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Data Explorer" }]} />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Data Explorer</h1>
          <p className="text-sm text-white/50 mt-1">Explorez les indicateurs economiques, demographiques et commerciaux de l'Afrique de l'Ouest</p>
        </div>
        <span className="text-xs font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full px-3 py-1">
          {stats?.indicators ?? 411} indicateurs · {stats?.countries ?? 15} pays
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="Rechercher un pays ou indicateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0d1028] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/40 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200",
              category === cat.key
                ? "bg-teal-500/15 text-teal-400 border border-teal-500/30"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCountries.map((country, i) => {
          const cs = countryStats[country.code]
          const gdp = cs?.["NY.GDP.MKTP.KD.ZG"]
          const pop = cs?.["SP.POP.TOTL"]
          const inflation = cs?.["FP.CPI.TOTL.ZG"]

          return (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
            >
              <Link
                href={`/data/${country.code.toLowerCase()}`}
                className="block bg-[#0d1028] border border-white/[0.08] rounded-xl p-4 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={`https://flagcdn.com/32x24/${country.code.toLowerCase()}.png`}
                    alt={country.name}
                    width={32}
                    height={24}
                    className="rounded-sm"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">{country.name}</h3>
                    {country.zone && (
                      <span className="text-[10px] text-white/30 font-mono">{country.zone}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="PIB" value={gdp ? `${gdp.value.toFixed(1)}%` : "-"} loading={isLoading} />
                  <Metric label="Pop." value={pop ? formatPop(pop.value) : "-"} loading={isLoading} />
                  <Metric label="Inflation" value={inflation ? `${inflation.value.toFixed(1)}%` : "-"} loading={isLoading} />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06]">
          <StatCard label="Observations" value={stats.observations?.toLocaleString() ?? "0"} />
          <StatCard label="Indicateurs" value={stats.indicators ?? 0} />
          <StatCard label="Pays" value={stats.countries ?? 15} />
          <StatCard label="Sources" value={stats.sources ?? 0} />
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-1">
        <div className="h-2.5 w-8 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-12 bg-white/5 rounded animate-pulse" />
      </div>
    )
  }
  return (
    <div>
      <p className="text-[10px] text-white/30">{label}</p>
      <p className="text-xs font-semibold text-white/70">{value}</p>
    </div>
  )
}

function formatPop(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return String(val)
}
