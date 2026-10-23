"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, AlertCircle, ArrowRight, ShieldCheck, ChefHat, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Route according to user role
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "PROVIDER") {
        router.push("/provider");
      } else {
        router.push("/customer");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Sign in to Tiffin Finder</h2>
        <p className="text-xs text-stone-500">Access your meal subscriptions, daily menus, or provider kitchen</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-subtle rounded-3xl border border-stone-200 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700">Password</label>
                <Link href="/forgot-password" className="text-brand-600 hover:underline text-[11px]">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick Demo Logins for Pair Programming Evaluation */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 block text-center">
              Quick Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("rahul@gmail.com", "customer123")}
                className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-center transition-colors"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
                <span className="text-[10px] font-semibold text-stone-700 block">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("anita@annapurna.com", "provider123")}
                className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-center transition-colors"
              >
                <ChefHat className="w-3.5 h-3.5 text-brand-600 mx-auto mb-0.5" />
                <span className="text-[10px] font-semibold text-stone-700 block">Provider</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@tiffinfinder.com", "admin123")}
                className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-center transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 mx-auto mb-0.5" />
                <span className="text-[10px] font-semibold text-stone-700 block">Admin</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-stone-500">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
