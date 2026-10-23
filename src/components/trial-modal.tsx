"use client";

import React, { useState } from "react";
import { X, Calendar, MapPin, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface TrialModalProps {
  provider: {
    id: string;
    businessName: string;
    locality: string;
    city: string;
    lunchCutoffTime?: string;
    dinnerCutoffTime?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  defaultMealPriceMinor?: number;
}

export function TrialModal({ provider, isOpen, onClose, defaultMealPriceMinor = 12000 }: TrialModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [requestedDate, setRequestedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [mealType, setMealType] = useState<"LUNCH" | "DINNER">("LUNCH");
  const [mealCount, setMealCount] = useState(1);
  const [deliveryLocality, setDeliveryLocality] = useState(provider.locality);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("VEG");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          customerName,
          customerPhone,
          requestedDate,
          mealType,
          mealCount: Number(mealCount),
          deliveryLocality,
          deliveryAddress,
          dietaryPreference,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit trial request");
      }

      setSuccessResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-floating border border-stone-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successResult ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Trial Request Submitted!</h3>
            <p className="text-sm text-stone-600">
              Your request has been forwarded directly to <strong>{provider.businessName}</strong>.
            </p>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 inline-block font-mono">
              Reference ID: <strong>{successResult.trial?.referenceNo}</strong>
            </div>
            <p className="text-xs text-stone-500">
              Note: Submitting a request does not guarantee delivery. The provider will review your address and contact you to confirm.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <h2 className="text-xl font-bold text-stone-900">Request a Trial Meal</h2>
            </div>
            <p className="text-xs text-stone-500 mb-5">
              Experience the taste and portion size from <strong>{provider.businessName}</strong> before committing to a weekly or monthly subscription.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date Needed *</label>
                  <input
                    type="date"
                    required
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Meal Type *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMealType("LUNCH")}
                      className={`flex-1 py-2 rounded-lg border font-medium ${
                        mealType === "LUNCH"
                          ? "bg-brand-50 border-brand-500 text-brand-800"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      Lunch
                    </button>
                    <button
                      type="button"
                      onClick={() => setMealType("DINNER")}
                      className={`flex-1 py-2 rounded-lg border font-medium ${
                        mealType === "DINNER"
                          ? "bg-brand-50 border-brand-500 text-brand-800"
                          : "border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      Dinner
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Delivery Locality *</label>
                  <input
                    type="text"
                    required
                    value={deliveryLocality}
                    onChange={(e) => setDeliveryLocality(e.target.value)}
                    placeholder="e.g. Kothrud / Baner"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dietary Preference</label>
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="VEG">Vegetarian</option>
                    <option value="JAIN">Pure Jain (No Root Veg)</option>
                    <option value="NON_VEG">Non-Veg (If Available)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Detailed Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Flat No, Building, Landmark, Street"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Special Notes / Spice Level (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Low spice, less oil, call before arrival"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <div>
                  <span className="text-[11px] text-stone-500">Estimated Trial Price</span>
                  <div className="font-bold text-stone-900 text-sm">
                    {formatCurrency(defaultMealPriceMinor)}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Send Trial Request"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
