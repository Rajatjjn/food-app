"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  UtensilsCrossed,
  MapPin,
  Search,
  User as UserIcon,
  Bell,
  Menu as MenuIcon,
  X,
  LogOut,
  Shield,
  ChefHat,
  Heart,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Pune");
  const [availableCities, setAvailableCities] = useState<string[]>(["Pune", "Bengaluru"]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch session and cities on load and route change
  useEffect(() => {
    fetchSession();
    fetchCities();
  }, [pathname]);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      if (data.cityNames && data.cityNames.length > 0) {
        setAvailableCities(data.cityNames);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        // Fetch notifications count
        const notifRes = await fetch("/api/notifications");
        const notifData = await notifRes.json();
        setUnreadCount(notifData.unreadCount || 0);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "PROVIDER") return "/provider";
    return "/customer";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-stone-900 group-hover:text-brand-600 transition-colors">
                  Tiffin<span className="text-brand-600">Finder</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                  Home-Style Meals
                </span>
              </div>
            </Link>

            {/* City Selector Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs font-medium text-stone-700">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  router.push(`/tiffins?city=${e.target.value}`);
                }}
                className="bg-transparent border-none outline-none cursor-pointer pr-1 text-stone-800 font-medium"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link
              href="/tiffins"
              className={`hover:text-brand-600 transition-colors flex items-center gap-1.5 ${
                pathname === "/tiffins" ? "text-brand-600 font-semibold" : ""
              }`}
            >
              <Search className="w-4 h-4" />
              Explore Tiffins
            </Link>
            <Link
              href="/how-it-works"
              className={`hover:text-brand-600 transition-colors ${
                pathname === "/how-it-works" ? "text-brand-600 font-semibold" : ""
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className={`hover:text-brand-600 transition-colors ${
                pathname === "/about" ? "text-brand-600 font-semibold" : ""
              }`}
            >
              About
            </Link>
          </nav>

          {/* User Auth & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <Link
                  href={getDashboardLink()}
                  className="relative p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Dashboard Button */}
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-medium transition-colors"
                >
                  {user.role === "ADMIN" ? (
                    <Shield className="w-4 h-4 text-purple-600" />
                  ) : user.role === "PROVIDER" ? (
                    <ChefHat className="w-4 h-4 text-brand-600" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>{user.name.split(" ")[0]}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                    {user.role}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all"
                >
                  Register
                </Link>
                <Link
                  href="/provider/onboarding"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors"
                >
                  <ChefHat className="w-4 h-4 text-brand-600" />
                  List Your Tiffin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-semibold text-stone-500 uppercase">City</span>
            <div className="flex items-center gap-1 text-sm font-medium text-stone-800">
              <MapPin className="w-4 h-4 text-brand-600" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setIsMobileMenuOpen(false);
                  router.push(`/tiffins?city=${e.target.value}`);
                }}
                className="bg-transparent font-medium"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Link
            href="/tiffins"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-700 hover:text-brand-600"
          >
            Explore Tiffins
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-700 hover:text-brand-600"
          >
            How It Works
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-stone-700 hover:text-brand-600"
          >
            About Us
          </Link>

          <div className="pt-3 border-t border-stone-100 space-y-2">
            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-stone-100 font-semibold text-stone-800"
                >
                  Go to {user.role === "ADMIN" ? "Admin" : user.role === "PROVIDER" ? "Provider" : "Customer"} Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 text-center text-sm font-medium text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2 text-center font-semibold text-stone-700 border border-stone-200 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center font-semibold text-white bg-brand-600 rounded-lg shadow-sm"
                >
                  Create Account
                </Link>
                <Link
                  href="/provider/onboarding"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2 text-center text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg"
                >
                  Partner With Us (List Tiffin)
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
