import { QueryProvider } from "@/components/providers/query-provider"
import { AppShell } from "@/components/shell/app-shell"

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  )
}
