"use client"

import { useEffect, useMemo } from "react"
import Image from "next/image"
import { Calendar, Map } from "lucide-react"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable, type Column } from "@/components/ui/data-table"

const SIDEBAR_ITEMS = [
  { label: "Calendrier", href: "/elections", icon: Calendar },
  { label: "Par pays", href: "/elections/by-country", icon: Map },
]

const ELECTIONS = [
  { country: "Cote d'Ivoire", code: "CI", flag: "ci", type: "Presidentielle", date: "2025-10-25", status: "upcoming" },
  { country: "Guinee", code: "GN", flag: "gn", type: "Presidentielle", date: "2025-10-18", status: "upcoming" },
  { country: "Nigeria", code: "NG", flag: "ng", type: "Gouvernorales", date: "2025-11-08", status: "upcoming" },
  { country: "Benin", code: "BJ", flag: "bj", type: "Presidentielle", date: "2026-04-11", status: "scheduled" },
  { country: "Cap-Vert", code: "CV", flag: "cv", type: "Legislatives", date: "2026-04-05", status: "scheduled" },
  { country: "Guinee-Bissau", code: "GW", flag: "gw", type: "Presidentielle", date: "2026-06-01", status: "scheduled" },
  { country: "Gambie", code: "GM", flag: "gm", type: "Presidentielle", date: "2026-12-04", status: "scheduled" },
  { country: "Liberia", code: "LR", flag: "lr", type: "Senatoriales", date: "2026-12-01", status: "scheduled" },
  { country: "Mali", code: "ML", flag: "ml", type: "Presidentielle", date: "2027-02-01", status: "scheduled" },
  { country: "Burkina Faso", code: "BF", flag: "bf", type: "Transition", date: "2026-07-01", status: "scheduled" },
  { country: "Niger", code: "NE", flag: "ne", type: "Transition", date: "2026-12-01", status: "scheduled" },
  { country: "Sierra Leone", code: "SL", flag: "sl", type: "Presidentielle", date: "2027-06-01", status: "scheduled" },
  { country: "Ghana", code: "GH", flag: "gh", type: "Presidentielle", date: "2024-12-07", status: "held" },
  { country: "Senegal", code: "SN", flag: "sn", type: "Legislatives", date: "2024-11-17", status: "held" },
  { country: "Togo", code: "TG", flag: "tg", type: "Legislatives", date: "2025-04-29", status: "held" },
]

type ElectionRow = Record<string, unknown> & typeof ELECTIONS[number] & { countdown: string }

function getCountdown(dateStr: string): string {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  if (diff < 0) return "Tenu"
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return `J-${days}`
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  upcoming: { label: "Prochain", class: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  scheduled: { label: "Planifie", class: "bg-teal-500/15 text-teal-400 border-teal-500/30" },
  held: { label: "Tenu", class: "bg-white/10 text-white/50 border-white/10" },
}

export default function ElectionsPage() {
  const { setItems, setTitle } = useSidebar()
  useEffect(() => {
    setTitle("ELECTIONS")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const rows: ElectionRow[] = useMemo(() =>
    ELECTIONS.map((e) => ({ ...e, countdown: getCountdown(e.date) }))
  , [])

  const upcoming = rows.filter((r) => r.status === "upcoming")
  const scheduled = rows.filter((r) => r.status === "scheduled")
  const held = rows.filter((r) => r.status === "held")

  const columns: Column<ElectionRow>[] = [
    {
      key: "country",
      header: "Pays",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Image src={`https://flagcdn.com/20x15/${row.flag}.png`} alt="" width={20} height={15} className="rounded-sm" />
          <span>{row.country}</span>
        </div>
      ),
    },
    { key: "type", header: "Type" },
    { key: "date", header: "Date", render: (r) => new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) },
    {
      key: "status",
      header: "Statut",
      render: (r) => {
        const s = STATUS_LABELS[r.status]
        return <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${s.class}`}>{s.label}</span>
      },
    },
    {
      key: "countdown",
      header: "Compte a rebours",
      align: "right",
      render: (r) => <span className="font-mono text-xs text-white/50">{r.countdown}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Elections" }]} />

      <h1 className="text-2xl font-bold text-white tracking-tight">Calendrier electoral CEDEAO</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Prochains" value={upcoming.length} />
        <StatCard label="Planifies 2026-2027" value={scheduled.length} />
        <StatCard label="Tenus 2024-2025" value={held.length} />
      </div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Prochaines elections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {upcoming.map((e) => (
              <div key={e.code} className="bg-[#0d1028] border border-amber-500/20 rounded-xl p-4 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Image src={`https://flagcdn.com/20x15/${e.flag}.png`} alt="" width={20} height={15} className="rounded-sm" />
                  <span className="text-sm font-semibold text-white">{e.country}</span>
                </div>
                <p className="text-xs text-white/50">{e.type}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-white/40">
                    {new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-400">{e.countdown}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable columns={columns} data={rows} loading={false} pageSize={15} />
    </div>
  )
}
