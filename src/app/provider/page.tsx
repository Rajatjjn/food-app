"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  Utensils,
  Calendar,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Clock,
  Plus,
  CheckCircle2,
  Copy,
  ExternalLink,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { evaluateMenuFreshness } from "@/lib/time";

export default function ProviderOverviewPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (!authData.user || authData.user.role !== "PROVIDER") {
        router.push("/login");
        return;
      }

      if (!authData.user.providerProfile) {
        router.push("/provider/onboarding");
        return;
      }

      setProvider(authData.user.providerProfile);

      // Fetch menus
      const menusRes = await fetch("/api/menus");
      const menusData = await menusRes.json();
      setMenus(menusData.menus || []);

      // Fetch trials
      const trialsRes = await fetch("/api/trials");
      const trialsData = await trialsRes.json();
      setTrials(trialsData.trials || []);

      // Fetch enquiries
      const enqRes = await fetch("/api/enquiries");
      const enqData = await enqRes.json();
      setEnquiries(enqData.enquiries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSoldOut = async (menuId: string, currentStatus: string) => {
    const newStatus = currentStatus === "SOLD_OUT" ? "PUBLISHED" : "SOLD_OUT";
    try {
      const res = await fetch("/api/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId, status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Menu marked as ${newStatus}`);
        fetchProviderData();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
        Loading provider kitchen...
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayLunch = menus.find((m) => m.date === today && m.mealType === "LUNCH");
  const todayDinner = menus.find((m) => m.date === today && m.mealType === "DINNER");
  const pendingTrials = trials.filter((t) => t.status === "PENDING");
  const pendingEnquiries = enquiries.filter((e) => e.status === "PENDING");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                provider?.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {provider?.status === "APPROVED" ? "Kitchen Active" : "Pending Verification"}
            </span>
            {provider?.verifiedBadge && (
              <span className="flex items-center gap-1 text-xs text-amber-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-600 fill-amber-100" />
                Verified
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {provider?.businessName}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your daily menus, incoming trial requests, and student subscriptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {provider?.slug && (
            <Link
              href={`/tiffins/${provider.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href="/provider/menus"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Daily Menu</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/provider/trials"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-brand-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
            <span>Pending Trials</span>
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{pendingTrials.length}</div>
          <span className="text-[11px] text-stone-500 block mt-1">Requires your acceptance</span>
        </Link>

        <Link
          href="/provider/enquiries"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-brand-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
            <span>New Enquiries</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{pendingEnquiries.length}</div>
          <span className="text-[11px] text-stone-500 block mt-1">From potential monthly subscribers</span>
        </Link>

        <Link
          href="/provider/menus"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-brand-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
            <span>Total Menus</span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{menus.length}</div>
          <span className="text-[11px] text-stone-500 block mt-1">Across all dates</span>
        </Link>

        <Link
          href="/provider/plans"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-brand-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
            <span>Meal Plans</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">Manage</div>
          <span className="text-[11px] text-stone-500 block mt-1">Weekly & monthly pricing</span>
        </Link>
      </div>

      {/* Today's Live Menus Quick Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Today's Menus Status ({today})</h2>
          <Link href="/provider/menus" className="text-xs font-semibold text-brand-600 hover:underline">
            Manage Menus →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lunch Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900">
                ☀️ Today's Lunch
              </span>
              {todayLunch && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    todayLunch.status === "SOLD_OUT"
                      ? "bg-red-100 text-red-800"
                      : todayLunch.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {todayLunch.status}
                </span>
              )}
            </div>

            {todayLunch ? (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-stone-900">{todayLunch.title}</h3>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Price: {formatCurrency(todayLunch.priceMinor)}</span>
                  <span>Portions Remaining: {todayLunch.availableQuantity}</span>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => toggleSoldOut(todayLunch.id, todayLunch.status)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      todayLunch.status === "SOLD_OUT"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    {todayLunch.status === "SOLD_OUT" ? "Mark Available Again" : "Mark Sold Out"}
                  </button>
                  <Link
                    href={`/provider/menus?edit=${todayLunch.id}`}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-stone-500">No Lunch menu published for today.</p>
                <Link
                  href="/provider/menus?mealType=LUNCH"
                  className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
                >
                  Create Lunch Menu
                </Link>
              </div>
            )}
          </div>

          {/* Dinner Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-stone-800 text-white">
                🌙 Today's Dinner
              </span>
              {todayDinner && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    todayDinner.status === "SOLD_OUT"
                      ? "bg-red-100 text-red-800"
                      : todayDinner.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {todayDinner.status}
                </span>
              )}
            </div>

            {todayDinner ? (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-stone-900">{todayDinner.title}</h3>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Price: {formatCurrency(todayDinner.priceMinor)}</span>
                  <span>Portions Remaining: {todayDinner.availableQuantity}</span>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => toggleSoldOut(todayDinner.id, todayDinner.status)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      todayDinner.status === "SOLD_OUT"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    {todayDinner.status === "SOLD_OUT" ? "Mark Available Again" : "Mark Sold Out"}
                  </button>
                  <Link
                    href={`/provider/menus?edit=${todayDinner.id}`}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-stone-500">No Dinner menu published for today.</p>
                <Link
                  href="/provider/menus?mealType=DINNER"
                  className="inline-block px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
                >
                  Create Dinner Menu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
