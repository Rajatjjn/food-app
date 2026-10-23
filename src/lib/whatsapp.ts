/**
 * Generates verified WhatsApp click-to-chat URL with pre-filled message.
 */
export function buildWhatsAppLink(
  phoneNumber: string,
  providerName: string,
  purpose: "ENQUIRY" | "TRIAL" | "MENU" = "ENQUIRY"
): string {
  // Clean phone number (strip spaces, dashes, plus)
  let cleanNumber = phoneNumber.replace(/[^0-9]/g, "");

  // If Indian number without 91 country code, add 91
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }

  let message = "";
  switch (purpose) {
    case "TRIAL":
      message = `Hi ${providerName}, I found your tiffin service on Tiffin Finder. I would like to request a trial meal. Could you please share today's menu and delivery details?`;
      break;
    case "MENU":
      message = `Hi ${providerName}, I am viewing your kitchen on Tiffin Finder. Could you please share your upcoming weekly menu schedule?`;
      break;
    case "ENQUIRY":
    default:
      message = `Hi ${providerName}, I found your tiffin service on Tiffin Finder. I would like to know about your current menu and monthly meal plans.`;
      break;
  }

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
