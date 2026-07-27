"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Search } from "lucide-react";
import { API_URL } from "@/lib/api";

const COUNTRIES = [
  { name: "Bénin", code: "BJ", currency: "XOF", lang: "FR", slug: "benin" },
  { name: "Burkina Faso", code: "BF", currency: "XOF", lang: "FR", slug: "burkina-faso" },
  { name: "Cap-Vert", code: "CV", currency: "CVE", lang: "PT", slug: "cabo-verde" },
  { name: "Côte d'Ivoire", code: "CI", currency: "XOF", lang: "FR", slug: "cote-divoire" },
  { name: "Gambie", code: "GM", currency: "GMD", lang: "EN", slug: "gambia" },
  { name: "Ghana", code: "GH", currency: "GHS", lang: "EN", slug: "ghana" },
  { name: "Guinée", code: "GN", currency: "GNF", lang: "FR", slug: "guinea" },
  { name: "Guinée-Bissau", code: "GW", currency: "XOF", lang: "PT", slug: "guinea-bissau" },
  { name: "Liberia", code: "LR", currency: "LRD", lang: "EN", slug: "liberia" },
  { name: "Mali", code: "ML", currency: "XOF", lang: "FR", slug: "mali" },
  { name: "Niger", code: "NE", currency: "XOF", lang: "FR", slug: "niger" },
  { name: "Nigeria", code: "NG", currency: "NGN", lang: "EN", slug: "nigeria" },
  { name: "Sénégal", code: "SN", currency: "XOF", lang: "FR", slug: "senegal" },
  { name: "Sierra Leone", code: "SL", currency: "SLE", lang: "EN", slug: "sierra-leone" },
  { name: "Togo", code: "TG", currency: "XOF", lang: "FR", slug: "togo" },
];

const LANG_COLORS: Record<string, string> = {
  FR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  EN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const CAT_COLORS: Record<string, string> = {
  "Économie": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Commerce": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Démographie": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Santé": "bg-red-500/10 text-red-400 border-red-500/20",
  "Bien-être enfant": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Éducation": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Sécurité alimentaire": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Agriculture": "bg-lime-500/10 text-lime-400 border-lime-500/20",
  "Gouvernance": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Humanitaire": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Technologie": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Infrastructure": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Énergie": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Climat": "bg-green-500/10 text-green-400 border-green-500/20",
};

type Indicator = {
  metric_key?: string;
  name: string;
  category: string;
  unit: string;
  frequency: string;
  source: string;
};

const ALL_INDICATORS_STATIC: Indicator[] = [
  // Économie (30)
  { name: "PIB (USD courants)", category: "Économie", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "PIB par habitant (USD)", category: "Économie", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "Croissance du PIB", category: "Économie", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "PIB (PPA, USD constants 2017)", category: "Économie", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "PIB par habitant (PPA)", category: "Économie", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "Inflation (IPC)", category: "Économie", unit: "%", frequency: "Annuelle", source: "IMF" },
  { name: "Inflation des prix alimentaires", category: "Économie", unit: "%", frequency: "Annuelle", source: "FAO" },
  { name: "Déflateur du PIB", category: "Économie", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "Masse monétaire M2", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "IMF" },
  { name: "Réserves de change", category: "Économie", unit: "mois d'importations", frequency: "Mensuelle", source: "IMF" },
  { name: "Taux directeur BCEAO", category: "Économie", unit: "%", frequency: "Mensuelle", source: "BCEAO" },
  { name: "Taux de change (USD/XOF)", category: "Économie", unit: "XOF", frequency: "Quotidienne", source: "BCEAO" },
  { name: "Balance courante", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "IMF" },
  { name: "Balance commerciale", category: "Économie", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "Exportations de biens et services", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Importations de biens et services", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Investissements directs étrangers (entrées)", category: "Économie", unit: "USD", frequency: "Annuelle", source: "UNCTAD" },
  { name: "Aide publique au développement reçue", category: "Économie", unit: "USD", frequency: "Annuelle", source: "OCDE" },
  { name: "Remises de fonds reçues", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Dette extérieure totale", category: "Économie", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "Service de la dette", category: "Économie", unit: "% des exportations", frequency: "Annuelle", source: "World Bank" },
  { name: "Recettes fiscales", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "IMF" },
  { name: "Dépenses publiques", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "IMF" },
  { name: "Dette publique brute", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "IMF" },
  { name: "Déficit budgétaire", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "IMF" },
  { name: "Formation brute de capital fixe", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Consommation des ménages", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Valeur ajoutée agriculture", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Valeur ajoutée industrie", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Valeur ajoutée services", category: "Économie", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  // Commerce (20)
  { name: "Exportations totales", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "UN Comtrade" },
  { name: "Importations totales", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "UN Comtrade" },
  { name: "Balance commerciale", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "UN Comtrade" },
  { name: "Exportations vers CEDEAO", category: "Commerce", unit: "% des exportations totales", frequency: "Annuelle", source: "ECOWAS" },
  { name: "Part du commerce intra-CEDEAO", category: "Commerce", unit: "%", frequency: "Annuelle", source: "ECOWAS" },
  { name: "Principaux produits exportés (valeur)", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "UN Comtrade" },
  { name: "Termes de l'échange", category: "Commerce", unit: "index 2015=100", frequency: "Annuelle", source: "World Bank" },
  { name: "Ouverture commerciale", category: "Commerce", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Droits de douane appliqués (moyenne)", category: "Commerce", unit: "%", frequency: "Annuelle", source: "WTO" },
  { name: "Exportations de pétrole brut", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "OPEC" },
  { name: "Exportations d'or", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "Exportations de cacao", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "FAO" },
  { name: "Exportations de coton", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "FAO" },
  { name: "Exportations de noix de cajou", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "FAO" },
  { name: "Exportations de phosphates", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "Corridor commercial Lagos-Abidjan", category: "Commerce", unit: "index", frequency: "Annuelle", source: "ECOWAS" },
  { name: "Délai d'exportation (jours)", category: "Commerce", unit: "jours", frequency: "Annuelle", source: "World Bank" },
  { name: "Coût d'exportation (USD/conteneur)", category: "Commerce", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "Délai d'importation (jours)", category: "Commerce", unit: "jours", frequency: "Annuelle", source: "World Bank" },
  { name: "Indice de performance logistique", category: "Commerce", unit: "index 0-5", frequency: "Annuelle", source: "World Bank" },
  // Démographie (20)
  { name: "Population totale", category: "Démographie", unit: "habitants", frequency: "Annuelle", source: "World Bank" },
  { name: "Taux de croissance démographique", category: "Démographie", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "Densité de population", category: "Démographie", unit: "hab./km²", frequency: "Annuelle", source: "World Bank" },
  { name: "Population urbaine", category: "Démographie", unit: "% du total", frequency: "Annuelle", source: "World Bank" },
  { name: "Taux d'urbanisation", category: "Démographie", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "Taux de fécondité total", category: "Démographie", unit: "naissances/femme", frequency: "Annuelle", source: "World Bank" },
  { name: "Taux brut de natalité", category: "Démographie", unit: "pour 1000 hab.", frequency: "Annuelle", source: "World Bank" },
  { name: "Taux brut de mortalité", category: "Démographie", unit: "pour 1000 hab.", frequency: "Annuelle", source: "World Bank" },
  { name: "Espérance de vie à la naissance", category: "Démographie", unit: "années", frequency: "Annuelle", source: "WHO" },
  { name: "Espérance de vie (femmes)", category: "Démographie", unit: "années", frequency: "Annuelle", source: "WHO" },
  { name: "Espérance de vie (hommes)", category: "Démographie", unit: "années", frequency: "Annuelle", source: "WHO" },
  { name: "Population de moins de 15 ans", category: "Démographie", unit: "% du total", frequency: "Annuelle", source: "World Bank" },
  { name: "Population de 15 à 64 ans", category: "Démographie", unit: "% du total", frequency: "Annuelle", source: "World Bank" },
  { name: "Population de 65 ans et plus", category: "Démographie", unit: "% du total", frequency: "Annuelle", source: "World Bank" },
  { name: "Ratio de dépendance (jeunes)", category: "Démographie", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "Taille moyenne des ménages", category: "Démographie", unit: "personnes", frequency: "Annuelle", source: "UNICEF" },
  { name: "Population réfugiée accueillie", category: "Démographie", unit: "personnes", frequency: "Mensuelle", source: "UNHCR" },
  { name: "Déplacements internes (PDI)", category: "Démographie", unit: "personnes", frequency: "Mensuelle", source: "IDMC" },
  { name: "Émigration nette", category: "Démographie", unit: "personnes", frequency: "Annuelle", source: "World Bank" },
  { name: "Diasporas à l'étranger (estimations)", category: "Démographie", unit: "personnes", frequency: "Annuelle", source: "World Bank" },
  // Santé (20)
  { name: "Mortalité infantile (moins de 5 ans)", category: "Santé", unit: "pour 1000 naiss.", frequency: "Annuelle", source: "WHO" },
  { name: "Mortalité néonatale", category: "Santé", unit: "pour 1000 naiss. vivantes", frequency: "Annuelle", source: "WHO" },
  { name: "Mortalité maternelle", category: "Santé", unit: "pour 100 000 naiss. vivantes", frequency: "Annuelle", source: "WHO" },
  { name: "Prévalence du paludisme", category: "Santé", unit: "pour 1000", frequency: "Annuelle", source: "WHO" },
  { name: "Incidence VIH/SIDA", category: "Santé", unit: "pour 1000 hab.", frequency: "Annuelle", source: "UNAIDS" },
  { name: "Prévalence malnutrition aiguë (enfants)", category: "Santé", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Couverture vaccinale DTP3", category: "Santé", unit: "%", frequency: "Annuelle", source: "WHO" },
  { name: "Couverture vaccinale rougeole", category: "Santé", unit: "%", frequency: "Annuelle", source: "WHO" },
  { name: "Dépenses de santé totales", category: "Santé", unit: "% du PIB", frequency: "Annuelle", source: "WHO" },
  { name: "Dépenses de santé publiques", category: "Santé", unit: "% du PIB", frequency: "Annuelle", source: "WHO" },
  { name: "Dépenses de santé par habitant", category: "Santé", unit: "USD", frequency: "Annuelle", source: "WHO" },
  { name: "Médecins pour 10 000 habitants", category: "Santé", unit: "pour 10 000", frequency: "Annuelle", source: "WHO" },
  { name: "Infirmières pour 10 000 habitants", category: "Santé", unit: "pour 10 000", frequency: "Annuelle", source: "WHO" },
  { name: "Lits d'hôpitaux pour 1000 habitants", category: "Santé", unit: "pour 1000", frequency: "Annuelle", source: "WHO" },
  { name: "Accès à l'eau potable (rural)", category: "Santé", unit: "%", frequency: "Annuelle", source: "WHO/UNICEF" },
  { name: "Accès à l'eau potable (urbain)", category: "Santé", unit: "%", frequency: "Annuelle", source: "WHO/UNICEF" },
  { name: "Accès à l'assainissement de base", category: "Santé", unit: "%", frequency: "Annuelle", source: "WHO/UNICEF" },
  { name: "Taux de prévalence du tabac", category: "Santé", unit: "%", frequency: "Annuelle", source: "WHO" },
  { name: "Prévalence du diabète", category: "Santé", unit: "%", frequency: "Annuelle", source: "IDF" },
  { name: "Prévalence de l'hypertension", category: "Santé", unit: "%", frequency: "Annuelle", source: "WHO" },
  // Bien-être enfant (15)
  { name: "Retard de croissance (enfants < 5 ans)", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Insuffisance pondérale (enfants < 5 ans)", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Émaciation (enfants < 5 ans)", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Allaitement maternel exclusif (0-5 mois)", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Naissances enregistrées", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Mariage d'enfants (filles avant 18 ans)", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Travail des enfants (5-17 ans)", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "ILO" },
  { name: "Violences contre enfants (déclarées)", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Accès à l'éducation préscolaire", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Mortalité < 1 an (nourrissons)", category: "Bien-être enfant", unit: "pour 1000 naiss.", frequency: "Annuelle", source: "WHO" },
  { name: "Carences en vitamine A (enfants)", category: "Bien-être enfant", unit: "%", frequency: "Annuelle", source: "UNICEF" },
  { name: "Dépenses publiques pour l'enfance", category: "Bien-être enfant", unit: "% du PIB", frequency: "Annuelle", source: "UNICEF" },
  { name: "Enfants non scolarisés (primaire)", category: "Bien-être enfant", unit: "millions", frequency: "Annuelle", source: "UNESCO" },
  { name: "Orphelins (toutes causes)", category: "Bien-être enfant", unit: "milliers", frequency: "Annuelle", source: "UNICEF" },
  { name: "Protection sociale pour enfants", category: "Bien-être enfant", unit: "% des enfants", frequency: "Annuelle", source: "UNICEF" },
  // Éducation (20)
  { name: "Taux d'alphabétisation adultes", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Taux d'alphabétisation jeunes (15-24 ans)", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Taux brut de scolarisation (primaire)", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Taux brut de scolarisation (secondaire)", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Taux brut de scolarisation (supérieur)", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Taux net de scolarisation (primaire)", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Taux d'achèvement du primaire", category: "Éducation", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "Taux d'achèvement du secondaire", category: "Éducation", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "Ratio élèves/enseignant (primaire)", category: "Éducation", unit: "élèves/ens.", frequency: "Annuelle", source: "UNESCO" },
  { name: "Ratio élèves/enseignant (secondaire)", category: "Éducation", unit: "élèves/ens.", frequency: "Annuelle", source: "UNESCO" },
  { name: "Parité filles/garçons (primaire)", category: "Éducation", unit: "index", frequency: "Annuelle", source: "UNESCO" },
  { name: "Parité filles/garçons (secondaire)", category: "Éducation", unit: "index", frequency: "Annuelle", source: "UNESCO" },
  { name: "Dépenses publiques d'éducation", category: "Éducation", unit: "% du PIB", frequency: "Annuelle", source: "UNESCO" },
  { name: "Dépenses éducation par élève (primaire)", category: "Éducation", unit: "USD", frequency: "Annuelle", source: "UNESCO" },
  { name: "Écoles avec électricité (primaire)", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Écoles avec eau potable (primaire)", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Enseignants qualifiés (primaire)", category: "Éducation", unit: "%", frequency: "Annuelle", source: "UNESCO" },
  { name: "Formation technique et professionnelle (TVET)", category: "Éducation", unit: "% scolarisés", frequency: "Annuelle", source: "UNESCO" },
  { name: "Étudiants à l'étranger", category: "Éducation", unit: "milliers", frequency: "Annuelle", source: "UNESCO" },
  { name: "Recherche et développement (R&D)", category: "Éducation", unit: "% du PIB", frequency: "Annuelle", source: "UNESCO" },
  // Sécurité alimentaire (15)
  { name: "Prévalence de la sous-alimentation", category: "Sécurité alimentaire", unit: "% population", frequency: "Annuelle", source: "FAO" },
  { name: "Indice de la faim dans le monde", category: "Sécurité alimentaire", unit: "index", frequency: "Annuelle", source: "IFPRI" },
  { name: "Importations alimentaires nettes", category: "Sécurité alimentaire", unit: "% exportations", frequency: "Annuelle", source: "FAO" },
  { name: "Autosuffisance alimentaire", category: "Sécurité alimentaire", unit: "%", frequency: "Annuelle", source: "FAO" },
  { name: "Production céréalière totale", category: "Sécurité alimentaire", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production alimentaire par habitant", category: "Sécurité alimentaire", unit: "index 2014=100", frequency: "Annuelle", source: "FAO" },
  { name: "Terres arables", category: "Sécurité alimentaire", unit: "% superficie totale", frequency: "Annuelle", source: "FAO" },
  { name: "Terres irriguées", category: "Sécurité alimentaire", unit: "% terres arables", frequency: "Annuelle", source: "FAO" },
  { name: "Pertes alimentaires post-récolte", category: "Sécurité alimentaire", unit: "%", frequency: "Annuelle", source: "FAO" },
  { name: "Prix alimentaires intérieurs (indice)", category: "Sécurité alimentaire", unit: "index", frequency: "Mensuelle", source: "FAO" },
  { name: "Aide alimentaire reçue", category: "Sécurité alimentaire", unit: "tonnes", frequency: "Annuelle", source: "WFP" },
  { name: "Personnes en insécurité alimentaire aiguë (phase 3+)", category: "Sécurité alimentaire", unit: "millions", frequency: "Mensuelle", source: "IPC" },
  { name: "Ménages avec accès alimentaire suffisant", category: "Sécurité alimentaire", unit: "%", frequency: "Mensuelle", source: "WFP" },
  { name: "Diversité alimentaire des ménages", category: "Sécurité alimentaire", unit: "score", frequency: "Annuelle", source: "FAO" },
  { name: "Prévalence de l'anémie (femmes)", category: "Sécurité alimentaire", unit: "%", frequency: "Annuelle", source: "WHO" },
  // Agriculture (15)
  { name: "Valeur ajoutée agricole", category: "Agriculture", unit: "% du PIB", frequency: "Annuelle", source: "World Bank" },
  { name: "Part de l'emploi agricole", category: "Agriculture", unit: "% emploi total", frequency: "Annuelle", source: "ILO" },
  { name: "Production de cacao", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production de coton", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production de café", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production de manioc", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production de maïs", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production de sorgho", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production de riz", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production d'arachides", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Production de cajou", category: "Agriculture", unit: "tonnes", frequency: "Annuelle", source: "FAO" },
  { name: "Utilisation d'engrais", category: "Agriculture", unit: "kg/ha", frequency: "Annuelle", source: "FAO" },
  { name: "Utilisation de pesticides", category: "Agriculture", unit: "kg/ha", frequency: "Annuelle", source: "FAO" },
  { name: "Accès au crédit agricole", category: "Agriculture", unit: "% agriculteurs", frequency: "Annuelle", source: "IFAD" },
  { name: "Mécanisation agricole (tracteurs)", category: "Agriculture", unit: "pour 100 km²", frequency: "Annuelle", source: "FAO" },
  // Gouvernance (15)
  { name: "Indice de perception de la corruption (IPC)", category: "Gouvernance", unit: "score /100", frequency: "Annuelle", source: "Transparency International" },
  { name: "Contrôle de la corruption (Worldwide Governance)", category: "Gouvernance", unit: "index -2.5 à 2.5", frequency: "Annuelle", source: "World Bank" },
  { name: "État de droit", category: "Gouvernance", unit: "index -2.5 à 2.5", frequency: "Annuelle", source: "World Bank" },
  { name: "Stabilité politique et absence de violence", category: "Gouvernance", unit: "index", frequency: "Annuelle", source: "World Bank" },
  { name: "Efficacité des pouvoirs publics", category: "Gouvernance", unit: "index", frequency: "Annuelle", source: "World Bank" },
  { name: "Qualité de la réglementation", category: "Gouvernance", unit: "index", frequency: "Annuelle", source: "World Bank" },
  { name: "Voix citoyenne et responsabilité", category: "Gouvernance", unit: "index", frequency: "Annuelle", source: "World Bank" },
  { name: "Indice Ibrahim de gouvernance africaine (IIAG)", category: "Gouvernance", unit: "score /100", frequency: "Annuelle", source: "Mo Ibrahim Foundation" },
  { name: "Liberté de la presse (RSF)", category: "Gouvernance", unit: "rang mondial", frequency: "Annuelle", source: "RSF" },
  { name: "Démocratie (indice EIU)", category: "Gouvernance", unit: "score /10", frequency: "Annuelle", source: "EIU" },
  { name: "Dépenses militaires", category: "Gouvernance", unit: "% du PIB", frequency: "Annuelle", source: "SIPRI" },
  { name: "Nombre de conflits armés actifs", category: "Gouvernance", unit: "nombre", frequency: "Mensuelle", source: "ACLED" },
  { name: "Accès à la justice (World Justice Project)", category: "Gouvernance", unit: "score", frequency: "Annuelle", source: "WJP" },
  { name: "Registres fonciers opérationnels", category: "Gouvernance", unit: "% couverture", frequency: "Annuelle", source: "World Bank" },
  { name: "Décentralisation fiscale", category: "Gouvernance", unit: "% recettes locales/total", frequency: "Annuelle", source: "IMF" },
  // Humanitaire (10)
  { name: "Personnes nécessitant aide humanitaire", category: "Humanitaire", unit: "millions", frequency: "Mensuelle", source: "OCHA" },
  { name: "Personnes déplacées internes (PDI)", category: "Humanitaire", unit: "milliers", frequency: "Mensuelle", source: "UNHCR" },
  { name: "Réfugiés accueillis", category: "Humanitaire", unit: "milliers", frequency: "Mensuelle", source: "UNHCR" },
  { name: "Demandeurs d'asile", category: "Humanitaire", unit: "milliers", frequency: "Mensuelle", source: "UNHCR" },
  { name: "Financement humanitaire reçu", category: "Humanitaire", unit: "USD", frequency: "Mensuelle", source: "OCHA FTS" },
  { name: "Financement humanitaire (% des besoins)", category: "Humanitaire", unit: "%", frequency: "Mensuelle", source: "OCHA" },
  { name: "Crises humanitaires actives (niveau 3)", category: "Humanitaire", unit: "nombre", frequency: "Mensuelle", source: "OCHA" },
  { name: "Accès humanitaire (indice)", category: "Humanitaire", unit: "index", frequency: "Mensuelle", source: "ACAPS" },
  { name: "Alertes épidémiques actives", category: "Humanitaire", unit: "nombre", frequency: "Mensuelle", source: "WHO" },
  { name: "Population en phase de crise alimentaire IPC (3+)", category: "Humanitaire", unit: "millions", frequency: "Mensuelle", source: "IPC" },
  // Technologie (20)
  { name: "Utilisateurs internet", category: "Technologie", unit: "% population", frequency: "Annuelle", source: "ITU" },
  { name: "Abonnements mobile (actifs)", category: "Technologie", unit: "pour 100 hab.", frequency: "Annuelle", source: "ITU" },
  { name: "Abonnements haut débit mobile", category: "Technologie", unit: "pour 100 hab.", frequency: "Annuelle", source: "ITU" },
  { name: "Abonnements fibre optique", category: "Technologie", unit: "pour 100 hab.", frequency: "Annuelle", source: "ITU" },
  { name: "Couverture réseau 4G", category: "Technologie", unit: "% population", frequency: "Annuelle", source: "GSMA" },
  { name: "Couverture réseau 2G/3G", category: "Technologie", unit: "% population", frequency: "Annuelle", source: "GSMA" },
  { name: "Mobile money (comptes actifs)", category: "Technologie", unit: "% adultes", frequency: "Annuelle", source: "GSMA" },
  { name: "Transactions mobile money", category: "Technologie", unit: "% PIB", frequency: "Annuelle", source: "GSMA" },
  { name: "Startups tech actives", category: "Technologie", unit: "nombre", frequency: "Annuelle", source: "Briter Bridges" },
  { name: "Investissements VC (fintech)", category: "Technologie", unit: "USD", frequency: "Annuelle", source: "Partech" },
  { name: "Applications gouvernementales mobiles", category: "Technologie", unit: "nombre", frequency: "Annuelle", source: "ITU" },
  { name: "Dépenses en TIC", category: "Technologie", unit: "% PIB", frequency: "Annuelle", source: "ITU" },
  { name: "Serveurs sécurisés internet", category: "Technologie", unit: "pour 1M hab.", frequency: "Annuelle", source: "World Bank" },
  { name: "Exportations de services TIC", category: "Technologie", unit: "USD", frequency: "Annuelle", source: "World Bank" },
  { name: "Chercheurs en R&D (TIC)", category: "Technologie", unit: "pour 1M hab.", frequency: "Annuelle", source: "UNESCO" },
  { name: "Abonnements TV numérique", category: "Technologie", unit: "pour 100 hab.", frequency: "Annuelle", source: "ITU" },
  { name: "Commerce électronique (valeur)", category: "Technologie", unit: "USD", frequency: "Annuelle", source: "UNCTAD" },
  { name: "Cyberattaques signalées", category: "Technologie", unit: "nombre", frequency: "Annuelle", source: "ITU" },
  { name: "Législation cybersécurité adoptée", category: "Technologie", unit: "oui/non", frequency: "Annuelle", source: "ITU" },
  { name: "Intelligence artificielle (adoption entreprises)", category: "Technologie", unit: "%", frequency: "Annuelle", source: "McKinsey" },
  // Infrastructure (15)
  { name: "Réseau routier total", category: "Infrastructure", unit: "km", frequency: "Annuelle", source: "World Bank" },
  { name: "Routes asphaltées", category: "Infrastructure", unit: "% du réseau total", frequency: "Annuelle", source: "World Bank" },
  { name: "Indice de connectivité routière rurale", category: "Infrastructure", unit: "index", frequency: "Annuelle", source: "World Bank" },
  { name: "Lignes de chemin de fer", category: "Infrastructure", unit: "km", frequency: "Annuelle", source: "World Bank" },
  { name: "Ports maritimes (capacité conteneurs)", category: "Infrastructure", unit: "EVP/an", frequency: "Annuelle", source: "UNCTAD" },
  { name: "Aéroports internationaux", category: "Infrastructure", unit: "nombre", frequency: "Annuelle", source: "ICAO" },
  { name: "Passagers aériens", category: "Infrastructure", unit: "milliers", frequency: "Annuelle", source: "ICAO" },
  { name: "Fret aérien", category: "Infrastructure", unit: "tonnes", frequency: "Annuelle", source: "ICAO" },
  { name: "Capacité de production électrique installée", category: "Infrastructure", unit: "MW", frequency: "Annuelle", source: "IEA" },
  { name: "Réseau de distribution électrique (pertes)", category: "Infrastructure", unit: "%", frequency: "Annuelle", source: "IEA" },
  { name: "Accès à l'électricité", category: "Infrastructure", unit: "% population", frequency: "Annuelle", source: "World Bank" },
  { name: "Accès à l'électricité (urbain)", category: "Infrastructure", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "Accès à l'électricité (rural)", category: "Infrastructure", unit: "%", frequency: "Annuelle", source: "World Bank" },
  { name: "Coût moyen de l'électricité (industrie)", category: "Infrastructure", unit: "USD/kWh", frequency: "Annuelle", source: "IEA" },
  { name: "Investissements infrastructure", category: "Infrastructure", unit: "% PIB", frequency: "Annuelle", source: "African Development Bank" },
  // Énergie (15)
  { name: "Consommation d'énergie primaire", category: "Énergie", unit: "kWh/capita", frequency: "Annuelle", source: "IEA" },
  { name: "Intensité énergétique du PIB", category: "Énergie", unit: "kWh/USD", frequency: "Annuelle", source: "IEA" },
  { name: "Part énergies renouvelables (total)", category: "Énergie", unit: "%", frequency: "Annuelle", source: "IRENA" },
  { name: "Capacité solaire installée", category: "Énergie", unit: "MW", frequency: "Annuelle", source: "IRENA" },
  { name: "Capacité hydraulique installée", category: "Énergie", unit: "MW", frequency: "Annuelle", source: "IRENA" },
  { name: "Capacité éolienne installée", category: "Énergie", unit: "MW", frequency: "Annuelle", source: "IRENA" },
  { name: "Production de pétrole brut", category: "Énergie", unit: "barils/jour", frequency: "Mensuelle", source: "OPEC" },
  { name: "Réserves prouvées de pétrole", category: "Énergie", unit: "milliards de barils", frequency: "Annuelle", source: "BP" },
  { name: "Production de gaz naturel", category: "Énergie", unit: "Gm³", frequency: "Annuelle", source: "IEA" },
  { name: "Réserves prouvées de gaz", category: "Énergie", unit: "Gm³", frequency: "Annuelle", source: "BP" },
  { name: "Importations de pétrole raffiné", category: "Énergie", unit: "USD", frequency: "Annuelle", source: "IEA" },
  { name: "Subventions aux énergies fossiles", category: "Énergie", unit: "% du PIB", frequency: "Annuelle", source: "IMF" },
  { name: "Dépenses en efficacité énergétique", category: "Énergie", unit: "USD", frequency: "Annuelle", source: "IEA" },
  { name: "Émissions CO₂ du secteur énergétique", category: "Énergie", unit: "MtCO₂", frequency: "Annuelle", source: "IEA" },
  { name: "Accès aux combustibles propres pour cuisiner", category: "Énergie", unit: "%", frequency: "Annuelle", source: "WHO" },
  // Climat (15)
  { name: "Émissions de GES totales", category: "Climat", unit: "MtCO₂eq", frequency: "Annuelle", source: "Climate Watch" },
  { name: "Émissions de CO₂ par habitant", category: "Climat", unit: "tCO₂/hab.", frequency: "Annuelle", source: "OWID" },
  { name: "Émissions de CH₄ (méthane)", category: "Climat", unit: "MtCO₂eq", frequency: "Annuelle", source: "Climate Watch" },
  { name: "Anomalie de température (vs 1990)", category: "Climat", unit: "°C", frequency: "Annuelle", source: "Copernicus" },
  { name: "Précipitations annuelles moyennes", category: "Climat", unit: "mm/an", frequency: "Annuelle", source: "World Bank" },
  { name: "Indice de risque climatique (CRI)", category: "Climat", unit: "rang mondial", frequency: "Annuelle", source: "Germanwatch" },
  { name: "Superficie forestière", category: "Climat", unit: "% du territoire", frequency: "Annuelle", source: "FAO" },
  { name: "Taux de déforestation", category: "Climat", unit: "%/an", frequency: "Annuelle", source: "FAO" },
  { name: "Superficie désertifiée (avance)", category: "Climat", unit: "km²/an", frequency: "Annuelle", source: "UNCCD" },
  { name: "Événements climatiques extrêmes (déclarés)", category: "Climat", unit: "nombre/an", frequency: "Annuelle", source: "EM-DAT" },
  { name: "Personnes affectées par catastrophes naturelles", category: "Climat", unit: "milliers/an", frequency: "Annuelle", source: "EM-DAT" },
  { name: "Pertes économiques dues aux catastrophes", category: "Climat", unit: "USD/an", frequency: "Annuelle", source: "EM-DAT" },
  { name: "Contributions déterminées au niveau national (NDC)", category: "Climat", unit: "soumise oui/non", frequency: "Annuelle", source: "UNFCCC" },
  { name: "Financement climatique reçu", category: "Climat", unit: "USD", frequency: "Annuelle", source: "Climate Funds Update" },
  { name: "Zones humides protégées", category: "Climat", unit: "ha", frequency: "Annuelle", source: "Ramsar" },
];

const FALLBACK_SNAPSHOT = [
  { country: "Nigeria", code: "NG", indicator: "PIB", value: "477.4B", unit: "USD", year: 2023, source: "World Bank" },
  { country: "Ghana", code: "GH", indicator: "Inflation", value: "23.2", unit: "%", year: 2023, source: "IMF" },
  { country: "Sénégal", code: "SN", indicator: "Croissance PIB", value: "8.3", unit: "%", year: 2023, source: "World Bank" },
  { country: "Côte d'Ivoire", code: "CI", indicator: "Population", value: "27.5M", unit: "hab.", year: 2023, source: "World Bank" },
  { country: "Nigeria", code: "NG", indicator: "Population", value: "218.5M", unit: "hab.", year: 2023, source: "World Bank" },
  { country: "Mali", code: "ML", indicator: "Taux de pauvreté", value: "44.9", unit: "%", year: 2022, source: "World Bank" },
  { country: "Bénin", code: "BJ", indicator: "Accès électricité", value: "42.1", unit: "%", year: 2022, source: "World Bank" },
  { country: "Togo", code: "TG", indicator: "Mortalité infantile", value: "47.2", unit: "pour 1000", year: 2022, source: "WHO" },
];

const ALL_CATEGORIES = [
  "Tous",
  "Économie",
  "Commerce",
  "Démographie",
  "Santé",
  "Bien-être enfant",
  "Éducation",
  "Sécurité alimentaire",
  "Agriculture",
  "Gouvernance",
  "Humanitaire",
  "Technologie",
  "Infrastructure",
  "Énergie",
  "Climat",
];

export default function DataPage() {
  const [search, setSearch] = useState("");
  const [snapshot, setSnapshot] = useState(FALLBACK_SNAPSHOT);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [indicators, setIndicators] = useState<Indicator[]>(ALL_INDICATORS_STATIC);
  const [indicatorsTotal, setIndicatorsTotal] = useState<number>(ALL_INDICATORS_STATIC.length);

  useEffect(() => {
    fetch(`${API_URL}/v1/data?latest=true&limit=8`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSnapshot(
            data.map((d: Record<string, unknown>) => ({
              country: (d.country_name || d.country) as string,
              code: (d.country_code || d.code) as string,
              indicator: (d.indicator_name || d.indicator) as string,
              value: d.value as string,
              unit: (d.unit || "") as string,
              year: d.year as number,
              source: (d.source || "API") as string,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/v1/indicators?with_stats=false&limit=500`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setIndicators(
            res.data.map((d: Record<string, unknown>) => ({
              metric_key: d.metric_key as string,
              name: (d.name_fr || d.name_en || d.metric_key) as string,
              category: (d.category as string) || "Autre",
              unit: (d.unit as string) || "",
              frequency: (d.frequency as string) || "Annuelle",
              source: (d.source as string) || "API",
            }))
          );
          if (typeof res.total === "number") {
            setIndicatorsTotal(res.total);
          }
        }
      })
      .catch(() => {});
  }, []);

  const searchLower = search.toLowerCase();

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(searchLower) ||
      c.code.toLowerCase().includes(searchLower) ||
      c.currency.toLowerCase().includes(searchLower)
  );

  const filteredSnapshot = snapshot.filter(
    (item) =>
      !search ||
      item.country.toLowerCase().includes(searchLower) ||
      item.indicator.toLowerCase().includes(searchLower)
  );

  const filteredIndicators = indicators.filter((ind) => {
    const matchesSearch =
      !search ||
      ind.name.toLowerCase().includes(searchLower) ||
      ind.category.toLowerCase().includes(searchLower) ||
      ind.source.toLowerCase().includes(searchLower) ||
      ind.unit.toLowerCase().includes(searchLower);
    const matchesCategory =
      activeCategory === "Tous" || ind.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const catCounts = ALL_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === "Tous"
      ? indicators.length
      : indicators.filter((i) => i.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#080b1a] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Explorez les données de l&apos;Afrique de l&apos;Ouest
            </h1>
            <p className="mt-4 text-lg text-white/55 max-w-2xl mx-auto">
              {indicatorsTotal} indicateurs · 15 pays · Mis à jour quotidiennement depuis les sources officielles.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 inline-flex items-center gap-8 md:gap-12 bg-white/[0.03] border border-white/8 rounded-2xl px-8 py-4"
          >
            {[
              { value: String(indicatorsTotal), label: "indicateurs" },
              { value: "15", label: "pays" },
              { value: "14", label: "catégories" },
              { value: "255", label: "sources" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un indicateur, un pays, une source..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200 text-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* Snapshot live */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-xl font-semibold">Données en direct</h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredSnapshot.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="p-4 rounded-xl bg-[#0d1028] border border-white/8 hover:border-teal-500/30 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/20x15/${item.code.toLowerCase()}.png`}
                    alt={item.country}
                    className="w-5 h-4 rounded-sm object-cover"
                  />
                  <span className="text-xs text-white/60 truncate">{item.country}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">{item.value}</span>
                  {item.unit && (
                    <span className="text-xs text-white/35">{item.unit}</span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-white/50 truncate pr-2">{item.indicator}</span>
                  <span className="text-xs text-white/25 shrink-0">{item.year}</span>
                </div>
                <div className="mt-2.5">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded border",
                    item.source === "BCEAO"
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                  )}>
                    {item.source}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 15 pays */}
      <section className="py-14 px-4 bg-[#0a0d20]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-8">
            {search ? `${filteredCountries.length} pays` : "15 pays couverts"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredCountries.map((country, i) => (
              <motion.div
                key={country.code}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  href={`/data/${country.slug}`}
                  className="flex flex-col p-4 rounded-xl bg-[#0d1028] border border-white/8 hover:border-teal-500/30 transition-all duration-200 h-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`}
                    alt={country.name}
                    className="w-6 h-[18px] rounded-sm object-cover mb-2.5"
                  />
                  <div className="font-medium text-sm text-white">{country.name}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-white/40 font-mono">{country.currency}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded border",
                      LANG_COLORS[country.lang]
                    )}>
                      {country.lang}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue des indicateurs */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-semibold">Catalogue des indicateurs</h2>
              <p className="text-sm text-white/40 mt-1">
                {filteredIndicators.length} indicateur{filteredIndicators.length !== 1 ? "s" : ""} · {indicatorsTotal} au total · 14 catégories
              </p>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-teal-500/15 border-teal-500/40 text-teal-400"
                    : "bg-white/[0.03] border-white/8 text-white/45 hover:text-white/70 hover:border-white/15"
                )}
              >
                {cat}
                {cat !== "Tous" && (
                  <span className="ml-1.5 text-white/25">{catCounts[cat]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-xl border border-white/8 overflow-hidden"
          >
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_100px_100px] gap-4 px-5 py-3 bg-white/[0.03] text-xs text-white/35 uppercase tracking-wider font-medium border-b border-white/5">
              <div>Indicateur</div>
              <div>Catégorie</div>
              <div>Unité</div>
              <div>Fréquence</div>
              <div>Source</div>
            </div>

            {/* Rows */}
            {filteredIndicators.length > 0 ? (
              filteredIndicators.map((ind, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_1fr_1fr_100px_100px] gap-4 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors duration-100 items-center"
                >
                  <div className="text-sm text-white/85 font-medium">{ind.name}</div>
                  <div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded border",
                      CAT_COLORS[ind.category] || "bg-white/5 text-white/50 border-white/10"
                    )}>
                      {ind.category}
                    </span>
                  </div>
                  <div className="text-xs text-white/45">{ind.unit}</div>
                  <div className="text-xs text-white/35">{ind.frequency}</div>
                  <div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded border",
                      ind.source === "BCEAO"
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    )}>
                      {ind.source}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-white/35 text-sm">
                Aucun indicateur ne correspond à votre recherche.
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
