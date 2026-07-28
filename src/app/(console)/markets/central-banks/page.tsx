"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { LayoutDashboard, DollarSign, TrendingUp, Landmark } from "lucide-react"
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

type BankRow = {
  bank: string
  country: string
  rate: string
  currency: string
  source: string
}

const OTHER_BANKS = [
  { key: "cbn_policy_rate", bank: "Central Bank of Nigeria", country: "Nigeria", flag: "ng", currency: "NGN" },
  { key: "bog_policy_rate", bank: "Bank of Ghana", country: "Ghana", flag: "gh", currency: "GHS" },
  { key: "cbg_policy_rate", bank: "Central Bank of Gambia", country: "Gambie", flag: "gm", currency: "GMD" },
  { key: "cbl_policy_rate", bank: "Central Bank of Liberia", country: "Liberia", flag: "lr", currency: "LRD" },
  { key: "bsl_policy_rate", bank: "Bank of Sierra Leone", country: "Sierra Leone", flag: "sl", currency: "SLE" },
  { key: "bcrg_policy_rate", bank: "BCRG", country: "Guinee", flag: "gn", currency: "GNF" },
]

export default function CentralBanksPage() {  const { data: snEconomy, isLoading: loadingSn } = useQuery({
    queryKey: ["economy", "SN"],
    queryFn: () => fetch(`${API_URL}/v1/economy/SN`).then((r) => r.json()),
  })

  const { data: allData, isLoading: loadingData } = useQuery({
    queryKey: ["data", "banks-latest"],
    queryFn: () => fetch(`${API_URL}/v1/data?limit=200&latest=true`).then((r) => r.json()),
  })

  const indicators = allData?.data ?? allData?.results ?? []
  const find = (key: string) => indicators.find((d: Record<string, unknown>) => d.metric_key === key || d.indicator_code === key)

  const policyRate = snEconomy?.data?.bceao_policy_rate ?? snEconomy?.bceao_policy_rate
  const lendingRate = find("bceao_lending_facility_rate")
  const reserveRate = find("bceao_reserve_requirement")
  const loading = loadingSn || loadingData

  const columns: Column<BankRow>[] = [
    {
      key: "bank",
      header: "Banque",
      render: (row) => <span className="font-medium text-white">{row.bank}</span>,
    },
    { key: "country", header: "Pays" },
    { key: "rate", header: "Taux directeur", align: "right" },
    { key: "currency", header: "Devise" },
    { key: "source", header: "Source" },
  ]

  const bankData: BankRow[] = OTHER_BANKS.map((b) => {
    const ind = find(b.key)
    return {
      bank: b.bank,
      country: b.country,
      rate: ind?.value != null ? `${ind.value}%` : "-",
      currency: b.currency,
      source: ind?.source ?? "Banque centrale",
    }
  })

  return (
    <div className="space-y-8 p-6">
      <Breadcrumbs items={[{ label: "Marches", href: "/markets" }, { label: "Banques centrales" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white">Banques centrales</h1>
        <p className="text-sm text-white/50 mt-1">Taux directeurs des banques centrales d'Afrique de l'Ouest</p>
      </div>

      <div className="bg-[#0d1028] border border-teal-500/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Landmark className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">BCEAO</h3>
            <p className="text-xs text-white/40">Banque Centrale des Etats de l'Afrique de l'Ouest - 8 pays UEMOA</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Taux directeur" value={policyRate ? `${policyRate}%` : "-"} loading={loading} />
          <StatCard label="Facilite de pret" value={lendingRate?.value != null ? `${lendingRate.value}%` : "-"} loading={loading} />
          <StatCard label="Reserves obligatoires" value={reserveRate?.value != null ? `${reserveRate.value}%` : "-"} loading={loading} />
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Autres banques centrales</h2>
        <DataTable columns={columns} data={bankData} loading={loading} pageSize={10} />
      </section>
    </div>
  )
}
