"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, AlertCircle, ChefHat, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (role === "PROVIDER") {
        router.push("/provider/onboarding");
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

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Create your account</h2>
        <p className="text-xs text-stone-500">Join Tiffin Finder as a Customer or Kitchen Provider</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-subtle rounded-3xl border border-stone-200 sm:px-10 space-y-6">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-stone-100">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                role === "CUSTOMER" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("PROVIDER")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                role === "PROVIDER" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <ChefHat className="w-4 h-4 text-brand-600" />
              <span>Food Provider</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {role === "PROVIDER" ? "Contact Person / Chef Name *" : "Full Name *"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anita Joshi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
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
              <label className="block font-semibold text-stone-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Password (min 6 characters) *</label>
              <input
                type="password"
                required
                minLength={6}
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
              {loading ? "Creating account..." : role === "PROVIDER" ? "Continue to Kitchen Profile" : "Register as Customer"}
            </button>
          </form>

          <div className="text-center text-xs text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
