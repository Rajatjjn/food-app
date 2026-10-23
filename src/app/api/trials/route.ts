import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireAuth } from "@/lib/auth";
import { trialRequestSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    let trials;
    if (user.role === "PROVIDER") {
      if (!user.providerProfile) {
        return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
      }
      trials = await prisma.trialRequest.findMany({
        where: { providerId: user.providerProfile.id },
        include: {
          customer: {
            select: { preferredCity: true, preferredLocality: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "ADMIN") {
      trials = await prisma.trialRequest.findMany({
        include: {
          provider: { select: { businessName: true, locality: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Customer
      trials = await prisma.trialRequest.findMany({
        where: {
          OR: [
            { customerId: user.customerProfile?.id },
            { customerPhone: user.phone || "" },
          ],
        },
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              contactPhone: true,
              whatsappNumber: true,
              locality: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ trials });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch trial requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = trialRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const session = await getSessionUser();

    // Verify provider exists and is approved
    const provider = await prisma.providerProfile.findUnique({
      where: { id: data.providerId },
      include: { user: true },
    });

    if (!provider || provider.status !== "APPROVED") {
      return NextResponse.json({ error: "This tiffin provider is currently not accepting new requests." }, { status: 400 });
    }

    // Rate limiting check: check how many trials submitted from this phone in the last 24h
    const recentCount = await prisma.trialRequest.count({
      where: {
        customerPhone: data.customerPhone,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recentCount >= 5) {
      return NextResponse.json(
        { error: "Daily limit exceeded. Please wait before submitting more trial requests." },
        { status: 429 }
      );
    }

    // Generate unique reference number: TR-YEAR-RANDOM
    const refYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNo = `TR-${refYear}-${randomSuffix}`;

    const trial = await prisma.trialRequest.create({
      data: {
        referenceNo,
        providerId: data.providerId,
        customerId: session?.customerProfile?.id || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        requestedDate: data.requestedDate,
        mealType: data.mealType,
        mealCount: data.mealCount,
        deliveryLocality: data.deliveryLocality,
        deliveryAddress: data.deliveryAddress,
        dietaryPreference: data.dietaryPreference,
        notes: data.notes,
        status: "PENDING",
      },
    });

    // Create In-App Notification for provider
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        title: "New Trial Request Received",
        message: `${data.customerName} requested a ${data.mealType} trial for ${data.requestedDate} in ${data.deliveryLocality}.`,
        link: "/provider/trials",
        type: "TRIAL_REQUEST",
      },
    });

    return NextResponse.json({
      success: true,
      trial,
      message: `Your trial meal request has been sent! Reference ID: ${referenceNo}. The provider will review and respond.`,
    });
  } catch (error) {
    console.error("Trial request error:", error);
    return NextResponse.json({ error: "Failed to submit trial request" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER", "ADMIN"]);
    const body = await req.json();
    const { trialId, status, providerResponse } = body;

    if (!trialId || !status) {
      return NextResponse.json({ error: "trialId and status are required" }, { status: 400 });
    }

    const trial = await prisma.trialRequest.findUnique({
      where: { id: trialId },
      include: { customer: { include: { user: true } } },
    });

    if (!trial) {
      return NextResponse.json({ error: "Trial request not found" }, { status: 404 });
    }

    if (user.role === "PROVIDER" && trial.providerId !== user.providerProfile?.id) {
      return NextResponse.json({ error: "Forbidden: Not your request" }, { status: 403 });
    }

    const updated = await prisma.trialRequest.update({
      where: { id: trialId },
      data: {
        status,
        providerResponse: providerResponse || trial.providerResponse,
        respondedAt: new Date(),
      },
    });

    // Notify customer if customer account exists
    if (trial.customer?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: trial.customer.user.id,
          title: `Trial Request ${status}`,
          message: `Your trial request (${trial.referenceNo}) has been ${status.toLowerCase()}.${
            providerResponse ? ` Provider says: "${providerResponse}"` : ""
          }`,
          link: "/customer/trials",
          type: "TRIAL_REQUEST",
        },
      });
    }

    return NextResponse.json({
      success: true,
      trial: updated,
      message: `Trial status updated to ${status}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update trial status" }, { status: 500 });
  }
}
