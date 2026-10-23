# Tiffin Finder Platform (MVP)

A production-minded, mobile-first web application connecting students, bachelors, and working professionals with affordable, reliable, home-style daily tiffin services, while enabling local home cooks and meal providers to manage daily menus, subscriptions, and customer enquiries.

---

## 🍛 Core Features

1. **Daily Menu Management & Freshness Engine**:
   - Live daily lunch & dinner menu publishing with dish breakdowns.
   - Enforces Asia/Kolkata timezone rules: past menus expire automatically and are never falsely shown as today's food.
   - Real-time order cutoff time tracking (e.g. 10:30 AM for lunch, 6:30 PM for dinner).
   - Instant "Mark Sold Out" and "Copy Yesterday's Menu" for 30-second daily updates by home cooks on mobile phones.

2. **Public Discovery & Advanced Filtering**:
   - Search by City (Pune, Bengaluru) and locality (Kothrud, Baner, Hinjawadi Phase 1, Viman Nagar, Koramangala, etc.).
   - Filter by Meal Timing (Lunch / Dinner), Dietary (Pure Veg, Jain Shakahari without root vegetables), Rating, and Trial Availability.
   - Transparent pricing: displays effective cost per meal for all weekly and monthly plans.

3. **Trial Meal & Enquiry Workflow**:
   - Customers can request 1-day sample meals before committing to a monthly subscription.
   - Automatic unique reference generation (`TR-2026-XXXX`, `ENQ-2026-XXXX`).
   - Rate limiting and direct in-app notifications for providers.
   - Providers can Accept, Decline, or reply with delivery ETAs.

4. **Direct WhatsApp Click-to-Chat Integration**:
   - Instant WhatsApp connect button pre-filled with the customer's enquiry or trial request.
   - No phone numbers invented; strictly sanitizes provider-configured numbers.

5. **Customer Dashboard**:
   - Manage saved favourite kitchens, track status of trial requests, review enquiry responses, and write verified reviews.

6. **Provider Onboarding & Management**:
   - 4-step wizard to register business details, service radius, dietary preferences, and cutoff times.
   - New applications enter `PENDING` state until approved by administrators.

7. **Admin Dashboard**:
   - Platform statistics computed from real database records (no fabricated numbers).
   - Approve, Reject, or Suspend kitchens; award Verified Kitchen badges; audit logs.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, Server Actions & API Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with warm culinary color tokens & glassmorphism
- **Icons**: Lucide React
- **Database & ORM**: SQLite (`dev.db`) managed via Prisma ORM for self-contained execution without requiring Docker or external database services. Easily switchable to PostgreSQL via `.env`.
- **Authentication**: Secure JWT cookies & bcrypt password hashing
- **Validation**: Zod schemas
- **Testing**: Vitest unit test suite

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 9+

### 2. Installation
```bash
npm install
```

### 3. Database Initialization & Push
Creates local SQLite database `dev.db` with all tables, constraints, and indexes:
```bash
npm run db:push
```

### 4. Seed Realistic Indian Tiffin Demo Data
Populates the database with real demo kitchens, menus for today, tomorrow, and yesterday, meal plans, trial requests, and demo accounts:
```bash
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

Use these pre-configured accounts (or click the quick demo buttons on the `/login` page):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@tiffinfinder.com` | `admin123` | System admin control panel & provider approval queue |
| **Approved Provider** | `anita@annapurna.com` | `provider123` | Annapurna Ghar Ka Khana (Kothrud, Pune) — Verified Kitchen |
| **Approved Provider** | `sunita@swad.com` | `provider123` | Swad Homestyle Meals (Baner, Pune) — Verified Kitchen |
| **Pending Provider** | `priya@momskitchen.com` | `provider123` | Mom's Kitchen (Hinjawadi) — Pending verification review |
| **Customer** | `rahul@gmail.com` | `customer123` | Active customer with trial requests & saved kitchens |
| **Customer** | `sneha@gmail.com` | `customer123` | Vegetarian/Jain meal customer |

---

## 🧪 Automated Testing

Run the Vitest test suite covering menu freshness, cutoff rules, monetary precision, WhatsApp URL generation, and validation schemas:
```bash
npm run test
```

Build the production bundle:
```bash
npm run build
```
