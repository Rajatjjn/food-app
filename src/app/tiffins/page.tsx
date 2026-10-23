"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Clock,
  Filter,
  X,
  Sparkles,
  ChefHat,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { ProviderCard } from "@/components/provider-card";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "Pune");
  const [locality, setLocality] = useState(searchParams.get("locality") || "");
  const [mealType, setMealType] = useState(searchParams.get("mealType") || "");
  const [dietary, setDietary] = useState(searchParams.get("dietary") || "");
  const [planType, setPlanType] = useState(searchParams.get("planType") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [trialOnly, setTrialOnly] = useState(searchParams.get("trialOnly") === "true");
  const [updatedToday, setUpdatedToday] = useState(searchParams.get("updatedToday") === "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "relevance");

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Available localities by city
  const cityLocalities: Record<string, string[]> = {
    Pune: ["Kothrud", "Baner", "Hinjawadi Phase 1", "Viman Nagar", "Kalyani Nagar", "Karve Nagar", "Wakad"],
    Bengaluru: ["Koramangala", "HSR Layout", "Indiranagar"],
  };

  useEffect(() => {
    fetchProviders();
  }, [searchParams]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.has("city")) params.set("city", city);

      const res = await fetch(`/api/tiffins?${params.toString()}`);
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (err) {
      console.error(err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    if (locality) params.set("locality", locality);
    if (mealType) params.set("mealType", mealType);
    if (dietary) params.set("dietary", dietary);
    if (planType) params.set("planType", planType);
    if (minRating) params.set("minRating", minRating);
    if (trialOnly) params.set("trialOnly", "true");
    if (updatedToday) params.set("updatedToday", "true");
    if (sortBy && sortBy !== "relevance") params.set("sortBy", sortBy);

    router.push(`/tiffins?${params.toString()}`);
    setIsMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    setQuery("");
    setLocality("");
    setMealType("");
    setDietary("");
    setPlanType("");
    setMinRating("");
    setTrialOnly(false);
    setUpdatedToday(false);
    setSortBy("relevance");
    router.push(`/tiffins?city=${city}`);
    setIsMobileFiltersOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Search by kitchen name, dish, or area..."
            className="w-full bg-transparent border-none outline-none text-sm placeholder:text-stone-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
            <ArrowUpDown className="w-4 h-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const params = new URLSearchParams(searchParams.toString());
                params.set("sortBy", e.target.value);
                router.push(`/tiffins?${params.toString()}`);
              }}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-semibold focus:outline-none"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="updated">Menu Updated Today</option>
            </select>
          </div>

          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            Apply
          </button>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-stone-100 rounded-lg text-xs font-medium text-stone-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs h-fit sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* City & Locality */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Locality ({city})</label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-800"
            >
              <option value="">All Localities in {city}</option>
              {(cityLocalities[city] || []).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Timing */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Meal Timing</label>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="mealType"
                  checked={mealType === ""}
                  onChange={() => setMealType("")}
                  className="accent-brand-600"
                />
                <span>Both Lunch & Dinner</span>
              </label>
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="mealType"
                  checked={mealType === "LUNCH"}
                  onChange={() => setMealType("LUNCH")}
                  className="accent-brand-600"
                />
                <span>Lunch Only</span>
              </label>
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="mealType"
                  checked={mealType === "DINNER"}
                  onChange={() => setMealType("DINNER")}
                  className="accent-brand-600"
                />
                <span>Dinner Only</span>
              </label>
            </div>
          </div>

          {/* Dietary Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Dietary Preferences</label>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="dietary"
                  checked={dietary === ""}
                  onChange={() => setDietary("")}
                  className="accent-brand-600"
                />
                <span>All Kitchens</span>
              </label>
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="dietary"
                  checked={dietary === "VEG"}
                  onChange={() => setDietary("VEG")}
                  className="accent-brand-600"
                />
                <span>Pure Vegetarian Only</span>
              </label>
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="radio"
                  name="dietary"
                  checked={dietary === "JAIN"}
                  onChange={() => setDietary("JAIN")}
                  className="accent-brand-600"
                />
                <span>Jain Shakahari (No Root Veg)</span>
              </label>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-800"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars (Top Rated)</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>

          {/* Checkbox Toggles */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={trialOnly}
                onChange={(e) => setTrialOnly(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <span className="font-medium">Trial Meal Available</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={updatedToday}
                onChange={(e) => setUpdatedToday(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
              <span className="font-medium">Menu Updated Today</span>
            </label>
          </div>

          <button
            onClick={applyFilters}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Apply Filters
          </button>
        </aside>

        {/* Results Area */}
        <main className="md:col-span-3">
          <div className="mb-4 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing <strong className="text-stone-900">{providers.length}</strong> tiffin services in{" "}
              <strong>{locality || city}</strong>
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-stone-100 animate-pulse" />
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">No Tiffin Services Match Your Filters</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                Try widening your search area or removing specific dietary restrictions to view nearby delivery kitchens.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900">Search Filters</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Locality</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All Localities in {city}</option>
                  {(cityLocalities[city] || []).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Dietary</label>
                <select
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All</option>
                  <option value="VEG">Pure Vegetarian</option>
                  <option value="JAIN">Jain Shakahari</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={trialOnly}
                    onChange={(e) => setTrialOnly(e.target.checked)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <span>Trial Meal Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={updatedToday}
                    onChange={(e) => setUpdatedToday(e.target.checked)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <span>Menu Updated Today</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2.5 border rounded-xl font-semibold text-stone-700"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TiffinsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Loading Tiffin Services...</div>}>
      <SearchContent />
    </Suspense>
  );
}
