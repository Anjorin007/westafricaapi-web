"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ship, ArrowUpRight, ArrowDownRight, Copy, Check, Scale } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";

const COUNTRIES = [
  { code: "BJ", name: "Benin" },
  { code: "BF", name: "Burkina Faso" },
  { code: "CV", name: "Cap-Vert" },
  { code: "CI", name: "Cote d'Ivoire" },
  { code: "GM", name: "Gambie" },
  { code: "GH", name: "Ghana" },
  { code: "GN", name: "Guinee" },
  { code: "GW", name: "Guinee-Bissau" },
  { code: "LR", name: "Liberia" },
  { code: "ML", name: "Mali" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "SN", name: "Senegal" },
  { code: "SL", name: "Sierra Leone" },
  { code: "TG", name: "Togo" },
];

const TEC_BANDS = [
  { rate: "0%", category: "Biens sociaux essentiels", examples: "Medicaments, livres scolaires, equipements medicaux" },
  { rate: "5%", category: "Matieres premieres et biens de capital", examples: "Machines industrielles, intrants agricoles" },
  { rate: "10%", category: "Produits intermediaires", examples: "Pieces detachees, semi-finis" },
  { rate: "20%", category: "Biens de consommation finale", examples: "Electronique, vetements, vehicules" },
  { rate: "35%", category: "Biens sensibles", examples: "Protection industries locales, viandes, ciment" },
];

const LEVIES = [
  { name: "ECOWAS Community Levy", rate: "0.5%", scope: "Importations hors CEDEAO" },
  { name: "UEMOA Prelevement Communautaire de Solidarite", rate: "1%", scope: "Importations hors UEMOA (8 pays)" },
  { name: "Redevance Statistique", rate: "1%", scope: "Toutes importations" },
];

interface TradeData {
  exports: number | null;
  imports: number | null;
  balance: number | null;
  tradePctGdp: number | null;
}

type TradeMap = Record<string, TradeData>;

function formatUsd(val: number | null): string {
  if (val === null) return "N/D";
  if (Math.abs(val) >= 1e9) return `${(val / 1e9).toFixed(1)} Md$`;
  if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(0)} M$`;
  return `${val.toLocaleString()} $`;
}

export default function TradePage() {
  const [tradeData, setTradeData] = useState<TradeMap>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/v1/data?limit=500&latest=true`);
        if (!res.ok) return;
        const json = await res.json();
        const items: Array<{ country_code: string; metric_key: string; value: number }> =
          json.data || [];

        const tradeItems = items.filter(
          (p) =>
            p.metric_key.includes("export") ||
            p.metric_key.includes("import") ||
            p.metric_key.includes("trade") ||
            p.metric_key.includes("comtrade")
        );

        const map: TradeMap = {};
        for (const country of COUNTRIES) {
          const cc = country.code.toLowerCase();
          const exportsPoint = tradeItems.find(
            (p) =>
              p.country_code === cc &&
              (p.metric_key === "comtrade_exports_total_usd" || p.metric_key === "exports_goods_services_usd")
          );
          const importsPoint = tradeItems.find(
            (p) =>
              p.country_code === cc &&
              p.metric_key === "comtrade_imports_total_usd"
          );
          const tradePct = tradeItems.find(
            (p) => p.country_code === cc && p.metric_key === "trade_pct_gdp"
          );

          const exp = exportsPoint?.value ?? null;
          const imp = importsPoint?.value ?? null;

          map[cc] = {
            exports: exp,
            imports: imp,
            balance: exp !== null && imp !== null ? exp - imp : null,
            tradePctGdp: tradePct?.value ?? null,
          };
        }
        setTradeData(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const curlExample = `curl -H "Authorization: Bearer YOUR_KEY" \\
  "${API_URL}/v1/data?indicator=comtrade_exports_total_usd&latest=true"`;

  function handleCopy() {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasData = Object.values(tradeData).some((d) => d.exports !== null || d.imports !== null);

  return (
    <div className="min-h-screen bg-[#080b1a] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Ship className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-medium text-teal-400 uppercase tracking-wider">
              Trade API
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Commerce regional · Afrique de l&apos;Ouest
          </h1>
          <p className="text-white/50 max-w-2xl text-lg">
            Tarif Exterieur Commun CEDEAO, flux commerciaux et prelevements
            communautaires pour les 15 pays membres.
          </p>
        </motion.div>

        {/* TEC CEDEAO */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-400" />
            Tarif Exterieur Commun (TEC) CEDEAO
          </h2>
          <p className="text-white/40 text-sm mb-6">
            5 bandes tarifaires harmonisees depuis 2015 pour les importations hors zone CEDEAO
          </p>

          <div className="rounded-xl border border-white/[0.06] bg-[#0d1028] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-white/40 font-medium">Taux</th>
                  <th className="text-left px-5 py-3 text-white/40 font-medium">Categorie</th>
                  <th className="text-left px-5 py-3 text-white/40 font-medium hidden sm:table-cell">Exemples</th>
                </tr>
              </thead>
              <tbody>
                {TEC_BANDS.map((band, i) => (
                  <tr
                    key={band.rate}
                    className={cn(
                      "border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors",
                    )}
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center justify-center w-12 h-7 rounded-md bg-teal-500/10 text-teal-300 font-mono font-semibold text-xs">
                        {band.rate}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-white/80 font-medium">{band.category}</td>
                    <td className="px-5 py-3 text-white/40 hidden sm:table-cell">{band.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Trade Data */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-1">Flux commerciaux par pays</h2>
          <p className="text-white/40 text-sm mb-6">
            Exportations, importations et balance commerciale (donnees Comtrade / Banque Mondiale)
          </p>

          {loading ? (
            <div className="grid gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : !hasData ? (
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1028] p-8 text-center text-white/40">
              Aucune donnee commerciale disponible actuellement
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1028] overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-3 text-white/40 font-medium">Pays</th>
                    <th className="text-right px-5 py-3 text-white/40 font-medium">Exports</th>
                    <th className="text-right px-5 py-3 text-white/40 font-medium">Imports</th>
                    <th className="text-right px-5 py-3 text-white/40 font-medium">Balance</th>
                    <th className="text-right px-5 py-3 text-white/40 font-medium">Trade/PIB</th>
                  </tr>
                </thead>
                <tbody>
                  {COUNTRIES.map((country) => {
                    const d = tradeData[country.code.toLowerCase()];
                    if (!d || (d.exports === null && d.imports === null)) return null;
                    return (
                      <tr
                        key={country.code}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3 flex items-center gap-2.5">
                          <img
                            src={`https://flagcdn.com/20x15/${country.code.toLowerCase()}.png`}
                            alt={country.name}
                            className="w-5 h-[15px] rounded-[2px] object-cover"
                          />
                          <span className="text-white/90 font-medium">{country.name}</span>
                        </td>
                        <td className="px-5 py-3 text-right text-white/70 font-mono text-xs">
                          {d.exports !== null && (
                            <span className="inline-flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3 text-teal-400" />
                              {formatUsd(d.exports)}
                            </span>
                          )}
                          {d.exports === null && "N/D"}
                        </td>
                        <td className="px-5 py-3 text-right text-white/70 font-mono text-xs">
                          {d.imports !== null && (
                            <span className="inline-flex items-center gap-1">
                              <ArrowDownRight className="w-3 h-3 text-amber-400" />
                              {formatUsd(d.imports)}
                            </span>
                          )}
                          {d.imports === null && "N/D"}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-xs">
                          <span
                            className={cn(
                              d.balance !== null && d.balance >= 0 ? "text-teal-400" : "text-red-400"
                            )}
                          >
                            {d.balance !== null ? formatUsd(d.balance) : "N/D"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-white/50 font-mono text-xs">
                          {d.tradePctGdp !== null ? `${d.tradePctGdp.toFixed(0)}%` : "N/D"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* Prelevements */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-1">Prelevements communautaires additionnels</h2>
          <p className="text-white/40 text-sm mb-6">
            Taxes appliquees en plus du TEC sur les importations
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {LEVIES.map((levy) => (
              <div
                key={levy.name}
                className="rounded-xl border border-white/[0.06] bg-[#0d1028] p-5 hover:border-teal-500/20 transition-colors"
              >
                <div className="text-2xl font-bold text-teal-300 font-mono mb-2">{levy.rate}</div>
                <div className="text-sm font-medium text-white/80 mb-1">{levy.name}</div>
                <div className="text-xs text-white/40">{levy.scope}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* API Example */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">Exemple d&apos;appel API</h2>
          <div className="relative rounded-xl border border-white/[0.06] bg-[#0d1028] p-5 font-mono text-xs text-white/70 overflow-x-auto">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <pre className="whitespace-pre-wrap">{curlExample}</pre>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
