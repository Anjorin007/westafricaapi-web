"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, FileCheck, Scale, Fingerprint, Building2, Clock, Check } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/api";

const REGISTRIES_COUNT = 15;

function highlightJson(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"([^"]+)"(?=\s*:)/g, '<span class="text-indigo-300">"$1"</span>')
    .replace(/:\s*"([^"]+)"/g, ': <span class="text-emerald-300">"$1"<\/span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-amber-300">$1<\/span>');
}

const SAMPLE_COMPLIANCE = `{
  "country": "Côte d'Ivoire",
  "vat_rate": 18.0,
  "corporate_tax": 25.0,
  "withholding_tax": 15.0,
  "source": "DGI · Loi de finances 2025"
}`;

const SAMPLE_IDENTITY = `{
  "registry": "RCCM Sénégal",
  "id_type": "NINEA",
  "id_value": "005678901",
  "status": "active"
}`;

const USE_CASES = [
  {
    icon: Building2,
    title: "Banques & institutions financières",
    desc: "Vérification d'entreprises avant ouverture de compte, conformité BCEAO/BCC.",
  },
  {
    icon: Shield,
    title: "Fintechs & mobile money",
    desc: "KYC/AML automatisé pour l'onboarding marchands sur 15 pays CEDEAO.",
  },
  {
    icon: Scale,
    title: "Cabinets juridiques & fiscalistes",
    desc: "Taux fiscaux à jour par pays sans dépouiller 15 lois de finances.",
  },
  {
    icon: FileCheck,
    title: "Entreprises import/export",
    desc: "Vérification de partenaires commerciaux avant signature de contrat.",
  },
];

const FEATURES = [
  "Vérification RCCM, NINEA, IFU sur 15 pays",
  "Taux de TVA, IS et retenues à la source par pays",
  "Mise à jour réglementaire continue",
  "SLA garanti et account manager dédié",
  "Intégration sur devis, volumes illimités",
  "Support prioritaire",
];

export default function CompliancePage() {
  const [stats, setStats] = useState<{ registries: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/v1/identity/registries`);
        if (res.ok) {
          const json = await res.json();
          setStats({ registries: json.total ?? REGISTRIES_COUNT });
        }
      } catch {
        setStats({ registries: REGISTRIES_COUNT });
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#080b1a] text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-500/8 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium mb-6"
            >
              <Shield className="w-3.5 h-3.5" />
              Enterprise · KYC/AML CEDEAO
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-5xl font-bold tracking-tight leading-tight"
            >
              La couche de conformité<br />
              pour opérer en{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-amber-300">
                Afrique de l&apos;Ouest.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed"
            >
              Vérification d&apos;entreprises (RCCM, NINEA, IFU) et taux fiscaux à jour sur {stats?.registries ?? REGISTRIES_COUNT} pays.
              Une seule intégration pour votre conformité KYC/AML régionale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="mailto:contact@westafricaapi.com?subject=Compliance%20Suite"
                className="inline-flex items-center gap-2 bg-rose-400 hover:bg-rose-300 text-black font-semibold px-7 h-12 rounded-xl text-base transition-colors shadow-xl shadow-rose-500/20"
              >
                Demander une démo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 border border-white/15 hover:bg-white/5 text-white px-7 h-12 rounded-xl text-base transition-colors"
              >
                Voir la documentation
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Samples */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-rose-500/20 bg-[#0a0f1e] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <Scale className="w-4 h-4 text-rose-400" />
                </div>
                <span className="font-semibold text-white">Compliance API</span>
              </div>
              <p className="text-sm text-white/40 mb-4">Fiscalité et réglementations par pays</p>
              <div className="rounded-xl bg-black/50 border border-white/5 overflow-hidden">
                <div className="px-3 py-2 border-b border-white/5">
                  <span className="text-[11px] font-mono text-white/40">GET /v1/compliance/tax?country=CI</span>
                </div>
                <pre
                  className="p-3 text-[11px] font-mono leading-relaxed text-white/40"
                  dangerouslySetInnerHTML={{ __html: highlightJson(SAMPLE_COMPLIANCE) }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-[#0a0f1e] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Fingerprint className="w-4 h-4 text-amber-400" />
                </div>
                <span className="font-semibold text-white">Identity API</span>
              </div>
              <p className="text-sm text-white/40 mb-4">Vérification RCCM, NINEA, IFU</p>
              <div className="rounded-xl bg-black/50 border border-white/5 overflow-hidden">
                <div className="px-3 py-2 border-b border-white/5">
                  <span className="text-[11px] font-mono text-white/40">GET /v1/identity/company/SN/NINEA/005678901</span>
                </div>
                <pre
                  className="p-3 text-[11px] font-mono leading-relaxed text-white/40"
                  dangerouslySetInnerHTML={{ __html: highlightJson(SAMPLE_IDENTITY) }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi c'est différent */}
        <section className="border-t border-white/5 py-20 px-6" style={{ background: "linear-gradient(180deg, #080b1a 0%, #0c1120 100%)" }}>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold text-white">Pourquoi la conformité CEDEAO est différente</h2>
            <p className="mt-4 text-white/40 max-w-xl mx-auto leading-relaxed">
              15 pays, 15 registres, 3 langues officielles. La donnée existe, mais elle est fragmentée,
              non-digitalisée et rarement à jour. Nous faisons le travail de curation en continu.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4 text-center">
            <div className="rounded-xl border border-white/8 bg-[#0a0f1e] p-6">
              <p className="text-3xl font-bold text-rose-300">15</p>
              <p className="text-sm text-white/40 mt-1">registres nationaux</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0a0f1e] p-6">
              <p className="text-3xl font-bold text-amber-300">3</p>
              <p className="text-sm text-white/40 mt-1">langues officielles (FR, EN, PT)</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0a0f1e] p-6">
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="w-5 h-5 text-teal-300" />
                <p className="text-3xl font-bold text-teal-300">Continu</p>
              </div>
              <p className="text-sm text-white/40 mt-1">veille réglementaire</p>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">Pour qui ?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {USE_CASES.map((u) => (
                <div key={u.title} className="flex gap-4 rounded-xl border border-white/8 bg-[#0a0f1e] p-5">
                  <div className="p-2.5 rounded-lg bg-rose-500/10 h-fit">
                    <u.icon className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{u.title}</h3>
                    <p className="text-sm text-white/40 mt-1 leading-relaxed">{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Offer */}
        <section className="border-t border-white/5 py-20 px-6" style={{ background: "linear-gradient(180deg, #0c1120 0%, #080b1a 100%)" }}>
          <div className="max-w-2xl mx-auto rounded-2xl border border-rose-500/25 bg-[#0d1028] p-8 sm:p-10 text-center shadow-[0_0_60px_-15px_rgba(244,63,94,0.25)]">
            <p className="text-rose-300 text-xs font-semibold uppercase tracking-widest">Compliance Suite</p>
            <p className="mt-3 text-3xl font-bold text-white">Sur devis</p>
            <p className="mt-2 text-white/40 text-sm">Volume, SLA et intégration adaptés à votre activité</p>

            <ul className="mt-8 space-y-3 text-left max-w-sm mx-auto">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="mailto:contact@westafricaapi.com?subject=Compliance%20Suite"
              className="mt-8 inline-flex items-center justify-center gap-2 bg-rose-400 hover:bg-rose-300 text-black font-semibold px-7 py-3 rounded-xl text-sm transition-colors w-full"
            >
              Contacter l&apos;équipe
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
