import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessDateString } from "@/lib/time";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const todayDate = getBusinessDateString(0);

    const provider = await prisma.providerProfile.findUnique({
      where: { slug },
      include: {
        serviceAreas: true,
        mealPlans: {
          where: { isActive: true },
          orderBy: { priceMinor: "asc" },
        },
        menus: {
          where: {
            // Fetch today, upcoming and recent menus
            date: { gte: getBusinessDateString(-1) },
          },
          include: {
            items: {
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: [{ date: "asc" }, { mealType: "asc" }],
        },
        reviews: {
          where: { status: "PUBLISHED" },
          include: {
            customer: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        verifications: {
          select: { verifiedAt: true, fssaiNumber: true },
          take: 1,
        },
      },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Segregate menus: today's lunch, today's dinner, future scheduled menus
    const todayLunch = provider.menus.find((m) => m.date === todayDate && m.mealType === "LUNCH");
    const todayDinner = provider.menus.find((m) => m.date === todayDate && m.mealType === "DINNER");
    const upcomingMenus = provider.menus.filter((m) => m.date > todayDate);

    // Rating breakdown
    const reviewCount = provider.reviews.length;
    let avgOverall = 0;
    let avgTaste = 0;
    let avgQuantity = 0;
    let avgPackaging = 0;
    let avgPunctuality = 0;

    if (reviewCount > 0) {
      avgOverall = Number((provider.reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviewCount).toFixed(1));
      avgTaste = Number((provider.reviews.reduce((acc, r) => acc + r.tasteRating, 0) / reviewCount).toFixed(1));
      avgQuantity = Number((provider.reviews.reduce((acc, r) => acc + r.quantityRating, 0) / reviewCount).toFixed(1));
      avgPackaging = Number((provider.reviews.reduce((acc, r) => acc + r.packagingRating, 0) / reviewCount).toFixed(1));
      avgPunctuality = Number((provider.reviews.reduce((acc, r) => acc + r.punctualityRating, 0) / reviewCount).toFixed(1));
    }

    return NextResponse.json({
      provider: {
        ...provider,
        reviewCount,
        ratings: {
          overall: avgOverall,
          taste: avgTaste,
          quantity: avgQuantity,
          packaging: avgPackaging,
          punctuality: avgPunctuality,
        },
        todayDate,
        todayLunch,
        todayDinner,
        upcomingMenus,
      },
    });
  } catch (error) {
    console.error("Provider details error:", error);
    return NextResponse.json({ error: "Failed to load provider profile" }, { status: 500 });
  }
}
