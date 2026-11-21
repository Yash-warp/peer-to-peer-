import React from "react";
import Link from "next/link";
import { COLLEGE_NAME, COLLEGE_EMAIL_DOMAIN, ITEM_CATEGORIES } from "@/config/college";
import {
  ArrowRight,
  ShieldCheck,
  Smartphone,
  RotateCcw,
  Bike,
  Compass,
  Shirt,
  Camera,
  Cpu,
  Trophy,
  BookOpen,
  Package,
  CheckCircle,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  cycle: <Bike className="w-6 h-6" />,
  drafter: <Compass className="w-6 h-6" />,
  lab_coat: <Shirt className="w-6 h-6" />,
  camera: <Camera className="w-6 h-6" />,
  electronics: <Cpu className="w-6 h-6" />,
  sports: <Trophy className="w-6 h-6" />,
  books: <BookOpen className="w-6 h-6" />,
  other: <Package className="w-6 h-6" />,
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/60 via-slate-50 to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* College Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
            <span>Exclusively for verified @{COLLEGE_EMAIL_DOMAIN} students</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Why buy when you can borrow right on campus?
          </h1>

          <p className="mt-5 text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Borrow cycles for weekend outings, drafters for submission week, lab coats for practicals, and DSLR cameras for college fests from fellow students in your hostel.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/browse"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Available Items</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-base border border-gray-300 shadow-sm transition-all"
            >
              Sign Up with College ID
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-brand-600" />
              <span>Direct Student-to-Student</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-brand-600" />
              <span>Refundable UPI Deposit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-brand-600" />
              <span>Zero Rental Commission</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              Simple & Safe
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              How Lending Works in 3 Steps
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              No complicated paperwork or payment gateways. Pure peer-to-peer trust backed by UPI deposits and verified college emails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold text-lg flex items-center justify-center mb-5 shadow-sm">
                1
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Request to Borrow</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Browse available cycles, drafters, cameras or tools. Tap <strong>&quot;Request to borrow&quot;</strong> and send an optional note with your dates.
              </p>
              <div className="mt-auto text-xs text-brand-700 font-semibold bg-brand-50/80 p-2.5 rounded-xl border border-brand-100">
                Lender reviews and accepts your request
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold text-lg flex items-center justify-center mb-5 shadow-sm">
                2
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Pay Deposit via UPI</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Pay the refundable deposit directly to the owner&apos;s UPI ID using GPay, PhonePe, or Paytm. Tap <strong>&quot;I have paid&quot;</strong>.
              </p>
              <div className="mt-auto text-xs text-brand-700 font-semibold bg-brand-50/80 p-2.5 rounded-xl border border-brand-100">
                Owner confirms & phone numbers unlock
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold text-lg flex items-center justify-center mb-5 shadow-sm">
                3
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Meet, Use & Return</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Meet up at the hostel gate or library. When done, hand the item back. The owner inspects it and refunds your full deposit on UPI!
              </p>
              <div className="mt-auto text-xs text-brand-700 font-semibold bg-brand-50/80 p-2.5 rounded-xl border border-brand-100">
                Both sides leave a rating & review
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                What students lend on {COLLEGE_NAME}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                From 1st-year essentials to fest equipment, find what you need without overspending.
              </p>
            </div>
            <Link
              href="/browse"
              className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              View all items <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ITEM_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.id}`}
                className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-brand-300 hover:shadow-md transition-all flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {CATEGORY_ICON_MAP[cat.id]}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  {cat.label}
                </h4>
                <span className="text-[11px] text-gray-400 mt-0.5">Explore items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Community Banner */}
      <section className="py-12 bg-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="p-3 bg-emerald-800/80 rounded-2xl shrink-0">
                <ShieldCheck className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-base">Campus Verified Identity</h4>
                <p className="text-xs text-emerald-200/90 mt-1">
                  Only students with active @{COLLEGE_EMAIL_DOMAIN} emails can browse, borrow, or list items.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="p-3 bg-emerald-800/80 rounded-2xl shrink-0">
                <Smartphone className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-base">Zero Hidden Fees</h4>
                <p className="text-xs text-emerald-200/90 mt-1">
                  Direct UPI transfer between peers. No commissions, no middleman cuts, 100% free forever.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="p-3 bg-emerald-800/80 rounded-2xl shrink-0">
                <RotateCcw className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-base">Security Deposits</h4>
                <p className="text-xs text-emerald-200/90 mt-1">
                  Refundable deposits ensure items are treated with utmost care and returned in original condition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

