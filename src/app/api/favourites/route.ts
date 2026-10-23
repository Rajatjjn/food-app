import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth(["CUSTOMER"]);
    if (!user.customerProfile) {
      return NextResponse.json({ favourites: [] });
    }

    const favourites = await prisma.favourite.findMany({
      where: { customerId: user.customerProfile.id },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            locality: true,
            city: true,
            profileImage: true,
            verifiedBadge: true,
            whatsappNumber: true,
            contactPhone: true,
            isVegetarianOnly: true,
          },
        },
      },
    });

    return NextResponse.json({ favourites });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch favourites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["CUSTOMER"]);
    if (!user.customerProfile) {
      return NextResponse.json({ error: "Customer profile required" }, { status: 400 });
    }

    const { providerId } = await req.json();
    if (!providerId) {
      return NextResponse.json({ error: "providerId is required" }, { status: 400 });
    }

    // Toggle favourite
    const existing = await prisma.favourite.findUnique({
      where: {
        customerId_providerId: {
          customerId: user.customerProfile.id,
          providerId,
        },
      },
    });

    if (existing) {
      await prisma.favourite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavourited: false, message: "Removed from favourites" });
    } else {
      await prisma.favourite.create({
        data: {
          customerId: user.customerProfile.id,
          providerId,
        },
      });
      return NextResponse.json({ isFavourited: true, message: "Added to favourites!" });
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to toggle favourite" }, { status: 500 });
  }
}
