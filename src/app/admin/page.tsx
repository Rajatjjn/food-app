"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  ChefHat,
  Users,
  Utensils,
  Sparkles,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  Globe,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [cityGroups, setCityGroups] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeSection, setActiveSection] = useState<"PROVIDERS" | "LOCATIONS" | "AUDIT">("PROVIDERS");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New location form state
  const [newCity, setNewCity] = useState("");
  const [newLocality, setNewLocality] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [newState, setNewState] = useState("Maharashtra");
  const [locationSubmitting, setLocationSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminData();
    fetchLocations();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.status === 403 || statsRes.status === 401) {
        router.push("/login");
        return;
      }
      const statsData = await statsRes.json();
      setStats(statsData.stats);
      setAuditLogs(statsData.recentAuditLogs || []);

      const providersRes = await fetch("/api/admin/providers");
      const providersData = await providersRes.json();
      setProviders(providersData.providers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(data.locations || []);
      setCityGroups(data.cities || {});
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProvider = async (
    providerId: string,
    status: "APPROVED" | "REJECTED" | "SUSPENDED",
    verifiedBadge = false
  ) => {
    setActionLoading(providerId);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          status,
          verifiedBadge,
          remarks: `Admin status update to ${status}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setFeedback(data.message);
      fetchAdminData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity || !newLocality || !newPincode) return;
    setLocationSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: newCity,
          locality: newLocality,
          pincode: newPincode,
          state: newState,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add location");
      }

      setFeedback(data.message);
      setNewLocality("");
      setNewPincode("");
      fetchLocations();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLocationSubmitting(false);
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from active service areas?`)) return;
    try {
      const res = await fetch(`/api/locations?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback(`Removed ${name}`);
        fetchLocations();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-stone-500">
        Authenticating administrator session...
      </div>
    );
  }

  const filteredProviders =
    filterStatus === "ALL" ? providers : providers.filter((p) => p.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-purple-100 text-purple-800">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
              Platform Administration
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">System Control Panel</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real platform metrics, dynamic cities & localities directory, and provider verifications
          </p>
        </div>

        {/* Primary Section Switcher */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200">
          <button
            onClick={() => setActiveSection("PROVIDERS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === "PROVIDERS"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Kitchens ({providers.length})
          </button>
          <button
            onClick={() => setActiveSection("LOCATIONS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSection === "LOCATIONS"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-brand-600" />
            <span>Cities & Areas ({locations.length})</span>
          </button>
          <button
            onClick={() => setActiveSection("AUDIT")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === "AUDIT"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Real Aggregate Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              All Providers
            </span>
            <div className="text-2xl font-black text-stone-900">{stats.totalProviders}</div>
            <span className="text-[10px] text-stone-500">{stats.approvedProviders} Approved</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs border-l-4 border-l-amber-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
              Pending Verification
            </span>
            <div className="text-2xl font-black text-amber-900">{stats.pendingProviders}</div>
            <span className="text-[10px] text-stone-500">Requires review</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Active Cities
            </span>
            <div className="text-2xl font-black text-brand-600">{Object.keys(cityGroups).length}</div>
            <span className="text-[10px] text-stone-500">{locations.length} total areas</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Today's Live Menus
            </span>
            <div className="text-2xl font-black text-emerald-600">{stats.todayPublishedMenus}</div>
            <span className="text-[10px] text-stone-500">Published today</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Trial Requests
            </span>
            <div className="text-2xl font-black text-stone-900">{stats.totalTrialRequests}</div>
            <span className="text-[10px] text-stone-500">{stats.pendingTrialRequests} pending</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Published Reviews
            </span>
            <div className="text-2xl font-black text-stone-900">{stats.totalReviews}</div>
          </div>
        </div>
      )}

      {/* SECTION 1: DYNAMIC LOCATIONS & AREAS MANAGEMENT */}
      {activeSection === "LOCATIONS" && (
        <div className="space-y-8">
          {/* Add City & Locality Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Plus className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-stone-900">Add New City & Service Area</h2>
            </div>
            <p className="text-xs text-stone-500">
              Expanding to new cities (e.g. Mumbai, Delhi, Hyderabad, Ahmedabad) or adding new residential colonies.
            </p>

            <form onSubmit={handleAddLocation} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs pt-2">
              <div>
                <label className="block font-semibold mb-1 text-stone-700">City Name *</label>
                <input
                  type="text"
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="e.g. Mumbai / Pune"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-stone-700">Locality / Area Name *</label>
                <input
                  type="text"
                  required
                  value={newLocality}
                  onChange={(e) => setNewLocality(e.target.value)}
                  placeholder="e.g. Andheri West / Powai / Kothrud"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700">Pincode *</label>
                <input
                  type="text"
                  required
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  placeholder="e.g. 400058"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-medium"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={locationSubmitting}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  {locationSubmitting ? "Adding..." : "Add Area"}
                </button>
              </div>
            </form>
          </div>

          {/* Active Cities & Localities Breakdown */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-stone-900">Current Supported Cities & Coverage</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(cityGroups).map((cityName) => (
                <div key={cityName} className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-600" />
                      <h4 className="font-bold text-base text-stone-900">{cityName}</h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {cityGroups[cityName].length} Areas
                    </span>
                  </div>

                  <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1 text-xs">
                    {cityGroups[cityName].map((item: any) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-stone-900">{item.locality}</span>
                          <span className="text-stone-400 font-mono text-[11px] ml-2">({item.pincode})</span>
                        </div>
                        <button
                          onClick={() => handleDeleteLocation(item.id, `${item.locality}, ${cityName}`)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          title="Remove Area"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PROVIDER MANAGEMENT */}
      {activeSection === "PROVIDERS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-stone-900">Provider Listings & Applications</h2>

            {/* Status Tabs */}
            <div className="flex gap-2">
              {["ALL", "PENDING", "APPROVED", "SUSPENDED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === st
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredProviders.map((prov) => (
              <div
                key={prov.id}
                className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col lg:flex-row justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        prov.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : prov.status === "PENDING"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {prov.status}
                    </span>
                    {prov.verifiedBadge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-600" />
                        Verified Badge Active
                      </span>
                    )}
                    <span className="text-xs text-stone-400 capitalize">
                      {prov.businessType.replace("_", " ").toLowerCase()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-stone-900">{prov.businessName}</h3>
                  <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">{prov.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-1">
                    <span>Chef: <strong>{prov.user?.name}</strong></span>
                    <span>Contact: <strong>{prov.contactPhone}</strong></span>
                    <span>City: <strong>{prov.locality}, {prov.city}</strong></span>
                    <span>Total Menus: <strong>{prov._count.menus}</strong></span>
                    <span>Meal Plans: <strong>{prov._count.mealPlans}</strong></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col justify-center items-start lg:items-end gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                  <div className="flex flex-wrap gap-2">
                    {prov.status !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdateProvider(prov.id, "APPROVED", true)}
                        disabled={actionLoading === prov.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        Approve & Verify
                      </button>
                    )}

                    {prov.status === "APPROVED" && !prov.verifiedBadge && (
                      <button
                        onClick={() => handleUpdateProvider(prov.id, "APPROVED", true)}
                        disabled={actionLoading === prov.id}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-semibold text-xs"
                      >
                        Award Verified Badge
                      </button>
                    )}

                    {prov.status === "APPROVED" && (
                      <button
                        onClick={() => handleUpdateProvider(prov.id, "SUSPENDED", false)}
                        disabled={actionLoading === prov.id}
                        className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
                      >
                        Suspend Kitchen
                      </button>
                    )}

                    {prov.status === "PENDING" && (
                      <button
                        onClick={() => handleUpdateProvider(prov.id, "REJECTED", false)}
                        disabled={actionLoading === prov.id}
                        className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
                      >
                        Reject Application
                      </button>
                    )}

                    <Link
                      href={`/tiffins/${prov.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:text-stone-900"
                      title="Preview Public Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: AUDIT LOGS */}
      {activeSection === "AUDIT" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900">Administrative Audit Trail</h2>
          <div className="bg-white rounded-3xl border border-stone-200 divide-y divide-stone-100 text-xs shadow-xs">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-stone-900">{log.action}</span>
                    <span className="text-stone-400 ml-2">by {log.user?.name || "System Administrator"}</span>
                    {log.details && (
                      <span className="text-stone-500 font-mono text-[11px] block mt-0.5">
                        Details: {log.details}
                      </span>
                    )}
                  </div>
                  <span className="text-stone-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-stone-400">No audit logs recorded yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
