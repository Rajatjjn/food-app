import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { mealPlanSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const providerId = searchParams.get("providerId");

    const whereClause: any = { isActive: true };
    if (providerId) {
      whereClause.providerId = providerId;
    }

    const plans = await prisma.mealPlan.findMany({
      where: whereClause,
      orderBy: { priceMinor: "asc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch meal plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER"]);
    if (!user.providerProfile) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = mealPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const effectiveCostPerMeal = Math.round(data.priceMinor / data.mealsCount);

    const plan = await prisma.mealPlan.create({
      data: {
        providerId: user.providerProfile.id,
        name: data.name,
        planType: data.planType,
        description: data.description,
        priceMinor: data.priceMinor,
        mealsCount: data.mealsCount,
        serviceDaysPerWeek: data.serviceDaysPerWeek,
        effectiveCostPerMealMinor: effectiveCostPerMeal,
        dietaryCategories: JSON.stringify(data.dietaryCategories),
        hasTrial: data.hasTrial,
        trialPriceMinor: data.hasTrial ? effectiveCostPerMeal : null,
        pauseRules: data.pauseRules,
        cancellationPolicy: data.cancellationPolicy,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, plan, message: "Meal plan created successfully!" });
  } catch (error: any) {
    console.error("Create meal plan error:", error);
    return NextResponse.json({ error: "Failed to create meal plan" }, { status: 500 });
  }
}
