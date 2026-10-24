import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword, comparePassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { providerOnboardingSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = providerOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // Check if user is already authenticated
    let user = await getSessionUser();
    let newlyCreatedToken: string | null = null;

    if (!user) {
      // Unauthenticated visitor: account fields are required
      const { accountEmail, accountPassword, accountName } = data;

      if (!accountEmail || !accountPassword) {
        return NextResponse.json(
          { error: "Please enter an account email and password to create your kitchen profile, or sign in first." },
          { status: 401 }
        );
      }

      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: accountEmail.toLowerCase() },
      });

      if (existingUser) {
        const isMatch = await comparePassword(accountPassword, existingUser.passwordHash);
        if (!isMatch) {
          return NextResponse.json(
            { error: "An account with this email already exists with a different password. Please sign in first." },
            { status: 400 }
          );
        }
        user = existingUser as any;
      } else {
        const passwordHash = await hashPassword(accountPassword);
        user = await prisma.user.create({
          data: {
            email: accountEmail.toLowerCase(),
            passwordHash,
            name: accountName || data.businessName,
            phone: data.contactPhone,
            role: "PROVIDER",
          },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            isActive: true,
          },
        }) as any;
      }

      // Generate session token
      newlyCreatedToken = signToken({
        userId: user!.id,
        email: user!.email,
        name: user!.name,
        role: "PROVIDER",
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Unable to identify or create user account." }, { status: 400 });
    }

    // Ensure role is elevated to PROVIDER
    if (user.role !== "PROVIDER" && user.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "PROVIDER" },
      });
    }

    // Generate unique slug
    const baseSlug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const slug = `${baseSlug || "kitchen"}-${randomSuffix}`;

    // Upsert provider profile (in case user already had a draft)
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });

    let profile;
    if (existingProfile) {
      profile = await prisma.providerProfile.update({
        where: { id: existingProfile.id },
        data: {
          businessName: data.businessName,
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
          status: "PENDING",
        },
      });
    } else {
      profile = await prisma.providerProfile.create({
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
          status: "PENDING", // Pending verification until Admin approves
          verifiedBadge: false,
          profileImage: body.profileImage || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80",
          coverImage: body.coverImage || "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=1200&auto=format&fit=crop&q=80",
        },
      });
    }

    // Add or update primary service area
    const existingArea = await prisma.providerServiceArea.findFirst({
      where: { providerId: profile.id, locality: data.locality },
    });

    if (!existingArea) {
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
    }

    // Notify admins of new application
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

    const response = NextResponse.json({
      success: true,
      profile,
      message: "Application submitted! Our team will review and approve your kitchen shortly.",
    });

    // If an account was created or authenticated during this flow, set the session cookie
    if (newlyCreatedToken) {
      response.cookies.set({
        name: COOKIE_NAME,
        value: newlyCreatedToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit provider onboarding" },
      { status: 400 }
    );
  }
}
