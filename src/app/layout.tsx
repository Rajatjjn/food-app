import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Tiffin Finder — Find Your Everyday Home-Style Food",
  description:
    "Discover affordable, reliable, home-style daily tiffin services, thalis, and meal plans for students and working professionals in Pune and Bengaluru.",
  keywords: [
    "tiffin service",
    "home cooked food",
    "daily thali",
    "pune tiffins",
    "bengaluru tiffin",
    "jain tiffin",
    "veg meal subscription",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
