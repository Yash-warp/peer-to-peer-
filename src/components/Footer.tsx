import React from "react";
import Link from "next/link";
import { COLLEGE_NAME, COLLEGE_EMAIL_DOMAIN } from "@/config/college";
import { ShieldCheck, HeartHandshake, Info } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 pb-20 md:pb-8 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-gray-900 font-bold text-base mb-2">
              <HeartHandshake className="w-5 h-5 text-brand-600" />
              <span>{COLLEGE_NAME}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Campus peer-to-peer item lending platform. Share cycles, drafters, cameras, lab coats, and fest gear safely with fellow hostel mates.
            </p>
            <div className="mt-3 text-xs text-brand-700 font-medium bg-brand-50 border border-brand-200 rounded-lg p-2.5 inline-block">
              Exclusively for verified @{COLLEGE_EMAIL_DOMAIN} students
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              How Payments & Deposits Work
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Deposits are 100% <strong>MANUAL UPI</strong>. Money moves directly between students via your preferred UPI app (GPay, PhonePe, Paytm). The app tracks the lending state and guarantees phone exchange only after deposit confirmation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600" />
              Campus Guidelines & Safety
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Always inspect equipment before taking possession. Meet in open campus spots (hostel gates, library, canteen). In this MVP, any physical damage or non-return disputes are arbitrated by campus student welfare or hostel wardens.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {COLLEGE_NAME}. Built for college students.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link href="/browse" className="hover:text-gray-700">Browse Items</Link>
            <Link href="/my-items" className="hover:text-gray-700">My Items</Link>
            <Link href="/profile" className="hover:text-gray-700">My Profile</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

