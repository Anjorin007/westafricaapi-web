"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    handleRedirectCallback({ signInForceRedirectUrl: "/dashboard", signUpForceRedirectUrl: "/dashboard" })
      .catch(() => router.push("/sign-in"));
  }, [handleRedirectCallback, router]);

  return (
    <div className="min-h-screen bg-[#080b1a] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-r-transparent" />
        <p className="mt-4 text-sm text-white/50">Connexion en cours...</p>
      </div>
    </div>
  );
}
