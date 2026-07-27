import Link from "next/link";
import { Logo } from "@/components/logo";

const FOOTER_LINKS = {
  Produits: [
    { href: "/data", label: "Data API" },
    { href: "/tenders", label: "Appels d'offres" },
    { href: "/markets", label: "Markets" },
    { href: "/trade", label: "Trade" },
    { href: "/government", label: "Government" },
  ],
  Développeurs: [
    { href: "/docs", label: "Documentation" },
    { href: "/docs/quickstart", label: "Quickstart" },
    { href: "/docs/mcp", label: "MCP (Claude, Cursor)" },
    { href: "/changelog", label: "Changelog" },
    { href: "/status", label: "Statut API" },
  ],
  Ressources: [
    { href: "/pricing", label: "Tarifs" },
    { href: "/compare", label: "Comparateur pays" },
    { href: "/convert", label: "Convertisseur devises" },
    { href: "/about", label: "À propos" },
  ],
};

const COUNTRIES = [
  { name: "Bénin",         code: "bj" },
  { name: "Burkina Faso",  code: "bf" },
  { name: "Cap-Vert",      code: "cv" },
  { name: "Côte d'Ivoire", code: "ci" },
  { name: "Gambie",        code: "gm" },
  { name: "Ghana",         code: "gh" },
  { name: "Guinée",        code: "gn" },
  { name: "Guinée-Bissau", code: "gw" },
  { name: "Liberia",       code: "lr" },
  { name: "Mali",          code: "ml" },
  { name: "Niger",         code: "ne" },
  { name: "Nigeria",       code: "ng" },
  { name: "Sénégal",       code: "sn" },
  { name: "Sierra Leone",  code: "sl" },
  { name: "Togo",          code: "tg" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080b1a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">

        <div className="flex flex-col md:flex-row gap-6 mb-10">
          {/* Brand */}
          <div className="space-y-3 md:w-[280px] shrink-0">
            <Logo size="md" variant="light" />
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              L&apos;API de référence pour les données officielles d&apos;Afrique de l&apos;Ouest.
              411 indicateurs. 255 sources. 15 pays.
            </p>
            <p className="text-xs text-white/20">
              Banque Mondiale · BCEAO · FMI · INS nationaux
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-20 md:ml-90">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title} className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">{title}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/45 hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Countries strip */}
        <div className="py-5 border-t border-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/25 mb-4">
            Couverture — 12 CEDEAO · 3 AES
          </p>
          <div className="flex flex-wrap gap-3">
            {COUNTRIES.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/[0.03] text-sm text-white/45">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://flagcdn.com/20x15/${c.code}.png`}
                  alt={c.name}
                  width={20}
                  height={15}
                  className="rounded-sm"
                  loading="lazy"
                />
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-5 pt-5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/25">
          <p>© 2026 WestAfrica API. Données officielles Afrique de l&apos;Ouest.</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">Confidentialité</Link>
            <Link href="/legal/terms" className="hover:text-white/60 transition-colors">Conditions</Link>
            <Link href="/llms.txt" className="hover:text-white/60 transition-colors font-mono">llms.txt</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
