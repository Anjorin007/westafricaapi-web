"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const plans = [
  {
    name: "Free",
    price: 0,
    annual: 0,
    description: "Idéal pour tester",
    cta: "Commencer gratuitement",
    href: "/sign-up",
    features: [
      "1 000 requêtes/mois",
      "5 requêtes/minute",
      "1 clé API",
      "Tous les endpoints (Data, Tenders, Markets, Government)",
      "15 pays Afrique de l'Ouest",
      "Support communautaire",
    ],
  },
  {
    name: "Builder",
    price: 29,
    annual: 278,
    description: "Pour startups et développeurs",
    cta: "Choisir Builder",
    href: "/sign-up?plan=builder",
    features: [
      "150 000 requêtes/mois",
      "60 requêtes/minute",
      "3 clés API",
      "Tous les endpoints",
      "Webhooks basiques",
      "Export CSV/JSON",
      "Support email",
    ],
  },
  {
    name: "Pro",
    price: 89,
    annual: 854,
    popular: true,
    description: "Pour les équipes",
    cta: "Choisir Pro",
    href: "/sign-up?plan=pro",
    features: [
      "500 000 requêtes/mois",
      "300 requêtes/minute",
      "5 clés API",
      "Tous les endpoints",
      "Webhooks avancés avec retry et filtres",
      "Alertes personnalisées",
      "Export CSV/JSON",
      "Support prioritaire sous 24h",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    annual: null,
    description: "Sur devis",
    cta: "Contacter l'équipe",
    href: "mailto:contact@westafricaapi.com",
    features: [
      "Volume illimité",
      "Débit personnalisé",
      "Clés API illimitées",
      "SLA garanti",
      "Dump données brutes",
      "Account manager dédié",
      "Contrat personnalisé",
    ],
  },
];

const faqs = [
  {
    q: "Le plan Free nécessite-t-il une carte bancaire ?",
    a: "Non. Une adresse email suffit. Votre clé API est disponible immédiatement après l'inscription.",
  },
  {
    q: "Que se passe-t-il si je dépasse mon quota mensuel ?",
    a: "Vos requêtes reçoivent un code HTTP 429. Votre clé API n'est jamais suspendue ni révoquée. Le compteur est remis à zéro le 1er de chaque mois.",
  },
  {
    q: "Les données sont-elles les mêmes sur tous les plans ?",
    a: "Oui. Tous les plans donnent accès aux mêmes endpoints, aux mêmes pays et aux mêmes données. Les plans payants achètent du volume et du débit, pas de l'accès supplémentaire.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, en libre-service depuis votre dashboard. Le changement prend effet immédiatement et la facturation est ajustée au prorata.",
  },
  {
    q: "Quelles devises acceptez-vous ?",
    a: "Nous acceptons les paiements en USD et EUR via Stripe. Les prix affichés sont en USD.",
  },
  {
    q: "Comment fonctionne le plan Tenders Alert ?",
    a: "Tenders Alert est indépendant des plans API. Vous recevez les appels d'offres par email et WhatsApp selon vos filtres (pays, secteur, budget minimum). Aucune compétence technique requise.",
  },
  {
    q: "Y a-t-il un engagement de durée ?",
    a: "Non, tous les plans sont sans engagement. La facturation annuelle offre une réduction de 20% et reste annulable avec remboursement au prorata.",
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#080b1a] text-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Un prix simple pour chaque étape
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 text-base text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Commencez gratuitement. Tous les plans donnent accès aux mêmes données — 15 pays, tous les endpoints.
            Les plans payants achètent du volume et du débit, pas de l'accès supplémentaire. Aucune carte requise à l'inscription.
          </motion.p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 inline-flex items-center gap-3 bg-white/5 rounded-full p-1"
          >
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                !annual ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                annual ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70"
              )}
            >
              Annuel
              <span className="bg-teal-500 text-black text-xs font-semibold px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </motion.div>
        </section>

        {/* Plans grid */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={cn(
                  "relative rounded-2xl p-6 flex flex-col border transition-all duration-300",
                  plan.popular
                    ? "bg-[#0d1028] border-teal-500/60 shadow-[0_0_40px_-8px_rgba(20,184,166,0.3)]"
                    : "bg-[#0d1028] border-white/8 hover:border-teal-500/30 hover:shadow-[0_8px_30px_-10px_rgba(20,184,166,0.15)]"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 bg-teal-500 text-black text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Populaire
                  </span>
                )}

                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-white/50 text-sm mt-1">{plan.description}</p>

                <div className="mt-6 mb-6">
                  {plan.price !== null ? (
                    <>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${plan.name}-${annual}`}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.15 }}
                          className="text-4xl font-bold inline-block"
                        >
                          ${annual && plan.annual ? Math.round(plan.annual / 12) : plan.price}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-white/40 text-sm ml-1">/mois</span>
                      {annual && plan.price > 0 && plan.annual && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-teal-400 text-xs mt-1"
                        >
                          ${plan.annual}/an · économisez ${plan.price * 12 - plan.annual}
                        </motion.p>
                      )}
                    </>
                  ) : (
                    <span className="text-3xl font-bold">Sur devis</span>
                  )}
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={cn(
                    "group mt-8 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    plan.popular
                      ? "bg-teal-500 text-black hover:bg-teal-400"
                      : "bg-white/8 text-white hover:bg-white/12"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Tenders Alert */}
        <section className="bg-[#0a0d20] py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <motion.div variants={fadeUp}>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Pas développeur ? Recevez les appels d&apos;offres directement.
                </h2>
                <p className="mt-4 text-white/60 leading-relaxed">
                  Tenders Alert vous envoie les nouveaux appels d&apos;offres par email et WhatsApp,
                  filtrés selon vos critères. Aucune compétence technique requise.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Alertes email + WhatsApp",
                    "Filtres par pays, secteur, budget minimum",
                    "Nouveaux appels d'offres en temps réel",
                    "Pour PME, fournisseurs, ONG, cabinets",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check className="w-4 h-4 text-teal-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="rounded-2xl bg-[#0d1028] border border-white/8 p-8 text-center"
              >
                <p className="text-white/50 text-sm uppercase tracking-wider font-medium">
                  Tenders Alert
                </p>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$9</span>
                  <span className="text-white/40 text-sm ml-1">/mois</span>
                </div>
                <p className="mt-2 text-white/40 text-sm">Sans engagement</p>
                <Link
                  href="/sign-up?plan=tenders"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 text-black px-6 py-3 text-sm font-medium hover:bg-teal-400 transition-colors duration-200 w-full"
                >
                  Recevoir les alertes
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-24">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-12"
          >
            Questions fréquentes
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-2"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="border border-white/8 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium hover:bg-white/[0.02] transition-colors"
                >
                  {faq.q}
                  <span
                    className={cn(
                      "text-white/40 text-lg transition-transform duration-200",
                      openFaq === i && "rotate-45"
                    )}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-sm text-white/50 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-32 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold">Prêt à commencer ?</h2>
            <p className="mt-3 text-white/50">
              Clé API en 30 secondes. Aucune carte requise.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-teal-500 text-black px-6 py-3 rounded-lg text-sm font-medium hover:bg-teal-400 transition-colors duration-200"
              >
                Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="mailto:contact@westafricaapi.com"
                className="inline-flex items-center gap-2 bg-white/8 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/12 transition-colors duration-200"
              >
                Parler à l'équipe
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
