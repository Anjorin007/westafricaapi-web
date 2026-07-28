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

type FxRow = {
  pair: string
  flag: string
  value: string
  source: string
}

type BankRow = {
  bank: string
  country: string
  rate: string
  currency: string
  source: string
}

const FX_PAIRS: { key: string; pair: string; flag: string }[] = [
  { key: "xof_per_usd", pair: "XOF/USD", flag: "sn" },
  { key: "xof_per_eur", pair: "XOF/EUR", flag: "fr" },
  { key: "ghs_per_usd", pair: "GHS/USD", flag: "gh" },
  { key: "ngn_per_usd", pair: "NGN/USD", flag: "ng" },
  { key: "gmd_per_usd", pair: "GMD/USD", flag: "gm" },
  { key: "sle_per_usd", pair: "SLE/USD", flag: "sl" },
  { key: "lrd_per_usd", pair: "LRD/USD", flag: "lr" },
  { key: "gnf_per_usd", pair: "GNF/USD", flag: "gn" },
  { key: "cve_per_usd", pair: "CVE/USD", flag: "cv" },
]

export default function MarketsPage() {
  const { setItems, setTitle } = useSidebar()

  useEffect(() => {
    setTitle("MARCHES FINANCIERS")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const { data: snEconomy, isLoading: loadingSn } = useQuery({
    queryKey: ["economy", "SN"],
    queryFn: () => fetch(`${API_URL}/v1/economy/SN`).then((r) => r.json()),
  })

  const { data: allData, isLoading: loadingData } = useQuery({
    queryKey: ["data", "markets-latest"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=200&latest=true`).then((r) => r.json()),
  })

  const indicators = allData?.data ?? allData?.results ?? []

  const findIndicator = (key: string) =>
    indicators.find((d: Record<string, unknown>) => d.metric_key === key || d.indicator_code === key)

  const brvmComposite = findIndicator("brvm_composite_index")
  const brvmCap = findIndicator("brvm_market_cap_xof_bn")

  const policyRate = snEconomy?.data?.bceao_policy_rate ?? snEconomy?.bceao_policy_rate
  const xofUsd = snEconomy?.data?.xof_per_usd ?? snEconomy?.xof_per_usd
  const loading = loadingSn || loadingData

  const fxColumns: Column<FxRow>[] = [
    {
      key: "pair",
      header: "Paire",
      render: (row) => (
        <span className="flex items-center gap-2">
          <img src={`https://flagcdn.com/20x15/${row.flag}.png`} alt="" className="w-5 h-3.5 rounded-sm object-cover" />
          <span className="font-medium text-white">{row.pair}</span>
        </span>
      ),
    },
    { key: "value", header: "Taux", align: "right" },
    { key: "source", header: "Source" },
  ]

  const fxData: FxRow[] = FX_PAIRS.map((p) => {
    const ind = findIndicator(p.key)
    return {
      pair: p.pair,
      flag: p.flag,
      value: ind?.value != null ? String(Number(ind.value).toLocaleString("fr-FR")) : xofUsd && p.key === "xof_per_usd" ? String(xofUsd) : "-",
      source: ind?.source ?? "BCEAO",
    }
  })

  const bankRates: { key: string; bank: string; country: string; currency: string }[] = [
    { key: "bceao_policy_rate", bank: "BCEAO", country: "UEMOA (8 pays)", currency: "XOF" },
    { key: "cbn_policy_rate", bank: "CBN", country: "Nigeria", currency: "NGN" },
    { key: "cbg_policy_rate", bank: "BOG", country: "Ghana", currency: "GHS" },
    { key: "cbg_policy_rate", bank: "CBG", country: "Gambie", currency: "GMD" },
    { key: "cbl_policy_rate", bank: "CBL", country: "Liberia", currency: "LRD" },
    { key: "bsl_policy_rate", bank: "BSL", country: "Sierra Leone", currency: "SLE" },
    { key: "bcrg_policy_rate", bank: "BCRG", country: "Guinee", currency: "GNF" },
  ]

  const bankColumns: Column<BankRow>[] = [
    { key: "bank", header: "Banque" },
    { key: "country", header: "Pays" },
    { key: "rate", header: "Taux directeur", align: "right" },
    { key: "currency", header: "Devise" },
    { key: "source", header: "Source" },
  ]

  const bankData: BankRow[] = bankRates.map((b) => {
    const ind = findIndicator(b.key)
    return {
      bank: b.bank,
      country: b.country,
      rate: ind?.value != null ? `${ind.value}%` : b.key === "bceao_policy_rate" && policyRate ? `${policyRate}%` : "-",
      currency: b.currency,
      source: ind?.source ?? "Banque centrale",
    }
  })

  return (
    <div className="space-y-8 p-6">
      <Breadcrumbs items={[{ label: "Marches" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white">Marches financiers</h1>
        <p className="text-sm text-white/50 mt-1">Devises, bourse et taux directeurs en Afrique de l'Ouest</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Taux BCEAO" value={policyRate ? `${policyRate}%` : "-"} loading={loading} />
        <StatCard label="XOF/USD" value={xofUsd ?? "-"} loading={loading} />
        <StatCard label="BRVM Composite" value={brvmComposite?.value ?? "-"} loading={loading} />
        <StatCard label="Cap. BRVM" value={brvmCap?.value ? `${brvmCap.value} Mrd` : "-"} unit="XOF" loading={loading} />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Taux de change</h2>
        <DataTable columns={fxColumns} data={fxData} loading={loading} pageSize={10} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">BRVM</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="BRVM Composite" value={brvmComposite?.value ?? "-"} loading={loading} />
          <StatCard label="BRVM 10" value={findIndicator("brvm_10_index")?.value ?? "-"} loading={loading} />
          <StatCard label="Volume journalier" value={findIndicator("brvm_daily_volume_xof_mn")?.value ?? "-"} unit="M XOF" loading={loading} />
          <StatCard label="Societes cotees" value={findIndicator("brvm_listed_companies_count")?.value ?? "45"} loading={loading} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Taux directeurs</h2>
        <DataTable columns={bankColumns} data={bankData} loading={loading} pageSize={10} />
      </section>
    </div>
  )
}
