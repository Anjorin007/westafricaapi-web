"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Landmark, Copy, Check, TrendingDown, TrendingUp } from "lucide-react";
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

interface GovData {
  revenue: number | null;
  expenditure: number | null;
  deficitPctGdp: number | null;
  debtPctGdp: number | null;
  hdi: number | null;
  hdiRank: number | null;
}

type GovMap = Record<string, GovData>;

export default function GovernmentPage() {
  const [govData, setGovData] = useState<GovMap>({});
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

        const relevant = items.filter(
          (p) =>
            p.metric_key.includes("budget") ||
            p.metric_key.includes("tax_revenue") ||
            p.metric_key.includes("government") ||
            p.metric_key.includes("hdi") ||
            p.metric_key.includes("imf_govt")
        );

        const map: GovMap = {};
        for (const country of COUNTRIES) {
          const cc = country.code.toLowerCase();
          const countryPoints = relevant.filter((p) => p.country_code === cc);

          const revenue = countryPoints.find(
            (p) => p.metric_key.includes("budget_revenue") || p.metric_key === "imf_govt_revenue_pct_gdp"
          );
          const expenditure = countryPoints.find(
            (p) => p.metric_key.includes("budget_expenditure") || p.metric_key === "imf_govt_expenditure_pct_gdp"
          );
          const deficit = countryPoints.find(
            (p) =>
              p.metric_key.includes("budget_deficit_pct_gdp") ||
              p.metric_key === "imf_govt_net_lending_pct_gdp"
          );
          const debt = countryPoints.find(
            (p) =>
              p.metric_key === "government_debt_pct_gdp" ||
              p.metric_key === "imf_govt_gross_debt_pct_gdp"
          );
          const hdi = countryPoints.find((p) => p.metric_key === "undp_hdi");
          const hdiRank = countryPoints.find((p) => p.metric_key === "undp_hdi_rank");

          map[cc] = {
            revenue: revenue?.value ?? null,
            expenditure: expenditure?.value ?? null,
            deficitPctGdp: deficit?.value ?? null,
            debtPctGdp: debt?.value ?? null,
            hdi: hdi?.value ?? null,
            hdiRank: hdiRank?.value ?? null,
          };
        }
        setGovData(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const countriesWithDeficit = COUNTRIES.filter((c) => {
    const d = govData[c.code.toLowerCase()];
    return d?.deficitPctGdp !== null && d?.deficitPctGdp !== undefined && d.deficitPctGdp < 0;
  });
  const countriesWithSurplus = COUNTRIES.filter((c) => {
    const d = govData[c.code.toLowerCase()];
    return d?.deficitPctGdp !== null && d?.deficitPctGdp !== undefined && d.deficitPctGdp >= 0;
  });

  const deficitValues = Object.values(govData)
    .map((d) => d.deficitPctGdp)
    .filter((v): v is number => v !== null)
    .sort((a, b) => a - b);
  const medianDeficit =
    deficitValues.length > 0
      ? deficitValues[Math.floor(deficitValues.length / 2)]
      : null;

  const hdiCountries = COUNTRIES.filter((c) => govData[c.code.toLowerCase()]?.hdi !== null)
    .sort((a, b) => {
      const aRank = govData[a.code.toLowerCase()]?.hdiRank ?? 999;
      const bRank = govData[b.code.toLowerCase()]?.hdiRank ?? 999;
      return aRank - bRank;
    });

  const debtCountries = COUNTRIES.filter((c) => govData[c.code.toLowerCase()]?.debtPctGdp !== null)
    .sort((a, b) => {
      const aDebt = govData[a.code.toLowerCase()]?.debtPctGdp ?? 0;
      const bDebt = govData[b.code.toLowerCase()]?.debtPctGdp ?? 0;
      return bDebt - aDebt;
    });
  const maxDebt = debtCountries.length > 0
    ? govData[debtCountries[0].code.toLowerCase()]?.debtPctGdp ?? 100
    : 100;

  const curlExample = `curl -H "Authorization: Bearer YOUR_KEY" \\
  "${API_URL}/v1/data?indicator=imf_govt_gross_debt_pct_gdp&latest=true"`;

  function handleCopy() {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
            <Landmark className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-medium text-teal-400 uppercase tracking-wider">
              Government API
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Finances publiques · Afrique de l&apos;Ouest
          </h1>
          <p className="text-white/50 max-w-2xl text-lg">
            Budgets nationaux, dette publique et indicateurs de developpement humain
            pour les 15 pays de la CEDEAO.
          </p>
        </motion.div>

        {/* Stats globales */}
        {!loading && medianDeficit !== null && (
          <motion.section
            className="mt-12 grid sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1028] p-5">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Deficit median / PIB</div>
              <div className="text-2xl font-bold font-mono text-red-400">{medianDeficit.toFixed(1)}%</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1028] p-5">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Pays en surplus</div>
              <div className="text-2xl font-bold font-mono text-teal-400">{countriesWithSurplus.length}</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1028] p-5">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Pays en deficit</div>
              <div className="text-2xl font-bold font-mono text-amber-400">{countriesWithDeficit.length}</div>
            </div>
          </motion.section>
        )}

        {/* Country Cards */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-6">Budget par pays</h2>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COUNTRIES.map((country) => {
                const d = govData[country.code.toLowerCase()];
                if (!d || (d.revenue === null && d.expenditure === null && d.deficitPctGdp === null)) return null;
                const isDeficit = d.deficitPctGdp !== null && d.deficitPctGdp < 0;
                return (
                  <div
                    key={country.code}
                    className="rounded-xl border border-white/[0.06] bg-[#0d1028] p-5 hover:border-teal-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <img
                        src={`https://flagcdn.com/20x15/${country.code.toLowerCase()}.png`}
                        alt={country.name}
                        className="w-5 h-[15px] rounded-[2px] object-cover"
                      />
                      <span className="font-medium text-white/90">{country.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {d.revenue !== null && (
                        <div>
                          <div className="text-white/40 mb-0.5">Recettes</div>
                          <div className="font-mono text-white/80">{d.revenue.toFixed(1)}%</div>
                        </div>
                      )}
                      {d.expenditure !== null && (
                        <div>
                          <div className="text-white/40 mb-0.5">Depenses</div>
                          <div className="font-mono text-white/80">{d.expenditure.toFixed(1)}%</div>
                        </div>
                      )}
                    </div>
                    {d.deficitPctGdp !== null && (
                      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                        <span className="text-xs text-white/40">Solde / PIB</span>
                        <span
                          className={cn(
                            "text-sm font-mono font-semibold flex items-center gap-1",
                            isDeficit ? "text-red-400" : "text-teal-400"
                          )}
                        >
                          {isDeficit ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          {d.deficitPctGdp.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {d.deficitPctGdp !== null && (
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden mt-2">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isDeficit ? "bg-red-500/60" : "bg-teal-500/60"
                          )}
                          style={{
                            width: `${Math.min(Math.abs(d.deficitPctGdp) * 10, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* HDI Section */}
        {hdiCountries.length > 0 && (
          <motion.section
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-1">Indice de Developpement Humain (IDH)</h2>
            <p className="text-white/40 text-sm mb-6">Classement PNUD des pays CEDEAO</p>

            <div className="rounded-xl border border-white/[0.06] bg-[#0d1028] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-3 text-white/40 font-medium">Rang</th>
                    <th className="text-left px-5 py-3 text-white/40 font-medium">Pays</th>
                    <th className="text-right px-5 py-3 text-white/40 font-medium">IDH</th>
                  </tr>
                </thead>
                <tbody>
                  {hdiCountries.map((country) => {
                    const d = govData[country.code.toLowerCase()];
                    return (
                      <tr
                        key={country.code}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-2.5 text-white/50 font-mono text-xs">
                          {d?.hdiRank !== null ? `#${d?.hdiRank}` : "N/D"}
                        </td>
                        <td className="px-5 py-2.5 flex items-center gap-2.5">
                          <img
                            src={`https://flagcdn.com/20x15/${country.code.toLowerCase()}.png`}
                            alt={country.name}
                            className="w-5 h-[15px] rounded-[2px] object-cover"
                          />
                          <span className="text-white/80">{country.name}</span>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-xs text-teal-300">
                          {d?.hdi?.toFixed(3) ?? "N/D"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {/* Debt Chart */}
        {debtCountries.length > 0 && (
          <motion.section
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-1">Dette publique / PIB</h2>
            <p className="text-white/40 text-sm mb-6">Ratio dette brute sur PIB par pays</p>

            <div className="rounded-xl border border-white/[0.06] bg-[#0d1028] p-5 space-y-3">
              {debtCountries.map((country) => {
                const d = govData[country.code.toLowerCase()];
                const debt = d?.debtPctGdp ?? 0;
                const pct = (debt / maxDebt) * 100;
                return (
                  <div key={country.code} className="flex items-center gap-3">
                    <div className="w-24 flex items-center gap-2 shrink-0">
                      <img
                        src={`https://flagcdn.com/20x15/${country.code.toLowerCase()}.png`}
                        alt={country.name}
                        className="w-4 h-3 rounded-[1px] object-cover"
                      />
                      <span className="text-xs text-white/70 truncate">{country.name}</span>
                    </div>
                    <div className="flex-1 h-5 rounded bg-white/[0.03] overflow-hidden relative">
                      <motion.div
                        className={cn(
                          "h-full rounded",
                          debt > 70 ? "bg-red-500/40" : debt > 50 ? "bg-amber-500/30" : "bg-teal-500/30"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                    <span className="text-xs font-mono text-white/50 w-12 text-right shrink-0">
                      {debt.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* API Example */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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
