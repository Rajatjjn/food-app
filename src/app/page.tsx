import React from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Utensils,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChefHat,
  HeartHandshake,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBusinessDateString } from "@/lib/time";
import { ProviderCard } from "@/components/provider-card";

export const revalidate = 60; // Refresh every minute

export default async function HomePage() {
  const todayDate = getBusinessDateString(0);

  // Fetch verified & approved providers for "Featured"
  const featuredProviders = await prisma.providerProfile.findMany({
    where: {
      status: "APPROVED",
      verifiedBadge: true,
    },
    include: {
      serviceAreas: true,
      mealPlans: { where: { isActive: true } },
      menus: {
        where: { date: todayDate },
        include: { items: true },
      },
      reviews: { where: { status: "PUBLISHED" } },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Fetch providers with menus updated today
  const todayUpdatedProviders = await prisma.providerProfile.findMany({
    where: {
      status: "APPROVED",
      menus: {
        some: { date: todayDate, status: "PUBLISHED" },
      },
    },
    include: {
      serviceAreas: true,
      mealPlans: { where: { isActive: true } },
      menus: {
        where: { date: todayDate },
        include: { items: true },
      },
      reviews: { where: { status: "PUBLISHED" } },
    },
    take: 4,
  });

  // Map to ProviderCard friendly props
  const mapProvider = (provider: any) => {
    const reviewCount = provider.reviews.length;
    const averageRating =
      reviewCount > 0
        ? Number((provider.reviews.reduce((acc: number, r: any) => acc + r.overallRating, 0) / reviewCount).toFixed(1))
        : 0;

    const planPrices = provider.mealPlans.map((p: any) => p.effectiveCostPerMealMinor || p.priceMinor);
    const menuPrices = provider.menus.map((m: any) => m.priceMinor);
    const allPrices = [...planPrices, ...menuPrices];
    const startingPriceMinor = allPrices.length > 0 ? Math.min(...allPrices) : 10000;

    const todayLunch = provider.menus.find((m: any) => m.mealType === "LUNCH" && m.status === "PUBLISHED");

    return {
      id: provider.id,
      businessName: provider.businessName,
      slug: provider.slug,
      businessType: provider.businessType,
      description: provider.description,
      city: provider.city,
      locality: provider.locality,
      startingPriceMinor,
      verifiedBadge: provider.verifiedBadge,
      profileImage: provider.profileImage,
      coverImage: provider.coverImage,
      whatsappNumber: provider.whatsappNumber,
      averageRating,
      reviewCount,
      hasTrialAvailable: provider.mealPlans.some((p: any) => p.hasTrial),
      hasTodayMenu: provider.menus.some((m: any) => m.status === "PUBLISHED"),
      dietaryCategories: provider.dietaryCategories,
      isVegetarianOnly: provider.isVegetarianOnly,
      todayLunchMenu: todayLunch
        ? {
            title: todayLunch.title,
            priceMinor: todayLunch.priceMinor,
            cutoffTime: todayLunch.cutoffTime,
          }
        : null,
    };
  };

  const formattedFeatured = featuredProviders.map(mapProvider);
  const formattedToday = todayUpdatedProviders.map(mapProvider);

  // Query dynamic locations from database with real provider count
  const dbLocations = await prisma.location.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { locality: "asc" },
  });

  const popularLocalities = await Promise.all(
    dbLocations.map(async (loc) => {
      const count = await prisma.providerProfile.count({
        where: {
          status: "APPROVED",
          OR: [
            { locality: loc.locality },
            { serviceAreas: { some: { locality: loc.locality } } },
          ],
        },
      });
      return {
        name: loc.locality,
        city: loc.city,
        count: count > 0 ? `${count} Active ${count === 1 ? "Service" : "Services"}` : "Expanding",
      };
    })
  );

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-amber-50/20 to-transparent pt-12 pb-20 border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Authentic Ghar Ka Khana • Direct Kitchen Contact</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Find Your Everyday <span className="text-brand-600 underline decoration-amber-400">Home-Style</span> Food.
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Discover affordable daily tiffin services, explore today's actual live menu, and subscribe to flexible meal
              plans from verified home cooks and small kitchens near you.
            </p>

            {/* Prominent Search Card */}
            <div className="mt-8 p-3 sm:p-4 rounded-2xl bg-white shadow-floating border border-stone-200">
              <form action="/tiffins" method="GET" className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800">
                  <MapPin className="w-5 h-5 text-brand-600 shrink-0" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Enter locality, area or pincode (e.g. Kothrud, Baner, 411038)"
                    className="w-full bg-transparent border-none outline-none text-sm placeholder:text-stone-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Tiffins</span>
                </button>
              </form>

              {/* Quick Filter Badges */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-stone-400 font-medium">Quick Filters:</span>
                <Link
                  href="/tiffins?mealType=LUNCH"
                  className="px-3 py-1 rounded-full bg-stone-100 hover:bg-brand-50 hover:text-brand-700 font-medium transition-colors"
                >
                  ☀️ Lunch Tiffins
                </Link>
                <Link
                  href="/tiffins?mealType=DINNER"
                  className="px-3 py-1 rounded-full bg-stone-100 hover:bg-brand-50 hover:text-brand-700 font-medium transition-colors"
                >
                  🌙 Dinner Tiffins
                </Link>
                <Link
                  href="/tiffins?dietary=VEG"
                  className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium border border-emerald-200 transition-colors"
                >
                  🌱 Pure Vegetarian
                </Link>
                <Link
                  href="/tiffins?dietary=JAIN"
                  className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 hover:bg-teal-100 font-medium border border-teal-200 transition-colors"
                >
                  🪷 Jain Rasoi
                </Link>
                <Link
                  href="/tiffins?trialOnly=true"
                  className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 hover:bg-amber-100 font-medium border border-amber-200 transition-colors"
                >
                  ✨ Trial Available
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menus Updated Today Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              <span>Menu Freshness Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Menus Updated Today
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Providers who have published their actual dishes and preparation timings for today.
            </p>
          </div>
          <Link
            href="/tiffins?updatedToday=true"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>View all live menus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {formattedToday.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {formattedToday.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center text-sm text-stone-500">
            No menus published yet for today. Check back shortly as morning cutoffs update!
          </div>
        )}
      </section>

      {/* Featured Verified Providers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Curated & Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Top-Rated Homestyle Kitchens
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Kitchens verified for hygiene, authentic recipes, and consistent punctual delivery.
            </p>
          </div>
          <Link
            href="/tiffins"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Explore all services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formattedFeatured.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-stone-100/70 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              How Tiffin Finder Works
            </h2>
            <p className="text-sm text-stone-600">
              Transparent, direct, and straightforward — no hidden fees or middlemen holding food hostage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 font-bold text-xl flex items-center justify-center border border-brand-100">
                1
              </div>
              <h3 className="font-bold text-lg text-stone-900">Discover & Compare</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Search by your locality, compare daily prices, and inspect today's live menu without having to call or join WhatsApp groups.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 font-bold text-xl flex items-center justify-center border border-amber-100">
                2
              </div>
              <h3 className="font-bold text-lg text-stone-900">Try a Sample Meal</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Submit a 1-day trial meal request or chat directly on WhatsApp to verify taste, spice level, and portion size before subscribing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xl flex items-center justify-center border border-emerald-100">
                3
              </div>
              <h3 className="font-bold text-lg text-stone-900">Enjoy Daily Delivery</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Receive hot, hygienic meals delivered to your room or office desk with easy pause options whenever you travel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Localities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Popular Localities</h2>
          <p className="text-xs text-stone-500">Discover verified home kitchens in your neighbourhood</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularLocalities.map((loc, idx) => (
            <Link
              key={idx}
              href={`/tiffins?city=${loc.city}&locality=${encodeURIComponent(loc.name)}`}
              className="p-4 rounded-xl bg-white border border-stone-200 hover:border-brand-400 hover:shadow-subtle transition-all group"
            >
              <div className="font-bold text-stone-800 text-sm group-hover:text-brand-600 transition-colors">
                {loc.name}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">{loc.city}</div>
              <div className="text-[10px] text-brand-600 font-semibold mt-2">{loc.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Provider CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-8 sm:p-12 text-white relative overflow-hidden shadow-card">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              <ChefHat className="w-4 h-4" />
              <span>For Home Cooks & Meal Providers</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Run a Tiffin Service? Attract Loyal Daily Customers.
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Stop typing today's menu in 5 different WhatsApp groups. Publish your daily menu once, accept trial
              requests, and let nearby customers discover you directly.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/provider/onboarding"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all"
              >
                Register Your Kitchen — Free
              </Link>
              <Link
                href="/provider-guidelines"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-all"
              >
                Read Guidelines
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Everything you need to know about discovering and ordering tiffins on Tiffin Finder.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
            <h3 className="font-bold text-sm text-stone-900">How do I know the menu shown is actually today's menu?</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tiffin Finder enforces a strict freshness engine. Menus are tagged with their specific date and server time in Asia/Kolkata. Old menus automatically expire and are never presented as today's food.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
            <h3 className="font-bold text-sm text-stone-900">Can I request a single trial meal before buying a monthly plan?</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Yes! Most providers offer a 1-day trial meal. You can submit a request directly through the "Trial Request" button or message the provider directly via WhatsApp.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
            <h3 className="font-bold text-sm text-stone-900">How do pause days work for monthly subscriptions?</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Each provider sets their own transparent pause rules (usually up to 3 to 5 days per month with prior 12 to 24 hours advance notice). You can view the exact pause terms on every provider's profile page.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
            <h3 className="font-bold text-sm text-stone-900">What if I have dietary preferences like Jain food or no garlic?</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              You can filter specifically by Pure Jain (no onion, garlic, or root vegetables) or Vegetarian Only kitchens using the top search filters.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
