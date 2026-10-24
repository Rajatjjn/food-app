import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ city: "asc" }, { locality: "asc" }],
    });

    // Group by city with detailed metadata
    const cities: Record<string, Array<{ id: string; locality: string; pincode: string }>> = {};
    for (const loc of locations) {
      if (!cities[loc.city]) {
        cities[loc.city] = [];
      }
      cities[loc.city].push({
        id: loc.id,
        locality: loc.locality,
        pincode: loc.pincode,
      });
    }

    const cityNames = Object.keys(cities);

    return NextResponse.json({
      locations,
      cities,
      cityNames,
    });
  } catch (error) {
    console.error("Fetch locations error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, locality, pincode, state = "India" } = body;

    if (!city || !locality || !pincode) {
      return NextResponse.json({ error: "City, locality, and pincode are required" }, { status: 400 });
    }

    const trimmedCity = city.trim();
    const trimmedLocality = locality.trim();
    const trimmedPincode = pincode.trim();

    // Upsert to handle unique constraint on [city, locality]
    const location = await prisma.location.upsert({
      where: {
        city_locality: {
          city: trimmedCity,
          locality: trimmedLocality,
        },
      },
      update: {
        pincode: trimmedPincode,
        state: state.trim(),
        isActive: true,
      },
      create: {
        city: trimmedCity,
        locality: trimmedLocality,
        pincode: trimmedPincode,
        state: state.trim(),
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      location,
      message: `Added ${trimmedLocality}, ${trimmedCity} successfully!`,
    });
  } catch (error: any) {
    console.error("Create location error:", error);
    return NextResponse.json({ error: "Failed to add location" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Location id is required" }, { status: 400 });
    }

    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    console.error("Delete location error:", error);
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
