import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth(["CUSTOMER"]);
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Fetch customer profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(["CUSTOMER"]);
    const body = await req.json();
    const { preferredCity, preferredLocality, dietaryPreferences, notes } = body;

    const updated = await prisma.customerProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(preferredCity && { preferredCity: preferredCity.trim() }),
        ...(preferredLocality !== undefined && { preferredLocality: preferredLocality ? preferredLocality.trim() : null }),
        ...(dietaryPreferences !== undefined && {
          dietaryPreferences: Array.isArray(dietaryPreferences) ? JSON.stringify(dietaryPreferences) : dietaryPreferences,
        }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      },
      create: {
        userId: user.id,
        preferredCity: preferredCity ? preferredCity.trim() : "Pune",
        preferredLocality: preferredLocality ? preferredLocality.trim() : null,
        dietaryPreferences: Array.isArray(dietaryPreferences) ? JSON.stringify(dietaryPreferences) : null,
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      message: "Customer preferences updated successfully!",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Update customer profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
