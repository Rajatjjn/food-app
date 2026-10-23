import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { providerOnboardingSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER", "CUSTOMER"]);
    const body = await req.json();

    const parsed = providerOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // Generate unique slug from business name
    const baseSlug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const slug = `${baseSlug}-${randomSuffix}`;

    // Update user role to PROVIDER if currently CUSTOMER
    if (user.role !== "PROVIDER") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "PROVIDER" },
      });
    }

    // Create provider profile
    const profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        slug,
        businessType: data.businessType,
        description: data.description,
        contactPhone: data.contactPhone,
        whatsappNumber: data.whatsappNumber,
        city: data.city,
        locality: data.locality,
        pincode: data.pincode,
        fullAddress: data.fullAddress || "",
        deliveryRadiusKm: data.deliveryRadiusKm,
        isVegetarianOnly: data.isVegetarianOnly,
        dietaryCategories: JSON.stringify(data.dietaryCategories),
        operatesLunch: data.operatesLunch,
        operatesDinner: data.operatesDinner,
        lunchCutoffTime: data.lunchCutoffTime,
        dinnerCutoffTime: data.dinnerCutoffTime,
        status: "PENDING", // Enforce pending status until Admin approves
        verifiedBadge: false,
        profileImage: body.profileImage || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80",
        coverImage: body.coverImage || "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=1200&auto=format&fit=crop&q=80",
      },
    });

    // Add initial service area for their primary locality
    await prisma.providerServiceArea.create({
      data: {
        providerId: profile.id,
        locality: data.locality,
        pincode: data.pincode,
        deliveryFeeMinor: 0,
        minOrderMinor: 10000,
        estimatedDeliveryMin: 30,
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Provider Application",
          message: `${data.businessName} in ${data.locality}, ${data.city} submitted an application.`,
          link: "/admin",
          type: "VERIFICATION",
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
      message: "Application submitted! Our team will review and approve your kitchen shortly.",
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to submit provider onboarding" }, { status: 500 });
  }
}
