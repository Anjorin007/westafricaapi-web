"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";
import { API_URL } from "@/lib/api";

type CountryInfo = {
  name: string;
  code: string;
  currency: string;
  lang: string;
  zone: string;
  capital: string;
  surface: string;
  slug: string;
};

const COUNTRIES: CountryInfo[] = [
  { name: "Bénin", code: "BJ", currency: "XOF", lang: "FR", zone: "UEMOA", capital: "Porto-Novo", surface: "114 763 km²", slug: "benin" },
  { name: "Burkina Faso", code: "BF", currency: "XOF", lang: "FR", zone: "UEMOA", capital: "Ouagadougou", surface: "274 200 km²", slug: "burkina-faso" },
  { name: "Cap-Vert", code: "CV", currency: "CVE", lang: "PT", zone: "CEDEAO", capital: "Praia", surface: "4 033 km²", slug: "cabo-verde" },
  { name: "Côte d'Ivoire", code: "CI", currency: "XOF", lang: "FR", zone: "UEMOA", capital: "Abidjan", surface: "322 463 km²", slug: "cote-divoire" },
  { name: "Gambie", code: "GM", currency: "GMD", lang: "EN", zone: "CEDEAO", capital: "Banjul", surface: "11 295 km²", slug: "gambia" },
  { name: "Ghana", code: "GH", currency: "GHS", lang: "EN", zone: "CEDEAO", capital: "Accra", surface: "238 533 km²", slug: "ghana" },
  { name: "Guinée", code: "GN", currency: "GNF", lang: "FR", zone: "CEDEAO", capital: "Conakry", surface: "245 857 km²", slug: "guinea" },
  { name: "Guinée-Bissau", code: "GW", currency: "XOF", lang: "PT", zone: "UEMOA", capital: "Bissau", surface: "36 125 km²", slug: "guinea-bissau" },
  { name: "Liberia", code: "LR", currency: "LRD", lang: "EN", zone: "CEDEAO", capital: "Monrovia", surface: "111 369 km²", slug: "liberia" },
  { name: "Mali", code: "ML", currency: "XOF", lang: "FR", zone: "UEMOA", capital: "Bamako", surface: "1 240 192 km²", slug: "mali" },
  { name: "Niger", code: "NE", currency: "XOF", lang: "FR", zone: "UEMOA", capital: "Niamey", surface: "1 267 000 km²", slug: "niger" },
  { name: "Nigeria", code: "NG", currency: "NGN", lang: "EN", zone: "CEDEAO", capital: "Abuja", surface: "923 768 km²", slug: "nigeria" },
  { name: "Sénégal", code: "SN", currency: "XOF", lang: "FR", zone: "UEMOA", capital: "Dakar", surface: "196 722 km²", slug: "senegal" },
  { name: "Sierra Leone", code: "SL", currency: "SLE", lang: "EN", zone: "CEDEAO", capital: "Freetown", surface: "71 740 km²", slug: "sierra-leone" },
  { name: "Togo", code: "TG", currency: "XOF", lang: "FR", zone: "UEMOA", capital: "Lomé", surface: "56 785 km²", slug: "togo" },
];

const SLUG_MAP: Record<string, CountryInfo> = Object.fromEntries(
  COUNTRIES.map((c) => [c.slug, c])
);

type KeyStat = { label: string; value: string; unit: string; source: string; year: number };

const FALLBACK_STATS: Record<string, KeyStat[]> = {
  BJ: [
    { label: "PIB", value: "17.8", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "6.4", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "2.8", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "13.7", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "42.1", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux alphabétisation", value: "45.8", unit: "%", source: "UNESCO", year: 2022 },
  ],
  BF: [
    { label: "PIB", value: "18.9", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "3.6", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "0.8", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "22.1", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "21.1", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux alphabétisation", value: "46.0", unit: "%", source: "UNESCO", year: 2022 },
  ],
  CV: [
    { label: "PIB", value: "2.2", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "4.8", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "4.1", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "0.6", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "93.4", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux alphabétisation", value: "87.5", unit: "%", source: "UNESCO", year: 2022 },
  ],
  CI: [
    { label: "PIB", value: "70.0", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "6.8", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "4.4", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "27.5", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "69.0", unit: "%", source: "World Bank", year: 2022 },
    { label: "Exportations cacao", value: "3.8", unit: "Mrd USD", source: "FAO", year: 2022 },
  ],
  GM: [
    { label: "PIB", value: "2.1", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "5.5", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "17.4", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "2.7", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "63.0", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux alphabétisation", value: "58.0", unit: "%", source: "UNESCO", year: 2022 },
  ],
  GH: [
    { label: "PIB", value: "76.4", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "2.9", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "23.2", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "33.5", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "84.8", unit: "%", source: "World Bank", year: 2022 },
    { label: "Exportations or", value: "6.6", unit: "Mrd USD", source: "World Bank", year: 2022 },
  ],
  GN: [
    { label: "PIB", value: "22.1", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "6.2", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "9.3", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "13.5", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "46.0", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux alphabétisation", value: "45.3", unit: "%", source: "UNESCO", year: 2022 },
  ],
  GW: [
    { label: "PIB", value: "1.6", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "4.2", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "7.4", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "2.1", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "28.0", unit: "%", source: "World Bank", year: 2022 },
    { label: "Exportations cajou", value: "0.2", unit: "Mrd USD", source: "FAO", year: 2022 },
  ],
  LR: [
    { label: "PIB", value: "4.4", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "4.7", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "10.1", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "5.4", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "28.9", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux alphabétisation", value: "48.3", unit: "%", source: "UNESCO", year: 2022 },
  ],
  ML: [
    { label: "PIB", value: "22.4", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "3.3", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "2.9", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "22.4", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "49.0", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux pauvreté", value: "44.9", unit: "%", source: "World Bank", year: 2022 },
  ],
  NE: [
    { label: "PIB", value: "16.8", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "14.1", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "3.7", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "26.2", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "19.5", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux fécondité", value: "6.8", unit: "naissances/femme", source: "World Bank", year: 2022 },
  ],
  NG: [
    { label: "PIB", value: "477.4", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "2.9", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "24.5", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "218.5", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Production pétrole", value: "1.22", unit: "M barils/jour", source: "OPEC", year: 2023 },
    { label: "Accès électricité", value: "55.4", unit: "%", source: "World Bank", year: 2022 },
  ],
  SN: [
    { label: "PIB", value: "27.6", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "8.3", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "5.9", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "17.8", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "67.4", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux alphabétisation", value: "56.3", unit: "%", source: "UNESCO", year: 2022 },
  ],
  SL: [
    { label: "PIB", value: "3.9", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "3.8", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "43.4", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "8.6", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "26.0", unit: "%", source: "World Bank", year: 2022 },
    { label: "Taux alphabétisation", value: "43.2", unit: "%", source: "UNESCO", year: 2022 },
  ],
  TG: [
    { label: "PIB", value: "9.4", unit: "Mrd USD", source: "World Bank", year: 2023 },
    { label: "Croissance PIB", value: "5.7", unit: "%", source: "World Bank", year: 2023 },
    { label: "Inflation", value: "5.1", unit: "%", source: "IMF", year: 2023 },
    { label: "Population", value: "8.9", unit: "millions", source: "World Bank", year: 2023 },
    { label: "Accès électricité", value: "52.0", unit: "%", source: "World Bank", year: 2022 },
    { label: "Mortalité infantile", value: "47.2", unit: "pour 1000", source: "WHO", year: 2022 },
  ],
};

type ApiDataPoint = {
  indicator_name?: string;
  indicator?: string;
  category?: string;
  value: number | string;
  unit?: string;
  year?: number;
  source?: string;
};

const LANG_COLORS: Record<string, string> = {
  FR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  EN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const CAT_COLORS: Record<string, string> = {
  economy: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  trade: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  demographics: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  health: "bg-red-500/10 text-red-400 border-red-500/20",
  education: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  technology: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  energy: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

const CAT_LABELS: Record<string, string> = {
  economy: "Économie",
  trade: "Commerce",
  demographics: "Démographie",
  health: "Santé",
  education: "Éducation",
  technology: "Technologie",
  energy: "Énergie",
};

function formatValue(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return String(value);
  if (Math.abs(n) > 1e9) return `${(n / 1e9).toFixed(1)} Mrd`;
  if (Math.abs(n) > 1e6) return `${(n / 1e6).toFixed(1)} M`;
  if (Math.abs(n) > 1e3) return n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

export default function CountryPage() {
  const params = useParams();
  const slug = typeof params?.country === "string" ? params.country : "";
  const info = SLUG_MAP[slug];

  const [apiData, setApiData] = useState<ApiDataPoint[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!info) return;
    fetch(`${API_URL}/v1/economy/${info.code}`)
      .then((r) => r.json())
      .then((data) => {
        const rows = data?.indicators || data?.data || (Array.isArray(data) ? data : []);
        if (rows.length > 0) setApiData(rows);
      })
      .catch(() => {});
  }, [info]);

  if (!info) {
    notFound();
    return null;
  }

  const countryIndex = COUNTRIES.findIndex((c) => c.slug === slug);
  const prevCountry = countryIndex > 0 ? COUNTRIES[countryIndex - 1] : null;
  const nextCountry = countryIndex < COUNTRIES.length - 1 ? COUNTRIES[countryIndex + 1] : null;

  const keyStats = FALLBACK_STATS[info.code] || [];

  const grouped: Record<string, ApiDataPoint[]> = {};
  for (const d of apiData) {
    const cat = d.category || "economy";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(d);
  }
  const groupKeys = Object.keys(grouped);

  const curlCmd = `curl -H "Authorization: Bearer ak_live_••••" \\
  "${API_URL}/v1/economy/${info.code}"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd.replace(" \\\\n  ", " \\\n  ")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b1a] text-white">
      <Navbar />

      {/* Breadcrumb + nav */}
      <section className="pt-24 pb-6 px-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Link href="/data" className="hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Data Explorer
            </Link>
            <span>/</span>
            <span className="text-white/70">{info.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {prevCountry && (
              <Link
                href={`/data/${prevCountry.slug}`}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {prevCountry.name}
              </Link>
            )}
            {nextCountry && (
              <Link
                href={`/data/${nextCountry.slug}`}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {nextCountry.name}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Hero country */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/80x60/${info.code.toLowerCase()}.png`}
              alt={info.name}
              className="w-20 h-15 rounded-lg object-cover border border-white/10 shadow-lg"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{info.name}</h1>
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                <span className="text-xs text-white/50 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">
                  {info.capital}
                </span>
                <span className="text-xs text-white/50 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full font-mono">
                  {info.currency}
                </span>
                <span className={cn("text-xs px-2.5 py-1 rounded-full border", LANG_COLORS[info.lang])}>
                  {info.lang === "FR" ? "Français" : info.lang === "EN" ? "Anglais" : "Portugais"}
                </span>
                <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
                  {info.zone}
                </span>
                <span className="text-xs text-white/35 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-full">
                  {info.surface}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key stats */}
      <section className="pb-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-base font-semibold text-white/60 uppercase tracking-wider mb-5">
            Indicateurs clés · {keyStats[0]?.year || 2023}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {keyStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="p-4 rounded-xl bg-[#0d1028] border border-white/8"
              >
                <div className="text-xl font-bold text-white">
                  {stat.value}
                  <span className="text-xs text-white/35 font-normal ml-1">{stat.unit}</span>
                </div>
                <div className="text-xs text-white/50 mt-1.5">{stat.label}</div>
                <div className="mt-2">
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded border",
                    stat.source === "BCEAO"
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                  )}>
                    {stat.source}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API data — if loaded */}
      {apiData.length > 0 && (
        <section className="py-14 px-4 bg-[#0a0d20]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-xl font-semibold">Données API</h2>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* Category tabs */}
            {groupKeys.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-all duration-150",
                    activeTab === "all"
                      ? "bg-teal-500/15 border-teal-500/40 text-teal-400"
                      : "bg-white/[0.03] border-white/8 text-white/45 hover:text-white/70"
                  )}
                >
                  Tous ({apiData.length})
                </button>
                {groupKeys.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition-all duration-150",
                      activeTab === cat
                        ? "bg-teal-500/15 border-teal-500/40 text-teal-400"
                        : "bg-white/[0.03] border-white/8 text-white/45 hover:text-white/70"
                    )}
                  >
                    {CAT_LABELS[cat] || cat} ({grouped[cat].length})
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-white/8 overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_80px_100px] gap-4 px-5 py-3 bg-white/[0.03] text-xs text-white/35 uppercase tracking-wider font-medium border-b border-white/5">
                <div>Indicateur</div>
                <div>Valeur</div>
                <div>Année</div>
                <div>Source</div>
              </div>
              {(activeTab === "all" ? apiData : grouped[activeTab] || []).map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_1fr_80px_100px] gap-4 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors duration-100 items-center"
                >
                  <div>
                    <div className="text-sm text-white/85 font-medium">
                      {d.indicator_name || d.indicator || "Indicateur"}
                    </div>
                    {d.category && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded border mt-1 inline-block",
                        CAT_COLORS[d.category] || "bg-white/5 text-white/40 border-white/8"
                      )}>
                        {CAT_LABELS[d.category] || d.category}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-mono font-semibold text-white">
                    {formatValue(d.value)}
                    {d.unit && <span className="text-xs text-white/35 font-normal ml-1">{d.unit}</span>}
                  </div>
                  <div className="text-sm text-white/40">{d.year || 2023}</div>
                  <div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded border",
                      d.source === "BCEAO"
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    )}>
                      {d.source || "API"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* API request example */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Accéder aux données via l&apos;API</h2>
          <div className="rounded-xl bg-[#0d1028] border border-white/8 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <span className="text-xs text-white/35 uppercase tracking-wider font-medium">Requête</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            <pre className="px-5 py-5 text-sm font-mono text-indigo-200/80 overflow-x-auto leading-relaxed">
{`curl -H "Authorization: Bearer ak_live_••••" \\
  "${API_URL}/v1/economy/${info.code}"`}
            </pre>
          </div>

          {/* Other endpoints for this country */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Historique", path: `/v1/economy/${info.code}/history` },
              { label: "Population", path: `/v1/statistics/${info.code}/population` },
              { label: "Énergie", path: `/v1/statistics/${info.code}/energy` },
            ].map((ep) => (
              <div
                key={ep.path}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="text-xs text-white/40 uppercase tracking-wider font-medium mb-1.5">{ep.label}</div>
                <code className="text-xs font-mono text-white/55">{API_URL}{ep.path}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other countries */}
      <section className="py-14 px-4 bg-[#0a0d20]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Autres pays</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {COUNTRIES.filter((c) => c.slug !== slug).map((c, i) => (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={`/data/${c.slug}`}
                  className="flex flex-col items-center p-3 rounded-xl bg-[#0d1028] border border-white/8 hover:border-teal-500/30 transition-all duration-200 text-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/20x15/${c.code.toLowerCase()}.png`}
                    alt={c.name}
                    className="w-5 h-4 rounded-sm object-cover mb-1.5"
                  />
                  <span className="text-xs text-white/60 leading-tight">{c.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
