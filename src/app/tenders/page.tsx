"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gavel, TrendingUp, Globe, Copy, Check } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";

const COUNTRIES = [
  { code: "BJ", name: "Bénin", currency: "XOF" },
  { code: "BF", name: "Burkina Faso", currency: "XOF" },
  { code: "CV", name: "Cap-Vert", currency: "CVE" },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF" },
  { code: "GM", name: "Gambie", currency: "GMD" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "GN", name: "Guinée", currency: "GNF" },
  { code: "GW", name: "Guinée-Bissau", currency: "XOF" },
  { code: "LR", name: "Liberia", currency: "USD" },
  { code: "ML", name: "Mali", currency: "XOF" },
  { code: "NE", name: "Niger", currency: "XOF" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "SN", name: "Sénégal", currency: "XOF" },
  { code: "SL", name: "Sierra Leone", currency: "SLE" },
  { code: "TG", name: "Togo", currency: "XOF" },
];

interface TenderData {
  open: number | null;
  published: number | null;
  awarded: number | null;
  totalValue: number | null;
  valueSuffix: string;
}

type TendersMap = Record<string, TenderData>;

function formatValue(val: number | null, currency: string): string {
  if (val === null) return "N/A";
  if (currency === "XOF") {
    if (val >= 1000) return `${(val / 1000).toFixed(1)} Md XOF`;
    return `${val.toFixed(1)} Md XOF`;
  }
  return `${val.toFixed(1)} ${currency}`;
}

function ProgressBar({ awarded, published }: { awarded: number; published: number }) {
  const pct = published > 0 ? Math.min((awarded / published) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
}

export default function TendersPage() {
  const [tenders, setTenders] = useState<TendersMap>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchTenders() {
      try {
        const res = await fetch(`${API_URL}/v1/data?limit=500&latest=true`);
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        const points: Array<{ country_code: string; metric_key: string; value: number }> =
          json.data || [];

        const tenderPoints = points.filter((p) => p.metric_key.includes("tenders"));

        const map: TendersMap = {};
        for (const country of COUNTRIES) {
          const cc = country.code.toLowerCase();
          const open = tenderPoints.find((p) => p.metric_key === `${cc}_tenders_open_count`);
          const published = tenderPoints.find((p) => p.metric_key === `${cc}_tenders_published_count`);
          const awarded = tenderPoints.find((p) => p.metric_key === `${cc}_tenders_awarded_count`);
          const valuePoint = tenderPoints.find((p) => p.metric_key.startsWith(`${cc}_tenders_total_value`));

          map[country.code] = {
            open: open?.value ?? null,
            published: published?.value ?? null,
            awarded: awarded?.value ?? null,
            totalValue: valuePoint?.value ?? null,
            valueSuffix: country.currency,
          };
        }
        setTenders(map);
      } catch {
        setTenders({});
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, []);

  const totalOpen = Object.values(tenders).reduce((s, t) => s + (t.open ?? 0), 0);
  const activeCountries = Object.values(tenders).filter((t) => t.open !== null && t.open > 0).length;
  const totalValueXOF = COUNTRIES.filter((c) => c.currency === "XOF")
    .reduce((s, c) => s + (tenders[c.code]?.totalValue ?? 0), 0);

  const curlExample = `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "${API_URL}/v1/data?indicator=tenders_open_count&latest=true"`;

  function handleCopy() {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#080b1a] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Marchés publics
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-white/50 text-lg max-w-2xl">
            Appels d'offres publics agrégés pour les 15 pays de la CEDEAO.
            Données collectées quotidiennement depuis les portails officiels.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {[
            { label: "Appels ouverts", value: loading ? "..." : totalOpen.toString(), icon: Gavel },
            { label: "Volume UEMOA", value: loading ? "..." : formatValue(totalValueXOF, "XOF"), icon: TrendingUp },
            { label: "Pays actifs", value: loading ? "..." : `${activeCountries}/15`, icon: Globe },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-[#0d1028] p-5"
            >
              <div className="flex items-center gap-2 text-white/40 text-sm mb-1">
                <stat.icon className="w-4 h-4" />
                {stat.label}
              </div>
              <div className="text-2xl font-semibold text-teal-300">{stat.value}</div>
            </div>
          ))}
        </motion.div>

        <section className="mt-14">
          <h2 className="text-xl font-semibold mb-6">Par pays</h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl bg-[#0d1028] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COUNTRIES.map((country, i) => {
                const data = tenders[country.code];
                const hasData = data && data.open !== null;
                return (
                  <motion.div
                    key={country.code}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03, ease: "easeOut" }}
                    className={cn(
                      "rounded-xl border bg-[#0d1028] p-5 transition-all duration-300",
                      hasData
                        ? "border-white/5 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5"
                        : "border-white/5 opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={`https://flagcdn.com/20x15/${country.code.toLowerCase()}.png`}
                        alt={country.name}
                        width={20}
                        height={15}
                        className="rounded-sm"
                      />
                      <span className="font-medium text-sm">{country.name}</span>
                    </div>

                    {hasData ? (
                      <>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-semibold text-teal-400">
                              {data.open}
                            </div>
                            <div className="text-[11px] text-white/40">Ouverts</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-white/80">
                              {data.awarded ?? 0}
                            </div>
                            <div className="text-[11px] text-white/40">Attribués</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white/60 mt-0.5">
                              {formatValue(data.totalValue, data.valueSuffix)}
                            </div>
                            <div className="text-[11px] text-white/40">Volume</div>
                          </div>
                        </div>
                        <ProgressBar
                          awarded={data.awarded ?? 0}
                          published={data.published ?? 1}
                        />
                        <div className="text-[10px] text-white/30 mt-1.5 text-right">
                          {data.awarded ?? 0}/{data.published ?? 0} attribués/publiés
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-white/30 mt-2">
                        Données non disponibles
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        <motion.section
          className="mt-20 rounded-2xl border border-white/5 bg-[#0d1028] p-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2">Accéder aux données</h2>
          <p className="text-white/50 text-sm mb-5">
            Interrogez les marchés publics via notre API REST.
          </p>
          <div className="relative">
            <pre className="rounded-lg bg-black/40 border border-white/5 p-4 text-sm text-teal-300/90 overflow-x-auto font-mono">
              {curlExample}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-teal-400" />
              ) : (
                <Copy className="w-4 h-4 text-white/40" />
              )}
            </button>
          </div>
          <p className="text-white/30 text-xs mt-3">
            Filtres disponibles : country, indicator, year, latest
          </p>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
