"use client"

import { QueryProvider } from "@/components/providers/query-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Navbar />
      <main className="min-h-screen pt-16 bg-[#080b1a]">
        {children}
      </main>
      <Footer />
    </QueryProvider>
  )
}
