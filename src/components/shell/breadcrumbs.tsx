import Link from "next/link"

type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-white/40">
      <Link href="/" className="hover:text-white/60 transition-colors">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span>/</span>
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-white/60 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-white/70" : ""}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
