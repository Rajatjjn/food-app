import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-stone-700">
      <h1 className="text-3xl font-extrabold text-stone-900">Terms of Service</h1>
      <p className="text-xs text-stone-500">Effective Date: October 2026</p>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-stone-900">1. Platform Scope</h2>
        <p>
          Tiffin Finder connects customers with independent tiffin services and meal providers. Providers are independent
          cooks and businesses responsible for food preparation, quality, packaging, and timely delivery.
        </p>

        <h2 className="text-lg font-bold text-stone-900">2. Enquiries and Trial Requests</h2>
        <p>
          Submitting a trial request or enquiry through the platform does not constitute a guaranteed delivery until the
          provider explicitly accepts and confirms terms directly with the customer.
        </p>

        <h2 className="text-lg font-bold text-stone-900">3. Verified Reviews</h2>
        <p>
          Reviews may only be submitted by verified customers who have transacted or engaged in an accepted trial or meal
          order with the respective kitchen. We prohibit fabricated ratings or malicious review manipulation.
        </p>
      </section>
    </div>
  );
}
