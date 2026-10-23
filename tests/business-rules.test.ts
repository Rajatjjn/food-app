import { describe, it, expect } from "vitest";
import { evaluateMenuFreshness, getBusinessDateString } from "../src/lib/time";
import { formatCurrency, formatDietaryTags } from "../src/lib/formatters";
import { buildWhatsAppLink } from "../src/lib/whatsapp";
import { menuSchema, trialRequestSchema, loginSchema } from "../src/lib/validations";

describe("Menu Freshness & Availability Engine", () => {
  const today = getBusinessDateString(0);
  const yesterday = getBusinessDateString(-1);
  const tomorrow = getBusinessDateString(1);

  it("should mark a menu from yesterday as past/expired", () => {
    const freshness = evaluateMenuFreshness(yesterday, "11:00", "PUBLISHED", 30);
    expect(freshness.isToday).toBe(false);
    expect(freshness.isPast).toBe(true);
    expect(freshness.isOrderingOpen).toBe(false);
    expect(freshness.statusLabel).toContain("Past Menu (Expired)");
  });

  it("should mark a future menu as scheduled and not today", () => {
    const freshness = evaluateMenuFreshness(tomorrow, "11:00", "SCHEDULED", 30);
    expect(freshness.isToday).toBe(false);
    expect(freshness.isFuture).toBe(true);
    expect(freshness.statusLabel).toBe("Scheduled");
  });

  it("should mark a menu as Sold Out if status is SOLD_OUT or available quantity is 0", () => {
    const freshness = evaluateMenuFreshness(today, "23:59", "SOLD_OUT", 10);
    expect(freshness.isOrderingOpen).toBe(false);
    expect(freshness.statusLabel).toBe("Sold Out");

    const freshnessZeroQty = evaluateMenuFreshness(today, "23:59", "PUBLISHED", 0);
    expect(freshnessZeroQty.isOrderingOpen).toBe(false);
    expect(freshnessZeroQty.statusLabel).toBe("Sold Out");
  });

  it("should flag cutoff passed if cutoff time is earlier than current time on today's menu", () => {
    // 01:00 is always earlier than any afternoon/evening current time
    const freshness = evaluateMenuFreshness(today, "01:00", "PUBLISHED", 20);
    expect(freshness.isToday).toBe(true);
    expect(freshness.isOrderingOpen).toBe(false);
    expect(freshness.statusLabel).toContain("Cutoff Passed");
  });

  it("should keep ordering open for today's menu when cutoff time is late in the day (23:59)", () => {
    const freshness = evaluateMenuFreshness(today, "23:59", "PUBLISHED", 20);
    expect(freshness.isToday).toBe(true);
    expect(freshness.isOrderingOpen).toBe(true);
    expect(freshness.statusLabel).toBe("Live Today");
  });
});

describe("Formatters & Monetary Accuracy", () => {
  it("formats integer minor units (paise) accurately to INR without floating point inaccuracies", () => {
    expect(formatCurrency(12000)).toContain("120");
    expect(formatCurrency(10500)).toContain("105");
    expect(formatCurrency(260000)).toContain("2,600");
  });

  it("parses dietary tags from JSON arrays safely", () => {
    expect(formatDietaryTags('["VEG", "JAIN"]')).toEqual(["VEG", "JAIN"]);
    expect(formatDietaryTags(null)).toEqual(["VEG"]);
    expect(formatDietaryTags("VEG")).toEqual(["VEG"]);
  });
});

describe("WhatsApp Click-to-Chat Generator", () => {
  it("generates correct wa.me link with 91 country code and encoded message", () => {
    const link = buildWhatsAppLink("9822012345", "Annapurna Kitchen", "ENQUIRY");
    expect(link).toContain("https://wa.me/919822012345");
    expect(link).toContain("Annapurna%20Kitchen");
    expect(link).toContain("Tiffin%20Finder");
  });

  it("handles numbers already with +91 cleanly", () => {
    const link = buildWhatsAppLink("+91 98220 12345", "Annapurna", "TRIAL");
    expect(link).toContain("https://wa.me/919822012345");
    expect(link).toContain("trial%20meal");
  });
});

describe("Validation Schemas", () => {
  it("validates valid daily menu payload", () => {
    const validMenu = {
      date: "2026-10-24",
      mealType: "LUNCH",
      title: "Dal Makhani & Jeera Rice Thali",
      priceMinor: 12000,
      availableQuantity: 30,
      status: "PUBLISHED",
      items: [{ name: "Dal Makhani", category: "MAIN", isVegetarian: true, isAvailable: true }],
    };

    const parsed = menuSchema.safeParse(validMenu);
    expect(parsed.success).toBe(true);
  });

  it("rejects menu without items", () => {
    const invalidMenu = {
      date: "2026-10-24",
      mealType: "LUNCH",
      title: "Empty Menu",
      priceMinor: 12000,
      availableQuantity: 30,
      items: [],
    };

    const parsed = menuSchema.safeParse(invalidMenu);
    expect(parsed.success).toBe(false);
  });

  it("validates trial request structure", () => {
    const validTrial = {
      providerId: "123e4567-e89b-12d3-a456-426614174000",
      customerName: "Sneha",
      customerPhone: "9970144556",
      requestedDate: "2026-10-25",
      mealType: "LUNCH",
      mealCount: 1,
      deliveryLocality: "Baner",
      deliveryAddress: "Flat 101, Palm Court, Baner",
    };

    const parsed = trialRequestSchema.safeParse(validTrial);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid email on login", () => {
    const invalidLogin = { email: "not-an-email", password: "123" };
    const parsed = loginSchema.safeParse(invalidLogin);
    expect(parsed.success).toBe(false);
  });
});
