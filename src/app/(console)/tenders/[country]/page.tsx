"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { FileText, MapPin, BarChart3 } from "lucide-react"
import { useSidebar } from "@/hooks/use-sidebar"
import { Breadcrumbs } from "@/components/shell/breadcrumbs"
import { StatCard } from "@/components/ui/stat-card"
import { CopyButton } from "@/components/ui/copy-button"

const API_URL = "https://ecowas-api.onrender.com"

const SIDEBAR_ITEMS = [
  { label: "Tous les marches", href: "/tenders", icon: FileText },
  { label: "Par pays", href: "/tenders/by-country", icon: MapPin },
  { label: "Statistiques", href: "/tenders/stats", icon: BarChart3 },
]

const COUNTRIES: Record<string, string> = {
  bj: "Benin", bf: "Burkina Faso", cv: "Cap-Vert", ci: "Cote d'Ivoire",
  gm: "Gambie", gh: "Ghana", gn: "Guinee", gw: "Guinee-Bissau",
  lr: "Liberia", ml: "Mali", ne: "Niger", ng: "Nigeria",
  sn: "Senegal", sl: "Sierra Leone", tg: "Togo",
}

export default function TenderCountryPage() {
  const params = useParams()
  const country = String(params.country ?? "").toLowerCase()
  const countryCode = country.toUpperCase()
  const countryName = COUNTRIES[country] ?? country.toUpperCase()

  const { setItems, setTitle } = useSidebar()

  useEffect(() => {
    setTitle("MARCHES PUBLICS")
    setItems(SIDEBAR_ITEMS)
  }, [setItems, setTitle])

  const { data: allData, isLoading } = useQuery({
    queryKey: ["data", "tenders", countryCode],
    queryFn: () => fetch(`${API_URL}/v1/data?country=${countryCode}&latest=true&limit=50`).then((r) => r.json()),
  })

  const indicators = allData?.data ?? allData?.results ?? []
  const tenderIndicators = indicators.filter((d: Record<string, unknown>) =>
    String(d.metric_key ?? d.indicator_code ?? "").includes("tenders")
  )

  const findVal = (partial: string) => {
    const ind = tenderIndicators.find((d: Record<string, unknown>) =>
      String(d.metric_key ?? d.indicator_code ?? "").includes(partial)
    )
    return ind?.value != null ? Number(ind.value) : 0
  }

  const open = findVal("open")
  const awarded = findVal("awarded")
  const published = findVal("published")
  const volume = findVal("volume")
  const ratio = published > 0 ? Math.round((awarded / published) * 100) : 0

  const curlExample = `curl -H "Authorization: Bearer YOUR_KEY" \\
  "${API_URL}/v1/data?country=${countryCode}&latest=true&limit=50"`

  return (
    <div className="space-y-8 p-6">
      <Breadcrumbs items={[{ label: "Marches publics", href: "/tenders" }, { label: countryName }]} />

      <div className="flex items-center gap-3">
        <img src={`https://flagcdn.com/40x30/${country}.png`} alt="" className="w-10 h-7 rounded object-cover" />
        <div>
          <h1 className="text-2xl font-bold text-white">{countryName}</h1>
          <p className="text-sm text-white/50">Marches publics - {countryCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Ouverts" value={open || "-"} loading={isLoading} />
        <StatCard label="Attribues" value={awarded || "-"} loading={isLoading} />
        <StatCard label="Publies" value={published || "-"} loading={isLoading} />
        <StatCard label="Volume total" value={volume > 0 ? volume.toLocaleString("fr-FR") : "-"} loading={isLoading} />
      </div>

      {published > 0 && (
        <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40">Ratio attribution</span>
            <span className="text-xs font-medium text-white">{ratio}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-500"
              style={{ width: `${ratio}%` }}
            />
          </div>
          <p className="text-xs text-white/30 mt-2">{awarded} attribues sur {published} publies</p>
        </div>
      )}

      <section className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Reference API</h3>
          <CopyButton text={curlExample} />
        </div>
        <pre className="text-xs text-teal-300/80 font-mono overflow-x-auto whitespace-pre-wrap">{curlExample}</pre>
      </section>
    </div>
  )
}
