"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { NetworkMap } from "@/components/auth/NetworkMap";
import { TerminalBlock } from "@/components/auth/TerminalBlock";
import { ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    setError("");

    const { error: signInError } = await signIn.password({
      emailAddress: email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize();
      router.push("/dashboard");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    if (!signIn) return;
    setError("");
    const { error: ssoError } = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectCallbackUrl: `${window.location.origin}/dashboard`,
    });
    if (ssoError) setError(ssoError.message || "Erreur Google OAuth");
  }

  return (
    <div className="min-h-screen bg-[#080b1a] grid grid-cols-1 lg:grid-cols-2">

      {/* ── Panneau gauche : visualisation ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:block relative overflow-hidden border-r border-white/5"
        style={{ background: "linear-gradient(135deg, #060914 0%, #0a0d1f 50%, #080b1a 100%)" }}
      >
        {/* Glow ambiance */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[100px] pointer-events-none" />

        <NetworkMap />
        <TerminalBlock />

        {/* Branding bas gauche */}
        <div className="absolute bottom-8 left-8">
          <Logo variant="light" size="sm" />
          <p className="mt-3 text-xs text-white/30 font-mono">279 indicators · 15 countries</p>
        </div>
      </motion.div>

      {/* ── Panneau droit : formulaire ── */}
      <div className="flex items-center justify-center px-6 py-12 bg-[#0d1028]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[400px]"
        >
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/"><Logo variant="light" size="md" /></Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-white/45">Access West Africa's economic data</p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm transition-colors flex items-center justify-center gap-3 border border-gray-200 shadow-sm"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#0d1028] text-xs text-white/30">or continue with email</span>
            </div>
          </div>

          {/* Formulaire email/password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 outline-none focus:border-teal-500/40 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 outline-none focus:border-teal-500/40 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-red-500/8 border border-red-500/20"
              >
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300/90">{error}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? "Connexion..." : "Se connecter"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-white/40">
            Pas de compte?{" "}
            <Link href="/sign-up" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              S'inscrire
            </Link>
          </p>

          <div className="mt-5 text-center lg:hidden">
            <Link href="/" className="text-xs text-white/30 hover:text-white/50 transition-colors">← Retour à l'accueil</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
