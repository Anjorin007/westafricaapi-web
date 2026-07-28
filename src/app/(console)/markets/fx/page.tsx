"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { LayoutDashboard, DollarSign, TrendingUp, Landmark } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { DataTable, type Column } from "@/components/ui/data-table"
import { ChartCard } from "@/components/ui/chart-card"

const API_URL = "https://ecowas-api.onrender.com"

const SIDEBAR_ITEMS = [
  { label: "Overview", href: "/markets", icon: LayoutDashboard },
  { label: "Taux de change", href: "/markets/fx", icon: DollarSign },
  { label: "BRVM", href: "/markets/brvm", icon: TrendingUp },
  { label: "Banques centrales", href: "/markets/central-banks", icon: Landmark },
]

type FxRow = {
  currency: string
  flag: string
  code: string
  usd: string
  eur: string
  source: string
  updated: string
  zone: string
}

const CURRENCIES = [
  { code: "XOF", flag: "sn", name: "Franc CFA (UEMOA)", zone: "UEMOA", keyUsd: "xof_per_usd", keyEur: "xof_per_eur" },
  { code: "GHS", flag: "gh", name: "Cedi ghaneen", zone: "Non-UEMOA", keyUsd: "ghs_per_usd", keyEur: "ghs_per_eur" },
  { code: "NGN", flag: "ng", name: "Naira nigerian", zone: "Non-UEMOA", keyUsd: "ngn_per_usd", keyEur: "ngn_per_eur" },
  { code: "GMD", flag: "gm", name: "Dalasi gambien", zone: "Non-UEMOA", keyUsd: "gmd_per_usd", keyEur: "gmd_per_eur" },
  { code: "SLE", flag: "sl", name: "Leone sierra-leonais", zone: "Non-UEMOA", keyUsd: "sle_per_usd", keyEur: "sle_per_eur" },
  { code: "LRD", flag: "lr", name: "Dollar liberien", zone: "Non-UEMOA", keyUsd: "lrd_per_usd", keyEur: "lrd_per_eur" },
  { code: "GNF", flag: "gn", name: "Franc guineen", zone: "Non-UEMOA", keyUsd: "gnf_per_usd", keyEur: "gnf_per_eur" },
  { code: "CVE", flag: "cv", name: "Escudo cap-verdien", zone: "Non-UEMOA", keyUsd: "cve_per_usd", keyEur: "cve_per_eur" },
]

const PLACEHOLDER_CHART = [
  { date: "Jan", value: 605 },
  { date: "Fev", value: 608 },
  { date: "Mar", value: 612 },
  { date: "Avr", value: 607 },
  { date: "Mai", value: 610 },
  { date: "Jun", value: 615 },
]

export default function FxPage() {
  const { setItems, setTitle } = useSidebar()

  useEffect(() => {
    setTitle("MARCHES FINANCIERS")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const { data: allData, isLoading } = useQuery({
    queryKey: ["data", "fx-latest"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=200&latest=true`).then((r) => r.json()),
  })

  const indicators = allData?.data ?? allData?.results ?? []
  const find = (key: string) => indicators.find((d: Record<string, unknown>) => d.metric_key === key || d.indicator_code === key)

  const columns: Column<FxRow>[] = [
    {
      key: "currency",
      header: "Devise",
      render: (row) => (
        <span className="flex items-center gap-2">
          <img src={`https://flagcdn.com/20x15/${row.flag}.png`} alt="" className="w-5 h-3.5 rounded-sm object-cover" />
          <span className="font-medium text-white">{row.code}</span>
          <span className="text-white/40">{row.currency}</span>
        </span>
      ),
    },
    { key: "usd", header: "Contre USD", align: "right" },
    { key: "eur", header: "Contre EUR", align: "right" },
    { key: "source", header: "Source" },
    { key: "updated", header: "MAJ" },
  ]

  const data: FxRow[] = CURRENCIES.map((c) => {
    const usdInd = find(c.keyUsd)
    const eurInd = find(c.keyEur)
    return {
      currency: c.name,
      flag: c.flag,
      code: c.code,
      usd: usdInd?.value != null ? Number(usdInd.value).toLocaleString("fr-FR") : c.code === "XOF" ? "655.957" : "-",
      eur: eurInd?.value != null ? Number(eurInd.value).toLocaleString("fr-FR") : c.code === "XOF" ? "655.957" : "-",
      source: usdInd?.source ?? "Banque centrale",
      updated: usdInd?.updated_at ? new Date(usdInd.updated_at as string).toLocaleDateString("fr-FR") : "-",
      zone: c.zone,
    }
  })

  return (
    <div className="space-y-8 p-6">
      <Breadcrumbs items={[{ label: "Marches", href: "/markets" }, { label: "Taux de change" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white">Taux de change</h1>
        <p className="text-sm text-white/50 mt-1">8 devises, sources banques centrales officielles</p>
      </div>

      <DataTable columns={columns} data={data} loading={isLoading} pageSize={10} />

      <ChartCard title="XOF/USD" subtitle="Historique (donnees indicatives)">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PLACEHOLDER_CHART}>
              <XAxis dataKey="date" stroke="#ffffff20" tick={{ fill: "#ffffff60", fontSize: 11 }} />
              <YAxis stroke="#ffffff20" tick={{ fill: "#ffffff60", fontSize: 11 }} domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip contentStyle={{ background: "#0d1028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#14b8a6" }} />
              <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Zone UEMOA</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Le franc CFA (XOF) est arrime a l'euro via un taux fixe de 655,957 XOF = 1 EUR.
            Les 8 pays membres (Benin, Burkina Faso, Cote d'Ivoire, Guinee-Bissau, Mali, Niger, Senegal, Togo)
            partagent cette monnaie commune emise par la BCEAO.
          </p>
        </div>
        <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Zone non-UEMOA</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Le Ghana (GHS), Nigeria (NGN), Gambie (GMD), Sierra Leone (SLE), Liberia (LRD),
            Guinee (GNF) et Cap-Vert (CVE) disposent chacun de leur propre monnaie a taux flottant,
            geree par leur banque centrale respective.
          </p>
        </div>
      </section>
    </div>
  )
}
