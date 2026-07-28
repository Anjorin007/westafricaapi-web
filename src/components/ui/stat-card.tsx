import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type StatCardProps = {
  label: string
  value: string | number
  unit?: string
  trend?: "up" | "down" | "neutral"
  delta?: string
  loading?: boolean
}

const trendConfig = {
  up: { icon: TrendingUp, color: "text-emerald-400" },
  down: { icon: TrendingDown, color: "text-red-400" },
  neutral: { icon: Minus, color: "text-white/40" },
}

export function StatCard({ label, value, unit, trend, delta, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-4 space-y-2">
        <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
        <div className="h-7 w-28 rounded bg-white/5 animate-pulse" />
      </div>
    )
  }

  const TrendIcon = trend ? trendConfig[trend].icon : null

  return (
    <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-4">
      <p className="text-xs text-white/40 font-medium">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm text-white/40">{unit}</span>}
      </div>
      {trend && delta && TrendIcon && (
        <div className={cn("mt-2 flex items-center gap-1 text-xs", trendConfig[trend].color)}>
          <TrendIcon className="h-3 w-3" />
          <span>{delta}</span>
        </div>
      )}
    </div>
  )
}
