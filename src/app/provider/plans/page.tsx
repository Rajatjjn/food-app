"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export default function ProviderMealPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New plan form state
  const [name, setName] = useState("");
  const [planType, setPlanType] = useState<string>("MONTHLY_LUNCH");
  const [description, setDescription] = useState("");
  const [priceRupees, setPriceRupees] = useState("2600");
  const [mealsCount, setMealsCount] = useState("26");
  const [serviceDaysPerWeek, setServiceDaysPerWeek] = useState("6");
  const [pauseRules, setPauseRules] = useState("Up to 3 pause days with 24hr notice");
  const [cancellationPolicy, setCancellationPolicy] = useState("Pro-rata refund for unused days");
  const [hasTrial, setHasTrial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meal-plans");
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const priceMinor = Math.round(parseFloat(priceRupees) * 100);
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          planType,
          description,
          priceMinor,
          mealsCount: parseInt(mealsCount, 10),
          serviceDaysPerWeek: parseInt(serviceDaysPerWeek, 10),
          pauseRules,
          cancellationPolicy,
          hasTrial,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create meal plan");
      }

      setFeedback("Plan created successfully!");
      setShowAddForm(false);
      fetchPlans();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/provider"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Meal Plans & Subscriptions</h1>
          <p className="text-xs text-stone-500">
            Define your weekly and monthly pricing tiers for daily customers
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Create New Plan"}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Add Plan Form */}
      {showAddForm && (
        <form onSubmit={handleCreatePlan} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-card space-y-4 text-xs">
          <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
            Create Meal Plan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Plan Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly Standard Lunch (26 Meals)"
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Plan Type</label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              >
                <option value="MONTHLY_LUNCH">Monthly Lunch Plan</option>
                <option value="MONTHLY_DINNER">Monthly Dinner Plan</option>
                <option value="MONTHLY_BOTH">Monthly Lunch + Dinner Combo</option>
                <option value="WEEKLY">Weekly 6-Day Plan</option>
                <option value="SINGLE_MEAL">Single Meal / Trial Thali</option>
                <option value="CUSTOM">Custom Plan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What dishes, rotis, rice and sweets are included in this plan..."
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Total Plan Price (₹) *</label>
              <input
                type="number"
                required
                min="10"
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Number of Meals in Plan *</label>
              <input
                type="number"
                required
                min="1"
                value={mealsCount}
                onChange={(e) => setMealsCount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Operating Days / Week</label>
              <select
                value={serviceDaysPerWeek}
                onChange={(e) => setServiceDaysPerWeek(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              >
                <option value="6">6 Days (Mon - Sat)</option>
                <option value="7">7 Days (All Days)</option>
                <option value="5">5 Days (Mon - Fri)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Pause Policy</label>
              <input
                type="text"
                value={pauseRules}
                onChange={(e) => setPauseRules(e.target.value)}
                placeholder="e.g. Up to 3 pause days with 24hr notice"
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Cancellation Terms</label>
              <input
                type="text"
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                placeholder="e.g. Pro-rata refund for unused days"
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
            >
              {submitting ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </form>
      )}

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between gap-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-brand-50 text-brand-800 border border-brand-200">
                  {p.planType.replace("_", " ")}
                </span>
                {p.hasTrial && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                    Trial Option Enabled
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-stone-900">{p.name}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{p.description}</p>

              <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-1">
                <span>Total Meals: <strong>{p.mealsCount}</strong></span>
                <span>Service Days: <strong>{p.serviceDaysPerWeek} days/wk</strong></span>
                {p.pauseRules && <span>Pause: {p.pauseRules}</span>}
              </div>
            </div>

            <div className="text-left md:text-right shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
              <div className="text-2xl font-black text-stone-900">{formatCurrency(p.priceMinor)}</div>
              <div className="text-xs font-semibold text-brand-600 mt-0.5">
                Effective: {formatCurrency(p.effectiveCostPerMealMinor)}/meal
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
