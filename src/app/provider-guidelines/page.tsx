import React from "react";
import Link from "next/link";
import { ShieldCheck, Utensils, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ProviderGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Quality & Hygiene Standards</span>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Tiffin Finder Provider Guidelines
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          To maintain customer trust and ensure safe, nutritious meals for students and working professionals, all meal
          providers must adhere to these standards.
        </p>
      </div>

      <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            1. Freshness & Truth in Menus
          </h3>
          <p className="text-xs text-stone-600">
            Never publish dishes that you do not intend to cook. If a meal or vegetable runs out, update the status to "Sold Out" immediately. We do not tolerate misleading menu listings.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            2. Food Safety & FSSAI Compliance
          </h3>
          <p className="text-xs text-stone-600">
            Home cooks and small caterers must follow basic food hygiene practices: potable water for cooking, clean stainless steel or food-grade containers, and proper food storage. An FSSAI registration number is strongly recommended to earn a Verified Kitchen badge.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            3. Delivery Commitments & Punctuality
          </h3>
          <p className="text-xs text-stone-600">
            Customers depend on timely lunch and dinner for office hours and study schedules. Deliver within your stated delivery window. In case of rain or traffic delay, inform the customer promptly.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
          <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            4. Clear Pause & Cancellation Terms
          </h3>
          <p className="text-xs text-stone-600">
            State your pause rules clearly in your meal plan descriptions. If a customer notifies you within the permitted notice period (e.g. 12 or 24 hours), honour their pause request and carry forward the meal credit.
          </p>
        </div>
      </div>
    </div>
  );
}
