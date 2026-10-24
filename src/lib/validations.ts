import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "PROVIDER"]).default("CUSTOMER"),
});

export const providerOnboardingSchema = z.object({
  accountName: z.string().min(2, "Chef/Owner name must be at least 2 characters").optional(),
  accountEmail: z.string().email("Please enter a valid email address").optional(),
  accountPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
  businessName: z.string().min(3, "Business name must be at least 3 characters"),
  businessType: z.enum(["HOME_COOK", "SMALL_TIFFIN", "MEAL_PROVIDER"]).default("HOME_COOK"),
  description: z.string().min(20, "Please provide a detailed description (min 20 characters)"),
  contactPhone: z.string().min(10, "Enter a valid phone number"),
  whatsappNumber: z.string().min(10, "Enter a valid WhatsApp number"),
  city: z.string().min(2, "City is required"),
  locality: z.string().min(2, "Locality is required"),
  pincode: z.string().min(6, "Enter valid 6-digit pincode"),
  fullAddress: z.string().optional(),
  deliveryRadiusKm: z.number().min(0.5).max(30).default(5.0),
  isVegetarianOnly: z.boolean().default(false),
  dietaryCategories: z.array(z.string()).min(1, "Select at least one dietary category"),
  operatesLunch: z.boolean().default(true),
  operatesDinner: z.boolean().default(true),
  lunchCutoffTime: z.string().default("10:30"),
  dinnerCutoffTime: z.string().default("18:30"),
});

export const menuSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  mealType: z.enum(["LUNCH", "DINNER"]),
  title: z.string().min(3, "Menu title is required"),
  priceMinor: z.number().min(1000, "Price must be at least ₹10 (1000 paise)"),
  availableQuantity: z.number().min(1, "Available quantity must be at least 1"),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "SOLD_OUT", "UNAVAILABLE"]).default("PUBLISHED"),
  cutoffTime: z.string().optional(),
  deliveryWindow: z.string().optional(),
  dietaryTags: z.array(z.string()).default(["VEG"]),
  allergenNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string().min(1, "Item name is required"),
      description: z.string().optional(),
      category: z.string().default("MAIN"),
      isVegetarian: z.boolean().default(true),
      isAvailable: z.boolean().default(true),
    })
  ).min(1, "At least one dish item is required"),
});

export const mealPlanSchema = z.object({
  name: z.string().min(3, "Plan name is required"),
  planType: z.enum(["SINGLE_MEAL", "WEEKLY", "MONTHLY_LUNCH", "MONTHLY_DINNER", "MONTHLY_BOTH", "CUSTOM"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceMinor: z.number().min(1000, "Price is required"),
  mealsCount: z.number().min(1, "Number of meals must be at least 1"),
  serviceDaysPerWeek: z.number().min(1).max(7).default(6),
  dietaryCategories: z.array(z.string()).default(["VEG"]),
  hasTrial: z.boolean().default(true),
  pauseRules: z.string().optional(),
  cancellationPolicy: z.string().optional(),
});

export const trialRequestSchema = z.object({
  providerId: z.string().uuid("Invalid provider ID"),
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid 10-digit phone number is required"),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  mealType: z.enum(["LUNCH", "DINNER"]),
  mealCount: z.number().min(1).max(10).default(1),
  deliveryLocality: z.string().min(2, "Locality is required"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  dietaryPreference: z.string().default("VEG"),
  notes: z.string().optional(),
});

export const enquirySchema = z.object({
  providerId: z.string().uuid("Invalid provider ID"),
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10, "Enquiry message must be at least 10 characters"),
});

export const reviewSchema = z.object({
  providerId: z.string().uuid("Invalid provider ID"),
  overallRating: z.number().min(1).max(5),
  tasteRating: z.number().min(1).max(5).default(5),
  quantityRating: z.number().min(1).max(5).default(5),
  packagingRating: z.number().min(1).max(5).default(5),
  punctualityRating: z.number().min(1).max(5).default(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});
