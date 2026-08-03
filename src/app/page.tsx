"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, BarChart3, Ship, TrendingUp, Scale, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { API_URL } from "@/lib/api";
import { countries, SHADOW_D, EXTRUSION_D } from "@/lib/africa-data";

/* ═══════════════════════════════════════════════════
   SECTION 1 — Hero + Carte interactive
   ═══════════════════════════════════════════════════ */

const ECOWAS_META: Record<string, { name: string; flag: string }> = {
  ML: { name: "Mali", flag: "🇲🇱" },
  NE: { name: "Niger", flag: "🇳🇪" },
  SN: { name: "Sénégal", flag: "🇸🇳" },
  GM: { name: "Gambie", flag: "🇬🇲" },
  GW: { name: "Guinée-Bissau", flag: "🇬🇼" },
  GN: { name: "Guinée", flag: "🇬🇳" },
  SL: { name: "Sierra Leone", flag: "🇸🇱" },
  LR: { name: "Liberia", flag: "🇱🇷" },
  CI: { name: "Côte d'Ivoire", flag: "🇨🇮" },
  BF: { name: "Burkina Faso", flag: "🇧🇫" },
  GH: { name: "Ghana", flag: "🇬🇭" },
  TG: { name: "Togo", flag: "🇹🇬" },
  BJ: { name: "Bénin", flag: "🇧🇯" },
  NG: { name: "Nigeria", flag: "🇳🇬" },
  CV: { name: "Cap-Vert", flag: "🇨🇻" },
};

interface CountryData {
  gdp_growth?: number;
  population?: number;
  inflation?: number;
}

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // 55 particules avec positions/vitesses aléatoires mais déterministes
    type P = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; speed: number };
    const particles: P[] = Array.from({ length: 55 }, (_, i) => {
      const seed = (i * 137.508) % 1;
      const seed2 = (i * 97.31 + 0.4) % 1;
      const seed3 = (i * 53.7 + 0.2) % 1;
      const seed4 = (i * 73.1 + 0.6) % 1;
      const angle = seed * Math.PI * 2;
      const sp = 0.08 + seed3 * 0.18;
      return {
        x: seed * W,
        y: seed2 * H,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        r: 0.8 + seed3 * 2.2,
        alpha: 0.12 + seed4 * 0.55,
        speed: sp,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,184,166,${p.alpha})`;
        ctx.fill();

        // Halo doux sur les grosses particules
        if (p.r > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(20,184,166,${p.alpha * 0.18})`;
          ctx.fill();
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  useEffect(() => {
    init();
    return () => cancelAnimationFrame(frameRef.current);
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
}

function AfricaMap({ countryData }: { countryData: Record<string, CountryData> }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Map country name → ISO code — 15 pays Afrique de l'Ouest
  // Mauritanie: exclue (quittée ECOWAS en 2000)
  const nameToCode: Record<string, string> = {
    "Mali": "ML", "Niger": "NE", "Sénégal": "SN", "Senegal": "SN",
    "Gambie": "GM", "Gambia": "GM", "Guinée-Bissau": "GW", "Guinea-Bissau": "GW",
    "Guinée": "GN", "Guinea": "GN", "Sierra Leone": "SL", "Liberia": "LR",
    "Côte d'Ivoire": "CI", "Ivory Coast": "CI", "Burkina Faso": "BF",
    "Ghana": "GH", "Togo": "TG", "Bénin": "BJ", "Benin": "BJ",
    "Nigeria": "NG", "Cap-Vert": "CV", "Cabo Verde": "CV",
  };

  // Pays marqués westAfrica dans le SVG mais pas couverts par notre API
  const excluded = new Set(["Mauritanie", "Mauritania"]);

  const hoveredCode = hovered ? nameToCode[hovered] : null;
  const meta = hoveredCode ? ECOWAS_META[hoveredCode] : null;

  return (
    <div className="relative w-full max-w-[560px] mx-auto lg:mx-0 select-none">
      <FloatingParticles />
      <svg
        viewBox="0 80 970 880"
        role="img"
        aria-label="Carte 3D de l'Afrique avec les pays CEDEAO mis en évidence"
        className="w-full drop-shadow-2xl"
      >
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="10" dy="18" stdDeviation="14" floodColor="#000" floodOpacity="0.28"/>
          </filter>
        </defs>

        {/* Ombre portée */}
        <g filter="url(#softShadow)">
          <path d={SHADOW_D} fill="#1e293b"/>
        </g>

        {/* Épaisseur 3D */}
        <g transform="translate(-7,11)">
          <path d={EXTRUSION_D} fill="#1e3a5f"/>
        </g>

        {/* Face supérieure — tous les pays */}
        <g strokeLinejoin="round">
          {countries.map((c) => {
            const code = nameToCode[c.name];
            const isEcowas = c.westAfrica && !excluded.has(c.name);
            const isHovered = hovered === c.name;
            // Cap-Vert est un marqueur séparé — ne pas affecter les autres pays quand il est survolé
            const anyHovered = hovered !== null && hovered !== "Cap-Vert";

            let fill: string;
            if (isEcowas) {
              if (isHovered) fill = "#5eead4";
              else if (anyHovered) fill = "#0d9488";
              else fill = "#14b8a6";
            } else {
              fill = isHovered ? "#d4d4d2" : anyHovered ? "#e8e8e6" : "#f5f5f4";
            }

            return (
              <path
                key={c.id}
                d={c.d}
                stroke={isEcowas ? "#0a5e56" : "#9ca3af"}
                strokeWidth={isEcowas ? 1.6 : 0.8}
                fill={fill}
                className="transition-[fill] duration-150"
                style={{ cursor: isEcowas ? "pointer" : "default" }}
                onMouseEnter={() => isEcowas && setHovered(c.name)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{c.name}</title>
              </path>
            );
          })}
        </g>

        {/* Cap-Vert — marqueur à l'ouest du Sénégal dans l'Atlantique */}
        {/* Sénégal ≈ x:135-200, y:352-400 → Cap-Vert à ~500km à l'ouest = x:55-75, y:358 */}
        <g
          onMouseEnter={() => setHovered("Cap-Vert")}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer" }}
        >
          {/* Ligne pointillée vers le Sénégal */}
          <line x1="78" y1="362" x2="135" y2="375"
            stroke="#0d9488" strokeWidth="1.2" strokeDasharray="5 3" opacity="0.5"/>

          {/* Îles — 5 cercles groupés */}
          {([
            [48, 358, 5.5],
            [60, 352, 4],
            [70, 357, 5],
            [55, 368, 3.5],
            [66, 369, 3],
          ] as [number, number, number][]).map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill={hovered === "Cap-Vert" ? "#5eead4" : "#14b8a6"}
              stroke="#0a5e56" strokeWidth="1.2"
              className="transition-[fill] duration-150"
            />
          ))}

          {/* Label */}
          <text x="59" y="342" textAnchor="middle"
            fontSize="11" fontWeight="600" fontFamily="system-ui, sans-serif"
            fill={hovered === "Cap-Vert" ? "#5eead4" : "#0d9488"}
            className="transition-[fill] duration-150"
          >
            Cap-Vert
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && meta && hoveredCode && (
          <motion.div
            key={hoveredCode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-4 right-0 bg-[#0f1629]/95 border border-white/10 backdrop-blur-xl rounded-xl p-4 min-w-[200px] shadow-2xl z-20 pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{meta.flag}</span>
              <span className="font-semibold text-white text-sm">{meta.name}</span>
            </div>
            {countryData[hoveredCode] ? (
              <div className="space-y-1.5 text-xs">
                {countryData[hoveredCode].gdp_growth != null && (
                  <div className="flex justify-between gap-6">
                    <span className="text-white/50">Croissance PIB</span>
                    <span className="text-teal-300 font-mono font-medium">
                      {countryData[hoveredCode].gdp_growth! > 0 ? "+" : ""}
                      {countryData[hoveredCode].gdp_growth?.toFixed(1)}%
                    </span>
                  </div>
                )}
                {countryData[hoveredCode].population != null && (
                  <div className="flex justify-between gap-6">
                    <span className="text-white/50">Population</span>
                    <span className="text-white font-mono font-medium">
                      {(countryData[hoveredCode].population! / 1e6).toFixed(1)}M
                    </span>
                  </div>
                )}
                {countryData[hoveredCode].inflation != null && (
                  <div className="flex justify-between gap-6">
                    <span className="text-white/50">Inflation</span>
                    <span className="text-amber-300 font-mono font-medium">
                      {countryData[hoveredCode].inflation?.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-white/40">Données live...</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */

function useCountUp(target: number, duration = 1400, delay = 300) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(ease * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

/* ═══════════════════════════════════════════════════
   SECTION 2 — Ticker données live (bande défilante)
   ═══════════════════════════════════════════════════ */

interface TickerItem {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  flag?: string;
}

const FX_FALLBACK = {
  xof_usd: 605.2,
  xof_eur: 655.96,
  ghs_usd: 14.85,
  ngn_usd: 1542,
  gmd_usd: 72.1,
  cve_usd: 102.4,
  lrd_usd: 192.5,
  gnf_usd: 8610,
  sle_usd: 22.5,
  bceao_rate: 3.50,
};

function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [fxRates, setFxRates] = useState({ ...FX_FALLBACK });

  useEffect(() => {
    async function fetchFxRates() {
      const rates = { ...FX_FALLBACK };

      const results = await Promise.allSettled([
        fetch(`${API_URL}/v1/economy/SN`),
        fetch(`${API_URL}/v1/economy/GH`),
        fetch(`${API_URL}/v1/economy/NG`),
        fetch(`${API_URL}/v1/economy/GM`),
        fetch(`${API_URL}/v1/economy/CV`),
        fetch(`${API_URL}/v1/economy/LR`),
        fetch(`${API_URL}/v1/economy/GN`),
        fetch(`${API_URL}/v1/economy/SL`),
      ]);
      const [snRes, ghRes, ngRes, gmRes, cvRes, lrRes, gnRes, slRes] = results;

      const pick = (ind: Record<string, {value: number}>, ...keys: string[]) => {
        for (const k of keys) if (ind[k]?.value != null) return Number(ind[k].value);
        return null;
      };

      try {
        if (snRes.status === "fulfilled" && snRes.value.ok) {
          const ind = (await snRes.value.json()).indicators || {};
          const v1 = pick(ind, "bceao_fx_xof_usd", "fx_xof_usd");
          const v2 = pick(ind, "bceao_fx_xof_eur", "fx_xof_eur");
          const v3 = pick(ind, "bceao_policy_rate", "policy_rate");
          if (v1) rates.xof_usd = v1;
          if (v2) rates.xof_eur = v2;
          if (v3) rates.bceao_rate = v3;
        }
      } catch { /* fallback */ }
      try {
        if (ghRes.status === "fulfilled" && ghRes.value.ok) {
          const ind = (await ghRes.value.json()).indicators || {};
          const v = pick(ind, "bog_fx_usd_ghs", "fx_usd_ghs");
          if (v) rates.ghs_usd = v;
        }
      } catch { /* fallback */ }
      try {
        if (ngRes.status === "fulfilled" && ngRes.value.ok) {
          const ind = (await ngRes.value.json()).indicators || {};
          const v = pick(ind, "cbn_fx_usd_ngn", "fx_usd_ngn");
          if (v) rates.ngn_usd = v;
        }
      } catch { /* fallback */ }
      try {
        if (gmRes.status === "fulfilled" && gmRes.value.ok) {
          const ind = (await gmRes.value.json()).indicators || {};
          const v = pick(ind, "cbg_fx_usd_gmd", "fx_usd_gmd");
          if (v) rates.gmd_usd = v;
        }
      } catch { /* fallback */ }
      try {
        if (cvRes.status === "fulfilled" && cvRes.value.ok) {
          const ind = (await cvRes.value.json()).indicators || {};
          const v = pick(ind, "bcv_fx_usd_cve", "fx_usd_cve");
          if (v) rates.cve_usd = v;
        }
      } catch { /* fallback */ }
      try {
        if (lrRes.status === "fulfilled" && lrRes.value.ok) {
          const ind = (await lrRes.value.json()).indicators || {};
          const v = pick(ind, "cbl_fx_usd_lrd", "fx_usd_lrd");
          if (v) rates.lrd_usd = v;
        }
      } catch { /* fallback */ }
      try {
        if (gnRes.status === "fulfilled" && gnRes.value.ok) {
          const ind = (await gnRes.value.json()).indicators || {};
          const v = pick(ind, "bcrg_fx_usd_gnf", "fx_usd_gnf");
          if (v) rates.gnf_usd = v;
        }
      } catch { /* fallback */ }
      try {
        if (slRes.status === "fulfilled" && slRes.value.ok) {
          const ind = (await slRes.value.json()).indicators || {};
          const v = pick(ind, "bsl_fx_usd_sle", "fx_usd_sle");
          if (v) rates.sle_usd = v;
        }
      } catch { /* fallback */ }

      setFxRates(rates);
    }
    fetchFxRates();
  }, []);

  useEffect(() => {
    async function fetchTicker() {
      const entries: TickerItem[] = [];
      try {
        // Stats plateforme
        const statsRes = await fetch(`${API_URL}/v1/platform/stats`);
        if (statsRes.ok) {
          const s = await statsRes.json();
          if (s.total_observations) entries.push({ label: "Observations", value: s.total_observations.toLocaleString(), trend: "neutral" });
          if (s.total_indicators) entries.push({ label: "Indicateurs", value: String(s.total_indicators), trend: "neutral" });
        }

        // ETL status
        const etlRes = await fetch(`${API_URL}/v1/platform/etl-status`);
        if (etlRes.ok) {
          const etl = await etlRes.json();
          if (etl.last_run) {
            const ago = Math.round((Date.now() - new Date(etl.last_run).getTime()) / 3600000);
            entries.push({ label: "Dernière MAJ", value: ago < 1 ? "< 1h" : `il y a ${ago}h`, trend: "neutral" });
          }
        }
      } catch {
        // fallback
      }

      // Calcul des trends dynamiques (comparaison avec valeurs de référence)
      const trendFor = (live: number, ref: number): "up" | "down" | "neutral" =>
        live > ref ? "up" : live < ref ? "down" : "neutral";

      // Formatage des valeurs
      const fmtXof = (v: number) => v.toFixed(1);
      const fmtGhs = (v: number) => v.toFixed(2);
      const fmtNgn = (v: number) => Math.round(v).toLocaleString("en-US");

      const xofUsdTrend = trendFor(fxRates.xof_usd, FX_FALLBACK.xof_usd);
      const xofEurTrend = trendFor(fxRates.xof_eur, FX_FALLBACK.xof_eur);
      const ghsTrend    = trendFor(fxRates.ghs_usd, FX_FALLBACK.ghs_usd);
      const ngnTrend    = trendFor(fxRates.ngn_usd, FX_FALLBACK.ngn_usd);

      const xofUsdVal = fmtXof(fxRates.xof_usd);
      const xofEurVal = fmtXof(fxRates.xof_eur);
      const ghsVal    = fmtGhs(fxRates.ghs_usd);
      const ngnVal    = fmtNgn(fxRates.ngn_usd);
      const gmdVal    = fxRates.gmd_usd.toFixed(1);
      const cveVal    = fxRates.cve_usd.toFixed(1);
      const lrdVal    = fxRates.lrd_usd.toFixed(1);
      const gnfVal    = Math.round(fxRates.gnf_usd).toLocaleString("en-US");
      const sleVal    = fxRates.sle_usd.toFixed(1);
      const bceaoVal  = `${fxRates.bceao_rate.toFixed(2)}%`;

      const gmdTrend = trendFor(fxRates.gmd_usd, FX_FALLBACK.gmd_usd);
      const cveTrend = trendFor(fxRates.cve_usd, FX_FALLBACK.cve_usd);
      const lrdTrend = trendFor(fxRates.lrd_usd, FX_FALLBACK.lrd_usd);
      const gnfTrend = trendFor(fxRates.gnf_usd, FX_FALLBACK.gnf_usd);
      const sleTrend = trendFor(fxRates.sle_usd, FX_FALLBACK.sle_usd);

      const base: TickerItem[] = [
        { label: "XOF/USD",    value: xofUsdVal, trend: xofUsdTrend, flag: "sn" },
        { label: "XOF/EUR",    value: xofEurVal, trend: xofEurTrend, flag: "ci" },
        { label: "GHS/USD",    value: ghsVal,    trend: ghsTrend,    flag: "gh" },
        { label: "NGN/USD",    value: ngnVal,    trend: ngnTrend,    flag: "ng" },
        { label: "GMD/USD",    value: gmdVal,    trend: gmdTrend,    flag: "gm" },
        { label: "CVE/USD",    value: cveVal,    trend: cveTrend,    flag: "cv" },
        { label: "LRD/USD",    value: lrdVal,    trend: lrdTrend,    flag: "lr" },
        { label: "GNF/USD",    value: gnfVal,    trend: gnfTrend,    flag: "gn" },
        { label: "SLE/USD",    value: sleVal,    trend: sleTrend,    flag: "sl" },
        { label: "Taux BCEAO", value: bceaoVal,  trend: "neutral",   flag: "bf" },
        { label: "XOF/USD",    value: xofUsdVal, trend: xofUsdTrend, flag: "ml" },
        { label: "XOF/USD",    value: xofUsdVal, trend: xofUsdTrend, flag: "ne" },
        { label: "XOF/USD",    value: xofUsdVal, trend: xofUsdTrend, flag: "tg" },
        { label: "XOF/USD",    value: xofUsdVal, trend: xofUsdTrend, flag: "bj" },
        { label: "XOF/USD",    value: xofUsdVal, trend: xofUsdTrend, flag: "gw" },
      ];

      setItems([...base, ...entries]);
    }
    fetchTicker();
  }, [fxRates]);

  if (items.length === 0) return null;

  // Dupliquer pour boucle infinie
  const doubled = [...items, ...items];

  return (
    <section className="relative border-y border-white/5 bg-[#070a14] overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070a14] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070a14] to-transparent z-10" />
      <div className="flex animate-ticker whitespace-nowrap py-3.5">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-sm">
            {item.flag && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://flagcdn.com/20x15/${item.flag}.png`}
                alt=""
                width={20}
                height={15}
                className="rounded-sm"
              />
            )}
            <span className="text-white/40 font-medium">{item.label}</span>
            <span className={
              item.trend === "up" ? "text-emerald-400 font-mono font-semibold" :
              item.trend === "down" ? "text-red-400 font-mono font-semibold" :
              "text-white font-mono font-semibold"
            }>
              {item.value}
            </span>
            {item.trend === "up" && <span className="text-emerald-400 text-xs">▲</span>}
            {item.trend === "down" && <span className="text-red-400 text-xs">▼</span>}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 3 — Terminal interactif
   ═══════════════════════════════════════════════════ */

const TERMINAL_COUNTRIES = [
  { code: "BJ", name: "Bénin", flag: "bj" },
  { code: "BF", name: "Burkina Faso", flag: "bf" },
  { code: "CV", name: "Cap-Vert", flag: "cv" },
  { code: "CI", name: "Côte d'Ivoire", flag: "ci" },
  { code: "GM", name: "Gambie", flag: "gm" },
  { code: "GH", name: "Ghana", flag: "gh" },
  { code: "GN", name: "Guinée", flag: "gn" },
  { code: "GW", name: "Guinée-Bissau", flag: "gw" },
  { code: "LR", name: "Liberia", flag: "lr" },
  { code: "ML", name: "Mali", flag: "ml" },
  { code: "NE", name: "Niger", flag: "ne" },
  { code: "NG", name: "Nigeria", flag: "ng" },
  { code: "SN", name: "Sénégal", flag: "sn" },
  { code: "SL", name: "Sierra Leone", flag: "sl" },
  { code: "TG", name: "Togo", flag: "tg" },
];

const TERMINAL_ENDPOINTS = [
  { key: "economy", label: "Économie", path: (code: string) => `/v1/economy/${code}` },
  { key: "population", label: "Population", path: (code: string) => `/v1/statistics/${code}/population` },
  { key: "technology", label: "Technologie", path: (code: string) => `/v1/statistics/${code}/technology` },
  { key: "energy", label: "Énergie", path: (code: string) => `/v1/statistics/${code}/energy` },
  { key: "country", label: "Détail pays", path: (code: string) => `/v1/countries/${code}` },
];

function InteractiveTerminal() {
  const [country, setCountry] = useState(TERMINAL_COUNTRIES[0]);
  const [endpoint, setEndpoint] = useState(TERMINAL_ENDPOINTS[0]);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");

  const executeCall = useCallback(async (c: typeof TERMINAL_COUNTRIES[0], ep: typeof TERMINAL_ENDPOINTS[0]) => {
    const path = ep.path(c.code);
    setUrl(`GET ${path}`);
    setLoading(true);
    setResponse("");

    const attempt = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const res = await fetch(`${API_URL}${path}`, { signal: controller.signal });
        clearTimeout(timeout);
        return await res.json();
      } catch {
        clearTimeout(timeout);
        return null;
      }
    };

    let json = await attempt();
    if (!json) {
      // Render cold start — retry once after 3s
      setResponse('{ "status": "Démarrage du serveur..." }');
      await new Promise(r => setTimeout(r, 3000));
      json = await attempt();
    }

    setResponse(json ? JSON.stringify(json, null, 2) : '{ "error": "Serveur indisponible — réessaie dans 30s" }');
    setLoading(false);
  }, []);

  useEffect(() => {
    executeCall(country, endpoint);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="py-20 bg-[#060914]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Un vrai appel, une vraie réponse
          </h2>
          <p className="text-white/50 mt-3 max-w-lg mx-auto">
            Choisissez un pays et un endpoint. La réponse s'affiche en temps réel.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {/* Country select */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://flagcdn.com/20x15/${country.flag}.png`} alt="" width={20} height={15} className="rounded-sm" />
            <select
              value={country.code}
              onChange={(e) => {
                const c = TERMINAL_COUNTRIES.find(x => x.code === e.target.value)!;
                setCountry(c);
                executeCall(c, endpoint);
              }}
              className="bg-transparent text-white text-sm outline-none cursor-pointer"
            >
              {TERMINAL_COUNTRIES.map(c => (
                <option key={c.code} value={c.code} className="bg-[#0f1629] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Endpoint tabs */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            {TERMINAL_ENDPOINTS.map(ep => (
              <button
                key={ep.key}
                onClick={() => {
                  setEndpoint(ep);
                  executeCall(country, ep);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  endpoint.key === ep.key
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {ep.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal window */}
        <div className="rounded-xl border border-white/10 bg-[#0a0f1e] overflow-hidden shadow-2xl shadow-black/40">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-3 text-xs text-white/30 font-mono">westafricaapi.com</span>
          </div>

          {/* URL bar */}
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-sm font-semibold">GET</span>
            <span className="text-white/70 font-mono text-sm">{url}</span>
            {loading && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-white/30">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                chargement...
              </span>
            )}
          </div>

          {/* Response */}
          <div className="p-4 max-h-[420px] overflow-auto">
            {loading ? (
              <div className="flex items-center gap-2 text-white/30 text-sm font-mono">
                <span className="inline-block w-2 h-2 bg-teal-400 rounded-full animate-ping" />
                Appel en cours...
              </div>
            ) : (
              <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                <code>
                  {response.split("\n").map((line, i) => {
                    // Coloration syntaxique basique
                    const colored = line
                      .replace(/"([^"]+)":/g, '<key>"$1"</key>:')
                      .replace(/: "([^"]+)"/g, ': <str>"$1"</str>')
                      .replace(/: (\d+\.?\d*)/g, ': <num>$1</num>')
                      .replace(/: (true|false|null)/g, ': <bool>$1</bool>');

                    return (
                      <span key={i} className="block">
                        {colored.includes("<key>") || colored.includes("<str>") ? (
                          <span dangerouslySetInnerHTML={{
                            __html: colored
                              .replace(/<key>/g, '<span class="text-indigo-300">')
                              .replace(/<\/key>/g, '</span>')
                              .replace(/<str>/g, '<span class="text-emerald-300">')
                              .replace(/<\/str>/g, '</span>')
                              .replace(/<num>/g, '<span class="text-amber-300">')
                              .replace(/<\/num>/g, '</span>')
                              .replace(/<bool>/g, '<span class="text-rose-300">')
                              .replace(/<\/bool>/g, '</span>')
                          }} />
                        ) : (
                          <span className="text-white/60">{line}</span>
                        )}
                      </span>
                    );
                  })}
                </code>
              </pre>
            )}
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-white/30 text-xs mt-4">
          Données réelles, servies en temps réel
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 9 — CTA final
   ═══════════════════════════════════════════════════ */

function CtaSection() {
  return (
    <section className="py-15 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0c1120 0%, #060914 100%)" }}>
      {/* Glow central */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-teal-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Ton accès en<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-500">30 secondes.</span>
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            Aucune carte bancaire. Aucune configuration.
          </p>

          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold text-base transition-colors shadow-lg shadow-teal-500/25"
          >
            Obtenir une clé API
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-white/20 text-xs mt-6">
            1 000 requêtes/mois gratuites
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 8 — Comment ça marche
   ═══════════════════════════════════════════════════ */

const TERMINAL_SCENARIOS = [
  {
    label: "Économie",
    code: `curl https://api.westafricaapi.com/v1/economy/SN \\
  -H "Authorization: Bearer waa_live_sk_••••••••••••"`,
    apiPath: "/v1/economy/SN",
    fallback: `{
  "country": "Sénégal",
  "gdp_growth": 4.7,
  "inflation": 2.1,
  "currency": "XOF"
}`,
  },
  {
    label: "Taux de change",
    code: `curl https://api.westafricaapi.com/v1/economy/GH \\
  -H "Authorization: Bearer waa_live_sk_••••••••••••"`,
    apiPath: "/v1/economy/GH",
    fallback: `{
  "country": "Ghana",
  "GHS_USD": 14.85,
  "policy_rate": 27.0
}`,
  },
  {
    label: "Population",
    code: `curl https://api.westafricaapi.com/v1/statistics/NG/population \\
  -H "Authorization: Bearer waa_live_sk_••••••••••••"`,
    apiPath: "/v1/statistics/NG/population",
    fallback: `{
  "country": "Nigeria",
  "population": 223804632,
  "urban_rate": 54.3,
  "growth_rate": 2.5
}`,
  },
];

function TypewriterCode({ autoplay }: { autoplay: boolean }) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [responseLine, setResponseLine] = useState(0);
  const [liveResponses, setLiveResponses] = useState<Record<number, string>>({});

  const scenario = TERMINAL_SCENARIOS[scenarioIdx];
  const responseText = liveResponses[scenarioIdx] || scenario.fallback;

  useEffect(() => {
    async function fetchAll() {
      const results: Record<number, string> = {};
      for (let idx = 0; idx < TERMINAL_SCENARIOS.length; idx++) {
        try {
          const res = await fetch(`${API_URL}${TERMINAL_SCENARIOS[idx].apiPath}`);
          if (res.ok) {
            const json = await res.json();
            const compact: Record<string, unknown> = { country: json.country_name };
            const ind = json.indicators || [];
            for (const item of ind.slice(0, 4)) {
              compact[item.metric_key] = item.value;
            }
            results[idx] = JSON.stringify(compact, null, 2);
          }
        } catch { /* use fallback */ }
      }
      setLiveResponses(results);
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    setDisplayed("");
    setShowResponse(false);
    setResponseLine(0);

    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(scenario.code.slice(0, i));
      if (i >= scenario.code.length) {
        clearInterval(iv);
        setTimeout(() => setShowResponse(true), 350);
      }
    }, 18);
    return () => clearInterval(iv);
  }, [autoplay, scenarioIdx, scenario.code]);

  useEffect(() => {
    if (!showResponse) return;
    const lines = responseText.split("\n");
    if (responseLine >= lines.length) {
      const t = setTimeout(() => {
        setScenarioIdx(s => (s + 1) % TERMINAL_SCENARIOS.length);
      }, 2200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setResponseLine(r => r + 1), 80);
    return () => clearTimeout(t);
  }, [showResponse, responseLine, responseText]);

  const responseLines = responseText.split("\n").slice(0, responseLine);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#050810] shadow-2xl shadow-black/50 font-mono text-xs leading-relaxed">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-white/20 text-[11px]">terminal</span>
        </div>
        {/* Scénario tabs */}
        <div className="flex gap-1">
          {TERMINAL_SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => setScenarioIdx(i)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                i === scenarioIdx ? "bg-teal-500/20 text-teal-300" : "text-white/20 hover:text-white/40"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 min-h-[180px]">
        {/* Prompt */}
        <div className="flex gap-2 mb-2">
          <span className="text-teal-400 select-none flex-shrink-0">$</span>
          <pre className="text-white/75 whitespace-pre-wrap break-all flex-1">
            {displayed.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && "\n"}
              </span>
            ))}
            {displayed.length < scenario.code.length && (
              <span className="inline-block w-1.5 h-3.5 bg-teal-400 animate-pulse align-middle ml-0.5" />
            )}
          </pre>
        </div>

        {/* Response — coloration syntaxique */}
        {showResponse && (
          <pre className="mt-1 border-t border-white/5 pt-3">
            {responseLines.map((line, i) => {
              const keyMatch = line.match(/^(\s*)"([^"]+)":\s*/);
              const strMatch = line.match(/:\s*"([^"]+)"/);
              const numMatch = line.match(/:\s*(\d+\.?\d*)$/);
              if (keyMatch) {
                const indent = keyMatch[1];
                const key = keyMatch[2];
                const rest = line.slice(keyMatch[0].length);
                const valStr = strMatch ? <span className="text-emerald-300">{`"${strMatch[1]}"`}</span> : null;
                const valNum = numMatch ? <span className="text-amber-300">{numMatch[1]}</span> : null;
                return (
                  <span key={i} className="block">
                    <span className="text-white/30">{indent}</span>
                    <span className="text-indigo-300">{`"${key}"`}</span>
                    <span className="text-white/30">{": "}</span>
                    {valStr}{valNum}
                    {!valStr && !valNum && <span className="text-white/30">{rest}</span>}
                  </span>
                );
              }
              return <span key={i} className="block text-white/30">{line}</span>;
            })}
          </pre>
        )}
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActiveStep(1); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeStep === 0) return;
    if (activeStep >= 3) return;
    const t = setTimeout(() => setActiveStep(s => s + 1), 1800);
    return () => clearTimeout(t);
  }, [activeStep]);

  const steps = [
    {
      num: "01",
      title: "Crée ton compte",
      desc: "Inscris-toi en 30 secondes. Aucune carte bancaire requise pour commencer.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
    },
    {
      num: "02",
      title: "Copie ta clé API",
      desc: "Ta clé est générée instantanément dans le dashboard. Elle est prête à l'emploi.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
        </svg>
      ),
    },
    {
      num: "03",
      title: "Lance ta requête",
      desc: "Un appel curl ou fetch suffit. La réponse JSON arrive en moins de 200ms.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
        </svg>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 border-t border-white/5" style={{ background: "linear-gradient(180deg, #080b1a 0%, #0c1120 100%)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Prêt en 3 minutes
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto">
            De l&apos;inscription à votre premier appel, sans friction.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — étapes */}
          <div className="space-y-2">
            {steps.map((step, i) => {
              const done = activeStep > i + 1;
              const current = activeStep === i + 1;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: activeStep > i ? 1 : 0.3, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`flex gap-4 p-5 rounded-xl border transition-all duration-500 cursor-pointer ${
                    current
                      ? "border-teal-500/30 bg-teal-500/5"
                      : done
                      ? "border-white/5 bg-white/[0.02]"
                      : "border-white/5 bg-transparent"
                  }`}
                  onClick={() => setActiveStep(i + 1)}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    current ? "bg-teal-500/15 text-teal-400" : done ? "bg-white/5 text-white/40" : "bg-white/5 text-white/20"
                  }`}>
                    {done ? (
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : step.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold ${current ? "text-teal-400" : "text-white/20"}`}>{step.num}</span>
                      <h3 className={`font-semibold text-sm ${current ? "text-white" : done ? "text-white/60" : "text-white/30"}`}>{step.title}</h3>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${current ? "text-white/50" : "text-white/25"}`}>{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right — terminal animé */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: activeStep > 0 ? 1 : 0, y: activeStep > 0 ? 0 : 20 }}
            transition={{ duration: 0.6 }}
          >
            <TypewriterCode autoplay={activeStep >= 3} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 7 — Appels d'offres live
   ═══════════════════════════════════════════════════ */

interface Tender {
  id: string;
  title: string;
  country_code: string;
  budget?: number;
  currency?: string;
  deadline?: string;
  authority?: string;
  sector?: string;
  source_url?: string;
}

const TENDER_FALLBACK: Tender[] = [
  { id: "t1", title: "Construction du pont de Farafenni sur le fleuve Gambie", country_code: "GM", budget: 48000000000, currency: "XOF", deadline: "2026-09-15", authority: "Min. des Travaux Publics", sector: "Infrastructure" },
  { id: "t2", title: "Fourniture de 500 000 manuels scolaires, cycle primaire", country_code: "SN", budget: 2400000000, currency: "XOF", deadline: "2026-08-20", authority: "Ministère de l'Éducation", sector: "Éducation" },
  { id: "t3", title: "Réhabilitation du port de Cotonou, terminal à conteneurs", country_code: "BJ", budget: 85000000000, currency: "XOF", deadline: "2026-10-01", authority: "Autorité Portuaire", sector: "Transport" },
  { id: "t4", title: "Système de gestion de la paie pour 42 000 fonctionnaires", country_code: "GH", budget: 12000000, currency: "GHS", deadline: "2026-08-05", authority: "Ministry of Finance", sector: "Technologie" },
  { id: "t5", title: "Acquisition de 80 ambulances médicalisées pour zones rurales", country_code: "CI", budget: 9600000000, currency: "XOF", deadline: "2026-09-28", authority: "Min. de la Santé", sector: "Santé" },
  { id: "t6", title: "Extension du réseau d'eau potable dans 35 communes", country_code: "TG", budget: 15000000000, currency: "XOF", deadline: "2026-11-10", authority: "ONEA Togo", sector: "Eau & Assainissement" },
];

const SECTOR_COLORS: Record<string, string> = {
  "Infrastructure":     "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Éducation":          "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "Transport":          "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "Technologie":        "text-teal-400 bg-teal-500/10 border-teal-500/20",
  "Santé":              "text-rose-400 bg-rose-500/10 border-rose-500/20",
  "Eau & Assainissement": "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

const COUNTRY_FLAG: Record<string, string> = {
  BJ:"bj", BF:"bf", CV:"cv", CI:"ci", GM:"gm", GH:"gh",
  GN:"gn", GW:"gw", LR:"lr", ML:"ml", NE:"ne", NG:"ng",
  SN:"sn", SL:"sl", TG:"tg",
};

function useCountdown(deadline?: string) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setLabel("Expiré"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setLabel(d > 0 ? `J-${d}` : `${h}h`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [deadline]);
  return label;
}

function TenderCard({ tender }: { tender: Tender }) {
  const countdown = useCountdown(tender.deadline);
  const flag = COUNTRY_FLAG[tender.country_code];
  const sectorStyle = SECTOR_COLORS[tender.sector || ""] || "text-white/40 bg-white/5 border-white/10";
  const isUrgent = (() => {
    if (!tender.deadline) return false;
    const diff = new Date(tender.deadline).getTime() - Date.now();
    return diff > 0 && diff < 14 * 86400000;
  })();

  const formatBudget = (v?: number, cur?: string) => {
    if (!v) return null;
    if (cur === "XOF") {
      if (v >= 1e9) return `${(v / 1e9).toFixed(1)} Md XOF`;
      if (v >= 1e6) return `${(v / 1e6).toFixed(0)} M XOF`;
    }
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)} M ${cur}`;
    return `${v.toLocaleString()} ${cur}`;
  };

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-white/8 bg-[#0a0f1e] p-5 hover:border-white/15 hover:bg-[#0d1425] transition-all duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          {flag && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://flagcdn.com/20x15/${flag}.png`} alt={tender.country_code} width={20} height={15} className="rounded-sm" loading="lazy" />
          )}
          {tender.sector && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sectorStyle}`}>
              {tender.sector}
            </span>
          )}
        </div>
        {countdown && (
          <span className={`text-xs font-mono font-bold flex-shrink-0 px-2.5 py-1 rounded-lg border ${
            isUrgent
              ? "text-red-300 bg-red-500/10 border-red-500/20"
              : "text-white/50 bg-white/5 border-white/10"
          }`}>
            {countdown}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm text-white/80 leading-relaxed font-medium line-clamp-2">{tender.title}</p>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
        <span className="text-xs text-white/30 truncate">{tender.authority}</span>
        {tender.budget && (
          <span className="text-xs font-mono font-semibold text-emerald-400 flex-shrink-0">
            {formatBudget(tender.budget, tender.currency)}
          </span>
        )}
      </div>
    </div>
  );
}

function TendersSection() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/v1/tenders?limit=6`);
        if (res.ok) {
          const json = await res.json();
          if ((json.tenders || []).length > 0) {
            setTenders(json.tenders.slice(0, 6));
            setLive(true);
            return;
          }
        }
      } catch { /* silent */ }
      setTenders(TENDER_FALLBACK);
    }
    load();
  }, []);

  return (
    <section className="py-24 border-t border-white/5" style={{ background: "linear-gradient(180deg, #060914 0%, #080b1a 100%)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Appels d&apos;offres en cours
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto">
            Marchés publics actifs à travers l&apos;Afrique de l&apos;Ouest. Budgets, délais et autorités.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm">
            <span className={`w-2 h-2 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span className="text-white/30">{live ? "Données live" : "Données d'illustration"}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenders.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <TenderCard tender={t} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/tenders"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 gap-2"
            )}
          >
            Voir tous les appels d&apos;offres
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 6 — Couverture géographique
   ═══════════════════════════════════════════════════ */

// 12 membres CEDEAO actifs (Mali, Burkina Faso, Niger ont quitté en jan. 2025 → AES)
const ECOWAS_MEMBERS = [
  { code: "BJ", name: "Bénin",         flag: "bj", zone: "UEMOA" },
  { code: "CV", name: "Cap-Vert",      flag: "cv", zone: "" },
  { code: "CI", name: "Côte d'Ivoire", flag: "ci", zone: "UEMOA" },
  { code: "GM", name: "Gambie",        flag: "gm", zone: "" },
  { code: "GH", name: "Ghana",         flag: "gh", zone: "" },
  { code: "GN", name: "Guinée",        flag: "gn", zone: "" },
  { code: "GW", name: "Guinée-Bissau", flag: "gw", zone: "UEMOA" },
  { code: "LR", name: "Liberia",       flag: "lr", zone: "" },
  { code: "NG", name: "Nigeria",       flag: "ng", zone: "" },
  { code: "SN", name: "Sénégal",       flag: "sn", zone: "UEMOA" },
  { code: "SL", name: "Sierra Leone",  flag: "sl", zone: "" },
  { code: "TG", name: "Togo",          flag: "tg", zone: "UEMOA" },
];

// Quittants CEDEAO en jan. 2025 — membres Alliance des États du Sahel (AES)
const AES_MEMBERS = [
  { code: "BF", name: "Burkina Faso",  flag: "bf", zone: "AES" },
  { code: "ML", name: "Mali",          flag: "ml", zone: "AES" },
  { code: "NE", name: "Niger",         flag: "ne", zone: "AES" },
];

interface CountryStats {
  gdp_growth?: number;
  population?: number;
  inflation?: number;
}

function CountryCard({ country, stats, aes }: { country: typeof ECOWAS_MEMBERS[0]; stats?: CountryStats; aes?: boolean }) {
  return (
    <Link
      href={`/countries/${country.code.toLowerCase()}`}
      className={`group relative flex flex-col gap-3 rounded-xl border bg-[#0a0f1e] p-4 transition-all duration-200 ${
        aes
          ? "border-amber-500/15 hover:border-amber-500/35 hover:bg-[#131008]"
          : "border-white/8 hover:border-teal-500/30 hover:bg-[#0d1425]"
      }`}
    >
      {/* Flag + name */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://flagcdn.com/32x24/${country.flag}.png`}
          alt={country.name}
          width={32}
          height={24}
          className="rounded-sm flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className="font-medium text-white text-sm truncate">{country.name}</p>
          {country.zone && (
            <span className={`text-[10px] font-medium ${country.zone === "AES" ? "text-amber-400/70" : "text-teal-400/70"}`}>{country.zone}</span>
          )}
        </div>
        <ArrowRight className={`w-3.5 h-3.5 text-white/20 ml-auto group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ${aes ? "group-hover:text-amber-400" : "group-hover:text-teal-400"}`} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-3">
        <div>
          <p className={`text-xs font-mono font-semibold ${stats?.gdp_growth != null ? (stats.gdp_growth >= 0 ? "text-emerald-400" : "text-red-400") : "text-white/20"}`}>
            {stats?.gdp_growth != null ? `${stats.gdp_growth > 0 ? "+" : ""}${stats.gdp_growth.toFixed(1)}%` : "—"}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">PIB</p>
        </div>
        <div>
          <p className={`text-xs font-mono font-semibold ${stats?.population != null ? "text-white/70" : "text-white/20"}`}>
            {stats?.population != null ? `${(stats.population / 1e6).toFixed(1)}M` : "—"}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">Pop.</p>
        </div>
        <div>
          <p className={`text-xs font-mono font-semibold ${stats?.inflation != null ? "text-amber-300" : "text-white/20"}`}>
            {stats?.inflation != null ? `${stats.inflation.toFixed(1)}%` : "—"}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">Inflation</p>
        </div>
      </div>
    </Link>
  );
}

function CoverageSection() {
  const [allStats, setAllStats] = useState<Record<string, CountryStats>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const map: Record<string, CountryStats> = {};
      const safeFetch = async (url: string): Promise<Record<string, unknown> | null> => {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) return await res.json();
          } catch { /* retry */ }
          if (attempt === 0) await new Promise(r => setTimeout(r, 3000));
        }
        return null;
      };

      const j1 = await safeFetch(`${API_URL}/v1/data?indicator=gdp_growth_annual&latest=true`);
      if (j1) for (const d of (j1.data as Array<{country_code: string; value: number}>) || []) { if (!map[d.country_code]) map[d.country_code] = {}; if (map[d.country_code].gdp_growth == null) map[d.country_code].gdp_growth = d.value; }

      const j2 = await safeFetch(`${API_URL}/v1/data?indicator=population_total&latest=true`);
      if (j2) for (const d of (j2.data as Array<{country_code: string; value: number}>) || []) { if (!map[d.country_code]) map[d.country_code] = {}; if (map[d.country_code].population == null) map[d.country_code].population = d.value; }

      const j3 = await safeFetch(`${API_URL}/v1/data?indicator=inflation_consumer_prices&latest=true`);
      if (j3) for (const d of (j3.data as Array<{country_code: string; value: number}>) || []) { if (!map[d.country_code]) map[d.country_code] = {}; if (map[d.country_code].inflation == null) map[d.country_code].inflation = d.value; }

      setAllStats(map);
      setLoaded(true);
    }
    load();
  }, []);

  return (
    <section className="py-24 border-t border-white/5" style={{ background: "linear-gradient(180deg, #080b1a 0%, #060914 100%)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            15 pays d&apos;Afrique de l&apos;Ouest
          </h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto">
            12 membres CEDEAO actifs et 3 pays de l&apos;Alliance des États du Sahel, couverts séparément.
          </p>
        </div>

        {/* CEDEAO — 12 membres */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-teal-500/10" />
          <span className="text-xs font-semibold uppercase tracking-widest text-teal-400">CEDEAO · 12 membres actifs</span>
          <div className="flex-1 h-px bg-teal-500/10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
          {ECOWAS_MEMBERS.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <CountryCard country={c} stats={loaded ? allStats[c.code] : undefined} />
            </motion.div>
          ))}
        </div>

        {/* AES — 3 membres */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-amber-500/10" />
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">Alliance des États du Sahel · sortie CEDEAO jan. 2025</span>
          <div className="flex-1 h-px bg-amber-500/10" />
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {AES_MEMBERS.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <CountryCard country={c} stats={loaded ? allStats[c.code] : undefined} aes />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/countries"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-white/15 text-white/60 hover:text-white hover:bg-white/5 bg-transparent"
            )}
          >
            Explorer tous les pays
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 5 — Les produits (cards avec data samples)
   ═══════════════════════════════════════════════════ */

function highlightJson(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"([^"]+)"(?=\s*:)/g, '<span class="text-indigo-300">"$1"</span>')
    .replace(/:\s*"([^"]+)"/g, ': <span class="text-emerald-300">"$1"<\/span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-amber-300">$1<\/span>');
}

type ProductColor = "teal" | "indigo" | "violet" | "amber" | "rose" | "sky";

interface Product {
  name: string;
  badge: string;
  href: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: ProductColor;
  sample: { endpoint: string; data: string };
}

// Data / Trade / Markets / AI = vitrine freemium (badge "Free")
// Compliance = produit phare Enterprise, fusionne Compliance + Identity API
const PRODUCTS: Product[] = [
  {
    name: "Data API",
    badge: "Free",
    href: "/data",
    description: "PIB, inflation, population, énergie. 23 indicateurs, 15 pays.",
    Icon: BarChart3,
    color: "teal",
    sample: {
      endpoint: "GET /v1/economy/SN",
      data: `{
  "country": "Sénégal",
  "gdp_growth": 4.7,
  "inflation": 2.1,
  "population": 17.9,
  "currency": "XOF"
}`,
    },
  },
  {
    name: "Trade API",
    badge: "Free",
    href: "/trade",
    description: "Codes SH, droits douane TEC-CEDEAO, corridors régionaux",
    Icon: Ship,
    color: "indigo",
    sample: {
      endpoint: "GET /v1/trade/tariff?hs=8471&dest=SN",
      data: `{
  "hs_code": "8471.30",
  "description": "Ordinateurs portables",
  "tec_rate": 5.0,
  "vat": 18.0,
  "total_duty": 23.0
}`,
    },
  },
  {
    name: "Markets API",
    badge: "Free",
    href: "/markets",
    description: "Taux de change XOF/USD/EUR, BCEAO, prix matières premières",
    Icon: TrendingUp,
    color: "violet",
    sample: {
      endpoint: "GET /v1/markets/fx",
      data: `{
  "XOF_USD": 605.2,
  "XOF_EUR": 655.96,
  "GHS_USD": 14.85,
  "NGN_USD": 1542
}`,
    },
  },
  {
    name: "Compliance Suite",
    badge: "Enterprise",
    href: "/compliance",
    description: "Vérification RCCM/NINEA/IFU + fiscalité par pays. KYC/AML CEDEAO.",
    Icon: Scale,
    color: "rose",
    sample: {
      endpoint: "GET /v1/compliance/tax?country=CI",
      data: `{
  "country": "Côte d'Ivoire",
  "vat_rate": 18.0,
  "corporate_tax": 25.0,
  "withholding_tax": 15.0
}`,
    },
  },
  {
    name: "AI API",
    badge: "Free",
    href: "/ai",
    description: "Q&R sur docs officiels, résumés PDF, recherche sémantique RAG",
    Icon: Sparkles,
    color: "sky",
    sample: {
      endpoint: "POST /v1/ai/query",
      data: `{
  "question": "Quels sont les droits douane pour importer des téléphones au Sénégal ?",
  "answer": "Le TEC-CEDEAO applique un taux de 20%...",
  "sources": ["Journal Officiel SN 2024", "TEC Art.12"]
}`,
    },
  },
];

const PRODUCT_STYLES: Record<ProductColor, { border: string; glow: string; icon: string; badge: string; dot: string }> = {
  teal:   { border: "border-teal-500/20 hover:border-teal-500/50",   glow: "group-hover:bg-teal-500/5",   icon: "bg-teal-500/10 text-teal-400",   badge: "bg-teal-500/10 text-teal-300 border-teal-500/20",   dot: "bg-teal-400" },
  indigo: { border: "border-indigo-500/20 hover:border-indigo-500/50", glow: "group-hover:bg-indigo-500/5", icon: "bg-indigo-500/10 text-indigo-400", badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20", dot: "bg-indigo-400" },
  violet: { border: "border-violet-500/20 hover:border-violet-500/50", glow: "group-hover:bg-violet-500/5", icon: "bg-violet-500/10 text-violet-400", badge: "bg-violet-500/10 text-violet-300 border-violet-500/20", dot: "bg-violet-400" },
  amber:  { border: "border-amber-500/20 hover:border-amber-500/50",   glow: "group-hover:bg-amber-500/5",   icon: "bg-amber-500/10 text-amber-400",   badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",   dot: "bg-amber-400" },
  rose:   { border: "border-rose-500/20 hover:border-rose-500/50",     glow: "group-hover:bg-rose-500/5",     icon: "bg-rose-500/10 text-rose-400",     badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",     dot: "bg-rose-400" },
  sky:    { border: "border-sky-500/20 hover:border-sky-500/50",       glow: "group-hover:bg-sky-500/5",       icon: "bg-sky-500/10 text-sky-400",       badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",       dot: "bg-sky-400" },
};

function ProductsSection() {
  const [liveSamples, setLiveSamples] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchLiveSamples() {
      const samples: Record<string, string> = {};
      try {
        const [econRes, popRes] = await Promise.allSettled([
          fetch(`${API_URL}/v1/economy/SN`),
          fetch(`${API_URL}/v1/statistics/NG/population`),
        ]);

        if (econRes.status === "fulfilled" && econRes.value.ok) {
          const json = await econRes.value.json();
          const ind = json.indicators || [];
          const find = (partial: string) => ind.find((i: { metric_key: string }) => i.metric_key?.includes(partial));
          const gdp = find("gdp_growth");
          const infl = find("inflation_consumer") || find("inflation");
          const pop = find("population_total") || find("population");
          const fxUsd = find("fx_xof_usd") || find("bceao_fx");
          const fxEur = find("fx_xof_eur");
          const gdpPc = find("gdp_per_capita");
          samples["Data API"] = JSON.stringify({
            country: "Sénégal",
            gdp_growth: gdp?.value != null ? +gdp.value.toFixed(2) : 4.7,
            inflation: infl?.value != null ? +infl.value.toFixed(1) : 2.1,
            gdp_per_capita: gdpPc?.value != null ? +gdpPc.value.toFixed(0) : 1720,
            currency: "XOF",
          }, null, 2);
          samples["Markets API"] = JSON.stringify({
            XOF_USD: fxUsd?.value ?? 605.2,
            XOF_EUR: fxEur?.value ?? 655.96,
            source: "BCEAO",
            updated: json.indicators?.[0]?.retrieved_at?.slice(0, 10) ?? "2026-07-27",
          }, null, 2);
        }

        if (popRes.status === "fulfilled" && popRes.value.ok) {
          const json = await popRes.value.json();
          const ind = json.indicators || [];
          const total = ind.find((i: { metric_key: string }) => i.metric_key === "population_total");
          const growth = ind.find((i: { metric_key: string }) => i.metric_key === "population_growth");
          const urban = ind.find((i: { metric_key: string }) => i.metric_key?.includes("urban"));
          if (total?.value) {
            samples["_population"] = JSON.stringify({
              country: "Nigeria",
              population: Math.round(total.value),
              urban_rate: urban?.value ?? 54.3,
              growth_rate: growth?.value ?? 2.5,
            }, null, 2);
          }
        }

        // Trade API
        const tradeRes = await fetch(`${API_URL}/v1/trade/tariff?hs=8471&dest=SN`);
        if (tradeRes.ok) {
          const t = await tradeRes.json();
          samples["Trade API"] = JSON.stringify({
            hs_code: t.hs_code,
            description: t.description,
            tec_rate: t.tec_rate,
            vat: t.vat,
            total_duty: t.total_duty,
          }, null, 2);
        }

        // Compliance Suite (Compliance + Identity fusionnés)
        const compRes = await fetch(`${API_URL}/v1/compliance/tax?country=CI`);
        if (compRes.ok) {
          const c = await compRes.json();
          samples["Compliance Suite"] = JSON.stringify({
            country: c.country,
            vat_rate: c.vat_rate,
            corporate_tax: c.corporate_tax,
            withholding_tax: c.withholding_tax,
          }, null, 2);
        }

        // AI API
        const aiRes = await fetch(`${API_URL}/v1/ai/status`);
        if (aiRes.ok) {
          const ai = await aiRes.json();
          samples["AI API"] = JSON.stringify({
            service: "WestAfrica AI",
            status: ai.status || "operational",
            capabilities: ["search", "qa", "compare", "translate"],
          }, null, 2);
        }
      } catch { /* fallback to static */ }
      setLiveSamples(samples);
    }
    fetchLiveSamples();
  }, []);

  return (
    <section className="py-24" style={{ background: "linear-gradient(180deg, #0c1120 0%, #080b1a 100%)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            6 API. Une seule intégration.
          </h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto text-base leading-relaxed">
            De la donnée brute à l&apos;intelligence artificielle. Tout ce dont vous avez besoin pour opérer en Afrique de l&apos;Ouest.
          </p>
        </div>

        {/* Grid 3x2 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => {
            const s = PRODUCT_STYLES[product.color];
            const isFree = product.badge === "Free";
            const isEnterprise = product.badge === "Enterprise";
            const sampleData = liveSamples[product.name] || product.sample.data;
            return (
              <Link
                key={product.name}
                href={product.href}
                className={`group relative rounded-2xl border bg-[#0a0f1e] p-6 transition-all duration-300 ${s.border} ${
                  isEnterprise ? "shadow-[0_0_40px_-15px_rgba(244,63,94,0.35)]" : ""
                }`}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${s.glow}`} />

                <div className="relative space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${s.icon}`}>
                      <product.Icon className="w-5 h-5" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${s.badge}`}>
                      {isFree && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.dot}`} />}
                      {product.badge}
                    </span>
                  </div>

                  {/* Title + desc */}
                  <div>
                    <h3 className="font-semibold text-white text-base">{product.name}</h3>
                    <p className="text-sm text-white/40 mt-1 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Code sample */}
                  <div className="rounded-xl bg-black/50 border border-white/5 overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">
                        {product.sample.endpoint.startsWith("POST") ? "POST" : "GET"}
                      </span>
                      <span className="text-[11px] font-mono text-white/40 truncate">
                        {product.sample.endpoint.replace(/^(GET|POST) /, "")}
                      </span>
                    </div>
                    <pre
                      className="p-3 text-[11px] font-mono leading-relaxed overflow-hidden text-white/40"
                      dangerouslySetInnerHTML={{ __html: highlightJson(sampleData) }}
                    />
                  </div>

                  {isEnterprise && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-rose-300 pt-1">
                      Demander une démo
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 4 — Chiffres plateforme (live)
   ═══════════════════════════════════════════════════ */

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const count = useCountUp(value, 1800, 200);
  return <>{count.toLocaleString()}{suffix}</>;
}

const ENDPOINT_PREVIEW = [
  { method: "GET", path: "/v1/economy/{code}", desc: "PIB, inflation, croissance annuelle" },
  { method: "GET", path: "/v1/economy/{code}/history", desc: "Historique d'un indicateur sur N ans" },
  { method: "GET", path: "/v1/statistics/{code}/population", desc: "Démographie, urbanisation, croissance" },
  { method: "GET", path: "/v1/tenders", desc: "Appels d'offres live · 15 pays" },
  { method: "GET", path: "/v1/countries", desc: "Liste et détail des 15 pays CEDEAO" },
  { method: "GET", path: "/v1/data", desc: "Query générique multi-pays, multi-indicateurs" },
];

function PlatformStats() {
  const [stats, setStats] = useState<{
    observations: number;
    countries: number;
    indicators: number;
    sources: number;
    lastUpdate: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [platformRes, indicatorsRes, etlRes] = await Promise.allSettled([
          fetch(`${API_URL}/v1/platform/stats`),
          fetch(`${API_URL}/v1/indicators?limit=1`),
          fetch(`${API_URL}/v1/platform/etl-status`),
        ]);

        let observations = 15866, countries = 15, indicators = 411, sources = 255;
        let lastUpdate = "< 24h";

        if (platformRes.status === "fulfilled" && platformRes.value.ok) {
          const s = await platformRes.value.json();
          if (s.total_observations) observations = s.total_observations;
          if (s.total_countries) countries = s.total_countries;
          if (s.total_sources) sources = s.total_sources;
        }
        if (indicatorsRes.status === "fulfilled" && indicatorsRes.value.ok) {
          const s = await indicatorsRes.value.json();
          if (s.total) indicators = s.total;
        }
        if (etlRes.status === "fulfilled" && etlRes.value.ok) {
          const etl = await etlRes.value.json();
          if (etl.last_run) {
            const ago = Math.round((Date.now() - new Date(etl.last_run).getTime()) / 3600000);
            lastUpdate = ago < 1 ? "< 1h" : `${ago}h`;
          }
        }

        setStats({ observations, countries, indicators, sources, lastUpdate });
      } catch {
        setStats({ observations: 15866, countries: 15, indicators: 411, sources: 255, lastUpdate: "< 24h" });
      }
    }
    load();
  }, []);

  if (!stats) return null;

  const counters = [
    { value: stats.indicators, suffix: "", label: "Indicateurs" },
    { value: stats.observations, suffix: "", label: "Observations" },
    { value: stats.countries, suffix: "", label: "Pays couverts" },
    { value: stats.sources, suffix: "+", label: "Sources" },
  ];

  return (
    <section className="py-20 border-t border-white/5" style={{ background: "linear-gradient(180deg, #080b1a 0%, #0c1120 100%)" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {counters.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl sm:text-5xl font-bold text-white tabular-nums">
                <AnimatedNumber value={item.value} suffix={item.suffix} />
              </p>
              <p className="text-sm text-white/40 mt-2">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mb-12" />

        {/* Aperçu endpoints */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Aperçu des endpoints</h3>
          <Link href="/docs" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
            Documentation complète →
          </Link>
        </div>

        <div className="rounded-xl border border-white/8 overflow-hidden">
          {ENDPOINT_PREVIEW.map((ep, i) => (
            <motion.div
              key={ep.path}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className={cn(
                "flex items-center gap-4 px-5 py-3 text-sm hover:bg-white/[0.04] transition-colors",
                i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent",
                i < ENDPOINT_PREVIEW.length - 1 && "border-b border-white/5"
              )}
            >
              <span className="text-xs font-mono font-semibold text-teal-400 w-10 shrink-0">{ep.method}</span>
              <span className="font-mono text-white/70 text-xs min-w-0 truncate flex-1">{ep.path}</span>
              <span className="text-white/35 text-xs hidden sm:block text-right shrink-0">{ep.desc}</span>
            </motion.div>
          ))}
        </div>

        {/* Dernière MAJ */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/30">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Dernière mise à jour : {stats.lastUpdate}
        </div>
      </div>
    </section>
  );
}

const HERO_STATS = [
  {
    dot: "bg-emerald-400",
    dotPulse: true,
    value: "API",
    label: "En ligne",
  },
  {
    dot: "bg-teal-400",
    dotPulse: false,
    value: "23",
    label: "Endpoints",
  },
  {
    dot: "bg-teal-400",
    dotPulse: false,
    value: "1 000",
    label: "Requêtes/mois gratuit",
  },
  {
    dot: "bg-teal-400",
    dotPulse: false,
    value: "< 24h",
    label: "Fraîcheur",
  },
];

function StatsRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="grid grid-cols-4 gap-16 sm:gap-20 mt-10 pt-8 border-t border-white/5"
    >
      {HERO_STATS.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
          className={cn("flex items-center gap-2.5", i === 3 && "pl-8")}
        >
          {i > 0 && <div className="w-px h-8 bg-white/5 mr-2" />}
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot, s.dotPulse && "animate-pulse")} />
          <div>
            <p className="text-lg font-bold text-white tabular-nums leading-tight">{s.value}</p>
            <p className="text-xs text-white/40 whitespace-nowrap mt-3">{s.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function HomePage() {
  const [countryData, setCountryData] = useState<Record<string, CountryData>>({});

  useEffect(() => {
    async function fetchCountryData() {
      const map: Record<string, CountryData> = {};
      const safeFetch = async (url: string): Promise<Record<string, unknown> | null> => {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) return await res.json();
          } catch { /* retry */ }
          if (attempt === 0) await new Promise(r => setTimeout(r, 3000));
        }
        return null;
      };

      const j1 = await safeFetch(`${API_URL}/v1/data?indicator=gdp_growth_annual&latest=true`);
      if (j1) for (const d of (j1.data as Array<{country_code: string; value: number}>) || []) { if (!map[d.country_code]) map[d.country_code] = {}; if (map[d.country_code].gdp_growth == null) map[d.country_code].gdp_growth = d.value; }

      const j2 = await safeFetch(`${API_URL}/v1/data?indicator=population_total&latest=true`);
      if (j2) for (const d of (j2.data as Array<{country_code: string; value: number}>) || []) { if (!map[d.country_code]) map[d.country_code] = {}; if (map[d.country_code].population == null) map[d.country_code].population = d.value; }

      const j3 = await safeFetch(`${API_URL}/v1/data?indicator=inflation_consumer_prices&latest=true`);
      if (j3) for (const d of (j3.data as Array<{country_code: string; value: number}>) || []) { if (!map[d.country_code]) map[d.country_code] = {}; if (map[d.country_code].inflation == null) map[d.country_code].inflation = d.value; }

      setCountryData(map);
    }
    fetchCountryData();
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ════════ SECTION 1 — Hero + Carte ════════ */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: "linear-gradient(165deg, #080b1a 0%, #0f1629 40%, #121d3a 70%, #0f1629 100%)" }}
        >
          {/* Grid subtile */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          {/* Glow effects */}
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left — Texte */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="max-w-lg"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                  L&apos;infrastructure de données<br />
                  pour{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-500">
                    l&apos;Afrique de l&apos;Ouest.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-white/50 mb-10 leading-relaxed max-w-md">
                  15 pays. 411 indicateurs. Des milliers de sources réduites à une API propre, normalisée, fiable.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "bg-teal-500 text-black hover:bg-teal-400 font-semibold gap-2 h-12 px-7 text-base shadow-xl shadow-teal-500/20"
                    )}
                  >
                    Obtenir ma clé API
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/docs"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "border-white/15 text-white hover:bg-white/5 bg-transparent h-12 px-7 text-base"
                    )}
                  >
                    Documentation
                  </Link>
                </div>

                {/* Chiffres clés animés */}
                <StatsRow />
              </motion.div>

              {/* Right — Carte interactive */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="hidden lg:block"
              >
                <AfricaMap countryData={countryData} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════ SECTION 2 — Ticker données live ════════ */}
        <LiveTicker />

        {/* ════════ SECTION 3 — Terminal interactif ════════ */}
        <InteractiveTerminal />

        {/* ════════ SECTION 4 — Chiffres plateforme live ════════ */}
        <PlatformStats />

        {/* ════════ SECTION 5 — Les produits ════════ */}
        <ProductsSection />

        {/* ════════ SECTION 6 — Couverture géographique ════════ */}
        <CoverageSection />

        {/* ════════ SECTION 7 — Appels d'offres live ════════ */}
        <TendersSection />

        {/* ════════ SECTION 8 — Comment ça marche ════════ */}
        <HowItWorksSection />

        {/* ════════ SECTION 9 — CTA final ════════ */}
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
