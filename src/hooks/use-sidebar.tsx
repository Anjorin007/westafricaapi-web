"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type SidebarItem = {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  group?: string
}

type SidebarContextValue = {
  items: SidebarItem[]
  title: string
  setItems: (items: SidebarItem[]) => void
  setTitle: (title: string) => void
}

const SidebarContext = createContext<SidebarContextValue>({
  items: [],
  title: "",
  setItems: () => {},
  setTitle: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SidebarItem[]>([])
  const [title, setTitle] = useState("")

  const handleSetItems = useCallback((newItems: SidebarItem[]) => {
    setItems(newItems)
  }, [])

  const handleSetTitle = useCallback((newTitle: string) => {
    setTitle(newTitle)
  }, [])

  return (
    <SidebarContext.Provider value={{ items, title, setItems: handleSetItems, setTitle: handleSetTitle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
