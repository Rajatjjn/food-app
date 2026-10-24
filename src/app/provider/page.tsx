"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  Utensils,
  Calendar,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Clock,
  Plus,
  CheckCircle2,
  Copy,
  ExternalLink,
  Users,
  MapPin,
  Trash2,
  Save,
  Edit3,
  Building2,
  Navigation,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { evaluateMenuFreshness } from "@/lib/time";

export default function ProviderOverviewPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Dynamic location states
  const [locationDirectory, setLocationDirectory] = useState<{
    cities: Record<string, Array<{ id: string; locality: string; pincode: string }>>;
    cityNames: string[];
  }>({ cities: {}, cityNames: [] });

  const [isEditingLocations, setIsEditingLocations] = useState(false);
  const [savingLocations, setSavingLocations] = useState(false);
  const [locationForm, setLocationForm] = useState({
    city: "",
    locality: "",
    pincode: "",
    deliveryRadiusKm: 5,
    deliveryFee: 0,
    serviceAreas: [] as Array<{ locality: string; pincode: string }>,
  });
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityName, setCustomCityName] = useState("");
  const [newAreaLocality, setNewAreaLocality] = useState("");
  const [newAreaPincode, setNewAreaPincode] = useState("");

  useEffect(() => {
    fetchProviderData();
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

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (!authData.user || authData.user.role !== "PROVIDER") {
        router.push("/login");
        return;
      }

      if (!authData.user.providerProfile) {
        router.push("/provider/onboarding");
        return;
      }

      // Fetch full provider profile including serviceAreas
      const profileRes = await fetch("/api/provider/profile");
      const profileData = await profileRes.json();
      const profile = profileData.profile || authData.user.providerProfile;
      setProvider(profile);

      // Populate location edit form
      setLocationForm({
        city: profile.city || "Pune",
        locality: profile.locality || "",
        pincode: profile.pincode || "",
        deliveryRadiusKm: profile.deliveryRadiusKm || 5,
        deliveryFee: (profile.deliveryFeeMinor || 0) / 100,
        serviceAreas: (profile.serviceAreas || []).map((sa: any) => ({
          locality: sa.locality,
          pincode: sa.pincode,
        })),
      });

      // Fetch menus
      const menusRes = await fetch("/api/menus");
      const menusData = await menusRes.json();
      setMenus(menusData.menus || []);

      // Fetch trials
      const trialsRes = await fetch("/api/trials");
      const trialsData = await trialsRes.json();
      setTrials(trialsData.trials || []);

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

  const toggleSoldOut = async (menuId: string, currentStatus: string) => {
    const newStatus = currentStatus === "SOLD_OUT" ? "PUBLISHED" : "SOLD_OUT";
    try {
      const res = await fetch("/api/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId, status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Menu marked as ${newStatus}`);
        fetchProviderData();
        setTimeout(() => setActionMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveLocations = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLocations(true);
    const finalCity = isCustomCity ? customCityName.trim() : locationForm.city.trim();

    try {
      const res = await fetch("/api/provider/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: finalCity,
          locality: locationForm.locality.trim(),
          pincode: locationForm.pincode.trim(),
          deliveryRadiusKm: Number(locationForm.deliveryRadiusKm),
          deliveryFeeMinor: Math.round(Number(locationForm.deliveryFee) * 100),
          serviceAreas: locationForm.serviceAreas,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage("Kitchen location & service areas updated successfully!");
        setIsEditingLocations(false);
        setIsCustomCity(false);
        setCustomCityName("");
        await fetchProviderData();
        await fetchLocations();
        setTimeout(() => setActionMessage(""), 4000);
      } else {
        alert(data.error || "Failed to update locations");
      }
    } catch (err) {
      console.error("Save locations error:", err);
      alert("Network error updating locations");
    } finally {
      setSavingLocations(false);
    }
  };

  const handleAddServiceArea = () => {
    if (!newAreaLocality.trim()) return;
    const localityToAdd = newAreaLocality.trim();
    const pincodeToAdd = newAreaPincode.trim() || locationForm.pincode || "411001";

    if (locationForm.serviceAreas.some((sa) => sa.locality.toLowerCase() === localityToAdd.toLowerCase())) {
      alert("This area is already in your service list");
      return;
    }

    setLocationForm({
      ...locationForm,
      serviceAreas: [...locationForm.serviceAreas, { locality: localityToAdd, pincode: pincodeToAdd }],
    });
    setNewAreaLocality("");
    setNewAreaPincode("");
  };

  const handleRemoveServiceArea = (idx: number) => {
    setLocationForm({
      ...locationForm,
      serviceAreas: locationForm.serviceAreas.filter((_, i) => i !== idx),
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
        Loading provider kitchen...
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayLunch = menus.find((m) => m.date === today && m.mealType === "LUNCH");
  const todayDinner = menus.find((m) => m.date === today && m.mealType === "DINNER");
  const pendingTrials = trials.filter((t) => t.status === "PENDING");
  const pendingEnquiries = enquiries.filter((e) => e.status === "PENDING");

  const currentAvailableAreas = locationDirectory.cities[locationForm.city] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                provider?.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {provider?.status === "APPROVED" ? "Kitchen Active" : "Pending Verification"}
            </span>
            {provider?.verifiedBadge && (
              <span className="flex items-center gap-1 text-xs text-amber-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-600 fill-amber-100" />
                Verified
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {provider?.businessName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>
              {provider?.locality}, {provider?.city} • {provider?.serviceAreas?.length || 0} Delivery Localities
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {provider?.slug && (
            <Link
              href={`/tiffins/${provider.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href="/provider/menus"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Daily Menu</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/provider/trials"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-brand-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
            <span>Pending Trials</span>
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{pendingTrials.length}</div>
          <span className="text-[11px] text-stone-500 block mt-1">Requires your acceptance</span>
        </Link>

        <Link
          href="/provider/enquiries"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-brand-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
            <span>New Enquiries</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{pendingEnquiries.length}</div>
          <span className="text-[11px] text-stone-500 block mt-1">From potential monthly subscribers</span>
        </Link>

        <Link
          href="/provider/menus"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-brand-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
            <span>Total Menus</span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">{menus.length}</div>
          <span className="text-[11px] text-stone-500 block mt-1">Across all dates</span>
        </Link>

        <Link
          href="/provider/plans"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-brand-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-semibold mb-2">
            <span>Meal Plans</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">Manage</div>
          <span className="text-[11px] text-stone-500 block mt-1">Weekly & monthly pricing</span>
        </Link>
      </div>

      {/* DYNAMIC CITY & SERVICE AREAS SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <Navigation className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-stone-900">
                Dynamic City & Delivery Service Areas
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Add or expand the cities and neighborhood localities where you deliver tiffins.
            </p>
          </div>

          <button
            onClick={() => setIsEditingLocations(!isEditingLocations)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors self-start"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-600" />
            <span>{isEditingLocations ? "Close Editor" : "Edit Cities & Areas"}</span>
          </button>
        </div>

        {/* View mode */}
        {!isEditingLocations ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-500 block mb-1">Primary Kitchen City</span>
                <span className="text-base font-extrabold text-stone-900">{provider?.city || "Pune"}</span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-500 block mb-1">Kitchen Locality & Pin</span>
                <span className="text-base font-extrabold text-stone-900">
                  {provider?.locality || "Not set"} ({provider?.pincode || "N/A"})
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="text-[11px] font-semibold text-stone-500 block mb-1">Delivery Settings</span>
                <span className="text-base font-extrabold text-stone-900">
                  Radius: {provider?.deliveryRadiusKm || 5} km • Fee: ₹{(provider?.deliveryFeeMinor || 0) / 100}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Active Covered Service Localities ({provider?.serviceAreas?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider?.serviceAreas && provider.serviceAreas.length > 0 ? (
                  provider.serviceAreas.map((sa: any) => (
                    <span
                      key={sa.id || sa.locality}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-bold"
                    >
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>{sa.locality}</span>
                      <span className="text-[10px] text-amber-700 font-medium">({sa.pincode})</span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    No extra service areas configured. You currently deliver to {provider?.locality}.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSaveLocations} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  City
                </label>
                {!isCustomCity ? (
                  <select
                    value={locationForm.city}
                    onChange={(e) => {
                      if (e.target.value === "__NEW_CITY__") {
                        setIsCustomCity(true);
                      } else {
                        setLocationForm({ ...locationForm, city: e.target.value });
                      }
                    }}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                  >
                    {locationDirectory.cityNames.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value="__NEW_CITY__">+ Add new city...</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai, Bengaluru, Nagpur"
                      value={customCityName}
                      onChange={(e) => setCustomCityName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-brand-500 rounded-xl text-xs font-semibold focus:outline-hidden ring-2 ring-brand-100"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCity(false)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 underline block"
                    >
                      Cancel new city
                    </button>
                  </div>
                )}
              </div>

              {/* Kitchen Locality */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Kitchen Primary Area / Locality
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kothrud, Andheri West, Navrangpura"
                  value={locationForm.locality}
                  onChange={(e) => setLocationForm({ ...locationForm, locality: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                />
              </div>

              {/* Kitchen Pincode */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Area Pincode
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 411038"
                  value={locationForm.pincode}
                  onChange={(e) => setLocationForm({ ...locationForm, pincode: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            {/* Delivery Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Delivery Radius (in Kilometers)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={locationForm.deliveryRadiusKm}
                  onChange={(e) => setLocationForm({ ...locationForm, deliveryRadiusKm: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Standard Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={locationForm.deliveryFee}
                  onChange={(e) => setLocationForm({ ...locationForm, deliveryFee: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            {/* Covered Service Areas Builder */}
            <div className="pt-2 border-t border-stone-100 space-y-3">
              <label className="block text-xs font-bold text-stone-800">
                Add Delivery Areas / Localities Covered by Your Kitchen
              </label>

              {/* Quick Pick existing localities from city directory */}
              {currentAvailableAreas.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-500 font-medium">
                    Quick-add popular localities in {locationForm.city}:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {currentAvailableAreas.map((loc) => {
                      const isAdded = locationForm.serviceAreas.some(
                        (sa) => sa.locality.toLowerCase() === loc.locality.toLowerCase()
                      );
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            if (!isAdded) {
                              setLocationForm({
                                ...locationForm,
                                serviceAreas: [
                                  ...locationForm.serviceAreas,
                                  { locality: loc.locality, pincode: loc.pincode },
                                ],
                              });
                            }
                          }}
                          disabled={isAdded}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                            isAdded
                              ? "bg-stone-200 text-stone-400 border-transparent cursor-not-allowed"
                              : "bg-white hover:bg-brand-50 text-stone-700 border-stone-300 hover:border-brand-300"
                          }`}
                        >
                          + {loc.locality}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom Area & Pincode input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Enter custom area / neighborhood name"
                  value={newAreaLocality}
                  onChange={(e) => setNewAreaLocality(e.target.value)}
                  className="flex-1 p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                />
                <input
                  type="text"
                  placeholder="Area pincode"
                  maxLength={6}
                  value={newAreaPincode}
                  onChange={(e) => setNewAreaPincode(e.target.value)}
                  className="w-full sm:w-36 p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddServiceArea}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Area</span>
                </button>
              </div>

              {/* Service Areas Tag List */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-stone-600 block mb-2">
                  Areas currently added to your delivery coverage:
                </span>
                <div className="flex flex-wrap gap-2">
                  {locationForm.serviceAreas.map((sa, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold"
                    >
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      <span>{sa.locality}</span>
                      <span className="text-[10px] text-brand-700">({sa.pincode})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveServiceArea(idx)}
                        className="ml-1 text-stone-400 hover:text-red-600 p-0.5 rounded-md"
                        title="Remove area"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {locationForm.serviceAreas.length === 0 && (
                    <span className="text-xs text-stone-400 italic">
                      No delivery areas selected yet. Add areas above.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
              <button
                type="submit"
                disabled={savingLocations}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingLocations ? "Saving Changes..." : "Save Location & Service Areas"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditingLocations(false)}
                className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Today's Live Menus Quick Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Today's Menus Status ({today})</h2>
          <Link href="/provider/menus" className="text-xs font-semibold text-brand-600 hover:underline">
            Manage Menus →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lunch Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900">
                ☀️ Today's Lunch
              </span>
              {todayLunch && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    todayLunch.status === "SOLD_OUT"
                      ? "bg-red-100 text-red-800"
                      : todayLunch.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {todayLunch.status}
                </span>
              )}
            </div>

            {todayLunch ? (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-stone-900">{todayLunch.title}</h3>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Price: {formatCurrency(todayLunch.priceMinor)}</span>
                  <span>Portions Remaining: {todayLunch.availableQuantity}</span>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => toggleSoldOut(todayLunch.id, todayLunch.status)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      todayLunch.status === "SOLD_OUT"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    {todayLunch.status === "SOLD_OUT" ? "Mark Available Again" : "Mark Sold Out"}
                  </button>
                  <Link
                    href={`/provider/menus?edit=${todayLunch.id}`}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-stone-500">No Lunch menu published for today.</p>
                <Link
                  href="/provider/menus?mealType=LUNCH"
                  className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
                >
                  Create Lunch Menu
                </Link>
              </div>
            )}
          </div>

          {/* Dinner Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-stone-800 text-white">
                🌙 Today's Dinner
              </span>
              {todayDinner && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    todayDinner.status === "SOLD_OUT"
                      ? "bg-red-100 text-red-800"
                      : todayDinner.status === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {todayDinner.status}
                </span>
              )}
            </div>

            {todayDinner ? (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-stone-900">{todayDinner.title}</h3>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Price: {formatCurrency(todayDinner.priceMinor)}</span>
                  <span>Portions Remaining: {todayDinner.availableQuantity}</span>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => toggleSoldOut(todayDinner.id, todayDinner.status)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      todayDinner.status === "SOLD_OUT"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    {todayDinner.status === "SOLD_OUT" ? "Mark Available Again" : "Mark Sold Out"}
                  </button>
                  <Link
                    href={`/provider/menus?edit=${todayDinner.id}`}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-stone-500">No Dinner menu published for today.</p>
                <Link
                  href="/provider/menus?mealType=DINNER"
                  className="inline-block px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
                >
                  Create Dinner Menu
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
