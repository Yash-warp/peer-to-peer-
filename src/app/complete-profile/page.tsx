"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Building, Phone, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [hostelBlock, setHostelBlock] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || "");
        setHostelBlock(profile.hostel_block || "");
        setPhone(profile.phone || "");
        setUpiId(profile.upi_id || "");
      }
      setFetching(false);
    }

    loadCurrentProfile();
  }, [router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !hostelBlock.trim() || !phone.trim()) {
      setError("Please fill in your full name, hostel/block name, and phone number.");
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    if (!/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error: upsertError } = await supabase.from("users").upsert({
        id: user.id,
        full_name: fullName.trim(),
        hostel_block: hostelBlock.trim(),
        phone: cleanPhone,
        upi_id: upiId.trim(),
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      router.push("/browse");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Campus Profile</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Your hostel and phone number are only revealed to your lender or borrower after a deposit is confirmed to coordinate campus pickup.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priyanshu Singh"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Hostel / Block / Room <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={hostelBlock}
                onChange={(e) => setHostelBlock(e.target.value)}
                placeholder="e.g. Brahmaputra Hostel, Wing C-302"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              WhatsApp / Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Kept private until deposit is confirmed.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Your UPI ID (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. username@okhdfcbank"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Used when you lend items to receive deposit payments.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Save and Continue to Campus Share"}
          </button>
        </form>
      </div>
    </div>
  );
}

