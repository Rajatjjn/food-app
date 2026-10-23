import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getBusinessDateString } from "@/lib/time";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);

    const todayDate = getBusinessDateString(0);

    const [
      totalProviders,
      pendingProviders,
      approvedProviders,
      totalCustomers,
      todayPublishedMenus,
      totalTrialRequests,
      pendingTrialRequests,
      totalEnquiries,
      totalReviews,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.providerProfile.count(),
      prisma.providerProfile.count({ where: { status: "PENDING" } }),
      prisma.providerProfile.count({ where: { status: "APPROVED" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.menu.count({ where: { date: todayDate, status: "PUBLISHED" } }),
      prisma.trialRequest.count(),
      prisma.trialRequest.count({ where: { status: "PENDING" } }),
      prisma.enquiry.count(),
      prisma.review.count({ where: { status: "PUBLISHED" } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalProviders,
        pendingProviders,
        approvedProviders,
        totalCustomers,
        todayPublishedMenus,
        totalTrialRequests,
        pendingTrialRequests,
        totalEnquiries,
        totalReviews,
      },
      recentAuditLogs,
      todayDate,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch platform metrics" }, { status: 500 });
  }
}
