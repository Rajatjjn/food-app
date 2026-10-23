import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireAuth } from "@/lib/auth";
import { enquirySchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    let enquiries;
    if (user.role === "PROVIDER") {
      if (!user.providerProfile) {
        return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
      }
      enquiries = await prisma.enquiry.findMany({
        where: { providerId: user.providerProfile.id },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "ADMIN") {
      enquiries = await prisma.enquiry.findMany({
        include: {
          provider: { select: { businessName: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      enquiries = await prisma.enquiry.findMany({
        where: {
          OR: [
            { customerId: user.customerProfile?.id },
            { customerPhone: user.phone || "" },
          ],
        },
        include: {
          provider: {
            select: {
              businessName: true,
              slug: true,
              contactPhone: true,
              whatsappNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const session = await getSessionUser();

    const provider = await prisma.providerProfile.findUnique({
      where: { id: data.providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Rate limiting: max 5 enquiries per phone per day
    const recent = await prisma.enquiry.count({
      where: {
        customerPhone: data.customerPhone,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (recent >= 5) {
      return NextResponse.json({ error: "Too many enquiries. Please try again later." }, { status: 429 });
    }

    const refYear = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const referenceNo = `ENQ-${refYear}-${randomSuffix}`;

    const enquiry = await prisma.enquiry.create({
      data: {
        referenceNo,
        providerId: data.providerId,
        customerId: session?.customerProfile?.id || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        message: data.message,
        status: "PENDING",
      },
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        title: "New Customer Enquiry",
        message: `${data.customerName} sent an enquiry: "${data.message.slice(0, 50)}..."`,
        link: "/provider/enquiries",
        type: "ENQUIRY",
      },
    });

    return NextResponse.json({
      success: true,
      enquiry,
      message: `Enquiry submitted successfully! Reference: ${referenceNo}`,
    });
  } catch (error) {
    console.error("Submit enquiry error:", error);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER", "ADMIN"]);
    const body = await req.json();
    const { enquiryId, providerResponse, status = "RESPONDED" } = body;

    if (!enquiryId || !providerResponse) {
      return NextResponse.json({ error: "enquiryId and providerResponse are required" }, { status: 400 });
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (user.role === "PROVIDER" && enquiry.providerId !== user.providerProfile?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        status,
        providerResponse,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to reply to enquiry" }, { status: 500 });
  }
}
