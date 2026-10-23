/**
 * Time and Date utilities with explicit Asia/Kolkata business timezone support.
 */

export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Kolkata";

/**
 * Returns the current date in YYYY-MM-DD format based on the business timezone.
 */
export function getBusinessDateString(offsetDays = 0): string {
  const now = new Date();
  if (offsetDays !== 0) {
    now.setDate(now.getDate() + offsetDays);
  }

  // Format to Asia/Kolkata
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(now); // en-CA returns YYYY-MM-DD
}

/**
 * Returns current HH:mm in Asia/Kolkata
 */
export function getCurrentBusinessTimeString(): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date());
}

/**
 * Evaluates whether an ordering window is active for a menu.
 * Returns { isAvailable: boolean, reason?: string }
 */
export function evaluateMenuFreshness(
  menuDate: string,
  cutoffTime?: string | null,
  status?: string,
  availableQuantity = 0
): {
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isOrderingOpen: boolean;
  statusLabel: string;
} {
  const today = getBusinessDateString(0);
  const isToday = menuDate === today;
  const isPast = menuDate < today;
  const isFuture = menuDate > today;

  if (status === "SOLD_OUT" || availableQuantity <= 0) {
    return {
      isToday,
      isPast,
      isFuture,
      isOrderingOpen: false,
      statusLabel: "Sold Out",
    };
  }

  if (status === "UNAVAILABLE" || status === "DRAFT") {
    return {
      isToday,
      isPast,
      isFuture,
      isOrderingOpen: false,
      statusLabel: "Unavailable",
    };
  }

  if (isPast) {
    return {
      isToday: false,
      isPast: true,
      isFuture: false,
      isOrderingOpen: false,
      statusLabel: "Past Menu (Expired)",
    };
  }

  if (isFuture) {
    return {
      isToday: false,
      isPast: false,
      isFuture: true,
      isOrderingOpen: true,
      statusLabel: "Scheduled",
    };
  }

  // It is today! Check cutoff time if present
  if (cutoffTime) {
    const currentTime = getCurrentBusinessTimeString();
    if (currentTime > cutoffTime) {
      return {
        isToday: true,
        isPast: false,
        isFuture: false,
        isOrderingOpen: false,
        statusLabel: `Cutoff Passed (${cutoffTime})`,
      };
    }
  }

  return {
    isToday: true,
    isPast: false,
    isFuture: false,
    isOrderingOpen: true,
    statusLabel: "Live Today",
  };
}

/**
 * Human friendly date format (e.g., "Friday, 23 Oct")
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}
