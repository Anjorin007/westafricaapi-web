"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle, Clock } from "lucide-react";

const ELECTIONS = [
  { country: "Côte d'Ivoire", flag: "ci", type: "Présidentielle", date: "2025-10-25", status: "upcoming" },
  { country: "Guinée",        flag: "gn", type: "Présidentielle", date: "2025-10-18", status: "upcoming" },
  { country: "Togo",          flag: "tg", type: "Législatives",   date: "2025-04-29", status: "held" },
  { country: "Nigeria",       flag: "ng", type: "Gouvernorales",  date: "2025-11-08", status: "upcoming" },
  { country: "Ghana",         flag: "gh", type: "Présidentielle", date: "2024-12-07", status: "held" },
  { country: "Sénégal",       flag: "sn", type: "Législatives",   date: "2024-11-17", status: "held" },
  { country: "Sierra Leone",  flag: "sl", type: "Présidentielle", date: "2027-06-01", status: "scheduled" },
  { country: "Liberia",       flag: "lr", type: "Sénatoriales",   date: "2026-12-01", status: "scheduled" },
  { country: "Gambie",        flag: "gm", type: "Présidentielle", date: "2026-12-04", status: "scheduled" },
  { country: "Mali",          flag: "ml", type: "Présidentielle", date: "2027-02-01", status: "scheduled" },
  { country: "Burkina Faso",  flag: "bf", type: "Transition",     date: "2026-07-01", status: "scheduled" },
  { country: "Niger",         flag: "ne", type: "Transition",     date: "2026-12-01", status: "scheduled" },
  { country: "Guinée-Bissau", flag: "gw", type: "Présidentielle", date: "2026-06-01", status: "scheduled" },
  { country: "Bénin",         flag: "bj", type: "Présidentielle", date: "2026-04-11", status: "scheduled" },
  { country: "Cap-Vert",      flag: "cv", type: "Législatives",   date: "2026-04-05", status: "scheduled" },
];

const STATUS_STYLES = {
  held:      { label: "Tenu",      class: "text-white/40 bg-white/5 border-white/10" },
  upcoming:  { label: "Prochain",  class: "text-amber-300 bg-amber-500/10 border-amber-500/20" },
  scheduled: { label: "Planifié",  class: "text-teal-300 bg-teal-500/10 border-teal-500/20" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function daysUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / 86400000);
}

export default function ElectionsPage() {
  const upcoming = ELECTIONS.filter(e => e.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const scheduled = ELECTIONS.filter(e => e.status === "scheduled").sort((a, b) => a.date.localeCompare(b.date));
  const held = ELECTIONS.filter(e => e.status === "held").sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#080b1a] pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-400">Calendrier électoral</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Elections · Afrique de l&apos;Ouest
            </h1>
            <p className="text-white/40 max-w-xl">
              Calendrier des scrutins présidentiels, législatifs et locaux pour les 15 pays couverts. Données compilées depuis les commissions électorales nationales.
            </p>
          </motion.div>

          {/* Stats rapides */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            {[
              { label: "Prochains scrutins", value: upcoming.length, color: "text-amber-300" },
              { label: "Planifiés 2026-2027", value: scheduled.length, color: "text-teal-300" },
              { label: "Tenus en 2024-2025", value: held.length, color: "text-white/60" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-[#0d1028] p-5 text-center">
                <p className={`text-3xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Prochains */}
          {upcoming.length > 0 && (
            <Section title="Prochains scrutins" icon={<Clock className="w-4 h-4 text-amber-400" />} color="text-amber-400">
              {upcoming.map((e, i) => <ElectionCard key={e.country} election={e} index={i} />)}
            </Section>
          )}

          {/* Planifiés */}
          <Section title="Scrutins planifiés" icon={<Calendar className="w-4 h-4 text-teal-400" />} color="text-teal-400">
            {scheduled.map((e, i) => <ElectionCard key={e.country} election={e} index={i} />)}
          </Section>

          {/* Tenus */}
          <Section title="Scrutins récents" icon={<CheckCircle className="w-4 h-4 text-white/30" />} color="text-white/30">
            {held.map((e, i) => <ElectionCard key={e.country} election={e} index={i} />)}
          </Section>

          {/* Note */}
          <p className="text-center text-white/20 text-xs mt-12">
            Dates indicatives · Sources : commissions électorales nationales, UA, CEDEAO
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className={`text-sm font-semibold uppercase tracking-widest ${color}`}>{title}</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function ElectionCard({ election: e, index }: { election: typeof ELECTIONS[0]; index: number }) {
  const s = STATUS_STYLES[e.status as keyof typeof STATUS_STYLES];
  const days = daysUntil(e.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        "rounded-xl border bg-[#0d1028] p-4 flex flex-col gap-3",
        e.status === "upcoming" ? "border-amber-500/20" :
        e.status === "held" ? "border-white/6" : "border-white/8"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://flagcdn.com/20x15/${e.flag}.png`} alt={e.country} width={20} height={15} className="rounded-sm" />
          <span className="text-sm font-medium text-white">{e.country}</span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${s.class}`}>{s.label}</span>
      </div>

      <div>
        <p className="text-xs text-white/50">{e.type}</p>
        <p className="text-sm font-mono text-white/80 mt-0.5">{formatDate(e.date)}</p>
      </div>

      {days !== null && (
        <p className="text-xs text-amber-400 font-mono">J-{days}</p>
      )}
    </motion.div>
  );
}
