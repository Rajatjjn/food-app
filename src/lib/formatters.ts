/**
 * Currency & Text Formatters
 */

/**
 * Format minor unit (paise) to INR currency string.
 * Example: 12000 -> "₹120"
 */
export function formatCurrency(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

/**
 * Parses dietary tags JSON string into clean labels
 */
export function formatDietaryTags(dietaryJson: string | null | undefined): string[] {
  if (!dietaryJson) return ["VEG"];
  try {
    const parsed = JSON.parse(dietaryJson);
    if (Array.isArray(parsed)) return parsed;
    return [String(parsed)];
  } catch {
    return [dietaryJson];
  }
}

/**
 * Badge styling helper based on dietary tag
 */
export function getDietaryBadgeDetails(tag: string): { label: string; bg: string; text: string } {
  const upper = tag.toUpperCase();
  if (upper.includes("JAIN")) {
    return { label: "Pure Jain", bg: "bg-emerald-50 border-emerald-300", text: "text-emerald-800" };
  }
  if (upper.includes("VEG") && !upper.includes("NON")) {
    return { label: "100% Pure Veg", bg: "bg-green-50 border-green-300", text: "text-green-800" };
  }
  if (upper.includes("NON_VEG")) {
    return { label: "Non-Veg & Veg", bg: "bg-orange-50 border-orange-300", text: "text-orange-800" };
  }
  return { label: tag, bg: "bg-stone-50 border-stone-200", text: "text-stone-700" };
}
