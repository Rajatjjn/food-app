import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-stone-700">
      <h1 className="text-3xl font-extrabold text-stone-900">Privacy Policy</h1>
      <p className="text-xs text-stone-500">Effective Date: October 2026</p>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-stone-900">1. Information We Collect</h2>
        <p>
          We collect personal information necessary to deliver our services, including name, phone number, email address,
          and locality. For providers, we collect business name, contact details, service localities, and business
          verification documentation where submitted.
        </p>

        <h2 className="text-lg font-bold text-stone-900">2. Address Privacy</h2>
        <p>
          We do not publicly expose home kitchen addresses on discovery pages. Only locality-level and service area
          information is publicly shown to customers searching for food in their neighbourhood.
        </p>

        <h2 className="text-lg font-bold text-stone-900">3. Contact with Providers</h2>
        <p>
          When you submit a trial request or click the WhatsApp chat action, your contact details and message are shared
          directly with the chosen meal provider to facilitate food coordination.
        </p>
      </section>
    </div>
  );
}
