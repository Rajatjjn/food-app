import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["CUSTOMER"]);
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { providerId, overallRating, tasteRating, quantityRating, packagingRating, punctualityRating, comment } =
      parsed.data;

    // Check if user already reviewed this provider
    const existingReview = await prisma.review.findFirst({
      where: {
        providerId,
        customerId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this provider." }, { status: 400 });
    }

    // Check if customer had an accepted trial or order with this provider for verified badge
    const hasOrder = await prisma.order.findFirst({
      where: { customer: { userId: user.id }, providerId },
    });
    const hasAcceptedTrial = await prisma.trialRequest.findFirst({
      where: {
        providerId,
        status: { in: ["ACCEPTED", "COMPLETED"] },
        OR: [{ customer: { userId: user.id } }, { customerPhone: user.phone || "" }],
      },
    });

    const isVerifiedPurchase = Boolean(hasOrder || hasAcceptedTrial);

    const review = await prisma.review.create({
      data: {
        providerId,
        customerId: user.id,
        overallRating,
        tasteRating,
        quantityRating,
        packagingRating,
        punctualityRating,
        comment,
        isVerifiedPurchase,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({
      success: true,
      review,
      message: "Thank you! Your review has been published.",
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please log in to submit a review." }, { status: 401 });
    }
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

// Provider response or report
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER", "ADMIN"]);
    const body = await req.json();
    const { reviewId, providerReply, reportReason } = body;

    if (!reviewId) {
      return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // If provider is replying
    if (providerReply) {
      if (user.role === "PROVIDER" && review.providerId !== user.providerProfile?.id) {
        return NextResponse.json({ error: "Forbidden: Not your review to reply to" }, { status: 403 });
      }

      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
          providerReply,
          replyCreatedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, review: updated, message: "Reply posted successfully!" });
    }

    // If reporting a review
    if (reportReason) {
      await prisma.reviewReport.create({
        data: {
          reviewId,
          reportedByUserId: user.id,
          reason: reportReason,
          status: "PENDING",
        },
      });

      return NextResponse.json({ success: true, message: "Review reported to admin for moderation." });
    }

    return NextResponse.json({ error: "No action provided" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
