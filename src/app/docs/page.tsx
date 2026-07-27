import Link from "next/link";
import { ArrowRight, Key, Database, Zap, Book } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const SECTIONS = [
  { href: "/docs/quickstart", icon: Zap, title: "Quickstart", desc: "Votre première requête en 2 minutes" },
  { href: "/docs/authentication", icon: Key, title: "Authentification", desc: "API keys, Bearer tokens, rate limits" },
  { href: "/docs/endpoints", icon: Database, title: "Endpoints", desc: "Référence complète des 17 endpoints" },
  { href: "/docs/errors", icon: Book, title: "Erreurs", desc: "Codes HTTP, retry strategy, headers" },
];

const ENDPOINTS = [
  { method: "GET", path: "/v1/countries", desc: "Liste des 15 pays" },
  { method: "GET", path: "/v1/economy/{code}", desc: "Indicateurs économiques par pays" },
  { method: "GET", path: "/v1/data", desc: "Query générique (filtres: country, indicator, year)" },
  { method: "GET", path: "/v1/indicators", desc: "Catalogue des 279+ indicateurs" },
  { method: "GET", path: "/v1/indicators/{key}/rankings", desc: "Classement 15 pays" },
  { method: "GET", path: "/v1/platform/stats", desc: "Statistiques plateforme (public)" },
];

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-bold mb-3">Documentation</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Tout ce qu&apos;il faut pour intégrer WestAfrica API dans votre produit.
          </p>

          {/* Quick links */}
          <div className="grid sm:grid-cols-2 gap-4 mb-16">
            {SECTIONS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-start gap-4 rounded-xl border border-border/50 p-5 hover:border-primary/40 hover:shadow-md transition-all bg-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15 shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5 group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Endpoint reference */}
          <h2 className="text-xl font-bold mb-4">Endpoints principaux</h2>
          <div className="rounded-xl border border-border/50 overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium w-20">Méthode</th>
                  <th className="text-left px-4 py-3 font-medium">Path</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map((ep) => (
                  <tr key={ep.path} className="border-b border-border/30">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{ep.path}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Base URL */}
          <div className="p-6 rounded-xl bg-[#0a0a1a] border border-white/10 mb-8">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3 font-medium">Base URL</p>
            <code className="text-sm text-indigo-200/80 font-mono">https://ecowas-api.onrender.com</code>
          </div>

          <Link href="/docs/quickstart" className={cn(buttonVariants(), "gap-2")}>
            Commencer le quickstart <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
