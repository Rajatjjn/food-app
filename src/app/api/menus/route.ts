import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { menuSchema } from "@/lib/validations";
import { getBusinessDateString } from "@/lib/time";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER", "ADMIN"]);
    const searchParams = req.nextUrl.searchParams;
    const providerId = searchParams.get("providerId") || (user.providerProfile ? user.providerProfile.id : null);
    const date = searchParams.get("date");

    if (!providerId) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // Role check: provider can only access their own menus
    if (user.role === "PROVIDER" && user.providerProfile?.id !== providerId) {
      return NextResponse.json({ error: "Forbidden: Cannot access another provider's menus" }, { status: 403 });
    }

    const whereClause: any = { providerId };
    if (date) {
      whereClause.date = date;
    }

    const menus = await prisma.menu.findMany({
      where: whereClause,
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ date: "desc" }, { mealType: "asc" }],
    });

    return NextResponse.json({
      menus,
      todayDate: getBusinessDateString(0),
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Fetch menus error:", error);
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER"]);
    if (!user.providerProfile) {
      return NextResponse.json({ error: "You must complete provider onboarding first." }, { status: 403 });
    }

    const body = await req.json();

    // Check if it's a "copy from date" action
    if (body.action === "COPY_FROM_DATE") {
      const { sourceDate, targetDate, mealType } = body;
      if (!sourceDate || !targetDate || !mealType) {
        return NextResponse.json({ error: "sourceDate, targetDate, and mealType are required" }, { status: 400 });
      }

      const sourceMenu = await prisma.menu.findUnique({
        where: {
          providerId_date_mealType: {
            providerId: user.providerProfile.id,
            date: sourceDate,
            mealType,
          },
        },
        include: { items: true },
      });

      if (!sourceMenu) {
        return NextResponse.json({ error: "Source menu not found" }, { status: 404 });
      }

      // Upsert into target date
      const createdMenu = await prisma.menu.upsert({
        where: {
          providerId_date_mealType: {
            providerId: user.providerProfile.id,
            date: targetDate,
            mealType,
          },
        },
        update: {
          title: sourceMenu.title,
          priceMinor: sourceMenu.priceMinor,
          availableQuantity: sourceMenu.availableQuantity,
          status: "PUBLISHED",
          cutoffTime: sourceMenu.cutoffTime,
          deliveryWindow: sourceMenu.deliveryWindow,
          dietaryTags: sourceMenu.dietaryTags,
          allergenNotes: sourceMenu.allergenNotes,
          customerNotes: sourceMenu.customerNotes,
          items: {
            deleteMany: {},
            create: sourceMenu.items.map((item) => ({
              name: item.name,
              description: item.description,
              category: item.category,
              isAvailable: true,
              isVegetarian: item.isVegetarian,
              sortOrder: item.sortOrder,
            })),
          },
        },
        create: {
          providerId: user.providerProfile.id,
          date: targetDate,
          mealType,
          title: sourceMenu.title,
          priceMinor: sourceMenu.priceMinor,
          availableQuantity: sourceMenu.availableQuantity,
          status: "PUBLISHED",
          cutoffTime: sourceMenu.cutoffTime,
          deliveryWindow: sourceMenu.deliveryWindow,
          dietaryTags: sourceMenu.dietaryTags,
          allergenNotes: sourceMenu.allergenNotes,
          customerNotes: sourceMenu.customerNotes,
          items: {
            create: sourceMenu.items.map((item) => ({
              name: item.name,
              description: item.description,
              category: item.category,
              isAvailable: true,
              isVegetarian: item.isVegetarian,
              sortOrder: item.sortOrder,
            })),
          },
        },
        include: { items: true },
      });

      return NextResponse.json({
        success: true,
        menu: createdMenu,
        message: `Successfully copied menu to ${targetDate}!`,
      });
    }

    // Standard create or update menu
    const parsed = menuSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const {
      date,
      mealType,
      title,
      priceMinor,
      availableQuantity,
      status,
      cutoffTime,
      deliveryWindow,
      dietaryTags,
      allergenNotes,
      customerNotes,
      items,
    } = parsed.data;

    // Default cutoff & delivery window if not provided
    const defaultCutoff = mealType === "LUNCH" ? "10:30" : "18:30";
    const defaultWindow = mealType === "LUNCH" ? "12:15 - 13:45" : "19:45 - 21:15";

    const menu = await prisma.menu.upsert({
      where: {
        providerId_date_mealType: {
          providerId: user.providerProfile.id,
          date,
          mealType,
        },
      },
      update: {
        title,
        priceMinor,
        availableQuantity,
        status,
        cutoffTime: cutoffTime || defaultCutoff,
        deliveryWindow: deliveryWindow || defaultWindow,
        dietaryTags: JSON.stringify(dietaryTags),
        allergenNotes,
        customerNotes,
        items: {
          deleteMany: {},
          create: items.map((it, idx) => ({
            name: it.name,
            description: it.description || "",
            category: it.category || "MAIN",
            isAvailable: it.isAvailable !== false,
            isVegetarian: it.isVegetarian !== false,
            sortOrder: idx + 1,
          })),
        },
      },
      create: {
        providerId: user.providerProfile.id,
        date,
        mealType,
        title,
        priceMinor,
        availableQuantity,
        status,
        cutoffTime: cutoffTime || defaultCutoff,
        deliveryWindow: deliveryWindow || defaultWindow,
        dietaryTags: JSON.stringify(dietaryTags),
        allergenNotes,
        customerNotes,
        items: {
          create: items.map((it, idx) => ({
            name: it.name,
            description: it.description || "",
            category: it.category || "MAIN",
            isAvailable: it.isAvailable !== false,
            isVegetarian: it.isVegetarian !== false,
            sortOrder: idx + 1,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      menu,
      message: `Menu for ${mealType} on ${date} published successfully!`,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Create menu error:", error);
    return NextResponse.json({ error: "Failed to save menu" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(["PROVIDER"]);
    if (!user.providerProfile) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 403 });
    }

    const body = await req.json();
    const { menuId, status, availableQuantity } = body;

    if (!menuId) {
      return NextResponse.json({ error: "menuId is required" }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!existing || existing.providerId !== user.providerProfile.id) {
      return NextResponse.json({ error: "Menu not found or unauthorized" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }
    if (availableQuantity !== undefined) {
      updateData.availableQuantity = availableQuantity;
    }

    const updated = await prisma.menu.update({
      where: { id: menuId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      menu: updated,
      message: `Menu status updated to ${status || "saved"}`,
    });
  } catch (error: any) {
    console.error("Update menu error:", error);
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 });
  }
}
