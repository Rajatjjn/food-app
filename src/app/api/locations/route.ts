import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ city: "asc" }, { locality: "asc" }],
    });

    // Group by city
    const cities: Record<string, string[]> = {};
    for (const loc of locations) {
      if (!cities[loc.city]) {
        cities[loc.city] = [];
      }
      cities[loc.city].push(loc.locality);
    }

    return NextResponse.json({
      locations,
      cities,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
