"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Form Fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("HOME_COOK");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [city, setCity] = useState("Pune");
  const [locality, setLocality] = useState("Kothrud");
  const [pincode, setPincode] = useState("411038");
  const [fullAddress, setFullAddress] = useState("");
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(5.0);
  const [isVegetarianOnly, setIsVegetarianOnly] = useState(true);
  const [dietaryCategories, setDietaryCategories] = useState<string[]>(["VEG"]);
  const [operatesLunch, setOperatesLunch] = useState(true);
  const [operatesDinner, setOperatesDinner] = useState(true);
  const [lunchCutoffTime, setLunchCutoffTime] = useState("10:30");
  const [dinnerCutoffTime, setDinnerCutoffTime] = useState("18:30");

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!businessName || businessName.length < 3) {
        setError("Please enter a valid business/kitchen name (min 3 characters)");
        return;
      }
      if (!description || description.length < 20) {
        setError("Please provide a description of at least 20 characters explaining your home-cooked meals");
        return;
      }
      if (!contactPhone || !whatsappNumber) {
        setError("Both contact phone and WhatsApp number are required");
        return;
      }
    }
    if (step === 2) {
      if (!city || !locality || !pincode) {
        setError("City, locality, and pincode are required");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/provider/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          businessType,
          description,
          contactPhone,
          whatsappNumber,
          city,
          locality,
          pincode,
          fullAddress,
          deliveryRadiusKm: Number(deliveryRadiusKm),
          isVegetarianOnly,
          dietaryCategories,
          operatesLunch,
          operatesDinner,
          lunchCutoffTime,
          dinnerCutoffTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit onboarding");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Wizard Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
          <ChefHat className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          List Your Kitchen on Tiffin Finder
        </h1>
        <p className="text-xs text-stone-500">
          Step {step} of 4 • Fast registration for home cooks and meal businesses
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-card text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900">Application Submitted!</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
            Your kitchen application for <strong>{businessName}</strong> has been received with status{" "}
            <span className="font-bold text-amber-700">PENDING VERIFICATION</span>.
          </p>
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 text-left space-y-2">
            <div className="flex items-center gap-2 text-stone-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Next Steps:</span>
            </div>
            <p>1. Our local city team reviews your kitchen location and contact numbers.</p>
            <p>2. You can access your Provider Dashboard right now to prepare your daily menus.</p>
            <p>3. Once approved, your listing becomes publicly discoverable in {locality}, {city}.</p>
          </div>
          <button
            onClick={() => router.push("/provider")}
            className="w-full py-3 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors"
          >
            Go to Provider Dashboard
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-card space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: BUSINESS PROFILE */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
                1. Kitchen & Contact Details
              </h3>

              <div>
                <label className="block font-semibold mb-1">Business / Kitchen Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Annapurna Ghar Ka Khana"
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="HOME_COOK">Independent Home Cook (Single Chef)</option>
                  <option value="SMALL_TIFFIN">Small Tiffin Business (Family Run)</option>
                  <option value="MEAL_PROVIDER">Commercial Meal Provider / Caterer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description & Specialties * (min 20 chars)</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your cooking style, cold-pressed oil, soft rotis, Maharashtrian / North Indian specials..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="WhatsApp number"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & SERVICE RADIUS */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
                2. Location & Delivery Radius
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Locality *</label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Kothrud / Baner"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 411038"
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Delivery Radius (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Kitchen Address (Private — not shown publicly)</label>
                <input
                  type="text"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Flat/House, Landmark, Street"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>
            </div>
          )}

          {/* STEP 3: FOOD & OPERATING SCHEDULE */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
                3. Dietary & Meal Timings
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegetarianOnly}
                    onChange={(e) => setIsVegetarianOnly(e.target.checked)}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">This is a 100% Pure Vegetarian Kitchen</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold mb-1">Lunch Cutoff Time</label>
                  <input
                    type="time"
                    value={lunchCutoffTime}
                    onChange={(e) => setLunchCutoffTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Dinner Cutoff Time</label>
                  <input
                    type="time"
                    value={dinnerCutoffTime}
                    onChange={(e) => setDinnerCutoffTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMISSION */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
                4. Review & Confirmation
              </h3>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Kitchen Name:</span>
                  <span className="font-bold text-stone-900">{businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Locality:</span>
                  <span className="font-bold text-stone-900">{locality}, {city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Contact:</span>
                  <span className="font-bold text-stone-900">{contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">WhatsApp:</span>
                  <span className="font-bold text-stone-900">{whatsappNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Type:</span>
                  <span className="font-bold text-stone-900">{isVegetarianOnly ? "Pure Veg" : "Veg & Non-Veg"}</span>
                </div>
              </div>

              <p className="text-stone-500 text-[11px] leading-relaxed">
                By submitting your application, you agree to adhere to Tiffin Finder food safety guidelines, accurate daily menu updates, and prompt delivery commitments.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 flex justify-between gap-4 border-t border-stone-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 font-semibold text-stone-700 text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
