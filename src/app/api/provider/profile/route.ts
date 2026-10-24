import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth(["PROVIDER"]);
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
      include: {
        serviceAreas: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Fetch provider profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER"]);
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
      include: { serviceAreas: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      businessName,
      description,
      contactPhone,
      whatsappNumber,
      city,
      locality,
      pincode,
      fullAddress,
      deliveryRadiusKm,
      deliveryFeeMinor,
      serviceAreas, // Array of { locality: string, pincode: string, deliveryFeeMinor?: number }
    } = body;

    const targetCity = (city || profile.city).trim();
    const targetLocality = (locality || profile.locality).trim();
    const targetPincode = (pincode || profile.pincode).trim();

    // Auto-upsert primary kitchen location in directory
    if (targetCity && targetLocality && targetPincode) {
      await prisma.location.upsert({
        where: {
          city_locality: {
            city: targetCity,
            locality: targetLocality,
          },
        },
        update: {
          pincode: targetPincode,
          isActive: true,
        },
        create: {
          city: targetCity,
          locality: targetLocality,
          pincode: targetPincode,
          isActive: true,
        },
      });
    }

    // Auto-upsert all service areas in global location directory
    if (Array.isArray(serviceAreas)) {
      for (const sa of serviceAreas) {
        if (sa.locality && sa.locality.trim()) {
          const saLocality = sa.locality.trim();
          const saPincode = (sa.pincode || targetPincode || "411001").trim();
          await prisma.location.upsert({
            where: {
              city_locality: {
                city: targetCity,
                locality: saLocality,
              },
            },
            update: {
              pincode: saPincode,
              isActive: true,
            },
            create: {
              city: targetCity,
              locality: saLocality,
              pincode: saPincode,
              isActive: true,
            },
          });
        }
      }

      // Re-sync provider service areas
      await prisma.providerServiceArea.deleteMany({
        where: { providerId: profile.id },
      });

      if (serviceAreas.length > 0) {
        await prisma.providerServiceArea.createMany({
          data: serviceAreas
            .filter((sa) => sa.locality && sa.locality.trim())
            .map((sa) => ({
              providerId: profile.id,
              locality: sa.locality.trim(),
              pincode: (sa.pincode || targetPincode || "411001").trim(),
              deliveryFeeMinor: typeof sa.deliveryFeeMinor === "number" ? sa.deliveryFeeMinor : 0,
            })),
        });
      }
    }

    // Update main provider profile
    const updated = await prisma.providerProfile.update({
      where: { id: profile.id },
      data: {
        ...(businessName && { businessName: businessName.trim() }),
        ...(description && { description: description.trim() }),
        ...(contactPhone && { contactPhone: contactPhone.trim() }),
        ...(whatsappNumber && { whatsappNumber: whatsappNumber.trim() }),
        city: targetCity,
        locality: targetLocality,
        pincode: targetPincode,
        ...(fullAddress !== undefined && { fullAddress: fullAddress ? fullAddress.trim() : null }),
        ...(typeof deliveryRadiusKm === "number" && { deliveryRadiusKm }),
        ...(typeof deliveryFeeMinor === "number" && { deliveryFeeMinor }),
      },
      include: {
        serviceAreas: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      message: "Kitchen location and service areas updated successfully!",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Update provider profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
