"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Check,
  Plus,
  Trash2,
  BarChart3,
  Zap,
  Globe,
  Clock,
  ChevronRight,
  AlertCircle,
  ArrowUpRight,
  LogOut,
} from "lucide-react";

const API_BASE = "https://ecowas-api.onrender.com";

// --- Types ---

interface ApiKey {
  id: string;
  name: string;
  tier: string;
  is_active: boolean;
  request_count: number;
  last_used_at: string | null;
}

interface MeData {
  name: string;
  tier: string;
  limits: {
    per_minute: number;
    per_month: number;
  };
  usage: {
    total_requests: number;
    this_minute: number;
    this_month: number;
    remaining_month: number;
  };
  last_used_at: string | null;
}

interface Tier {
  name: string;
  per_minute: number;
  per_month: number;
  price_usd: number;
  description: string;
}

// --- Composant StatCard ---

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-950/40 to-teal-900/20 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-teal-300/60 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-white">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-teal-300/40">{sub}</p>}
        </div>
        <div className="h-9 w-9 rounded-lg bg-teal-500/15 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-teal-400" />
        </div>
      </div>
    </div>
  );
}

// --- Composant ApiKeyCard ---

function ApiKeyCard({
  apiKey,
  onDelete,
}: {
  apiKey: ApiKey;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Révoquer la clé "${apiKey.name}" ?`)) return;
    setDeleting(true);
    await onDelete(apiKey.id);
    setDeleting(false);
  }

  function formatDate(iso: string | null) {
    if (!iso) return "jamais";
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-950/40 to-teal-900/20 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Key className="h-3.5 w-3.5 text-teal-400 shrink-0" />
            <span className="text-sm font-semibold text-white">
              {apiKey.name}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {apiKey.tier}
            </span>
            {!apiKey.is_active && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                inactive
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-white/40 font-mono">
            Valeur non affichable · visible uniquement à la création
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
        <span>
          {apiKey.request_count.toLocaleString("fr-FR")} requêtes
        </span>
        <span>Dernier appel · {formatDate(apiKey.last_used_at)}</span>
      </div>
    </div>
  );
}

// --- Formulaire saisie clé API ---

function ApiKeyGate({
  onConnect,
}: {
  onConnect: (key: string) => Promise<boolean>;
}) {
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const ok = await onConnect(input.trim());
    if (!ok) {
      setError("Clé invalide ou accès refusé. Vérifiez votre clé et réessayez.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080b1a] via-[#0a0d1f] to-[#060914] text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Logo variant="light" size="md" />
        </div>

        <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-950/40 to-teal-900/20 p-8 backdrop-blur-sm">
          <h1 className="text-lg font-bold text-white mb-1">
            Accès au dashboard
          </h1>
          <p className="text-sm text-teal-300/50 mb-6">
            Entrez votre clé API West Africa API pour accéder à votre tableau de bord.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-teal-300/60 uppercase tracking-wide mb-2">
                Clé API
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="waa_live_sk_..."
                  autoComplete="off"
                  className="w-full text-sm bg-white/5 border border-teal-500/20 rounded-lg px-3 py-2.5 pr-10 text-white placeholder-white/25 focus:outline-none focus:border-teal-500/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {visible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full py-2.5 text-sm font-semibold bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
            >
              {loading ? "Connexion..." : "Connecter"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-teal-300/40">
            Pas encore de clé ?{" "}
            <Link
              href="/docs"
              className="text-teal-400 hover:text-teal-300 underline underline-offset-2 transition-colors"
            >
              Consultez la documentation
            </Link>{" "}
            pour créer un compte gratuit.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// --- Page principale ---

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [me, setMe] = useState<MeData | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedNew, setCopiedNew] = useState(false);

  const loadData = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${key}` };
      const [meRes, keysRes, tiersRes] = await Promise.all([
        fetch(`${API_BASE}/v1/account/me`, { headers }),
        fetch(`${API_BASE}/v1/account/api-keys`, { headers }),
        fetch(`${API_BASE}/v1/account/tiers`, { headers }),
      ]);

      if (!meRes.ok) {
        if (meRes.status === 401) {
          setError("Clé invalide. Veuillez saisir une clé API valide.");
          localStorage.removeItem("waa_api_key");
          setApiKey(null);
          setLoading(false);
          return;
        }
        throw new Error(`Erreur ${meRes.status}`);
      }

      const meData: MeData = await meRes.json();
      setMe(meData);

      if (keysRes.ok) {
        const keysData: { data: ApiKey[] } = await keysRes.json();
        setKeys(keysData.data ?? []);
      }

      if (tiersRes.ok) {
        const tiersData: { tiers: Tier[] } = await tiersRes.json();
        setTiers(tiersData.tiers ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lecture localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem("waa_api_key");
    if (stored) {
      setApiKey(stored);
      loadData(stored);
    }
  }, [loadData]);

  async function handleConnect(key: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/v1/account/me`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return false;
    localStorage.setItem("waa_api_key", key);
    setApiKey(key);
    await loadData(key);
    return true;
  }

  function handleDisconnect() {
    localStorage.removeItem("waa_api_key");
    setApiKey(null);
    setMe(null);
    setKeys([]);
    setTiers([]);
  }

  async function handleDeleteKey(id: string) {
    if (!apiKey) return;
    await fetch(`${API_BASE}/v1/account/api-keys/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    await loadData(apiKey);
  }

  async function handleCreateKey() {
    if (!apiKey || !newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const res = await fetch(`${API_BASE}/v1/account/api-keys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName.trim(), tier: "free" }),
      });
      if (res.ok) {
        const data: { api_key: string; name: string; tier: string; message: string } =
          await res.json();
        setCreatedKey(data.api_key);
        setNewKeyName("");
        await loadData(apiKey);
      }
    } finally {
      setCreatingKey(false);
    }
  }

  function copyCreatedKey() {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopiedNew(true);
    setTimeout(() => setCopiedNew(false), 2000);
  }

  // Afficher le formulaire de saisie si pas de clé
  if (!apiKey) {
    return <ApiKeyGate onConnect={handleConnect} />;
  }

  // Données pour les StatCards
  const callsValue = me
    ? me.usage.this_month.toLocaleString("fr-FR")
    : loading
    ? "..."
    : "-";
  const callsSub = me
    ? `sur ${me.limits.per_month.toLocaleString("fr-FR")}`
    : undefined;

  // Couleurs par tier pour la section Plan
  const tierColors: Record<string, string> = {
    free: "text-slate-400",
    builder: "text-teal-400",
    pro: "text-teal-300",
    enterprise: "text-teal-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080b1a] via-[#0a0d1f] to-[#060914] text-white">
      {/* Top bar */}
      <div className="border-b border-teal-500/20 bg-gradient-to-r from-[#0d1028]/90 via-[#0f1730]/90 to-[#0d1028]/90 backdrop-blur-xl px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo variant="light" size="sm" />
            <div className="h-6 w-px bg-teal-500/20" />
            <div>
              <h1 className="text-base font-bold text-white">Dashboard</h1>
              <p className="text-xs text-teal-300/50 mt-0.5">
                {me?.name || "Développeur"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-teal-300/60">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              API opérationnelle
            </div>
            <button
              onClick={handleDisconnect}
              title="Changer de clé"
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Changer de clé
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={Zap}
            label="Appels ce mois"
            value={callsValue}
            sub={callsSub}
          />
          <StatCard
            icon={BarChart3}
            label="Taux de succès"
            value="99.9%"
            sub="dernières 24h"
          />
          <StatCard
            icon={Globe}
            label="Pays couverts"
            value="15"
            sub="CEDEAO · AES"
          />
          <StatCard
            icon={Clock}
            label="Latence moyenne"
            value="~130ms"
            sub="p95 · 340ms"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left col: API keys + activité */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Keys */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Clés API</h2>
                <button
                  onClick={() => {
                    setShowNewKey(!showNewKey);
                    setCreatedKey(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nouvelle clé
                </button>
              </div>

              {showNewKey && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-3 rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-3"
                >
                  {createdKey ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Copiez cette clé maintenant · elle ne sera plus affichée
                      </p>
                      <div className="flex items-center gap-2 bg-white/5 border border-teal-500/20 rounded-lg px-3 py-2">
                        <code className="flex-1 text-xs text-teal-300 font-mono truncate">
                          {createdKey}
                        </code>
                        <button
                          onClick={copyCreatedKey}
                          className="shrink-0 p-1 rounded text-white/40 hover:text-white transition-colors"
                        >
                          {copiedNew ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setCreatedKey(null);
                          setShowNewKey(false);
                        }}
                        className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-teal-300/60">Nom de la clé</p>
                      <div className="flex gap-2">
                        <input
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="ex: Production backend"
                          className="flex-1 text-sm bg-white/5 border border-teal-500/20 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50"
                        />
                        <button
                          onClick={handleCreateKey}
                          disabled={creatingKey || !newKeyName.trim()}
                          className="px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                        >
                          {creatingKey ? "..." : "Créer"}
                        </button>
                        <button
                          onClick={() => setShowNewKey(false)}
                          className="px-3 py-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {loading && keys.length === 0 ? (
                <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-6 text-center text-xs text-teal-300/40">
                  Chargement...
                </div>
              ) : keys.length === 0 ? (
                <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-6 text-center text-xs text-teal-300/40">
                  Aucune clé API. Créez-en une ci-dessus.
                </div>
              ) : (
                <div className="space-y-3">
                  {keys.map((k) => (
                    <ApiKeyCard key={k.id} apiKey={k} onDelete={handleDeleteKey} />
                  ))}
                </div>
              )}
            </motion.section>

            {/* Activité récente */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-sm font-semibold text-white mb-3">
                Activité récente
              </h2>
              <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-950/30 to-teal-900/10 overflow-hidden backdrop-blur-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-teal-500/20">
                      <th className="text-left px-4 py-2.5 text-teal-300/50 font-medium">
                        Endpoint
                      </th>
                      <th className="text-left px-4 py-2.5 text-teal-300/50 font-medium">
                        Status
                      </th>
                      <th className="text-left px-4 py-2.5 text-teal-300/50 font-medium">
                        Latence
                      </th>
                      <th className="text-right px-4 py-2.5 text-teal-300/50 font-medium">
                        Heure
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-teal-300/30"
                      >
                        Aucune activité récente
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.section>
          </div>

          {/* Right col: Plan + accès rapide */}
          <div className="space-y-5">
            {/* Plan actuel */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-sm font-semibold text-white mb-3">
                Mon plan
              </h2>
              <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-950/30 to-teal-900/10 p-4 space-y-2 backdrop-blur-sm">
                {tiers.length === 0 && loading ? (
                  <p className="text-xs text-teal-300/40 text-center py-2">
                    Chargement...
                  </p>
                ) : tiers.length === 0 ? (
                  <p className="text-xs text-teal-300/40 text-center py-2">
                    Données non disponibles
                  </p>
                ) : (
                  tiers.map((t) => {
                    const isCurrent =
                      me?.tier?.toLowerCase() === t.name.toLowerCase();
                    const color =
                      tierColors[t.name.toLowerCase()] ?? "text-teal-400";
                    const priceLabel =
                      t.price_usd === 0
                        ? "Gratuit"
                        : `$${t.price_usd}/mois`;
                    const callsLabel =
                      t.per_month >= 1_000_000
                        ? "Illimité"
                        : `${t.per_month.toLocaleString("fr-FR")}/mois`;
                    return (
                      <div
                        key={t.name}
                        className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-colors ${
                          isCurrent
                            ? "bg-teal-500/15 border border-teal-500/30"
                            : "hover:bg-teal-500/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                          )}
                          <span className={`font-semibold capitalize ${color}`}>
                            {t.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-teal-400">
                              actuel
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-white/70 font-medium">
                            {priceLabel}
                          </div>
                          <div className="text-teal-300/40">{callsLabel}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <Link
                  href="/pricing"
                  className="w-full mt-2 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-white"
                >
                  Passer à Pro
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.section>

            {/* Accès rapide */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-sm font-semibold text-white mb-3">
                Accès rapide
              </h2>
              <div className="rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-950/20 to-teal-900/10 p-2 backdrop-blur-sm">
                {[
                  { label: "Documentation API", href: "/docs" },
                  { label: "Référence endpoints", href: "/docs/endpoints" },
                  { label: "Limites de débit", href: "/docs/rate-limits" },
                  { label: "Codes pays CEDEAO", href: "/countries" },
                  {
                    label: "Support",
                    href: "mailto:support@westafricaapi.com",
                  },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between px-3 py-2.5 text-xs text-teal-300/70 hover:text-white hover:bg-teal-500/10 rounded-lg transition-colors group"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                  </Link>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
