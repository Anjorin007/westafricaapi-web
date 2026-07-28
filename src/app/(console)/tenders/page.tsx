"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, MapPin, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable, type Column } from "@/components/ui/data-table"
import { CopyButton } from "@/components/ui/copy-button"

const API_URL = "https://ecowas-api.onrender.com"

const SIDEBAR_ITEMS = [
  { label: "Tous les marches", href: "/tenders", icon: FileText },
  { label: "Par pays", href: "/tenders/by-country", icon: MapPin },
  { label: "Statistiques", href: "/tenders/stats", icon: BarChart3 },
]

const COUNTRIES: Record<string, { name: string; flag: string }> = {
  BJ: { name: "Benin", flag: "bj" },
  BF: { name: "Burkina Faso", flag: "bf" },
  CV: { name: "Cap-Vert", flag: "cv" },
  CI: { name: "Cote d'Ivoire", flag: "ci" },
  GM: { name: "Gambie", flag: "gm" },
  GH: { name: "Ghana", flag: "gh" },
  GN: { name: "Guinee", flag: "gn" },
  GW: { name: "Guinee-Bissau", flag: "gw" },
  LR: { name: "Liberia", flag: "lr" },
  ML: { name: "Mali", flag: "ml" },
  NE: { name: "Niger", flag: "ne" },
  NG: { name: "Nigeria", flag: "ng" },
  SN: { name: "Senegal", flag: "sn" },
  SL: { name: "Sierra Leone", flag: "sl" },
  TG: { name: "Togo", flag: "tg" },
}

type TenderRow = {
  country: string
  code: string
  flag: string
  open: number
  awarded: number
  published: number
  volume: string
}

export default function TendersPage() {  const { data: allData, isLoading } = useQuery({
    queryKey: ["data", "tenders-latest"],
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

  const tableData: TenderRow[] = Array.from(countryMap.entries())
    .map(([cc, vals]) => ({
      country: COUNTRIES[cc].name,
      code: cc.toLowerCase(),
      flag: COUNTRIES[cc].flag,
      open: vals.open,
      awarded: vals.awarded,
      published: vals.published,
      volume: vals.volume > 0 ? vals.volume.toLocaleString("fr-FR") : "-",
    }))
    .sort((a, b) => {
      const va = countryMap.get(a.code.toUpperCase())?.volume ?? 0
      const vb = countryMap.get(b.code.toUpperCase())?.volume ?? 0
      return vb - va
    })

  const totalOpen = tableData.reduce((s, r) => s + r.open, 0)
  const activeCountries = tableData.filter((r) => r.open > 0 || r.awarded > 0).length

  const columns: Column<TenderRow>[] = [
    {
      key: "country",
      header: "Pays",
      render: (row) => (
        <span className="flex items-center gap-2">
          <img src={`https://flagcdn.com/20x15/${row.flag}.png`} alt="" className="w-5 h-3.5 rounded-sm object-cover" />
          <span className="font-medium text-white">{row.country}</span>
        </span>
      ),
    },
    { key: "open", header: "Ouverts", align: "right" },
    { key: "awarded", header: "Attribues", align: "right" },
    { key: "published", header: "Publies", align: "right" },
    { key: "volume", header: "Volume", align: "right" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Link href={`/tenders/${row.code}`} className="text-teal-400 hover:text-teal-300 text-xs transition-colors">
          Voir &rarr;
        </Link>
      ),
    },
  ]

  const curlExample = `curl -H "Authorization: Bearer YOUR_KEY" \\
  "${API_URL}/v1/data?limit=50&latest=true"`

  return (
    <div className="space-y-8 p-6">
      <Breadcrumbs items={[{ label: "Marches publics" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white">Marches publics</h1>
        <p className="text-sm text-white/50 mt-1">Appels d'offres et attributions dans les 15 pays CEDEAO</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Marches ouverts" value={totalOpen || "-"} loading={isLoading} />
        <StatCard label="Volume CEDEAO" value={tableData.length > 0 ? `${tableData.length} pays` : "-"} loading={isLoading} />
        <StatCard label="Pays actifs" value={activeCountries || "-"} loading={isLoading} />
      </div>

      <DataTable columns={columns} data={tableData} loading={isLoading} pageSize={15} emptyMessage="Aucun marche public disponible" />

      <section className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Acces API</h3>
          <CopyButton text={curlExample} />
        </div>
        <pre className="text-xs text-teal-300/80 font-mono overflow-x-auto whitespace-pre-wrap">{curlExample}</pre>
      </section>
    </div>
  )
}
