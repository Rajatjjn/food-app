import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);

    const providers = await prisma.providerProfile.findMany({
      include: {
        user: { select: { email: true, name: true, phone: true } },
        serviceAreas: true,
        verifications: true,
        _count: {
          select: { menus: true, mealPlans: true, trialRequests: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ providers });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied: Administrator privileges required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAuth(["ADMIN"]);
    const body = await req.json();
    const { providerId, status, verifiedBadge, fssaiNumber, remarks } = body;

    if (!providerId || !status) {
      return NextResponse.json({ error: "providerId and status are required" }, { status: 400 });
    }

    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: { user: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const updated = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        status,
        verifiedBadge: verifiedBadge !== undefined ? verifiedBadge : provider.verifiedBadge,
      },
    });

    // Record verification record & audit log
    if (status === "APPROVED" || fssaiNumber) {
      await prisma.providerVerification.create({
        data: {
          providerId: provider.id,
          verifiedAt: new Date(),
          verifiedByAdminId: admin.id,
          fssaiNumber: fssaiNumber || null,
          remarks: remarks || `Status changed to ${status} by admin`,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: `UPDATE_PROVIDER_STATUS_${status}`,
        resourceType: "PROVIDER",
        resourceId: providerId,
        details: JSON.stringify({ status, verifiedBadge, remarks }),
      },
    });

    // Notify provider user
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        title: `Provider Account ${status === "APPROVED" ? "Approved!" : "Status Updated"}`,
        message:
          status === "APPROVED"
            ? "Congratulations! Your kitchen has been approved. You can now publish daily menus."
            : `Your application status has been updated to ${status}. ${remarks ? `Note: ${remarks}` : ""}`,
        link: "/provider",
        type: "VERIFICATION",
      },
    });

    return NextResponse.json({
      success: true,
      provider: updated,
      message: `Provider successfully marked as ${status}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update provider status" }, { status: 500 });
  }
}
