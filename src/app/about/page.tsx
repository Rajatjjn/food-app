import React from "react";
import Link from "next/link";
import { UtensilsCrossed, ShieldCheck, Heart, Users, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Bringing Homestyle Comfort to Every Table
        </h1>
        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Tiffin Finder was born out of a simple observation: millions of students, young professionals, and migrant workers
          struggle every day to find nutritious, reliable, affordable home-cooked food in new cities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3 text-center">
          <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-base text-stone-900">Verified Providers</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We verify kitchens, FSSAI licenses, and delivery areas so you never have to guess about food safety or hygiene.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3 text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="font-bold text-base text-stone-900">True Daily Menus</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            No stale stock photos or recycled weekly lists. Our daily menu engine shows the exact sabzi, dal, and roti being cooked today.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3 text-center">
          <Users className="w-8 h-8 text-brand-600 mx-auto" />
          <h3 className="font-bold text-base text-stone-900">Empowering Home Cooks</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We provide hardworking home chefs and small businesses with modern digital tools to manage daily customers without exorbitant marketplace fees.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200/80 space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Our Launch Cities</h2>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          Currently serving key educational and IT hubs across <strong>Pune</strong> (Kothrud, Baner, Hinjawadi Phase 1, Viman Nagar),
          <strong>Bengaluru</strong> (Koramangala, HSR Layout, Indiranagar), and <strong>Surat</strong> (Adajan, Vesu, City Light, Piplod).
        </p>
        <div className="pt-2">
          <Link
            href="/tiffins"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-xs hover:bg-brand-700"
          >
            <span>Browse Active Kitchens</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
