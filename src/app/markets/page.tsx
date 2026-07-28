"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Building2, ArrowRightLeft, Landmark, RefreshCw, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface IndicatorValue {
  value: number;
  year: number;
  source: string;
}

interface EconomyResponse {
  country_code: string;
  country_name: string;
  indicators: Record<string, IndicatorValue>;
}

interface DataPoint {
  country_code: string;
  metric_key: string;
  year: number;
  value: number;
  source: string;
  source_url: string;
}

const FX_PAIRS: { key: string; label: string; flag: string; source: string }[] = [
  { key: "xof_per_usd", label: "XOF / USD", flag: "sn", source: "BCEAO" },
  { key: "xof_per_eur", label: "XOF / EUR", flag: "sn", source: "BCEAO" },
  { key: "xof_per_gbp", label: "XOF / GBP", flag: "sn", source: "BCEAO" },
  { key: "xof_per_ghs", label: "GHS / USD", flag: "gh", source: "Bank of Ghana" },
  { key: "cbn_exchange_rate_usd_ngn", label: "NGN / USD", flag: "ng", source: "CBN" },
  { key: "cbg_fx_usd_gmd", label: "GMD / USD", flag: "gm", source: "CBG" },
  { key: "bsl_fx_usd_sle", label: "SLE / USD", flag: "sl", source: "BSL" },
  { key: "cbl_fx_usd_lrd", label: "LRD / USD", flag: "lr", source: "CBL" },
  { key: "bcrg_fx_usd_gnf", label: "GNF / USD", flag: "gn", source: "BCRG" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function MarketsPage() {
  const [economy, setEconomy] = useState<EconomyResponse | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const [economyRes, dataRes] = await Promise.allSettled([
        fetch(`${API_URL}/v1/economy/SN`),
        fetch(`${API_URL}/v1/data?limit=200&latest=true`),
      ]);

      if (economyRes.status === "fulfilled" && economyRes.value.ok) {
        setEconomy(await economyRes.value.json());
      }
      if (dataRes.status === "fulfilled" && dataRes.value.ok) {
        const json = await dataRes.value.json();
        setDataPoints(json.data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  function getIndicator(key: string): IndicatorValue | undefined {
    return economy?.indicators?.[key];
  }

  function getDataValue(key: string): DataPoint | undefined {
    return dataPoints.find((d) => d.metric_key === key);
  }

  function getFxValue(key: string): number | null {
    const fromEconomy = getIndicator(key);
    if (fromEconomy) return fromEconomy.value;
    const fromData = getDataValue(key);
    if (fromData) return fromData.value;
    return null;
  }

  const bceaoCards = [
    { label: "Taux directeur", key: "bceao_policy_rate", suffix: "%" },
    { label: "Facilite de pret", key: "bceao_lending_facility_rate", suffix: "%" },
    { label: "Reserves obligatoires", key: "bceao_minimum_reserve_ratio", suffix: "%" },
  ];

  const brvmKeys = [
    { key: "brvm_composite_index", label: "Indice Composite", format: (v: number) => v.toFixed(2) },
    { key: "brvm_10_index", label: "Indice BRVM 10", format: (v: number) => v.toFixed(2) },
    { key: "brvm_market_cap_xof_bn", label: "Capitalisation", format: (v: number) => `${v.toFixed(0)} Mds XOF` },
    { key: "brvm_daily_volume_xof_mn", label: "Volume journalier", format: (v: number) => `${v.toFixed(1)} M XOF` },
    { key: "brvm_listed_companies_count", label: "Societes cotees", format: (v: number) => `${v.toFixed(0)}` },
  ];

  const curlExample = `curl -s "${API_URL}/v1/economy/SN" | jq '.indicators.bceao_policy_rate'`;

  function handleCopy() {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#080b1a] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Marches financiers{" "}
            <span className="text-teal-400">· Afrique de l&apos;Ouest</span>
          </h1>
          <p className="mt-3 text-white/50 max-w-xl text-lg">
            Taux directeurs, change et indices boursiers en temps reel via l&apos;API WestAfrica.
          </p>
        </motion.header>

        {/* BCEAO */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Landmark className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-semibold">BCEAO · Politique monetaire</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bceaoCards.map((card, i) => {
              const val = getFxValue(card.key);
              return (
                <motion.div
                  key={card.key}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "rounded-xl border border-teal-500/10 bg-[#0d1028] p-6",
                    "hover:border-teal-500/30 transition-all duration-300"
                  )}
                >
                  <p className="text-sm text-white/40 mb-1">{card.label}</p>
                  {loading ? (
                    <div className="h-8 w-20 rounded bg-white/5 animate-pulse" />
                  ) : (
                    <p className="text-2xl font-bold text-teal-300">
                      {val !== null ? `${val}${card.suffix}` : "N/A"}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Taux de change */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <ArrowRightLeft className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-semibold">Taux de change</h2>
          </div>
          <div className="rounded-xl border border-teal-500/10 bg-[#0d1028] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-left">
                  <th className="px-5 py-3 font-medium">Paire</th>
                  <th className="px-5 py-3 font-medium">Valeur</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {FX_PAIRS.map((pair, i) => {
                  const val = getFxValue(pair.key);
                  return (
                    <motion.tr
                      key={pair.key}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="border-b border-white/5 last:border-0 hover:bg-teal-500/5 transition-colors"
                    >
                      <td className="px-5 py-3 flex items-center gap-2">
                        <img
                          src={`https://flagcdn.com/20x15/${pair.flag}.png`}
                          alt={pair.flag}
                          className="w-5 h-4 rounded-sm object-cover"
                        />
                        <span className="font-medium">{pair.label}</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-teal-300">
                        {loading ? (
                          <span className="inline-block h-4 w-16 bg-white/5 rounded animate-pulse" />
                        ) : val !== null ? (
                          val.toLocaleString("fr-FR", { maximumFractionDigits: 2 })
                        ) : (
                          <span className="text-white/20">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-white/40 hidden sm:table-cell">{pair.source}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* BRVM */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-semibold">BRVM · Bourse regionale</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brvmKeys.map((item, i) => {
              const dp = getDataValue(item.key) || (economy?.indicators?.[item.key] ? { value: economy.indicators[item.key].value } : null);
              return (
                <motion.div
                  key={item.key}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    "rounded-xl border border-teal-500/10 bg-[#0d1028] p-6",
                    "hover:border-teal-500/30 transition-all duration-300"
                  )}
                >
                  <p className="text-sm text-white/40 mb-1">{item.label}</p>
                  {loading ? (
                    <div className="h-8 w-24 rounded bg-white/5 animate-pulse" />
                  ) : dp ? (
                    <p className="text-2xl font-bold text-teal-300">{item.format(dp.value)}</p>
                  ) : (
                    <p className="text-2xl font-bold text-white/20">N/A</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* API Example */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-semibold">Exemple d&apos;appel API</h2>
          </div>
          <div className="rounded-xl border border-teal-500/10 bg-[#0d1028] p-5 relative group">
            <pre className="text-sm text-teal-200/80 font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {curlExample}
            </pre>
            <button
              onClick={handleCopy}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-lg border transition-all duration-200",
                copied
                  ? "border-teal-500/40 bg-teal-500/10 text-teal-400"
                  : "border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-teal-500/30"
              )}
            >
              {copied ? <RefreshCw className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
