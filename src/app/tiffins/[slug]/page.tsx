"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Sparkles,
  Calendar,
  Utensils,
  AlertCircle,
  Heart,
  ChevronRight,
  Info,
  CheckCircle2,
  ChefHat,
  Share2,
} from "lucide-react";
import { formatCurrency, formatDietaryTags, getDietaryBadgeDetails } from "@/lib/formatters";
import { evaluateMenuFreshness, formatFriendlyDate } from "@/lib/time";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { TrialModal } from "@/components/trial-modal";
import { EnquiryModal } from "@/components/enquiry-modal";

export default function ProviderDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"TODAY" | "PLANS" | "REVIEWS" | "UPCOMING">("TODAY");

  // Modals state
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);

  useEffect(() => {
    fetchProvider();
  }, [slug]);

  const fetchProvider = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tiffins/${slug}`);
      if (!res.ok) {
        throw new Error("Provider not found");
      }
      const data = await res.json();
      setProvider(data.provider);
    } catch (err: any) {
      setError(err.message || "Failed to load provider");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavourite = async () => {
    if (!provider) return;
    setFavouriteLoading(true);
    try {
      const res = await fetch("/api/favourites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: provider.id }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setIsFavourited(data.isFavourited);
    } catch (err) {
      console.error(err);
    } finally {
      setFavouriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading home kitchen profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Kitchen Profile Not Found</h2>
        <p className="text-sm text-stone-600">The tiffin service you requested may have been relocated or updated.</p>
        <button
          onClick={() => router.push("/tiffins")}
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold"
        >
          Browse All Tiffins
        </button>
      </div>
    );
  }

  const dietaryTags = formatDietaryTags(provider.dietaryCategories);
  const whatsappUrl = buildWhatsAppLink(provider.whatsappNumber, provider.businessName, "ENQUIRY");

  // Freshness evaluations
  const lunchFreshness = provider.todayLunch
    ? evaluateMenuFreshness(
        provider.todayLunch.date,
        provider.todayLunch.cutoffTime,
        provider.todayLunch.status,
        provider.todayLunch.availableQuantity
      )
    : null;

  const dinnerFreshness = provider.todayDinner
    ? evaluateMenuFreshness(
        provider.todayDinner.date,
        provider.todayDinner.cutoffTime,
        provider.todayDinner.status,
        provider.todayDinner.availableQuantity
      )
    : null;

  return (
    <div className="pb-24">
      {/* Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-stone-900 overflow-hidden">
        <img
          src={
            provider.coverImage ||
            "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=1600&auto=format&fit=crop&q=80"
          }
          alt={provider.businessName}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleToggleFavourite}
            disabled={favouriteLoading}
            className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-colors ${
              isFavourited ? "bg-red-500 text-white" : "bg-white/90 text-stone-700 hover:text-red-500"
            }`}
            title="Save Kitchen"
          >
            <Heart className={`w-5 h-5 ${isFavourited ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Kitchen Overview & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-subtle space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {provider.verifiedBadge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-amber-600 fill-amber-100" />
                    <span>Verified Kitchen</span>
                  </span>
                )}
                {provider.isVegetarianOnly && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    100% Pure Veg
                  </span>
                )}
                {dietaryTags.map((tag: string, idx: number) => {
                  const details = getDietaryBadgeDetails(tag);
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${details.bg} ${details.text}`}
                    >
                      {details.label}
                    </span>
                  );
                })}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                  {provider.businessName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-500 mt-2">
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    {provider.locality}, {provider.city} ({provider.pincode})
                  </span>
                  <span className="capitalize">{provider.businessType.replace("_", " ").toLowerCase()}</span>
                  {provider.verifications?.[0]?.fssaiNumber && (
                    <span className="text-stone-400 font-mono">FSSAI: {provider.verifications[0].fssaiNumber}</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
                {provider.description}
              </p>

              {/* Delivery Areas */}
              <div className="pt-3 border-t border-stone-100 text-xs text-stone-600">
                <span className="font-bold text-stone-800 block mb-1">Serving Areas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {provider.serviceAreas.map((sa: any) => (
                    <span key={sa.id} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium">
                      {sa.locality} ({sa.estimatedDeliveryMin} mins delivery)
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-stone-200 gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab("TODAY")}
                className={`pb-3 relative transition-colors ${
                  activeTab === "TODAY" ? "text-brand-600 border-b-2 border-brand-600" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Today's Menu
              </button>
              <button
                onClick={() => setActiveTab("PLANS")}
                className={`pb-3 relative transition-colors ${
                  activeTab === "PLANS" ? "text-brand-600 border-b-2 border-brand-600" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Weekly & Monthly Plans ({provider.mealPlans.length})
              </button>
              <button
                onClick={() => setActiveTab("REVIEWS")}
                className={`pb-3 relative transition-colors ${
                  activeTab === "REVIEWS" ? "text-brand-600 border-b-2 border-brand-600" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Reviews & Ratings ({provider.reviewCount})
              </button>
              {provider.upcomingMenus.length > 0 && (
                <button
                  onClick={() => setActiveTab("UPCOMING")}
                  className={`pb-3 relative transition-colors ${
                    activeTab === "UPCOMING"
                      ? "text-brand-600 border-b-2 border-brand-600"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  Upcoming Schedule ({provider.upcomingMenus.length})
                </button>
              )}
            </div>

            {/* TAB CONTENT: TODAY'S LIVE MENUS */}
            {activeTab === "TODAY" && (
              <div className="space-y-6">
                {/* Lunch Menu */}
                {provider.todayLunch ? (
                  <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            ☀️ Today's Lunch
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              lunchFreshness?.isOrderingOpen
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {lunchFreshness?.statusLabel}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-stone-900">{provider.todayLunch.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-stone-900">
                          {formatCurrency(provider.todayLunch.priceMinor)}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Delivery: {provider.todayLunch.deliveryWindow || provider.lunchDeliveryWindow}
                        </div>
                      </div>
                    </div>

                    {/* Cutoff note */}
                    {provider.todayLunch.cutoffTime && (
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-4 h-4 text-brand-600" />
                          Order Cutoff Time: <strong>{provider.todayLunch.cutoffTime}</strong>
                        </span>
                        <span>Available Portions: {provider.todayLunch.availableQuantity}</span>
                      </div>
                    )}

                    {/* Dishes Breakdown */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Included Dishes</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {provider.todayLunch.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-amber-50/40 border border-amber-100/80 flex items-start justify-between"
                          >
                            <div>
                              <div className="font-bold text-stone-900 text-xs">{item.name}</div>
                              {item.description && (
                                <div className="text-[11px] text-stone-500 mt-0.5">{item.description}</div>
                              )}
                            </div>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-stone-500 border border-stone-200 shrink-0">
                              {item.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {provider.todayLunch.allergenNotes && (
                      <div className="text-xs text-stone-500 italic flex items-center gap-1.5 pt-2">
                        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>Allergen info: {provider.todayLunch.allergenNotes}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                    Today's Lunch menu has not been published yet.
                  </div>
                )}

                {/* Dinner Menu */}
                {provider.todayDinner ? (
                  <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-stone-800 text-white">
                            🌙 Today's Dinner
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              dinnerFreshness?.isOrderingOpen
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {dinnerFreshness?.statusLabel}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-stone-900">{provider.todayDinner.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-stone-900">
                          {formatCurrency(provider.todayDinner.priceMinor)}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Delivery: {provider.todayDinner.deliveryWindow || provider.dinnerDeliveryWindow}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {provider.todayDinner.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between"
                        >
                          <div>
                            <div className="font-bold text-stone-900 text-xs">{item.name}</div>
                            {item.description && (
                              <div className="text-[11px] text-stone-500 mt-0.5">{item.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                    Today's Dinner menu has not been published yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MEAL PLANS */}
            {activeTab === "PLANS" && (
              <div className="space-y-4">
                {provider.mealPlans.map((plan: any) => (
                  <div
                    key={plan.id}
                    className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between gap-6 hover:border-brand-300 transition-colors"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-brand-50 text-brand-800 border border-brand-200">
                          {plan.planType.replace("_", " ")}
                        </span>
                        {plan.hasTrial && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Trial Available
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{plan.description}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-1">
                        <span>Total Meals: <strong>{plan.mealsCount}</strong></span>
                        <span>Service Days: <strong>{plan.serviceDaysPerWeek} days/wk</strong></span>
                        {plan.pauseRules && (
                          <span className="text-amber-800 font-medium">Pause: {plan.pauseRules}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-start md:items-end shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wide">
                          Total Plan Price
                        </span>
                        <div className="text-2xl font-black text-stone-900">
                          {formatCurrency(plan.priceMinor)}
                        </div>
                        <div className="text-xs font-semibold text-brand-600 mt-0.5">
                          Effective: {formatCurrency(plan.effectiveCostPerMealMinor)}/meal
                        </div>
                      </div>

                      <button
                        onClick={() => setIsTrialModalOpen(true)}
                        className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        Request Plan Trial
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === "REVIEWS" && (
              <div className="space-y-6">
                {/* Rating Metrics Header */}
                <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                  <div className="border-r border-stone-100">
                    <span className="text-xs text-stone-400 font-bold block">Overall</span>
                    <span className="text-2xl font-black text-stone-900">{provider.ratings.overall} / 5</span>
                    <span className="text-[10px] text-stone-500 block">({provider.reviewCount} verified)</span>
                  </div>
                  <div className="border-r border-stone-100">
                    <span className="text-xs text-stone-400 font-bold block">Taste</span>
                    <span className="text-lg font-bold text-stone-900">{provider.ratings.taste} ★</span>
                  </div>
                  <div className="border-r border-stone-100">
                    <span className="text-xs text-stone-400 font-bold block">Portion</span>
                    <span className="text-lg font-bold text-stone-900">{provider.ratings.quantity} ★</span>
                  </div>
                  <div className="border-r border-stone-100">
                    <span className="text-xs text-stone-400 font-bold block">Packaging</span>
                    <span className="text-lg font-bold text-stone-900">{provider.ratings.packaging} ★</span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 font-bold block">Punctuality</span>
                    <span className="text-lg font-bold text-stone-900">{provider.ratings.punctuality} ★</span>
                  </div>
                </div>

                {/* Review Cards */}
                {provider.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {provider.reviews.map((rev: any) => (
                      <div key={rev.id} className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">{rev.customer.name}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Verified Customer
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-amber-500 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-current inline mr-1" />
                            {rev.overallRating}.0
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rev.comment}</p>

                        {/* Provider Reply */}
                        {rev.providerReply && (
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-1">
                            <span className="font-bold text-amber-900 block">
                              Response from {provider.businessName}:
                            </span>
                            <p className="text-stone-700">{rev.providerReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                    No customer reviews yet. Order a trial meal to be the first!
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: UPCOMING SCHEDULE */}
            {activeTab === "UPCOMING" && (
              <div className="space-y-4">
                {provider.upcomingMenus.map((menu: any) => (
                  <div key={menu.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-600">{formatFriendlyDate(menu.date)}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                          {menu.mealType}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-stone-900">{formatCurrency(menu.priceMinor)}</span>
                    </div>
                    <h4 className="font-bold text-sm text-stone-900">{menu.title}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                      {menu.items.map((it: any) => (
                        <span key={it.id} className="px-2 py-0.5 rounded bg-stone-100">
                          {it.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contact & Booking Sticky Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-card sticky top-24 space-y-6">
              <div>
                <span className="text-[11px] uppercase font-bold text-stone-400 block tracking-wide">
                  Starting Price
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-stone-900">
                    {formatCurrency(provider.mealPlans[0]?.priceMinor || 11000)}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">/meal</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsTrialModalOpen(true)}
                  className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Request a Trial Meal</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  onClick={() => setIsEnquiryModalOpen(true)}
                  className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors"
                >
                  Send Subscription Enquiry
                </button>
              </div>

              {/* Kitchen Contact & Timings Summary */}
              <div className="pt-4 border-t border-stone-100 space-y-3 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Direct Phone:</span>
                  <a href={`tel:${provider.contactPhone}`} className="font-semibold text-stone-800 hover:underline">
                    {provider.contactPhone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Lunch Window:</span>
                  <span className="font-medium text-stone-800">{provider.lunchDeliveryWindow}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Dinner Window:</span>
                  <span className="font-medium text-stone-800">{provider.dinnerDeliveryWindow}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Delivery Fee:</span>
                  <span className="font-medium text-stone-800">
                    {provider.deliveryFeeMinor === 0 ? "Free Local Delivery" : formatCurrency(provider.deliveryFeeMinor)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Modal Dialog */}
      <TrialModal
        provider={provider}
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        defaultMealPriceMinor={provider.mealPlans[0]?.priceMinor || 12000}
      />

      {/* Enquiry Modal Dialog */}
      <EnquiryModal
        provider={provider}
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </div>
  );
}
