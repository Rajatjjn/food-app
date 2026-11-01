import React from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Contact Tiffin Finder</h1>
        <p className="text-sm text-stone-600 max-w-lg mx-auto">
          Need help finding a tiffin provider or have questions about listing your kitchen? We are here to help.
        </p>
      </div>

      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        <a
          href="mailto:rajatjjn0510@gmail.com"
          className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-brand-400 hover:shadow-subtle transition-all block group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-stone-900 pt-1">Email Support</h3>
          <p className="text-xs font-medium text-brand-600 hover:underline">rajatjjn0510@gmail.com</p>
          <span className="text-[11px] text-stone-400 block pt-1">Response within 24 hours</span>
        </a>

        <a
          href="tel:+917742552333"
          className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2 hover:border-emerald-400 hover:shadow-subtle transition-all block group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-stone-900 pt-1">Provider & Help Desk</h3>
          <p className="text-xs font-medium text-emerald-700">+91 77425 52333</p>
          <span className="text-[11px] text-stone-400 block pt-1">Mon-Sat, 9:00 AM – 7:00 PM</span>
        </a>
      </div>
    </div>
  );
}

