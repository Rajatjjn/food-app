"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";

export default function ProviderEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (enquiryId: string) => {
    const text = replyInputs[enquiryId];
    if (!text) return;
    setReplyingId(enquiryId);
    try {
      const res = await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiryId, providerResponse: text }),
      });
      if (res.ok) {
        fetchEnquiries();
        setReplyInputs({ ...replyInputs, [enquiryId]: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyingId(null);
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
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Customer Enquiries</h1>
        <p className="text-xs text-stone-500">
          Respond to questions regarding custom monthly plans and corporate meal arrangements
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500">Loading enquiries...</div>
      ) : enquiries.length > 0 ? (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500">{enq.referenceNo}</span>
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
                <span className="text-xs text-stone-400">{new Date(enq.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-bold text-stone-900 text-sm">{enq.customerName}</span>
                <span className="text-stone-500 block">Phone: {enq.customerPhone}</span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-100 leading-relaxed">
                "{enq.message}"
              </p>

              {enq.providerResponse ? (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-stone-700 space-y-1">
                  <span className="font-bold text-amber-900 block">Your Sent Response:</span>
                  <p>{enq.providerResponse}</p>
                </div>
              ) : (
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyInputs[enq.id] || ""}
                    onChange={(e) => setReplyInputs({ ...replyInputs, [enq.id]: e.target.value })}
                    placeholder="Type your response to the customer..."
                    className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => handleSendReply(enq.id)}
                    disabled={replyingId === enq.id || !replyInputs[enq.id]}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
          No enquiries received yet.
        </div>
      )}
    </div>
  );
}
