"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
import { Globe, Map, Percent, Route } from "lucide-react"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable, type Column } from "@/components/ui/data-table"
import { API_URL } from "@/lib/api"

const SIDEBAR_ITEMS = [
  { label: "Vue d'ensemble", href: "/trade", icon: Globe },
  { label: "Par pays", href: "/trade/by-country", icon: Map },
  { label: "TEC CEDEAO", href: "/trade/tec", icon: Percent },
  { label: "Corridors", href: "/trade/corridors", icon: Route },
]

const COUNTRIES: Record<string, string> = {
  BJ: "Benin", BF: "Burkina Faso", CV: "Cap-Vert", CI: "Cote d'Ivoire",
  GM: "Gambie", GH: "Ghana", GN: "Guinee", GW: "Guinee-Bissau",
  LR: "Liberia", ML: "Mali", NE: "Niger", NG: "Nigeria",
  SN: "Senegal", SL: "Sierra Leone", TG: "Togo",
}

type TradeRow = Record<string, unknown> & {
  country_code: string
  country: string
  exports: number | null
  imports: number | null
  balance: number | null
  openness: number | null
  source: string
}

export default function TradePage() {
  const { setItems, setTitle } = useSidebar()

  useEffect(() => {
    setTitle("COMMERCE")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const { data: raw, isLoading } = useQuery({
    queryKey: ["trade-overview"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=500&latest=true`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const { rows, totalExports, totalImports } = useMemo(() => {
    if (!raw?.data) return { rows: [], totalExports: 0, totalImports: 0 }
    const byCountry: Record<string, Record<string, number>> = {}
    for (const dp of raw.data) {
      const key = dp.metric_key as string
      if (!key.match(/^(comtrade|exports|imports|trade)/)) continue
      if (!byCountry[dp.country_code]) byCountry[dp.country_code] = {}
      byCountry[dp.country_code][key] = dp.value
    }
    let tExp = 0
    let tImp = 0
    const rows: TradeRow[] = Object.entries(byCountry).map(([code, metrics]) => {
      const exp = metrics["comtrade_exports_usd"] ?? metrics["exports_goods_services_pct_gdp"] ?? null
      const imp = metrics["comtrade_imports_usd"] ?? metrics["imports_goods_services_pct_gdp"] ?? null
      const expNum = exp ?? 0
      const impNum = imp ?? 0
      tExp += expNum
      tImp += impNum
      return {
        country_code: code,
        country: COUNTRIES[code] ?? code,
        exports: exp,
        imports: imp,
        balance: exp != null && imp != null ? expNum - impNum : null,
        openness: exp != null && imp != null ? expNum + impNum : null,
        source: "World Bank / UN Comtrade",
      }
    })
    return { rows: rows.sort((a, b) => (b.exports ?? 0) - (a.exports ?? 0)), totalExports: tExp, totalImports: tImp }
  }, [raw])

  const columns: Column<TradeRow>[] = [
    {
      key: "country",
      header: "Pays",
      render: (row) => (
        <Link href={`/trade/${row.country_code.toLowerCase()}`} className="flex items-center gap-2 hover:text-teal-400 transition-colors">
          <Image src={`https://flagcdn.com/20x15/${row.country_code.toLowerCase()}.png`} alt="" width={20} height={15} className="rounded-sm" />
          <span>{row.country}</span>
        </Link>
      ),
    },
    { key: "exports", header: "Exports", align: "right", render: (r) => r.exports != null ? fmtNum(r.exports) : "-" },
    { key: "imports", header: "Imports", align: "right", render: (r) => r.imports != null ? fmtNum(r.imports) : "-" },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      render: (r) => r.balance != null ? (
        <span className={r.balance >= 0 ? "text-emerald-400" : "text-red-400"}>{fmtNum(r.balance)}</span>
      ) : "-",
    },
    { key: "source", header: "Source", render: (r) => <span className="text-white/30 text-xs">{r.source}</span> },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Commerce" }]} />

      <h1 className="text-2xl font-bold text-white tracking-tight">Commerce CEDEAO</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Exports totaux CEDEAO" value={fmtNum(totalExports)} loading={isLoading} />
        <StatCard label="Imports totaux CEDEAO" value={fmtNum(totalImports)} loading={isLoading} />
        <StatCard
          label="Balance agregee"
          value={fmtNum(totalExports - totalImports)}
          trend={totalExports - totalImports >= 0 ? "up" : "down"}
          loading={isLoading}
        />
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pageSize={15} />
    </div>
  )
}

function fmtNum(v: number): string {
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return v.toFixed(1)
}
