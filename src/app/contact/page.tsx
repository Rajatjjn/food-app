import React from "react";
import { Mail, Phone, MapPin, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Contact Tiffin Finder</h1>
        <p className="text-sm text-stone-600 max-w-lg mx-auto">
          Need help finding a tiffin provider or have questions about listing your kitchen? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <Mail className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-sm text-stone-900">Email Support</h3>
          <p className="text-xs text-stone-600">support@tiffinfinder.com</p>
          <span className="text-[11px] text-stone-400 block pt-1">Response within 24 hours</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <Phone className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-stone-900">Provider Help Desk</h3>
          <p className="text-xs text-stone-600">+91 98765 43210</p>
          <span className="text-[11px] text-stone-400 block pt-1">Mon-Sat, 9:00 AM – 7:00 PM</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <MapPin className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-sm text-stone-900">Operating Headquarters</h3>
          <p className="text-xs text-stone-600">Kothrud, Pune, Maharashtra 411038</p>
          <span className="text-[11px] text-stone-400 block pt-1">India</span>
        </div>
      </div>
    </div>
  );
}
