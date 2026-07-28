"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { LayoutDashboard, Map, DollarSign, TrendingDown, Star } from "lucide-react"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
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

type HDIRow = Record<string, unknown> & { country_code: string; country: string; hdi: number | null; rank: number | null; gii: number | null; source: string }

export default function DevelopmentPage() {  const { data: raw, isLoading } = useQuery({
    queryKey: ["government-development"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=500&latest=true`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const rows = useMemo(() => {
    if (!raw?.data) return []
    const byCountry: Record<string, Record<string, number>> = {}
    for (const dp of raw.data) {
      const key = dp.metric_key as string
      if (!key.match(/^undp_/)) continue
      if (!byCountry[dp.country_code]) byCountry[dp.country_code] = {}
      byCountry[dp.country_code][key] = dp.value
    }
    const rows: HDIRow[] = Object.entries(byCountry).map(([code, m]) => ({
      country_code: code,
      country: COUNTRIES[code] ?? code,
      hdi: m["undp_hdi"] ?? null,
      rank: m["undp_hdi_rank"] ?? null,
      gii: m["undp_gender_inequality_index"] ?? null,
      source: "UNDP",
    }))
    return rows.sort((a, b) => (b.hdi ?? 0) - (a.hdi ?? 0))
  }, [raw])

  const columns: Column<HDIRow>[] = [
    {
      key: "country",
      header: "Pays",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Image src={`https://flagcdn.com/20x15/${row.country_code.toLowerCase()}.png`} alt="" width={20} height={15} className="rounded-sm" />
          <span>{row.country}</span>
        </div>
      ),
    },
    { key: "hdi", header: "IDH", align: "right", render: (r) => r.hdi != null ? r.hdi.toFixed(3) : "-" },
    { key: "rank", header: "Rang mondial", align: "right", render: (r) => r.rank != null ? `#${r.rank}` : "-" },
    { key: "gii", header: "GII (Genre)", align: "right", render: (r) => r.gii != null ? r.gii.toFixed(3) : "-" },
    { key: "source", header: "Source", render: (r) => <span className="text-white/30 text-xs">{r.source}</span> },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Finances publiques", href: "/government" }, { label: "Developpement humain" }]} />

      <h1 className="text-2xl font-bold text-white tracking-tight">Indice de developpement humain</h1>
      <p className="text-sm text-white/50">
        L'IDH mesure le developpement humain selon trois dimensions : sante (esperance de vie), education (annees de scolarisation) et niveau de vie (revenu par habitant).
      </p>

      <DataTable columns={columns} data={rows} loading={isLoading} pageSize={15} />
    </div>
  )
}
