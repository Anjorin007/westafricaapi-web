"use client"

import { useEffect } from "react"
import { Globe, Map, Percent, Route } from "lucide-react"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"

const SIDEBAR_ITEMS = [
  { label: "Vue d'ensemble", href: "/trade", icon: Globe },
  { label: "Par pays", href: "/trade/by-country", icon: Map },
  { label: "TEC CEDEAO", href: "/trade/tec", icon: Percent },
  { label: "Corridors", href: "/trade/corridors", icon: Route },
]

const BANDS = [
  { band: 0, rate: "0%", label: "Biens sociaux essentiels", examples: "Medicaments, intrants agricoles, livres scolaires" },
  { band: 1, rate: "5%", label: "Matieres premieres et biens de capital", examples: "Equipements industriels, intrants specifiques" },
  { band: 2, rate: "10%", label: "Produits intermediaires", examples: "Demi-produits, composants" },
  { band: 3, rate: "20%", label: "Biens de consommation finale", examples: "Electronique, vetements, cosmetiques" },
  { band: 4, rate: "35%", label: "Biens sensibles", examples: "Protection industries locales, produits agricoles concurrents" },
]

const LEVIES = [
  { name: "ECOWAS Levy", rate: "0.5%", scope: "Tous les pays membres" },
  { name: "UEMOA Levy", rate: "1.0%", scope: "Pays UEMOA uniquement" },
  { name: "Frais statistiques", rate: "1.0%", scope: "Tous les pays membres" },
]

export default function TECPage() {
  const { setItems, setTitle } = useSidebar()
  useEffect(() => {
    setTitle("COMMERCE")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Commerce", href: "/trade" }, { label: "TEC CEDEAO" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">TEC CEDEAO</h1>
        <p className="text-sm text-white/50 mt-1">Tarif Exterieur Commun - Structure tarifaire unifiee</p>
      </div>

      <div className="bg-[#0a0e1f] rounded-xl border border-white/[0.08] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="px-4 py-2.5 text-xs font-medium text-white/40 uppercase tracking-wider text-left">Bande</th>
              <th className="px-4 py-2.5 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Taux</th>
              <th className="px-4 py-2.5 text-xs font-medium text-white/40 uppercase tracking-wider text-left">Categorie</th>
              <th className="px-4 py-2.5 text-xs font-medium text-white/40 uppercase tracking-wider text-left hidden md:table-cell">Exemples</th>
            </tr>
          </thead>
          <tbody>
            {BANDS.map((b) => (
              <tr key={b.band} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-bold">
                    {b.band}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono font-bold text-white">{b.rate}</span>
                </td>
                <td className="px-4 py-3 text-white/70 font-medium">{b.label}</td>
                <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">{b.examples}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Prelevements additionnels</h2>
        <div className="bg-[#0a0e1f] rounded-xl border border-white/[0.08] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-4 py-2.5 text-xs font-medium text-white/40 uppercase tracking-wider text-left">Prelevement</th>
                <th className="px-4 py-2.5 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Taux</th>
                <th className="px-4 py-2.5 text-xs font-medium text-white/40 uppercase tracking-wider text-left">Champ d'application</th>
              </tr>
            </thead>
            <tbody>
              {LEVIES.map((l) => (
                <tr key={l.name} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                  <td className="px-4 py-3 text-white/70 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">{l.rate}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">{l.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-4 text-xs text-white/40">
        En vigueur depuis 2015 - 15 pays membres CEDEAO
      </div>
    </div>
  )
}
