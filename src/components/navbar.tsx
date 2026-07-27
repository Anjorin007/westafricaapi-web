"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Database, Gavel, BarChart3, Landmark, Vote, Ship } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

const PRODUCTS = [
  { href: "/data", label: "Data API", desc: "Économie, démographie, énergie", icon: Database, live: true },
  { href: "/tenders", label: "Tenders", desc: "Appels d'offres 12 portails", icon: Gavel, live: true },
  { href: "/markets", label: "Markets", desc: "BRVM, FX, banques centrales", icon: BarChart3, live: true },
  { href: "/government", label: "Government", desc: "Leaders, cabinets, institutions", icon: Landmark, live: false },
  { href: "/elections", label: "Elections", desc: "Résultats, calendrier", icon: Vote, live: false },
  { href: "/trade", label: "Trade", desc: "Douanes, corridors, codes SH", icon: Ship, live: false },
];

const NAV_LINKS = [
  { href: "/data", label: "Data" },
  { href: "/tenders", label: "Tenders" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "h-14 border-b border-white/10 bg-[#1e2060]/80 backdrop-blur-xl shadow-lg shadow-indigo-950/20"
          : "h-16 bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Logo variant="light" size="md" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Products dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Products
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", productsOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {productsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-80 rounded-xl border border-white/10 bg-[#1a1b4b]/95 backdrop-blur-xl p-2 shadow-2xl"
                  >
                    {PRODUCTS.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="flex items-start gap-3 rounded-lg p-3 hover:bg-white/5 transition-colors group/item"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 group-hover/item:bg-indigo-500/20 transition-colors">
                          <p.icon className="h-4 w-4 text-indigo-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{p.label}</span>
                            {p.live && (
                              <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] text-emerald-400 font-medium">Live</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{p.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors px-3 py-2"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-white text-[#1e2060] hover:bg-white/90 font-semibold shadow-lg shadow-white/10"
              )}
            >
              Obtenir une clé API
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-white/10 bg-[#1e2060]/95 backdrop-blur-xl"
          >
            <div className="px-4 py-6 space-y-1">
              {PRODUCTS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <p.icon className="h-4 w-4 text-indigo-300" />
                  <span>{p.label}</span>
                  {p.live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-auto" />}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-3" />
              <Link href="/docs" className="block px-3 py-2.5 text-sm text-white/80 hover:text-white" onClick={() => setOpen(false)}>
                Documentation
              </Link>
              <Link href="/pricing" className="block px-3 py-2.5 text-sm text-white/80 hover:text-white" onClick={() => setOpen(false)}>
                Pricing
              </Link>
              <div className="pt-4 flex flex-col gap-2">
                <Link href="/dashboard" className="text-sm text-center text-white/70 py-2" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ size: "lg" }), "w-full justify-center bg-white text-[#1e2060] hover:bg-white/90 font-semibold")}
                  onClick={() => setOpen(false)}
                >
                  Obtenir une clé API
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
