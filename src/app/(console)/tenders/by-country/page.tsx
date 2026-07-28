"use client"

import { useEffect } from "react"
import { FileText, MapPin, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"

const SIDEBAR_ITEMS = [
  { label: "Tous les marches", href: "/tenders", icon: FileText },
  { label: "Par pays", href: "/tenders/by-country", icon: MapPin },
  { label: "Statistiques", href: "/tenders/stats", icon: BarChart3 },
]

const COUNTRIES = [
  { code: "bj", name: "Benin" },
  { code: "bf", name: "Burkina Faso" },
  { code: "cv", name: "Cap-Vert" },
  { code: "ci", name: "Cote d'Ivoire" },
  { code: "gm", name: "Gambie" },
  { code: "gh", name: "Ghana" },
  { code: "gn", name: "Guinee" },
  { code: "gw", name: "Guinee-Bissau" },
  { code: "lr", name: "Liberia" },
  { code: "ml", name: "Mali" },
  { code: "ne", name: "Niger" },
  { code: "ng", name: "Nigeria" },
  { code: "sn", name: "Senegal" },
  { code: "sl", name: "Sierra Leone" },
  { code: "tg", name: "Togo" },
]

export default function TendersByCountryPage() {  return (
    <div className="space-y-8 p-6">
      <Breadcrumbs items={[{ label: "Marches publics", href: "/tenders" }, { label: "Par pays" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white">Marches publics par pays</h1>
        <p className="text-sm text-white/50 mt-1">Selectionnez un pays pour voir ses marches publics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {COUNTRIES.map((c) => (
          <Link
            key={c.code}
            href={`/tenders/${c.code}`}
            className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-4 flex items-center gap-3 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all duration-200"
          >
            <img src={`https://flagcdn.com/20x15/${c.code}.png`} alt="" className="w-5 h-3.5 rounded-sm object-cover" />
            <span className="text-sm text-white font-medium truncate">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
