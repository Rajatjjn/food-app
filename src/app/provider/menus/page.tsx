"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Plus,
  Trash2,
  Copy,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { getBusinessDateString } from "@/lib/time";

export default function DailyMenuEditorPage() {
  const router = useRouter();
  const todayStr = getBusinessDateString(0);
  const tomorrowStr = getBusinessDateString(1);
  const yesterdayStr = getBusinessDateString(-1);

  const [date, setDate] = useState(todayStr);
  const [mealType, setMealType] = useState<"LUNCH" | "DINNER">("LUNCH");
  const [title, setTitle] = useState("");
  const [priceRupees, setPriceRupees] = useState("120");
  const [availableQuantity, setAvailableQuantity] = useState("40");
  const [cutoffTime, setCutoffTime] = useState("10:30");
  const [deliveryWindow, setDeliveryWindow] = useState("12:15 - 13:45");
  const [dietaryTags, setDietaryTags] = useState<string[]>(["VEG"]);
  const [allergenNotes, setAllergenNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [items, setItems] = useState<Array<{ name: string; description: string; category: string }>>([
    { name: "Paneer Butter Masala", description: "Rich homestyle tomato-cashew gravy", category: "MAIN" },
    { name: "Yellow Dal Tadka", description: "Tempered with cumin & hing", category: "CURRY" },
    { name: "4 Whole Wheat Phulkas", description: "Soft rotis with pure cow ghee", category: "BREAD" },
    { name: "Steamed Jeera Rice", description: "Fragrant basmati rice", category: "RICE" },
  ]);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pastMenus, setPastMenus] = useState<any[]>([]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      const data = await res.json();
      setPastMenus(data.menus || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", description: "", category: "MAIN" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleCopyYesterday = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COPY_FROM_DATE",
          sourceDate: yesterdayStr,
          targetDate: date,
          mealType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No menu found from yesterday to copy");
      }

      setFeedback({ type: "success", msg: data.message });
      fetchMenus();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const filteredItems = items.filter((it) => it.name.trim().length > 0);
    if (filteredItems.length === 0) {
      setFeedback({ type: "error", msg: "Please add at least one dish item" });
      setLoading(false);
      return;
    }

    try {
      const priceMinor = Math.round(parseFloat(priceRupees) * 100);
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          mealType,
          title,
          priceMinor,
          availableQuantity: parseInt(availableQuantity, 10),
          status: "PUBLISHED",
          cutoffTime,
          deliveryWindow,
          dietaryTags,
          allergenNotes,
          customerNotes,
          items: filteredItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish menu");
      }

      setFeedback({ type: "success", msg: data.message });
      fetchMenus();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/provider"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Daily Menu Publisher</h1>
          <p className="text-xs text-stone-500">
            Publish today's fresh dishes or schedule upcoming lunch and dinner menus
          </p>
        </div>

        {/* Quick Fast Copy Button */}
        <button
          type="button"
          onClick={handleCopyYesterday}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Yesterday's Menu</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Main Menu Creation Form */}
      <form onSubmit={handlePublish} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-card space-y-6 text-xs">
        {/* Date and Meal Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-stone-100">
          <div>
            <label className="block font-semibold mb-1">Menu Date *</label>
            <div className="flex gap-2">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-stone-300 font-medium"
              />
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  date === todayStr ? "bg-brand-50 border-brand-500 text-brand-800" : "border-stone-200"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(tomorrowStr)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  date === tomorrowStr ? "bg-brand-50 border-brand-500 text-brand-800" : "border-stone-200"
                }`}
              >
                Tomorrow
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Meal Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMealType("LUNCH");
                  setCutoffTime("10:30");
                  setDeliveryWindow("12:15 - 13:45");
                }}
                className={`py-2.5 rounded-xl border font-bold text-center ${
                  mealType === "LUNCH"
                    ? "bg-amber-100 border-amber-400 text-amber-950"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                ☀️ Lunch
              </button>
              <button
                type="button"
                onClick={() => {
                  setMealType("DINNER");
                  setCutoffTime("18:30");
                  setDeliveryWindow("19:45 - 21:15");
                }}
                className={`py-2.5 rounded-xl border font-bold text-center ${
                  mealType === "DINNER"
                    ? "bg-stone-900 border-stone-900 text-white"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                🌙 Dinner
              </button>
            </div>
          </div>
        </div>

        {/* Title & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Menu Title / Special Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Homestyle Paneer Bhurji & Moong Dal Tadka Thali"
              className="w-full p-2.5 rounded-xl border border-stone-300 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Single Meal Price (₹) *</label>
            <input
              type="number"
              required
              min="10"
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
            />
          </div>
        </div>

        {/* Timings & Portions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Order Cutoff Time *</label>
            <input
              type="time"
              required
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Delivery Window</label>
            <input
              type="text"
              value={deliveryWindow}
              onChange={(e) => setDeliveryWindow(e.target.value)}
              placeholder="e.g. 12:15 - 13:45"
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Available Quantity</label>
            <input
              type="number"
              min="1"
              value={availableQuantity}
              onChange={(e) => setAvailableQuantity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>
        </div>

        {/* Dishes Breakdown (Dynamic Items) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-stone-900 text-sm">Dishes in this Thali / Box *</label>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Dish
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <input
                  type="text"
                  required
                  value={item.name}
                  onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                  placeholder="Dish name (e.g. 4 Phulkas / Dal Tadka)"
                  className="flex-1 p-2 rounded-lg border border-stone-300 bg-white"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                  placeholder="Short description (optional)"
                  className="flex-1 p-2 rounded-lg border border-stone-300 bg-white"
                />
                <select
                  value={item.category}
                  onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                  className="p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="MAIN">Main</option>
                  <option value="CURRY">Curry/Dal</option>
                  <option value="BREAD">Roti/Bread</option>
                  <option value="RICE">Rice</option>
                  <option value="DESSERT">Sweet</option>
                  <option value="SALAD">Salad</option>
                </select>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Allergen Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-semibold mb-1">Customer Special Note</label>
            <input
              type="text"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Cooked with pure cow ghee & whole spices"
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Allergen Information</label>
            <input
              type="text"
              value={allergenNotes}
              onChange={(e) => setAllergenNotes(e.target.value)}
              placeholder="e.g. Contains Dairy (Ghee, Paneer)"
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Menu to Live Site"}
          </button>
        </div>
      </form>

      {/* Past Published Menus Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-stone-900">Recently Published Menus</h2>
        <div className="space-y-3">
          {pastMenus.slice(0, 5).map((m) => (
            <div key={m.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{m.date}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                    {m.mealType}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">{m.status}</span>
                </div>
                <p className="text-stone-600 font-medium">{m.title}</p>
              </div>

              <div className="text-right">
                <span className="font-bold text-stone-900">{formatCurrency(m.priceMinor)}</span>
                <span className="text-stone-400 block text-[10px]">{m.items?.length || 0} dishes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
