import React from "react";
import Link from "next/link";
import { Search, Utensils, MessageSquare, CheckCircle, ChefHat, Sparkles } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          How Tiffin Finder Works
        </h1>
        <p className="text-base text-stone-600 max-w-xl mx-auto">
          A modern, transparent way to connect hungry customers with local home kitchens.
        </p>
      </div>

      {/* For Customers */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200">
          <Utensils className="w-3.5 h-3.5 text-brand-600" />
          <span>For Customers (Students & Working Professionals)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center">1</div>
            <h3 className="font-bold text-base text-stone-900">Search Your Locality</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Filter by Lunch, Dinner, Pure Veg or Jain requirements. View exact delivery fees and cutoff timings.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center">2</div>
            <h3 className="font-bold text-base text-stone-900">Check Today's Live Menu</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              See what the cook is preparing today before ordering. If the cutoff has passed, our system clearly warns you.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center">3</div>
            <h3 className="font-bold text-base text-stone-900">Trial Meal or WhatsApp</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Submit a trial request directly through the app, or click the WhatsApp button to chat with the cook directly.
            </p>
          </div>
        </div>
      </div>

      {/* For Providers */}
      <div className="space-y-6 pt-6 border-t border-stone-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
          <span>For Tiffin Providers & Home Cooks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">1</div>
            <h3 className="font-bold text-base text-stone-900">Create Free Profile</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Specify your service radius, delivery windows, cutoff times, and weekly/monthly meal plan rates.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">2</div>
            <h3 className="font-bold text-base text-stone-900">Publish in 30 Seconds</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Use our quick menu publisher or copy yesterday's menu with a single tap. Schedule future menus in advance.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">3</div>
            <h3 className="font-bold text-base text-stone-900">Receive Direct Enquiries</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Accept trial requests and talk directly to customers on your own terms. Build long-term recurring subscriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
