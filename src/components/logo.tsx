"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AFRICA_REST_PATH, ECOWAS_PATHS } from "@/components/logo-map-data";

interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 32 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="WestAfrica API — carte de l'Afrique avec les pays CEDEAO"
    >
      <path d={AFRICA_REST_PATH} fill="#94a3b8" opacity="1" />
      <g fill="#14b8a6" stroke="#5eead4" strokeWidth="0.6" strokeLinejoin="round">
        {ECOWAS_PATHS.map((c) => (
          <path key={c.name} d={c.d}>
            <title>{c.name}</title>
          </path>
        ))}
      </g>
    </svg>
  );
}

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  variant?: "default" | "light";
}

export function Logo({
  className,
  showText = true,
  size = "md",
  href = "/",
  variant = "default",
}: LogoProps) {
  const px = { sm: 28, md: 36, lg: 52 }[size];
  const textSize = { sm: "text-sm", md: "text-lg", lg: "text-2xl" }[size];
  const isLight = variant === "light";

  const content = (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <LogoMark size={px} />
      {showText && (
        <span className={cn("font-bold tracking-tight leading-none", textSize, isLight ? "text-white" : "text-foreground")}>
          WestAfrica
          <span className={isLight ? " text-teal-300" : " text-teal-600 dark:text-teal-400"}> API</span>
        </span>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
      {content}
    </Link>
  );
}
