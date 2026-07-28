"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, BarChart3, TrendingUp, Ship, Scale, Fingerprint, Sparkles, Gavel, Landmark, Vote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

// Dans "Plus" : uniquement ce qui N'est PAS déjà en lien direct
// Produits API non exposés en direct
const API_PRODUCTS = [
  { href: "/compliance", label: "Compliance API",  desc: "Fiscalité, réglementations douanières", icon: Scale,       color: "amber" },
  { href: "/identity",   label: "Identity API",    desc: "RCCM, NINEA, IFU, registres",           icon: Fingerprint, color: "rose" },
  { href: "/ai",         label: "AI API",          desc: "Q&R, résumés PDF, recherche RAG",       icon: Sparkles,    color: "sky" },
];

// Pages de contenu non exposées en direct
const MORE_LINKS = [
  { href: "/government", label: "Gouvernement", desc: "Leaders, cabinets, institutions",  icon: Landmark },
  { href: "/elections",  label: "Élections",    desc: "Résultats, calendrier régional",   icon: Vote },
];

const ICON_COLORS: Record<string, string> = {
  teal:   "bg-teal-500/10 text-teal-400",
  violet: "bg-violet-500/10 text-violet-400",
  indigo: "bg-indigo-500/10 text-indigo-400",
  amber:  "bg-amber-500/10 text-amber-400",
  rose:   "bg-rose-500/10 text-rose-400",
  sky:    "bg-sky-500/10 text-sky-400",
};

// Liens directs dans le nav
const DIRECT_LINKS = [
  { href: "/data",     label: "Data" },
  { href: "/markets",  label: "Markets" },
  { href: "/trade",    label: "Trade" },
  { href: "/tenders",  label: "Tenders" },
];

export function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "h-14 border-b border-white/10 bg-[#080b1a]/90 backdrop-blur-xl shadow-lg"
          : "h-16 bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between gap-6">

          {/* Logo */}
          <Logo variant="light" size="md" />

          {/* Desktop nav — centre */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">

            {/* Liens directs */}
            {DIRECT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150",
                  isActive(link.href)
                    ? "text-white bg-white/8"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Plus dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button className={cn(
                "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150",
                moreOpen ? "text-white bg-white/8" : "text-white/60 hover:text-white hover:bg-white/5"
              )}>
                Plus
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", moreOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.13 }}
                    className="absolute top-full left-0 mt-1.5 w-72 rounded-xl border border-white/10 bg-[#0d1028]/95 backdrop-blur-xl p-1.5 shadow-2xl shadow-black/40"
                  >
                    {/* API Products */}
                    <div className="px-2 pt-1.5 pb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Produits API</p>
                    </div>
                    {API_PRODUCTS.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors group/item"
                      >
                        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", ICON_COLORS[p.color])}>
                          <p.icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-white">{p.label}</span>
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded bg-white/8 text-white/40">API</span>
                          </div>
                          <p className="text-[11px] text-white/40 truncate">{p.desc}</p>
                        </div>
                      </Link>
                    ))}

                    {/* Divider */}
                    <div className="mx-2 my-1.5 h-px bg-white/8" />

                    {/* Content pages */}
                    <div className="px-2 pb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Données & Actualités</p>
                    </div>
                    {MORE_LINKS.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-white/40">
                          <p.icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{p.label}</p>
                          <p className="text-[11px] text-white/40">{p.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Séparateur */}
            <div className="w-px h-4 bg-white/10 mx-1" />

            <Link href="/docs" className="px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150">
              Docs
            </Link>
            <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150">
              Pricing
            </Link>
          </nav>

          {/* Actions — droite */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150"
            >
              Console
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-black text-sm font-semibold transition-colors shadow-lg shadow-teal-500/20"
            >
              Get API Key
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
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
            className="lg:hidden overflow-hidden border-t border-white/10 bg-[#080b1a]/98 backdrop-blur-xl"
          >
            <div className="px-4 py-5 space-y-1">
              {/* Liens directs */}
              {DIRECT_LINKS.map((link) => (
                <Link key={link.href} href={link.href}
                  className="block px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-white/8 my-2" />
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/25 pt-1">Produits API</p>
              {API_PRODUCTS.map((p) => (
                <Link key={p.href} href={p.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}>
                  <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded", ICON_COLORS[p.color])}>
                    <p.icon className="h-3 w-3" />
                  </div>
                  <span>{p.label}</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded bg-white/8 text-white/30 ml-auto">API</span>
                </Link>
              ))}

              <div className="h-px bg-white/8 my-2" />
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/25 pt-1">Données & Actualités</p>
              {MORE_LINKS.map((p) => (
                <Link key={p.href} href={p.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}>
                  <p.icon className="h-4 w-4 text-white/30" />
                  <span>{p.label}</span>
                </Link>
              ))}

              <div className="h-px bg-white/8 my-2" />
              <Link href="/docs" className="block px-3 py-2.5 text-sm text-white/70 hover:text-white rounded-lg" onClick={() => setOpen(false)}>Docs</Link>
              <Link href="/pricing" className="block px-3 py-2.5 text-sm text-white/70 hover:text-white rounded-lg" onClick={() => setOpen(false)}>Pricing</Link>

              <div className="pt-3 flex flex-col gap-2">
                <Link href="/dashboard" className="block text-center px-3 py-2.5 text-sm text-white/60 hover:text-white rounded-lg" onClick={() => setOpen(false)}>Console</Link>
                <Link href="/dashboard"
                  className="flex items-center justify-center px-4 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm transition-colors"
                  onClick={() => setOpen(false)}>
                  Get API Key
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
