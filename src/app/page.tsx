"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
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
  Info,
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
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Ensure GSAP context handles cleanup properly for React
    const ctx = gsap.context(() => {
      // 1. Initial Load Animations for Hero Text (Fade + Rise, smooth power2.out)
      gsap.fromTo(
        ".hero-badge-pill",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 }
      );

      gsap.fromTo(
        ".hero-headline-title",
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.25 }
      );

      gsap.fromTo(
        ".hero-subtext-para",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", delay: 0.4 }
      );

      gsap.fromTo(
        ".hero-buttons-container",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.55 }
      );

      gsap.fromTo(
        ".hero-trust-badges",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.7 }
      );

      // 2. Parallax Scroll with scrub for Hero Layers
      const mm = gsap.matchMedia();

      // Desktop & Tablet Viewport
      mm.add("(min-width: 768px)", () => {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });

        // Layer translations on scroll
        heroTl.to(".layer-hill1", { y: 150, ease: "none" }, 0);
        heroTl.to(".layer-hill2", { y: 200, ease: "none" }, 0);
        heroTl.to(".layer-hill3", { y: 260, ease: "none" }, 0);
        heroTl.to(".layer-hill4", { x: -160, y: 140, ease: "none" }, 0);
        heroTl.to(".layer-tree", { y: 230, ease: "none" }, 0);
        heroTl.to(".layer-hill5", { x: 160, y: 140, ease: "none" }, 0);
        heroTl.to(".layer-leaf", { x: 260, y: -260, scale: 1.15, ease: "none" }, 0);
        heroTl.to(".layer-plant", { y: 70, ease: "none" }, 0);
        heroTl.to(".hero-text-content", { y: 240, opacity: 0.05, ease: "none" }, 0);
      });

      // Mobile Viewport (Tuned for smooth performance without overflow)
      mm.add("(max-width: 767px)", () => {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        heroTl.to(".layer-hill1", { y: 60, ease: "none" }, 0);
        heroTl.to(".layer-hill2", { y: 80, ease: "none" }, 0);
        heroTl.to(".layer-hill3", { y: 100, ease: "none" }, 0);
        heroTl.to(".layer-hill4", { x: -60, y: 50, ease: "none" }, 0);
        heroTl.to(".layer-tree", { y: 90, ease: "none" }, 0);
        heroTl.to(".layer-hill5", { x: 60, y: 50, ease: "none" }, 0);
        heroTl.to(".layer-leaf", { x: 100, y: -90, ease: "none" }, 0);
        heroTl.to(".layer-plant", { y: 30, ease: "none" }, 0);
        heroTl.to(".hero-text-content", { y: 110, opacity: 0.1, ease: "none" }, 0);
      });

      // 3. Section Revealing Animations (Fade up ~40px, duration 0.4-0.7s, ease-out, transform & opacity only)
      const sectionHeaders = mainRef.current?.querySelectorAll(".gsap-fade-up");
      sectionHeaders?.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Staggered cards (~0.1s stagger, duration 0.55s, ease-out)
      const cardGroups = mainRef.current?.querySelectorAll(".gsap-stagger-group");
      cardGroups?.forEach((group) => {
        const cards = group.querySelectorAll(".gsap-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: group,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="flex flex-col overflow-x-hidden">
      {/* 1. HERO SECTION WITH LAYERED PARALLAX */}
      <section
        ref={heroRef}
        className="relative w-full h-[100vh] min-h-[720px] lg:min-h-[820px] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax Background Visual Layers */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Deep Twilight Sky Gradient with Starry Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#03070d] via-[#06141a] to-[#081f21]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-teal-500/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-cyan-400/10 rounded-full blur-[120px]" />

          {/* Distant Mountains & Hills Layers */}
          <img
            src="/parallax/hill1.png"
            alt=""
            aria-hidden="true"
            className="layer-hill1 absolute bottom-0 left-0 w-full h-full object-cover object-bottom"
          />
          <img
            src="/parallax/hill2.png"
            alt=""
            aria-hidden="true"
            className="layer-hill2 absolute bottom-0 left-0 w-full h-full object-cover object-bottom"
          />
          <img
            src="/parallax/hill3.png"
            alt=""
            aria-hidden="true"
            className="layer-hill3 absolute bottom-0 left-0 w-full h-full object-cover object-bottom"
          />
          <img
            src="/parallax/hill4.png"
            alt=""
            aria-hidden="true"
            className="layer-hill4 absolute bottom-0 left-0 w-full h-full object-cover object-bottom"
          />
          <img
            src="/parallax/tree.png"
            alt=""
            aria-hidden="true"
            className="layer-tree absolute bottom-0 left-0 w-full h-full object-cover object-bottom"
          />
          <img
            src="/parallax/hill5.png"
            alt=""
            aria-hidden="true"
            className="layer-hill5 absolute bottom-0 left-0 w-full h-full object-cover object-bottom"
          />

          {/* Foreground Leaves (Upper-left branches) */}
          <img
            src="/parallax/leaf.png"
            alt=""
            aria-hidden="true"
            className="layer-leaf absolute top-0 left-0 w-full h-full object-cover object-top z-15"
          />

          {/* Foreground Bottom Plants */}
          <img
            src="/parallax/plant.png"
            alt=""
            aria-hidden="true"
            className="layer-plant absolute bottom-0 left-0 w-full h-full object-cover object-bottom z-15"
          />

          {/* Smooth Bottom Gradient Blend to Next Sections */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#060911] via-[#060911]/80 to-transparent z-15" />
        </div>

        {/* Hero Content Overlay (Positioned on top of parallax layers) */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center hero-text-content pt-12 pb-16">
          {/* College Verification Badge */}
          <div className="hero-badge-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-6 shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-sm shadow-cyan-400" />
            <span>Exclusively for verified @{COLLEGE_EMAIL_DOMAIN} students</span>
          </div>

          {/* Hero Headline */}
          <h1 className="hero-headline-title text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Why buy when you can borrow right on campus?
          </h1>

          {/* Hero Subtext */}
          <p className="hero-subtext-para mt-6 text-base sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            Borrow cycles for weekend outings, drafters for submission week, lab coats for practicals, and DSLR cameras for college fests from fellow students in your hostel.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons-container mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/browse"
              className="btn-cyan w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Available Items</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-md text-white font-semibold text-base border border-white/20 shadow-xl shadow-black/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Up with College ID
            </Link>
          </div>

          {/* 3 Trust Feature Badges */}
          <div className="hero-trust-badges mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-200 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/40 backdrop-blur-sm border border-white/10">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Direct Student-to-Student</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/40 backdrop-blur-sm border border-white/10">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Refundable UPI Deposit</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/40 backdrop-blur-sm border border-white/10">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Zero Rental Commission</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE-STEP PROCESS: SIMPLE & SAFE */}
      <section className="py-24 border-y border-white/[0.08] relative bg-[#070d18]/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-fade-up text-center max-w-2xl mx-auto mb-16">
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

          <div className="gsap-stagger-group grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="gsap-card relative p-6 sm:p-8 rounded-3xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 hover-lift shadow-xl flex flex-col transition-all">
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
            <div className="gsap-card relative p-6 sm:p-8 rounded-3xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 hover-lift shadow-xl flex flex-col transition-all">
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
            <div className="gsap-card relative p-6 sm:p-8 rounded-3xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 hover-lift shadow-xl flex flex-col transition-all">
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

      {/* 3. POPULAR CATEGORIES */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-end justify-between mb-12">
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

          <div className="gsap-stagger-group grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {ITEM_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.id}`}
                className="gsap-card p-6 rounded-2xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 hover-lift shadow-lg flex flex-col items-center text-center group transition-all"
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

      {/* 4. TRUST FEATURES */}
      <section className="py-20 bg-[#070b16] border-t border-white/[0.08] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-stagger-group grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="gsap-card flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-2xl bg-[#0d1424]/60 border border-white/[0.06] hover:border-cyan-500/20 transition-all">
              <div className="p-3 bg-cyan-950/50 border border-cyan-500/20 rounded-2xl shrink-0 text-cyan-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Campus Verified Identity</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Only students with active @{COLLEGE_EMAIL_DOMAIN} emails can browse, borrow, or list items.
                </p>
              </div>
            </div>

            <div className="gsap-card flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-2xl bg-[#0d1424]/60 border border-white/[0.06] hover:border-cyan-500/20 transition-all">
              <div className="p-3 bg-cyan-950/50 border border-cyan-500/20 rounded-2xl shrink-0 text-cyan-400">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Zero Hidden Fees</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Direct UPI transfer between peers. No commissions, no middleman cuts, 100% free forever.
                </p>
              </div>
            </div>

            <div className="gsap-card flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-2xl bg-[#0d1424]/60 border border-white/[0.06] hover:border-cyan-500/20 transition-all">
              <div className="p-3 bg-cyan-950/50 border border-cyan-500/20 rounded-2xl shrink-0 text-cyan-400">
                <RotateCcw className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Security Deposits</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Refundable deposits ensure items are treated with utmost care and returned in original condition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW PAYMENTS & DEPOSITS WORK & CAMPUS GUIDELINES & SAFETY INFO BLOCKS */}
      <section className="py-20 border-t border-white/[0.08] bg-[#050912]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gsap-stagger-group grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* How Payments & Deposits Work */}
            <div className="gsap-card p-8 rounded-3xl bg-[#0d1424]/70 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  How Payments & Deposits Work
                </h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Deposits are 100% <strong className="text-slate-200">MANUAL UPI</strong>. Money moves directly between students via your preferred UPI app (GPay, PhonePe, Paytm). The app tracks the lending state and guarantees phone exchange only after deposit confirmation.
              </p>
            </div>

            {/* Campus Guidelines & Safety */}
            <div className="gsap-card p-8 rounded-3xl bg-[#0d1424]/70 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-400">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  Campus Guidelines & Safety
                </h4>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Always inspect equipment before taking possession. Meet in open campus spots (hostel gates, library, canteen). In this MVP, any physical damage or non-return disputes are arbitrated by campus student welfare or hostel wardens.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
