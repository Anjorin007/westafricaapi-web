import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WestAfrica API — Données CEDEAO",
  description:
    "Plateforme d'API commerciales pour l'Afrique de l'Ouest. Données économiques, marchés financiers, commerce et conformité pour les 15 pays CEDEAO.",
  keywords: ["CEDEAO", "ECOWAS", "West Africa", "API", "données", "économie"],
  openGraph: {
    title: "WestAfrica API",
    description: "Infrastructure de données pour les 15 pays CEDEAO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
