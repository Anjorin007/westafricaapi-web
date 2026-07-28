"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { LayoutDashboard, DollarSign, TrendingUp, Landmark } from "lucide-react"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable, type Column } from "@/components/ui/data-table"

const API_URL = "https://ecowas-api.onrender.com"

const SIDEBAR_ITEMS = [
  { label: "Overview", href: "/markets", icon: LayoutDashboard },
  { label: "Taux de change", href: "/markets/fx", icon: DollarSign },
  { label: "BRVM", href: "/markets/brvm", icon: TrendingUp },
  { label: "Banques centrales", href: "/markets/central-banks", icon: Landmark },
]

type MetricRow = {
  metric: string
  value: string
  source: string
  updated: string
}

const BRVM_METRICS = [
  { key: "brvm_composite_index", label: "Indice BRVM Composite" },
  { key: "brvm_10_index", label: "Indice BRVM 10" },
  { key: "brvm_bond_index", label: "Indice obligataire" },
  { key: "brvm_market_cap_xof_bn", label: "Capitalisation boursiere (Mrd XOF)" },
  { key: "brvm_daily_volume_xof_mn", label: "Volume journalier (M XOF)" },
  { key: "brvm_listed_companies_count", label: "Societes cotees" },
]

export default function BrvmPage() {
  const { setItems, setTitle } = useSidebar()

  useEffect(() => {
    setTitle("MARCHES FINANCIERS")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const { data: allData, isLoading } = useQuery({
    queryKey: ["data", "brvm-latest"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=200&latest=true`).then((r) => r.json()),
  })

  const indicators = allData?.data ?? allData?.results ?? []
  const find = (key: string) => indicators.find((d: Record<string, unknown>) => d.metric_key === key || d.indicator_code === key)

  const composite = find("brvm_composite_index")
  const brvm10 = find("brvm_10_index")
  const cap = find("brvm_market_cap_xof_bn")
  const volume = find("brvm_daily_volume_xof_mn")

  const columns: Column<MetricRow>[] = [
    { key: "metric", header: "Indicateur" },
    { key: "value", header: "Valeur", align: "right" },
    { key: "source", header: "Source" },
    { key: "updated", header: "MAJ" },
  ]

  const tableData: MetricRow[] = BRVM_METRICS.map((m) => {
    const ind = find(m.key)
    return {
      metric: m.label,
      value: ind?.value != null ? String(ind.value) : "-",
      source: ind?.source ?? "BRVM",
      updated: ind?.updated_at ? new Date(ind.updated_at as string).toLocaleDateString("fr-FR") : "-",
    }
  })

  return (
    <div className="space-y-8 p-6">
      <Breadcrumbs items={[{ label: "Marches", href: "/markets" }, { label: "BRVM" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white">BRVM</h1>
        <p className="text-sm text-white/50 mt-1">Bourse Regionale des Valeurs Mobilieres - Abidjan</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="BRVM-C" value={composite?.value ?? "-"} loading={isLoading} />
        <StatCard label="BRVM-10" value={brvm10?.value ?? "-"} loading={isLoading} />
        <StatCard label="Cap. boursiere" value={cap?.value ? `${cap.value}` : "-"} unit="Mrd XOF" loading={isLoading} />
        <StatCard label="Volume journalier" value={volume?.value ?? "-"} unit="M XOF" loading={isLoading} />
      </div>

      <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2">A propos de la BRVM</h3>
        <p className="text-xs text-white/50 leading-relaxed">
          La Bourse Regionale des Valeurs Mobilieres (BRVM), basee a Abidjan, est la bourse commune aux 8 pays
          de l'UEMOA. Creee en 1998, elle est unique en Afrique comme bourse multinationale. Elle regroupe
          les marches actions et obligations de la zone franc CFA ouest-africaine.
        </p>
      </div>

      <DataTable columns={columns} data={tableData} loading={isLoading} pageSize={10} />

      <p className="text-xs text-white/30 text-center">
        45 societes cotees - Abidjan - Zone UEMOA
      </p>
    </div>
  )
}
