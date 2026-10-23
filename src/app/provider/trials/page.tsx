"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, Clock, MapPin, MessageSquare } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function ProviderTrialsPage() {
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseInputs, setResponseInputs] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTrials();
  }, []);

  const fetchTrials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trials");
      const data = await res.json();
      setTrials(data.trials || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (trialId: string, status: "ACCEPTED" | "DECLINED" | "COMPLETED") => {
    setActionLoading(trialId);
    try {
      const res = await fetch("/api/trials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trialId,
          status,
          providerResponse: responseInputs[trialId] || (status === "ACCEPTED" ? "Accepted! We will deliver during the designated delivery window." : "Sorry, we are unable to accept this trial request."),
        }),
      });

      if (res.ok) {
        fetchTrials();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          href="/provider"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Manage Trial Requests</h1>
        <p className="text-xs text-stone-500">
          Review customer sample meal requests and coordinate delivery
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500">Loading trial requests...</div>
      ) : trials.length > 0 ? (
        <div className="space-y-4">
          {trials.map((trial) => {
            const whatsappUrl = buildWhatsAppLink(trial.customerPhone, trial.customerName, "TRIAL");

            return (
              <div
                key={trial.id}
                className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
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
                  <span className="text-xs text-stone-400">{new Date(trial.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-stone-400 font-semibold block">Customer Details:</span>
                    <div className="font-bold text-stone-900 text-sm">{trial.customerName}</div>
                    <div className="text-stone-600">Phone: {trial.customerPhone}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-stone-400 font-semibold block">Delivery Address:</span>
                    <div className="font-medium text-stone-800">{trial.deliveryAddress}</div>
                    <div className="text-stone-500">Locality: {trial.deliveryLocality}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span>Requested Date: <strong>{trial.requestedDate}</strong></span>
                  <span>Portions: <strong>{trial.mealCount}</strong></span>
                  {trial.notes && <span>Notes: "{trial.notes}"</span>}
                </div>

                {/* Status response note if already answered */}
                {trial.providerResponse && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-stone-700">
                    <strong className="text-amber-900 block mb-0.5">Your Response:</strong>
                    {trial.providerResponse}
                  </div>
                )}

                {/* Action Controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Customer</span>
                  </a>

                  {trial.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(trial.id, "DECLINED")}
                        disabled={actionLoading === trial.id}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(trial.id, "ACCEPTED")}
                        disabled={actionLoading === trial.id}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                      >
                        Accept Trial Meal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
          No trial requests received yet.
        </div>
      )}
    </div>
  );
}
