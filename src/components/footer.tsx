import React from "react";
import Link from "next/link";
import { UtensilsCrossed, Heart, ShieldCheck, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Tiffin<span className="text-brand-500">Finder</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Connecting students, bachelors, and working professionals with verified, authentic home-style meal providers
              and daily tiffin services in Pune, Bengaluru, and Surat.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dedicated to hygiene, transparency & zero fake listings</span>
            </div>
          </div>

          {/* For Customers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Discover</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/tiffins?city=Pune" className="hover:text-white transition-colors">
                  Tiffins in Pune
                </Link>
              </li>
              <li>
                <Link href="/tiffins?city=Bengaluru" className="hover:text-white transition-colors">
                  Tiffins in Bengaluru
                </Link>
              </li>
              <li>
                <Link href="/tiffins?city=Surat" className="hover:text-white transition-colors">
                  Tiffins in Surat
                </Link>
              </li>
              <li>
                <Link href="/tiffins?dietary=VEG" className="hover:text-white transition-colors">
                  Pure Vegetarian Tiffins
                </Link>
              </li>
              <li>
                <Link href="/tiffins?dietary=JAIN" className="hover:text-white transition-colors">
                  Jain Shakahari Rasoi
                </Link>
              </li>
              <li>
                <Link href="/tiffins?updatedToday=true" className="hover:text-white transition-colors">
                  Today's Live Menus
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Meal Providers</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/provider/onboarding" className="hover:text-white transition-colors">
                  List Your Kitchen
                </Link>
              </li>
              <li>
                <Link href="/provider-guidelines" className="hover:text-white transition-colors">
                  Provider Guidelines
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How Tiffin Finder Works
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Provider Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Policies</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Tiffin Finder Platform. Built for home-cooked food lovers.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" />
            <span>for bachelors, students & hardworking home cooks.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
