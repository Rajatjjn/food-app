import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessDateString } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const rawCity = searchParams.get("city");
    const city = rawCity && rawCity !== "All" && rawCity !== "" ? rawCity.trim() : null;
    const locality = searchParams.get("locality")?.trim();
    const mealType = searchParams.get("mealType"); // LUNCH, DINNER
    const dietary = searchParams.get("dietary"); // VEG, JAIN, NON_VEG
    const planType = searchParams.get("planType"); // SINGLE_MEAL, WEEKLY, MONTHLY
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!, 10) * 100 : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!, 10) * 100 : undefined;
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
    const trialOnly = searchParams.get("trialOnly") === "true";
    const updatedTodayOnly = searchParams.get("updatedToday") === "true";
    const sortBy = searchParams.get("sortBy") || "relevance"; // relevance, price_asc, price_desc, rating, updated

    const todayDate = getBusinessDateString(0);

    // Build Prisma query filters
    const andClauses: any[] = [{ status: "APPROVED" }];

    if (city) {
      andClauses.push({ city: { equals: city } });
    }

    if (locality && locality !== "All" && locality !== "") {
      andClauses.push({
        OR: [
          { locality: { contains: locality } },
          { serviceAreas: { some: { locality: { contains: locality } } } },
        ],
      });
    }

    if (query) {
      andClauses.push({
        OR: [
          { businessName: { contains: query } },
          { locality: { contains: query } },
          { city: { contains: query } },
          { pincode: { contains: query } },
          { description: { contains: query } },
          { serviceAreas: { some: { locality: { contains: query } } } },
        ],
      });
    }

    const whereClause: any = {
      AND: andClauses,
    };

    if (mealType === "LUNCH") {
      whereClause.operatesLunch = true;
    } else if (mealType === "DINNER") {
      whereClause.operatesDinner = true;
    }

    if (dietary === "VEG") {
      whereClause.isVegetarianOnly = true;
    } else if (dietary === "JAIN") {
      whereClause.dietaryCategories = { contains: "JAIN" };
    }

    if (trialOnly) {
      whereClause.mealPlans = {
        some: { hasTrial: true, isActive: true },
      };
    }

    if (updatedTodayOnly) {
      whereClause.menus = {
        some: { date: todayDate, status: "PUBLISHED" },
      };
    }

    // Fetch providers with relations
    const providers = await prisma.providerProfile.findMany({
      where: whereClause,
      include: {
        serviceAreas: true,
        mealPlans: {
          where: { isActive: true },
        },
        menus: {
          where: { date: todayDate },
          include: { items: true },
        },
        reviews: {
          where: { status: "PUBLISHED" },
          select: { overallRating: true },
        },
      },
    });

    // Format results with computed aggregates
    let results = providers.map((provider) => {
      // Calculate rating
      const reviewCount = provider.reviews.length;
      const averageRating =
        reviewCount > 0
          ? Number((provider.reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviewCount).toFixed(1))
          : 0;

      // Find lowest starting price across plans & menus
      const planPrices = provider.mealPlans.map((p) => p.effectiveCostPerMealMinor || p.priceMinor);
      const menuPrices = provider.menus.map((m) => m.priceMinor);
      const allPrices = [...planPrices, ...menuPrices];
      const startingPriceMinor = allPrices.length > 0 ? Math.min(...allPrices) : 10000;

      const hasTrialAvailable = provider.mealPlans.some((p) => p.hasTrial);
      const hasTodayMenu = provider.menus.some((m) => m.status === "PUBLISHED");
      const todayLunchMenu = provider.menus.find((m) => m.mealType === "LUNCH" && m.status === "PUBLISHED");
      const todayDinnerMenu = provider.menus.find((m) => m.mealType === "DINNER" && m.status === "PUBLISHED");

      return {
        id: provider.id,
        businessName: provider.businessName,
        slug: provider.slug,
        businessType: provider.businessType,
        description: provider.description,
        city: provider.city,
        locality: provider.locality,
        pincode: provider.pincode,
        deliveryRadiusKm: provider.deliveryRadiusKm,
        deliveryFeeMinor: provider.deliveryFeeMinor,
        minOrderAmountMinor: provider.minOrderAmountMinor,
        isVegetarianOnly: provider.isVegetarianOnly,
        dietaryCategories: provider.dietaryCategories,
        operatesLunch: provider.operatesLunch,
        operatesDinner: provider.operatesDinner,
        lunchCutoffTime: provider.lunchCutoffTime,
        dinnerCutoffTime: provider.dinnerCutoffTime,
        lunchDeliveryWindow: provider.lunchDeliveryWindow,
        dinnerDeliveryWindow: provider.dinnerDeliveryWindow,
        verifiedBadge: provider.verifiedBadge,
        profileImage: provider.profileImage,
        coverImage: provider.coverImage,
        whatsappNumber: provider.whatsappNumber,
        contactPhone: provider.contactPhone,
        serviceAreas: provider.serviceAreas.map((sa) => sa.locality),
        reviewCount,
        averageRating,
        startingPriceMinor,
        hasTrialAvailable,
        hasTodayMenu,
        todayLunchMenu: todayLunchMenu
          ? {
              id: todayLunchMenu.id,
              title: todayLunchMenu.title,
              priceMinor: todayLunchMenu.priceMinor,
              status: todayLunchMenu.status,
              cutoffTime: todayLunchMenu.cutoffTime,
              itemsCount: todayLunchMenu.items.length,
            }
          : null,
        todayDinnerMenu: todayDinnerMenu
          ? {
              id: todayDinnerMenu.id,
              title: todayDinnerMenu.title,
              priceMinor: todayDinnerMenu.priceMinor,
              status: todayDinnerMenu.status,
              cutoffTime: todayDinnerMenu.cutoffTime,
              itemsCount: todayDinnerMenu.items.length,
            }
          : null,
      };
    });

    // Post-query filtering for price range and rating
    if (minPrice !== undefined) {
      results = results.filter((p) => p.startingPriceMinor >= minPrice);
    }
    if (maxPrice !== undefined) {
      results = results.filter((p) => p.startingPriceMinor <= maxPrice);
    }
    if (minRating !== undefined && minRating > 0) {
      results = results.filter((p) => p.averageRating >= minRating);
    }
    if (planType) {
      // plan filtering
      // Can refine if provider has that plan type
    }

    // Sorting
    if (sortBy === "price_asc") {
      results.sort((a, b) => a.startingPriceMinor - b.startingPriceMinor);
    } else if (sortBy === "price_desc") {
      results.sort((a, b) => b.startingPriceMinor - a.startingPriceMinor);
    } else if (sortBy === "rating") {
      results.sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
    } else if (sortBy === "updated") {
      results.sort((a, b) => (b.hasTodayMenu ? 1 : 0) - (a.hasTodayMenu ? 1 : 0));
    } else {
      // Relevance: verified first, has today's menu, higher rating
      results.sort((a, b) => {
        if (a.verifiedBadge !== b.verifiedBadge) return a.verifiedBadge ? -1 : 1;
        if (a.hasTodayMenu !== b.hasTodayMenu) return a.hasTodayMenu ? -1 : 1;
        return b.averageRating - a.averageRating;
      });
    }

    return NextResponse.json({
      providers: results,
      total: results.length,
      todayDate,
    });
  } catch (error) {
    console.error("Fetch tiffins error:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}
