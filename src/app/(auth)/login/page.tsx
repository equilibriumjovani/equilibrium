"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-eq-blue-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex">

        {/* LEFT PANEL — Brand */}
        <div className="hidden md:flex flex-col justify-between flex-1 bg-gradient-to-br from-blue-700 via-blue-600 to-eq-blue p-10 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-white/5" />

          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 backdrop-blur border border-white/20 p-1.5">
    <Image
      src="/logo.png"
      alt="Equilibrium Center"
      width={56}
      height={56}
      className="object-contain w-full h-full"
    />
  </div>
  <div>
    <span className="text-white text-xl font-semibold tracking-wide block">
      Equilibrium
    </span>
    <span className="text-white/60 text-xs">Center · Body Fitness · Self-Defense</span>
  </div>
</div>

          {/* Tagline */}
          <div className="relative z-10">
            <p className="text-white/70 text-sm uppercase tracking-widest mb-3 font-medium">
              Tableau de bord
            </p>
            <h1 className="text-white text-4xl font-light leading-snug mb-8">
              Gérez votre salle<br />
              <span className="font-semibold">avec précision.</span>
            </h1>

            {/* Feature list */}
            <div className="flex flex-col gap-3">
              {[
                "Suivi complet des clients",
                "Paiements & statuts en temps réel",
                "Sessions mensuelles détaillées",
                "Factures PDF par email",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/40 text-xs relative z-10">
            Equilibrium Gym · Tanger
          </p>
        </div>

        {/* RIGHT PANEL — Form */}
        <div className="flex-1 md:max-w-sm flex flex-col justify-center p-8 md:p-10">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-eq-blue-light flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-900 font-semibold text-lg">Equilibrium</span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Connexion
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Accès réservé au propriétaire
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@equilibrium.ma"
                required
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm bg-gray-50",
                  "text-gray-900 placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-eq-blue/30 focus:border-eq-blue",
                  "transition-all duration-200",
                  error ? "border-red-300 bg-red-50" : "border-gray-200"
                )}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "w-full px-4 py-3 pr-11 rounded-xl border text-sm bg-gray-50",
                    "text-gray-900 placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-eq-blue/30 focus:border-eq-blue",
                    "transition-all duration-200",
                    error ? "border-red-300 bg-red-50" : "border-gray-200"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-semibold text-white",
                "bg-gradient-to-r from-blue-700 to-eq-blue",
                "hover:opacity-90 active:scale-[0.98]",
                "transition-all duration-200 mt-1",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "shadow-md shadow-blue-200"
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Connexion...
                </span>
              ) : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Equilibrium Gym · Tanger © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}