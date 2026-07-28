"use client"

import { type ReactNode } from "react"
import { TopBar } from "./top-bar"
import { Sidebar } from "./sidebar"
import { SidebarProvider } from "@/hooks/use-sidebar"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col bg-[#080b1a]">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
