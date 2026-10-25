"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Heart,
  Sparkles,
  MessageSquare,
  Package,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Star,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { formatFriendlyDate } from "@/lib/time";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"TRIALS" | "FAVOURITES" | "ENQUIRIES" | "SUBSCRIPTIONS" | "PROFILE">("TRIALS");
  const [user, setUser] = useState<any>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic location states
  const [locationDirectory, setLocationDirectory] = useState<{
    cities: Record<string, Array<{ id: string; locality: string; pincode: string }>>;
    cityNames: string[];
  }>({ cities: {}, cityNames: [] });

  const [profileForm, setProfileForm] = useState({
    preferredCity: "Pune",
    preferredLocality: "",
    notes: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProviderForReview, setSelectedProviderForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    fetchCustomerData();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      if (data.cities) {
        setLocationDirectory({
          cities: data.cities,
          cityNames: data.cityNames || Object.keys(data.cities),
        });
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setUser(userData.user);

      // Populate preferences
      if (userData.user.customerProfile) {
        setProfileForm({
          preferredCity: userData.user.customerProfile.preferredCity || "Pune",
          preferredLocality: userData.user.customerProfile.preferredLocality || "",
          notes: userData.user.customerProfile.notes || "",
        });
      }

      // Fetch trials
      const trialsRes = await fetch("/api/trials");
      const trialsData = await trialsRes.json();
      setTrials(trialsData.trials || []);

      // Fetch favourites
      const favRes = await fetch("/api/favourites");
      const favData = await favRes.json();
      setFavourites(favData.favourites || []);

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

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderForReview) return;
    setReviewSubmitting(true);
    setReviewSuccess("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProviderForReview.id,
          overallRating: Number(reviewRating),
          tasteRating: Number(reviewRating),
          quantityRating: Number(reviewRating),
          packagingRating: 5,
          punctualityRating: 5,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewSuccess("Review submitted successfully! Thank you for supporting local cooks.");
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccess("");
        setReviewComment("");
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
        Loading your customer dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">{user?.name}</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.email} • {user?.phone} • {user?.customerProfile?.preferredCity || "Pune"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tiffins"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs"
          >
            Find More Tiffins
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("TRIALS")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "TRIALS" ? "text-brand-600 border-b-2 border-brand-600" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Trial Requests ({trials.length})
        </button>
        <button
          onClick={() => setActiveTab("FAVOURITES")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "FAVOURITES" ? "text-brand-600 border-b-2 border-brand-600" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Saved Kitchens ({favourites.length})
        </button>
        <button
          onClick={() => setActiveTab("ENQUIRIES")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "ENQUIRIES" ? "text-brand-600 border-b-2 border-brand-600" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          My Enquiries ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab("SUBSCRIPTIONS")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "SUBSCRIPTIONS" ? "text-brand-600 border-b-2 border-brand-600" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Meal Subscriptions
        </button>
        <button
          onClick={() => setActiveTab("PROFILE")}
          className={`pb-3 relative whitespace-nowrap transition-colors ${
            activeTab === "PROFILE" ? "text-brand-600 border-b-2 border-brand-600" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          Location & Preferences
        </button>
      </div>

      {/* TAB CONTENT: TRIALS */}
      {activeTab === "TRIALS" && (
        <div className="space-y-4">
          {trials.length > 0 ? (
            trials.map((trial) => {
              const whatsappUrl = trial.provider?.whatsappNumber
                ? buildWhatsAppLink(trial.provider.whatsappNumber, trial.provider.businessName, "TRIAL")
                : null;

              return (
                <div
                  key={trial.id}
                  className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-500">{trial.referenceNo}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          trial.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-800"
                            : trial.status === "DECLINED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {trial.status}
                      </span>
                      <span className="text-xs uppercase font-bold text-stone-400">
                        {trial.mealType} • {trial.dietaryPreference}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-stone-900">{trial.provider?.businessName}</h3>
                    <div className="flex flex-wrap gap-4 text-xs text-stone-600">
                      <span>Date: <strong>{trial.requestedDate}</strong></span>
                      <span>Meals: <strong>{trial.mealCount}</strong></span>
                      <span>Delivery: <strong>{trial.deliveryLocality}</strong></span>
                    </div>

                    {trial.deliveryAddress && (
                      <p className="text-xs text-stone-500">Address: {trial.deliveryAddress}</p>
                    )}

                    {trial.providerResponse && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-stone-700">
                        <strong className="text-amber-900 block mb-0.5">Provider Response:</strong>
                        {trial.providerResponse}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-start md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
                    <div className="flex flex-wrap gap-2">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200 hover:bg-emerald-100"
                        >
                          Chat on WhatsApp
                        </a>
                      )}
                      {trial.status === "ACCEPTED" && (
                        <button
                          onClick={() => {
                            setSelectedProviderForReview(trial.provider);
                            setReviewModalOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 font-semibold text-xs border border-amber-200 hover:bg-amber-100"
                        >
                          Write Review ★
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="font-bold text-base text-stone-900">No trial requests yet</h3>
              <p className="text-xs text-stone-500">
                Found a kitchen you'd like to try? Submit a 1-day sample meal request directly from their profile.
              </p>
              <Link
                href="/tiffins"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs"
              >
                Browse Kitchens
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FAVOURITES */}
      {activeTab === "FAVOURITES" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.length > 0 ? (
            favourites.map((fav) => (
              <div
                key={fav.id}
                className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <h3 className="font-bold text-base text-stone-900">{fav.provider.businessName}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {fav.provider.locality}, {fav.provider.city}
                  </p>
                  {fav.provider.isVegetarianOnly && (
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Pure Veg
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <Link
                    href={`/tiffins/${fav.provider.slug}`}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    View Kitchen →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-12 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
              You haven't saved any kitchens yet. Click the heart icon on any kitchen profile to save it here.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ENQUIRIES */}
      {activeTab === "ENQUIRIES" && (
        <div className="space-y-4">
          {enquiries.length > 0 ? (
            enquiries.map((enq) => (
              <div key={enq.id} className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-stone-400 font-bold">{enq.referenceNo}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      enq.status === "RESPONDED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 text-sm">To: {enq.provider?.businessName}</h4>
                <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  "{enq.message}"
                </p>
                {enq.providerResponse && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-stone-700">
                    <strong className="text-amber-900 block mb-0.5">Response:</strong>
                    {enq.providerResponse}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
              No enquiries sent yet.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MEAL SUBSCRIPTIONS */}
      {activeTab === "SUBSCRIPTIONS" && (
        <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-4">
          <Package className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-stone-900">Direct Subscription Management</h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            In our launch phase, subscriptions are arranged directly between you and your verified provider via enquiry or WhatsApp.
            This ensures zero commission overhead and the best possible daily meal rates for you.
          </p>
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block text-xs text-stone-600">
            Online recurring automated payments & pause controls are slated for Phase 2.
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOCATION & PREFERENCES */}
      {activeTab === "PROFILE" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-lg font-bold text-stone-900">Your Discovery Location & Preferences</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Set your home city and locality to see personalized menus and delivery timings.
            </p>
          </div>

          {profileMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileMessage}</span>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSavingProfile(true);
              setProfileMessage("");
              try {
                const res = await fetch("/api/customer/profile", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(profileForm),
                });
                if (res.ok) {
                  setProfileMessage("Location preferences updated successfully!");
                  setTimeout(() => setProfileMessage(""), 3000);
                }
              } catch (err) {
                console.error(err);
              } finally {
                setSavingProfile(false);
              }
            }}
            className="space-y-4 max-w-lg"
          >
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Preferred City
              </label>
              <select
                value={profileForm.preferredCity}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    preferredCity: e.target.value,
                    preferredLocality: "",
                  })
                }
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
              >
                {locationDirectory.cityNames.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Preferred Locality / Neighborhood
              </label>
              <input
                type="text"
                placeholder="e.g. Kothrud, Hinjewadi, Viman Nagar"
                value={profileForm.preferredLocality}
                onChange={(e) => setProfileForm({ ...profileForm, preferredLocality: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
              />
              {/* Quick suggestions */}
              {locationDirectory.cities[profileForm.preferredCity]?.length > 0 && (
                <div className="mt-2">
                  <span className="text-[11px] text-stone-400 block mb-1">Known areas in {profileForm.preferredCity}:</span>
                  <div className="flex flex-wrap gap-1">
                    {locationDirectory.cities[profileForm.preferredCity].slice(0, 8).map((loc: { id: string; locality: string; pincode: string }) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, preferredLocality: loc.locality })}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-brand-50 hover:text-brand-700 text-stone-600 border border-stone-200 transition-colors"
                      >
                        {loc.locality}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Dietary Notes (e.g. Less spicy, Vegetarian only, Diabetic friendly)
              </label>
              <textarea
                rows={3}
                placeholder="Share any special preferences for tiffins..."
                value={profileForm.notes}
                onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              {savingProfile ? "Saving..." : "Save Preferences"}
            </button>
          </form>
        </div>
      )}

      {/* Post Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-stone-200 space-y-4">
            <h3 className="font-bold text-lg text-stone-900">Review {selectedProviderForReview?.businessName}</h3>
            {reviewSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handlePostReview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Overall Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl"
                  >
                    <option value={5}>5 Stars - Excellent Homely Food</option>
                    <option value={4}>4 Stars - Very Good Taste & Portion</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Needs Improvement</option>
                    <option value={1}>1 Star - Poor Experience</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Your Honest Feedback</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe taste, roti softness, dal aroma, and delivery punctuality..."
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-2.5 border rounded-xl font-semibold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-semibold"
                  >
                    {reviewSubmitting ? "Posting..." : "Publish Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
