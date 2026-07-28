import { type ReactNode } from "react"

type ChartCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
  loading?: boolean
  actions?: ReactNode
}

export function ChartCard({ title, subtitle, children, loading, actions }: ChartCardProps) {
  if (loading) {
    return (
      <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
        <div className="h-4 w-32 rounded bg-white/5 animate-pulse mb-4" />
        <div className="h-48 rounded bg-white/5 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-[#0d1028] border border-white/[0.08] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">{title}</h3>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
