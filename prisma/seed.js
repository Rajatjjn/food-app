const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper to get formatted date string in Asia/Kolkata
function getFormattedDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main() {
  console.log('Seeding Tiffin Finder database with realistic demo data...');

  // Clear existing records cleanly
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reviewReport.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.mealSubscription.deleteMany();
  await prisma.trialRequest.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.menuTemplate.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.providerServiceArea.deleteMany();
  await prisma.providerVerification.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSetting.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const providerPasswordHash = await bcrypt.hash('provider123', salt);
  const customerPasswordHash = await bcrypt.hash('customer123', salt);

  // 1. Platform Settings
  await prisma.platformSetting.createMany({
    data: [
      { key: 'COMMISSION_RATE_PERCENT', value: '5', description: 'Platform commission for future marketplace orders' },
      { key: 'MAX_TRIAL_PER_USER_PER_MONTH', value: '4', description: 'Maximum trial requests allowed per customer per month' },
      { key: 'DEFAULT_TIMEZONE', value: 'Asia/Kolkata', description: 'Application operational timezone' }
    ]
  });

  // 2. Locations (Pune, Bengaluru & Surat)
  const locations = [
    { city: 'Pune', locality: 'Kothrud', pincode: '411038', state: 'Maharashtra' },
    { city: 'Pune', locality: 'Baner', pincode: '411045', state: 'Maharashtra' },
    { city: 'Pune', locality: 'Hinjawadi Phase 1', pincode: '411057', state: 'Maharashtra' },
    { city: 'Pune', locality: 'Viman Nagar', pincode: '411014', state: 'Maharashtra' },
    { city: 'Pune', locality: 'Kalyani Nagar', pincode: '411006', state: 'Maharashtra' },
    { city: 'Pune', locality: 'Karve Nagar', pincode: '411052', state: 'Maharashtra' },
    { city: 'Pune', locality: 'Wakad', pincode: '411057', state: 'Maharashtra' },
    { city: 'Bengaluru', locality: 'Koramangala', pincode: '560034', state: 'Karnataka' },
    { city: 'Bengaluru', locality: 'HSR Layout', pincode: '560102', state: 'Karnataka' },
    { city: 'Bengaluru', locality: 'Indiranagar', pincode: '560038', state: 'Karnataka' },
    { city: 'Surat', locality: 'Adajan', pincode: '395009', state: 'Gujarat' },
    { city: 'Surat', locality: 'Vesu', pincode: '395007', state: 'Gujarat' },
    { city: 'Surat', locality: 'City Light', pincode: '395007', state: 'Gujarat' },
    { city: 'Surat', locality: 'Piplod', pincode: '395007', state: 'Gujarat' },
    { city: 'Surat', locality: 'Pal', pincode: '395009', state: 'Gujarat' },
    { city: 'Surat', locality: 'Ghod Dod Road', pincode: '395007', state: 'Gujarat' },
    { city: 'Surat', locality: 'Althan', pincode: '395017', state: 'Gujarat' },
    { city: 'Surat', locality: 'Varachha', pincode: '395006', state: 'Gujarat' },
    { city: 'Surat', locality: 'Katargam', pincode: '395004', state: 'Gujarat' },
    { city: 'Surat', locality: 'Athwa Lines', pincode: '395001', state: 'Gujarat' },
  ];
  for (const loc of locations) {
    await prisma.location.create({ data: loc });
  }

  // 3. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tiffinfinder.com',
      passwordHash: adminPasswordHash,
      name: 'System Administrator',
      phone: '+91 98765 00001',
      role: 'ADMIN',
    }
  });

  // 4. Customers
  const customerUser1 = await prisma.user.create({
    data: {
      email: 'rahul@gmail.com',
      passwordHash: customerPasswordHash,
      name: 'Rahul Sharma',
      phone: '+91 98234 11223',
      role: 'CUSTOMER',
      customerProfile: {
        create: {
          preferredCity: 'Pune',
          preferredLocality: 'Kothrud',
          dietaryPreferences: JSON.stringify(['VEG']),
          notes: 'Prefer low oil and no excess red chili.'
        }
      }
    },
    include: { customerProfile: true }
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'sneha@gmail.com',
      passwordHash: customerPasswordHash,
      name: 'Sneha Kulkarni',
      phone: '+91 99701 44556',
      role: 'CUSTOMER',
      customerProfile: {
        create: {
          preferredCity: 'Pune',
          preferredLocality: 'Baner',
          dietaryPreferences: JSON.stringify(['VEG', 'JAIN']),
          notes: 'Strictly vegetarian.'
        }
      }
    },
    include: { customerProfile: true }
  });

  // 5. Providers
  // Provider 1: Annapurna Ghar Ka Khana (Verified, highly rated)
  const providerUser1 = await prisma.user.create({
    data: {
      email: 'anita@annapurna.com',
      passwordHash: providerPasswordHash,
      name: 'Anita Joshi',
      phone: '+91 98220 12345',
      role: 'PROVIDER',
    }
  });

  const provider1 = await prisma.providerProfile.create({
    data: {
      userId: providerUser1.id,
      businessName: 'Annapurna Ghar Ka Khana',
      slug: 'annapurna-ghar-ka-khana',
      businessType: 'HOME_COOK',
      description: 'Authentic homely Maharashtrian & North Indian meals prepared fresh with cold-pressed oil, farm vegetables and soft wheat phulkas. Zero preservatives or soda.',
      contactPhone: '+91 98220 12345',
      contactEmail: 'anita@annapurna.com',
      whatsappNumber: '919822012345',
      city: 'Pune',
      locality: 'Kothrud',
      pincode: '411038',
      fullAddress: 'Lane 4, Near Dahanukar Colony, Kothrud',
      deliveryRadiusKm: 5.5,
      deliveryMethod: 'DIRECT_DELIVERY',
      deliveryFeeMinor: 0, // Free local delivery
      minOrderAmountMinor: 10000,
      isVegetarianOnly: true,
      dietaryCategories: JSON.stringify(['VEG', 'JAIN_ON_REQUEST']),
      operatesLunch: true,
      operatesDinner: true,
      lunchCutoffTime: '10:30',
      dinnerCutoffTime: '18:30',
      lunchDeliveryWindow: '12:15 - 13:45',
      dinnerDeliveryWindow: '19:45 - 21:15',
      weeklyOperatingDays: JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']),
      status: 'APPROVED',
      verifiedBadge: true,
      profileImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=1200&auto=format&fit=crop&q=80',
    }
  });

  await prisma.providerVerification.create({
    data: {
      providerId: provider1.id,
      verifiedAt: new Date(),
      verifiedByAdminId: adminUser.id,
      fssaiNumber: '21523167000492',
      remarks: 'Kitchen inspected, hygiene verified, food license active.'
    }
  });

  // Service areas for Provider 1
  await prisma.providerServiceArea.createMany({
    data: [
      { providerId: provider1.id, locality: 'Kothrud', pincode: '411038', deliveryFeeMinor: 0, minOrderMinor: 10000, estimatedDeliveryMin: 25 },
      { providerId: provider1.id, locality: 'Karve Nagar', pincode: '411052', deliveryFeeMinor: 1500, minOrderMinor: 10000, estimatedDeliveryMin: 35 },
      { providerId: provider1.id, locality: 'Deccan Gymkhana', pincode: '411004', deliveryFeeMinor: 2000, minOrderMinor: 12000, estimatedDeliveryMin: 40 },
    ]
  });

  // Provider 2: Swad Maharashtrian & North Indian Tiffins (Baner)
  const providerUser2 = await prisma.user.create({
    data: {
      email: 'sunita@swad.com',
      passwordHash: providerPasswordHash,
      name: 'Sunita Deshmukh',
      phone: '+91 97654 32109',
      role: 'PROVIDER',
    }
  });

  const provider2 = await prisma.providerProfile.create({
    data: {
      userId: providerUser2.id,
      businessName: 'Swad Homestyle Meals',
      slug: 'swad-homestyle-meals',
      businessType: 'SMALL_TIFFIN',
      description: 'Wholesome balanced meals with changing daily specials: Matar Paneer, Dal Tadka, Seasonal Bhaji, soft chapatis and basmati rice. Special corporate & bachelor meal packages.',
      contactPhone: '+91 97654 32109',
      contactEmail: 'sunita@swad.com',
      whatsappNumber: '919765432109',
      city: 'Pune',
      locality: 'Baner',
      pincode: '411045',
      fullAddress: 'Near Pan Card Club Road, Baner',
      deliveryRadiusKm: 6.0,
      deliveryMethod: 'DIRECT_DELIVERY',
      deliveryFeeMinor: 1500,
      minOrderAmountMinor: 11000,
      isVegetarianOnly: false,
      dietaryCategories: JSON.stringify(['VEG', 'NON_VEG_WED_SUN']),
      operatesLunch: true,
      operatesDinner: true,
      lunchCutoffTime: '10:00',
      dinnerCutoffTime: '18:00',
      lunchDeliveryWindow: '12:30 - 14:00',
      dinnerDeliveryWindow: '20:00 - 21:30',
      weeklyOperatingDays: JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
      status: 'APPROVED',
      verifiedBadge: true,
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&auto=format&fit=crop&q=80',
    }
  });

  await prisma.providerVerification.create({
    data: {
      providerId: provider2.id,
      verifiedAt: new Date(),
      verifiedByAdminId: adminUser.id,
      fssaiNumber: '21521098000311',
      remarks: 'Verified address and business registration.'
    }
  });

  await prisma.providerServiceArea.createMany({
    data: [
      { providerId: provider2.id, locality: 'Baner', pincode: '411045', deliveryFeeMinor: 0, minOrderMinor: 11000, estimatedDeliveryMin: 25 },
      { providerId: provider2.id, locality: 'Balewadi', pincode: '411045', deliveryFeeMinor: 1000, minOrderMinor: 11000, estimatedDeliveryMin: 30 },
      { providerId: provider2.id, locality: 'Aundh', pincode: '411007', deliveryFeeMinor: 2000, minOrderMinor: 12000, estimatedDeliveryMin: 35 },
    ]
  });

  // Provider 3: Shree Jain Shudh Shakahari Rasoi (Viman Nagar)
  const providerUser3 = await prisma.user.create({
    data: {
      email: 'mukesh@jainrasoi.com',
      passwordHash: providerPasswordHash,
      name: 'Mukesh Shah',
      phone: '+91 98901 88776',
      role: 'PROVIDER',
    }
  });

  const provider3 = await prisma.providerProfile.create({
    data: {
      userId: providerUser3.id,
      businessName: 'Shree Jain Shudh Shakahari Rasoi',
      slug: 'shree-jain-shudh-rasoi',
      businessType: 'HOME_COOK',
      description: '100% Shudh Shakahari Jain food prepared strictly without onion, garlic, potatoes or root vegetables. Prepared with traditional brass cookware and pure ghee.',
      contactPhone: '+91 98901 88776',
      contactEmail: 'mukesh@jainrasoi.com',
      whatsappNumber: '919890188776',
      city: 'Pune',
      locality: 'Viman Nagar',
      pincode: '411014',
      fullAddress: 'Near Datta Mandir, Viman Nagar',
      deliveryRadiusKm: 5.0,
      deliveryMethod: 'DIRECT_DELIVERY',
      deliveryFeeMinor: 0,
      minOrderAmountMinor: 12000,
      isVegetarianOnly: true,
      dietaryCategories: JSON.stringify(['JAIN', 'PURE_VEG']),
      operatesLunch: true,
      operatesDinner: true,
      lunchCutoffTime: '11:00',
      dinnerCutoffTime: '18:00',
      lunchDeliveryWindow: '12:00 - 13:30',
      dinnerDeliveryWindow: '19:00 - 20:30',
      weeklyOperatingDays: JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
      status: 'APPROVED',
      verifiedBadge: true,
      profileImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&auto=format&fit=crop&q=80',
    }
  });

  await prisma.providerServiceArea.createMany({
    data: [
      { providerId: provider3.id, locality: 'Viman Nagar', pincode: '411014', deliveryFeeMinor: 0, minOrderMinor: 12000, estimatedDeliveryMin: 20 },
      { providerId: provider3.id, locality: 'Kalyani Nagar', pincode: '411006', deliveryFeeMinor: 1500, minOrderMinor: 12000, estimatedDeliveryMin: 30 },
      { providerId: provider3.id, locality: 'Kharadi', pincode: '411014', deliveryFeeMinor: 2500, minOrderMinor: 15000, estimatedDeliveryMin: 40 },
    ]
  });

  // Provider 4: Mom's Homestyle Kitchen (Hinjawadi Phase 1) - Pending verification
  const providerUser4 = await prisma.user.create({
    data: {
      email: 'priya@momskitchen.com',
      passwordHash: providerPasswordHash,
      name: 'Priya Verma',
      phone: '+91 91580 99881',
      role: 'PROVIDER',
    }
  });

  const provider4 = await prisma.providerProfile.create({
    data: {
      userId: providerUser4.id,
      businessName: 'Mom’s Homestyle Kitchen',
      slug: 'moms-homestyle-kitchen',
      businessType: 'HOME_COOK',
      description: 'Budget-friendly daily North Indian tiffins for IT professionals and college students in Hinjawadi. Rajma Chawal, Kadhi Pakoda, Paneer and home made rotis.',
      contactPhone: '+91 91580 99881',
      contactEmail: 'priya@momskitchen.com',
      whatsappNumber: '919158099881',
      city: 'Pune',
      locality: 'Hinjawadi Phase 1',
      pincode: '411057',
      fullAddress: 'Near Tech Mahindra Circle, Phase 1',
      deliveryRadiusKm: 4.5,
      deliveryMethod: 'DIRECT_DELIVERY',
      deliveryFeeMinor: 1000,
      minOrderAmountMinor: 9000,
      isVegetarianOnly: true,
      dietaryCategories: JSON.stringify(['VEG']),
      operatesLunch: true,
      operatesDinner: true,
      lunchCutoffTime: '11:00',
      dinnerCutoffTime: '19:00',
      lunchDeliveryWindow: '12:30 - 14:00',
      dinnerDeliveryWindow: '20:15 - 21:45',
      weeklyOperatingDays: JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']),
      status: 'PENDING', // Pending verification demo
      verifiedBadge: false,
      profileImage: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    }
  });

  await prisma.providerServiceArea.createMany({
    data: [
      { providerId: provider4.id, locality: 'Hinjawadi Phase 1', pincode: '411057', deliveryFeeMinor: 1000, minOrderMinor: 9000, estimatedDeliveryMin: 25 },
      { providerId: provider4.id, locality: 'Wakad', pincode: '411057', deliveryFeeMinor: 2000, minOrderMinor: 10000, estimatedDeliveryMin: 35 },
    ]
  });

  // 6. Meal Plans for Providers
  // Provider 1 Meal Plans
  await prisma.mealPlan.createMany({
    data: [
      {
        providerId: provider1.id,
        name: 'Single Homestyle Trial Thali',
        planType: 'SINGLE_MEAL',
        description: 'Try 1 complete meal to experience taste and portion size. Includes 4 Phulkas, Paneer/Veg Special, Dal Tadka, Jeera Rice, Salad & Sweet.',
        priceMinor: 12000, // Rs. 120
        mealsCount: 1,
        serviceDaysPerWeek: 6,
        effectiveCostPerMealMinor: 12000,
        dietaryCategories: JSON.stringify(['VEG']),
        hasTrial: true,
        trialPriceMinor: 12000,
        pauseRules: 'Single day meal, no pause needed.',
        cancellationPolicy: 'Cancel 2 hours before cutoff for full refund.',
      },
      {
        providerId: provider1.id,
        name: 'Weekly Lunch Thali Plan (6 Days)',
        planType: 'WEEKLY',
        description: '6 working days fresh hot lunch delivered to your home or office desk in Kothrud/Karve Nagar.',
        priceMinor: 69000, // Rs. 690 = Rs. 115/meal
        mealsCount: 6,
        serviceDaysPerWeek: 6,
        effectiveCostPerMealMinor: 11500,
        dietaryCategories: JSON.stringify(['VEG']),
        hasTrial: true,
        pauseRules: 'Can pause 1 meal with 12 hour advance notice.',
        cancellationPolicy: 'Pro-rata refund for unused days.',
      },
      {
        providerId: provider1.id,
        name: 'Monthly Standard Lunch Plan (26 Meals)',
        planType: 'MONTHLY_LUNCH',
        description: 'Our most popular lunch subscription for working professionals. Balanced everyday diet with rotating menu every day.',
        priceMinor: 273000, // Rs. 2730 = Rs. 105/meal
        mealsCount: 26,
        serviceDaysPerWeek: 6,
        effectiveCostPerMealMinor: 10500,
        dietaryCategories: JSON.stringify(['VEG']),
        hasTrial: true,
        pauseRules: 'Up to 4 pause days allowed per calendar month with prior notice via WhatsApp.',
        cancellationPolicy: 'Refund calculated at daily non-discounted rate of Rs. 120/meal.',
      },
      {
        providerId: provider1.id,
        name: 'Monthly Lunch + Dinner Combo (52 Meals)',
        planType: 'MONTHLY_BOTH',
        description: 'Complete daily nutrition without kitchen hassle. Fresh hot lunch & comforting light dinner delivered everyday.',
        priceMinor: 520000, // Rs. 5200 = Rs. 100/meal
        mealsCount: 52,
        serviceDaysPerWeek: 6,
        effectiveCostPerMealMinor: 10000,
        dietaryCategories: JSON.stringify(['VEG']),
        hasTrial: true,
        pauseRules: 'Up to 6 pause meals per month.',
        cancellationPolicy: 'Pro-rata refund upon 3-day notice.',
      }
    ]
  });

  // Provider 2 Meal Plans
  await prisma.mealPlan.createMany({
    data: [
      {
        providerId: provider2.id,
        name: 'Trial Veg Tiffin',
        planType: 'SINGLE_MEAL',
        description: 'Sample our popular Baner meal box with 4 Chapatis, Seasonal Sabzi, Dal Fry, Steam Rice & Pickle.',
        priceMinor: 11000, // Rs. 110
        mealsCount: 1,
        serviceDaysPerWeek: 6,
        effectiveCostPerMealMinor: 11000,
        dietaryCategories: JSON.stringify(['VEG']),
        hasTrial: true,
        trialPriceMinor: 11000,
      },
      {
        providerId: provider2.id,
        name: 'Monthly Executive Lunch Plan (26 Days)',
        planType: 'MONTHLY_LUNCH',
        description: 'Includes 2 special paneer dishes per week, sweet on Fridays, delivered hot in insulated containers.',
        priceMinor: 260000, // Rs. 2600 = Rs. 100/meal
        mealsCount: 26,
        serviceDaysPerWeek: 6,
        effectiveCostPerMealMinor: 10000,
        dietaryCategories: JSON.stringify(['VEG']),
        hasTrial: true,
        pauseRules: 'Up to 3 pause days allowed with 24h WhatsApp notice.',
      }
    ]
  });

  // Provider 3 Meal Plans
  await prisma.mealPlan.createMany({
    data: [
      {
        providerId: provider3.id,
        name: 'Shudh Jain Trial Thali',
        planType: 'SINGLE_MEAL',
        description: 'Authentic Jain rasoi meal. Absolutely no kanda, lasan, batata. Prepared fresh.',
        priceMinor: 13000, // Rs. 130
        mealsCount: 1,
        serviceDaysPerWeek: 7,
        effectiveCostPerMealMinor: 13000,
        dietaryCategories: JSON.stringify(['JAIN']),
        hasTrial: true,
      },
      {
        providerId: provider3.id,
        name: 'Monthly Jain Shakahari Plan (30 Days)',
        planType: 'MONTHLY_LUNCH',
        description: 'Daily fresh Jain lunch delivered across Viman Nagar & Kalyani Nagar.',
        priceMinor: 345000, // Rs. 3450 = Rs. 115/meal
        mealsCount: 30,
        serviceDaysPerWeek: 7,
        effectiveCostPerMealMinor: 11500,
        dietaryCategories: JSON.stringify(['JAIN']),
        hasTrial: true,
      }
    ]
  });

  // 7. Menus for Today, Tomorrow, and Yesterday (with dynamic dates!)
  const today = getFormattedDate(0);
  const tomorrow = getFormattedDate(1);
  const yesterday = getFormattedDate(-1);

  // Provider 1 Today Lunch
  const p1MenuLunch = await prisma.menu.create({
    data: {
      providerId: provider1.id,
      date: today,
      mealType: 'LUNCH',
      title: 'Homestyle Paneer Butter Masala & Dal Tadka Thali',
      priceMinor: 12000,
      availableQuantity: 40,
      status: 'PUBLISHED',
      cutoffTime: '10:30',
      deliveryWindow: '12:15 - 13:45',
      dietaryTags: JSON.stringify(['VEG']),
      allergenNotes: 'Contains Dairy (Paneer, Ghee). No nuts or artificial colors.',
      customerNotes: 'Freshly made ginger-garlic tadka with whole cumin and desi ghee.',
    }
  });

  await prisma.menuItem.createMany({
    data: [
      { menuId: p1MenuLunch.id, name: 'Paneer Butter Masala (Rich & Mild)', description: 'Fresh malai paneer simmered in tomato cashew gravy', category: 'MAIN', isAvailable: true, isVegetarian: true, sortOrder: 1 },
      { menuId: p1MenuLunch.id, name: 'Yellow Moong Dal Tadka', description: 'Tempered with mustard, jeera, curry leaves and hing', category: 'CURRY', isAvailable: true, isVegetarian: true, sortOrder: 2 },
      { menuId: p1MenuLunch.id, name: '4 Whole Wheat Phulkas', description: 'Soft puffed phulkas with light cow ghee', category: 'BREAD', isAvailable: true, isVegetarian: true, sortOrder: 3 },
      { menuId: p1MenuLunch.id, name: 'Jeera Rice', description: 'Fragrant steamed rice tempered with roasted cumin', category: 'RICE', isAvailable: true, isVegetarian: true, sortOrder: 4 },
      { menuId: p1MenuLunch.id, name: 'Cucumber Tomato Koshimbir', description: 'Crisp Maharashtrian cucumber salad with crushed peanuts', category: 'SALAD', isAvailable: true, isVegetarian: true, sortOrder: 5 },
      { menuId: p1MenuLunch.id, name: 'Gulab Jamun (1 pc)', description: 'Warm soft gulab jamun in cardamom syrup', category: 'DESSERT', isAvailable: true, isVegetarian: true, sortOrder: 6 },
    ]
  });

  // Provider 1 Today Dinner
  const p1MenuDinner = await prisma.menu.create({
    data: {
      providerId: provider1.id,
      date: today,
      mealType: 'DINNER',
      title: 'Light & Comforting Methi Aloo & Panchmel Dal',
      priceMinor: 11000,
      availableQuantity: 35,
      status: 'PUBLISHED',
      cutoffTime: '18:30',
      deliveryWindow: '19:45 - 21:15',
      dietaryTags: JSON.stringify(['VEG']),
      allergenNotes: 'Contains Dairy (Butter/Ghee).',
      customerNotes: 'Light evening meal that is easy on digestion.',
    }
  });

  await prisma.menuItem.createMany({
    data: [
      { menuId: p1MenuDinner.id, name: 'Fresh Methi Aloo Sabzi', description: 'Farm fresh fenugreek greens tossed with potatoes', category: 'MAIN', isAvailable: true, isVegetarian: true, sortOrder: 1 },
      { menuId: p1MenuDinner.id, name: 'Panchmel Dal Fry', description: 'Five-lentil healthy protein blend', category: 'CURRY', isAvailable: true, isVegetarian: true, sortOrder: 2 },
      { menuId: p1MenuDinner.id, name: '4 Phulkas', description: 'Fresh whole wheat rotis', category: 'BREAD', isAvailable: true, isVegetarian: true, sortOrder: 3 },
      { menuId: p1MenuDinner.id, name: 'Steamed Rice', description: 'Fresh kolam rice', category: 'RICE', isAvailable: true, isVegetarian: true, sortOrder: 4 },
    ]
  });

  // Provider 1 Tomorrow Lunch (Scheduled)
  const p1TomorrowMenu = await prisma.menu.create({
    data: {
      providerId: provider1.id,
      date: tomorrow,
      mealType: 'LUNCH',
      title: 'Chole Masala & Veg Pulao Special',
      priceMinor: 12000,
      availableQuantity: 45,
      status: 'SCHEDULED',
      cutoffTime: '10:30',
      deliveryWindow: '12:15 - 13:45',
      dietaryTags: JSON.stringify(['VEG']),
    }
  });

  await prisma.menuItem.createMany({
    data: [
      { menuId: p1TomorrowMenu.id, name: 'Amritsari Chole Masala', description: 'Slow cooked kabuli chana with aromatic spices', category: 'MAIN', isAvailable: true, isVegetarian: true, sortOrder: 1 },
      { menuId: p1TomorrowMenu.id, name: 'Aromatic Veg Pulao', description: 'Basmati rice with carrots, peas and whole spices', category: 'RICE', isAvailable: true, isVegetarian: true, sortOrder: 2 },
      { menuId: p1TomorrowMenu.id, name: '4 Soft Phulkas', description: 'Whole wheat flatbreads', category: 'BREAD', isAvailable: true, isVegetarian: true, sortOrder: 3 },
      { menuId: p1TomorrowMenu.id, name: 'Boondi Raita', description: 'Chilled spiced yogurt with crispy boondi', category: 'SALAD', isAvailable: true, isVegetarian: true, sortOrder: 4 },
    ]
  });

  // Provider 2 Today Lunch
  const p2MenuLunch = await prisma.menu.create({
    data: {
      providerId: provider2.id,
      date: today,
      mealType: 'LUNCH',
      title: 'Bhindi Masala & Gujarati Kadi Thali',
      priceMinor: 11000,
      availableQuantity: 30,
      status: 'PUBLISHED',
      cutoffTime: '10:00',
      deliveryWindow: '12:30 - 14:00',
      dietaryTags: JSON.stringify(['VEG']),
    }
  });

  await prisma.menuItem.createMany({
    data: [
      { menuId: p2MenuLunch.id, name: 'Crispy Bhindi Do Pyaza', description: 'Okra sautéed with caramelized onions', category: 'MAIN', isAvailable: true, isVegetarian: true, sortOrder: 1 },
      { menuId: p2MenuLunch.id, name: 'Sweet & Tangy Kadi', description: 'Yogurt curry tempered with mustard and fenugreek seeds', category: 'CURRY', isAvailable: true, isVegetarian: true, sortOrder: 2 },
      { menuId: p2MenuLunch.id, name: '4 Chapatis', description: 'Homemade soft chapatis', category: 'BREAD', isAvailable: true, isVegetarian: true, sortOrder: 3 },
      { menuId: p2MenuLunch.id, name: 'Steamed Rice & Pickle', description: 'Daily essential accompaniments', category: 'RICE', isAvailable: true, isVegetarian: true, sortOrder: 4 },
    ]
  });

  // Provider 3 Today Lunch (Jain)
  const p3MenuLunch = await prisma.menu.create({
    data: {
      providerId: provider3.id,
      date: today,
      mealType: 'LUNCH',
      title: 'Shree Jain Paneer Bhurji & Moong Mogar Thali',
      priceMinor: 13000,
      availableQuantity: 25,
      status: 'PUBLISHED',
      cutoffTime: '11:00',
      deliveryWindow: '12:00 - 13:30',
      dietaryTags: JSON.stringify(['JAIN', 'PURE_VEG']),
      allergenNotes: 'Strict Jain preparation. No onion, garlic or potatoes.',
    }
  });

  await prisma.menuItem.createMany({
    data: [
      { menuId: p3MenuLunch.id, name: 'Jain Paneer Bhurji', description: 'Crumbled cottage cheese sautéed with green capsicum and tomatoes', category: 'MAIN', isAvailable: true, isVegetarian: true, sortOrder: 1 },
      { menuId: p3MenuLunch.id, name: 'Yellow Moong Mogar Dal', description: 'Tempered with hing, cumin and green chillies in pure ghee', category: 'CURRY', isAvailable: true, isVegetarian: true, sortOrder: 2 },
      { menuId: p3MenuLunch.id, name: '4 Ghee Phulkas', description: 'Soft hand-rolled rotis with pure desi cow ghee', category: 'BREAD', isAvailable: true, isVegetarian: true, sortOrder: 3 },
      { menuId: p3MenuLunch.id, name: 'Steamed Basmati Rice', description: 'Long grain rice', category: 'RICE', isAvailable: true, isVegetarian: true, sortOrder: 4 },
    ]
  });

  // 8. Favourites
  await prisma.favourite.create({
    data: {
      customerId: customerUser1.customerProfile.id,
      providerId: provider1.id,
    }
  });

  await prisma.favourite.create({
    data: {
      customerId: customerUser1.customerProfile.id,
      providerId: provider2.id,
    }
  });

  // 9. Trial Requests
  await prisma.trialRequest.create({
    data: {
      referenceNo: 'TR-2026-001',
      customerId: customerUser1.customerProfile.id,
      providerId: provider1.id,
      customerName: 'Rahul Sharma',
      customerPhone: '+91 98234 11223',
      requestedDate: today,
      mealType: 'LUNCH',
      mealCount: 1,
      deliveryLocality: 'Kothrud',
      deliveryAddress: 'Flat 402, Rohan Residency, Dahanukar Colony, Kothrud',
      dietaryPreference: 'VEG',
      notes: 'Please keep less chili. Ring the doorbell on 4th floor.',
      status: 'ACCEPTED',
      providerResponse: 'Accepted! Our delivery person Sachin will deliver between 12:45 and 1:00 PM.',
      respondedAt: new Date(),
    }
  });

  await prisma.trialRequest.create({
    data: {
      referenceNo: 'TR-2026-002',
      customerId: customerUser2.customerProfile.id,
      providerId: provider3.id,
      customerName: 'Sneha Kulkarni',
      customerPhone: '+91 99701 44556',
      requestedDate: tomorrow,
      mealType: 'LUNCH',
      mealCount: 2,
      deliveryLocality: 'Viman Nagar',
      deliveryAddress: 'B-303, Sky Lounge, Viman Nagar',
      dietaryPreference: 'JAIN',
      notes: 'Need 2 trial meals for me and my roommate.',
      status: 'PENDING',
    }
  });

  // 10. Enquiries
  await prisma.enquiry.create({
    data: {
      referenceNo: 'ENQ-2026-01',
      customerId: customerUser1.customerProfile.id,
      providerId: provider1.id,
      customerName: 'Rahul Sharma',
      customerPhone: '+91 98234 11223',
      customerEmail: 'rahul@gmail.com',
      message: 'Hi Anita ji, do you deliver on Saturdays as well? Also can I pause the monthly subscription if I travel on business?',
      status: 'RESPONDED',
      providerResponse: 'Namaste Rahul ji! Yes, we deliver Monday through Saturday. You can pause up to 4 days anytime with 12 hour notice.',
      respondedAt: new Date(),
    }
  });

  // 11. Honest Reviews
  await prisma.review.create({
    data: {
      providerId: provider1.id,
      customerId: customerUser1.id,
      overallRating: 5,
      tasteRating: 5,
      quantityRating: 5,
      packagingRating: 5,
      punctualityRating: 5,
      comment: 'Superb homely food! The rotis are genuinely soft like mother makes at home. Paneer Butter Masala was rich without being heavy or greasy. Delivered right at 12:45 PM.',
      isVerifiedPurchase: true,
      providerReply: 'Thank you so much Rahul beta! It is our joy to serve authentic ghar ka khana.',
      replyCreatedAt: new Date(),
      status: 'PUBLISHED',
    }
  });

  await prisma.review.create({
    data: {
      providerId: provider1.id,
      customerId: customerUser2.id,
      overallRating: 5,
      tasteRating: 5,
      quantityRating: 4,
      packagingRating: 5,
      punctualityRating: 5,
      comment: 'Clean stainless steel or leak-proof packaging. Dal Tadka has that pure cumin-ghee aroma. Highly recommended for bachelors in Kothrud!',
      isVerifiedPurchase: true,
      status: 'PUBLISHED',
    }
  });

  await prisma.review.create({
    data: {
      providerId: provider2.id,
      customerId: customerUser1.id,
      overallRating: 4,
      tasteRating: 5,
      quantityRating: 4,
      packagingRating: 4,
      punctualityRating: 4,
      comment: 'Good Maharashtrian taste, spicy and authentic. Delivery took 10 minutes longer than expected during rain, but food was still hot.',
      isVerifiedPurchase: true,
      providerReply: 'Apologies for the rain delay that day! We have added rain-proof bags for our delivery partners now.',
      replyCreatedAt: new Date(),
      status: 'PUBLISHED',
    }
  });

  // 12. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: providerUser1.id,
        title: 'New Trial Request Received',
        message: 'Rahul Sharma requested a Lunch trial meal for today in Kothrud.',
        link: '/provider/trials',
        type: 'TRIAL_REQUEST',
        isRead: true,
      },
      {
        userId: customerUser1.id,
        title: 'Trial Request Accepted!',
        message: 'Annapurna Ghar Ka Khana accepted your trial request. Expected delivery: 12:45 PM.',
        link: '/customer/trials',
        type: 'TRIAL_REQUEST',
        isRead: false,
      },
      {
        userId: providerUser1.id,
        title: 'Reminder: Dinner Cutoff Approaching',
        message: 'Dinner cutoff is 18:30. You currently have 35 meals remaining.',
        link: '/provider/menus',
        type: 'MENU_REMINDER',
        isRead: false,
      }
    ]
  });

  console.log('Seed completed successfully!');
  console.log('Demo Accounts:');
  console.log('Admin:    admin@tiffinfinder.com / admin123');
  console.log('Provider: anita@annapurna.com   / provider123 (Approved & Verified)');
  console.log('Provider: sunita@swad.com       / provider123 (Approved & Verified)');
  console.log('Provider: priya@momskitchen.com / provider123 (Pending Verification)');
  console.log('Customer: rahul@gmail.com       / customer123');
  console.log('Customer: sneha@gmail.com       / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
