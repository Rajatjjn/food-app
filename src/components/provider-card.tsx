"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, MapPin, Clock, MessageSquare, ArrowRight, Utensils, Sparkles } from "lucide-react";
import { formatCurrency, formatDietaryTags, getDietaryBadgeDetails } from "@/lib/formatters";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface ProviderCardProps {
  provider: {
    id: string;
    businessName: string;
    slug: string;
    businessType: string;
    description: string;
    city: string;
    locality: string;
    startingPriceMinor: number;
    verifiedBadge: boolean;
    profileImage?: string | null;
    coverImage?: string | null;
    whatsappNumber: string;
    averageRating: number;
    reviewCount: number;
    hasTrialAvailable: boolean;
    hasTodayMenu: boolean;
    dietaryCategories?: string;
    isVegetarianOnly?: boolean;
    todayLunchMenu?: {
      title: string;
      priceMinor: number;
      cutoffTime?: string;
    } | null;
  };
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const dietaryTags = formatDietaryTags(provider.dietaryCategories);
  const whatsappUrl = buildWhatsAppLink(provider.whatsappNumber, provider.businessName, "ENQUIRY");

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 shadow-subtle hover:shadow-card hover:border-brand-200 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Cover / Image Header */}
      <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
        <img
          src={provider.coverImage || provider.profileImage || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"}
          alt={provider.businessName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Floating Verified Badge */}
        {provider.verifiedBadge && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs text-xs font-semibold text-amber-900 border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 fill-amber-100" />
            <span>Verified Kitchen</span>
          </div>
        )}

        {/* Trial Badge */}
        {provider.hasTrialAvailable && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-600/95 text-white backdrop-blur-md text-[11px] font-bold shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>Trial Available</span>
          </div>
        )}

        {/* Rating Floating Tag */}
        {provider.reviewCount > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900/90 text-white backdrop-blur-md text-xs font-bold shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{provider.averageRating}</span>
            <span className="text-stone-300 text-[10px] font-normal">({provider.reviewCount})</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Locality & Dietary row */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="flex items-center gap-1 text-stone-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              {provider.locality}, {provider.city}
            </span>
            <span className="capitalize text-stone-500 font-medium">
              {provider.businessType.replace("_", " ").toLowerCase()}
            </span>
          </div>

          {/* Business Name */}
          <Link href={`/tiffins/${provider.slug}`}>
            <h3 className="font-bold text-lg text-stone-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {provider.businessName}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
            {provider.description}
          </p>

          {/* Dietary Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {provider.isVegetarianOnly && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Pure Veg
              </span>
            )}
            {dietaryTags.map((tag, idx) => {
              const details = getDietaryBadgeDetails(tag);
              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border ${details.bg} ${details.text}`}
                >
                  {details.label}
                </span>
              );
            })}
          </div>

          {/* Today's Menu Highlight (Freshness proof!) */}
          {provider.hasTodayMenu && provider.todayLunchMenu ? (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
              <div className="flex items-center justify-between font-semibold text-amber-900 mb-1">
                <span className="flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  Today's Lunch Menu
                </span>
                {provider.todayLunchMenu.cutoffTime && (
                  <span className="text-[10px] text-amber-800 font-normal flex items-center gap-0.5">
                    <Clock className="w-3 h-3 inline" /> Cutoff {provider.todayLunchMenu.cutoffTime}
                  </span>
                )}
              </div>
              <p className="text-stone-700 font-medium line-clamp-1">
                {provider.todayLunchMenu.title}
              </p>
            </div>
          ) : (
            <div className="mt-3 p-2 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Weekly & monthly meal plans available</span>
            </div>
          )}
        </div>

        {/* Pricing & Actions Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wide">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-stone-900">
                {formatCurrency(provider.startingPriceMinor)}
              </span>
              <span className="text-xs text-stone-500">/meal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Direct Chat Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            {/* View Details Link */}
            <Link
              href={`/tiffins/${provider.slug}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>View Kitchen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
