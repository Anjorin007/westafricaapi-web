"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { Globe, Map, Percent, Route } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { ChartCard } from "@/components/ui/chart-card"
import { CopyButton } from "@/components/ui/copy-button"
import { API_URL } from "@/lib/api"

const SIDEBAR_ITEMS = [
  { label: "Vue d'ensemble", href: "/trade", icon: Globe },
  { label: "Par pays", href: "/trade/by-country", icon: Map },
  { label: "TEC CEDEAO", href: "/trade/tec", icon: Percent },
  { label: "Corridors", href: "/trade/corridors", icon: Route },
]

const COUNTRIES: Record<string, string> = {
  bj: "Benin", bf: "Burkina Faso", cv: "Cap-Vert", ci: "Cote d'Ivoire",
  gm: "Gambie", gh: "Ghana", gn: "Guinee", gw: "Guinee-Bissau",
  lr: "Liberia", ml: "Mali", ne: "Niger", ng: "Nigeria",
  sn: "Senegal", sl: "Sierra Leone", tg: "Togo",
}

export default function TradeCountryPage() {
  const params = useParams<{ country: string }>()
  const code = params.country.toLowerCase()
  const countryName = COUNTRIES[code] ?? code.toUpperCase()

  const { data: raw, isLoading } = useQuery({
    queryKey: ["trade-country", code],
    queryFn: () => fetch(`${API_URL}/v1/data?country=${code.toUpperCase()}&latest=true&limit=100`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const metrics = useMemo(() => {
    if (!raw?.data) return { exports: null, imports: null, balance: null, openness: null, chartData: [] }
    const map: Record<string, number> = {}
    const byYear: Record<number, { exports: number; imports: number }> = {}
    for (const dp of raw.data) {
      const key = dp.metric_key as string
      if (!key.match(/^(comtrade|exports|imports|trade)/)) continue
      map[key] = dp.value
      if (!byYear[dp.year]) byYear[dp.year] = { exports: 0, imports: 0 }
      if (key.includes("export")) byYear[dp.year].exports = dp.value
      if (key.includes("import")) byYear[dp.year].imports = dp.value
    }
    const exp = map["comtrade_exports_usd"] ?? map["exports_goods_services_pct_gdp"] ?? null
    const imp = map["comtrade_imports_usd"] ?? map["imports_goods_services_pct_gdp"] ?? null
    const chartData = Object.entries(byYear).map(([yr, v]) => ({ year: yr, Exports: v.exports, Imports: v.imports }))
    return {
      exports: exp,
      imports: imp,
      balance: exp != null && imp != null ? exp - imp : null,
      openness: exp != null && imp != null ? exp + imp : null,
      chartData,
    }
  }, [raw])

  const curlCmd = `curl -H "Authorization: Bearer YOUR_KEY" \\\n  "${API_URL}/v1/data?country=${code.toUpperCase()}&latest=true"`

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Commerce", href: "/trade" }, { label: countryName }]} />

      <div className="flex items-center gap-3">
        <Image src={`https://flagcdn.com/32x24/${code}.png`} alt={countryName} width={32} height={24} className="rounded-sm" />
        <h1 className="text-2xl font-bold text-white tracking-tight">{countryName}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Exports" value={metrics.exports != null ? fmtNum(metrics.exports) : "-"} loading={isLoading} />
        <StatCard label="Imports" value={metrics.imports != null ? fmtNum(metrics.imports) : "-"} loading={isLoading} />
        <StatCard
          label="Balance"
          value={metrics.balance != null ? fmtNum(metrics.balance) : "-"}
          trend={metrics.balance != null ? (metrics.balance >= 0 ? "up" : "down") : undefined}
          loading={isLoading}
        />
        <StatCard label="Ouverture commerciale" value={metrics.openness != null ? fmtNum(metrics.openness) : "-"} loading={isLoading} />
      </div>

      {metrics.chartData.length > 0 && (
        <ChartCard title="Exports vs Imports" subtitle="USD">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metrics.chartData}>
              <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Exports" fill="#14b8a6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Imports" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

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

function fmtNum(v: number): string {
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return v.toFixed(1)
}
