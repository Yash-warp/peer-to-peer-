"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COLLEGE_NAME } from "@/config/college";
import {
  Compass,
  PlusCircle,
  Package,
  Layers,
  User,
  LogOut,
  Menu,
  X,
  Share2,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
    }
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  const navLinks = [
    { href: "/browse", label: "Browse", icon: Compass },
    { href: "/items/new", label: "List Item", icon: PlusCircle },
    { href: "/my-borrows", label: "My Borrows", icon: Package },
    { href: "/my-items", label: "My Items", icon: Layers },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <Share2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 block leading-tight">
                {COLLEGE_NAME}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600 block">
                Peer-to-Peer Lending
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {user ? (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 ml-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {user ? (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu (when toggled on header) */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-base font-medium ${
                    isActive
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (app-like experience) */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1 flex justify-around items-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? "text-brand-600 font-bold" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-brand-600" : "text-gray-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}

