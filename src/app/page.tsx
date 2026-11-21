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
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-32">
        {/* Subtle glowing ambient spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-0" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-teal-500/8 rounded-full blur-[100px] pointer-events-none -z-0" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* College Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-sm shadow-cyan-400" />
            <span>Exclusively for verified @{COLLEGE_EMAIL_DOMAIN} students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Why buy when you can borrow right on campus?
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Borrow cycles for weekend outings, drafters for submission week, lab coats for practicals, and DSLR cameras for college fests from fellow students in your hostel.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/browse"
              className="btn-cyan w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Available Items</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-base border border-white/10 shadow-lg shadow-black/40 transition-all"
            >
              Sign Up with College ID
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>Direct Student-to-Student</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>Refundable UPI Deposit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>Zero Rental Commission</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 border-y border-white/[0.08] relative bg-[#080d19]/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2.5">
              Simple & Safe
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Lending Works in 3 Steps
            </h3>
            <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
              No complicated paperwork or payment gateways. Pure peer-to-peer trust backed by UPI deposits and verified college emails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 hover-lift shadow-xl flex flex-col transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Request to Borrow</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Browse available cycles, drafters, cameras or tools. Tap <strong className="text-slate-200">&quot;Request to borrow&quot;</strong> and send an optional note with your dates.
              </p>
              <div className="mt-auto text-xs text-cyan-300 font-semibold bg-cyan-950/40 p-3 rounded-xl border border-cyan-500/20">
                Lender reviews and accepts your request
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 hover-lift shadow-xl flex flex-col transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Pay Deposit via UPI</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Pay the refundable deposit directly to the owner&apos;s UPI ID using GPay, PhonePe, or Paytm. Tap <strong className="text-slate-200">&quot;I have paid&quot;</strong>.
              </p>
              <div className="mt-auto text-xs text-cyan-300 font-semibold bg-cyan-950/40 p-3 rounded-xl border border-cyan-500/20">
                Owner confirms & phone numbers unlock
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 hover-lift shadow-xl flex flex-col transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Meet, Use & Return</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Meet up at the hostel gate or library. When done, hand the item back. The owner inspects it and refunds your full deposit on UPI!
              </p>
              <div className="mt-auto text-xs text-cyan-300 font-semibold bg-cyan-950/40 p-3 rounded-xl border border-cyan-500/20">
                Both sides leave a rating & review
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                What students lend on {COLLEGE_NAME}
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                From 1st-year essentials to fest equipment, find what you need without overspending.
              </p>
            </div>
            <Link
              href="/browse"
              className="mt-4 sm:mt-0 text-sm font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View all items</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {ITEM_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.id}`}
                className="p-6 rounded-2xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 hover-lift shadow-lg flex flex-col items-center text-center group transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-3.5 group-hover:scale-110 group-hover:border-cyan-400/50 transition-all shadow-sm shadow-cyan-500/10">
                  {CATEGORY_ICON_MAP[cat.id]}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {cat.label}
                </h4>
                <span className="text-[11px] text-slate-400 mt-1">Explore items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Community Banner */}
      <section className="py-16 bg-[#080d19] border-t border-white/[0.08] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="p-3 bg-cyan-950/50 border border-cyan-500/20 rounded-2xl shrink-0 text-cyan-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Campus Verified Identity</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Only students with active @{COLLEGE_EMAIL_DOMAIN} emails can browse, borrow, or list items.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="p-3 bg-cyan-950/50 border border-cyan-500/20 rounded-2xl shrink-0 text-cyan-400">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Zero Hidden Fees</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Direct UPI transfer between peers. No commissions, no middleman cuts, 100% free forever.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="p-3 bg-cyan-950/50 border border-cyan-500/20 rounded-2xl shrink-0 text-cyan-400">
                <RotateCcw className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Security Deposits</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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
