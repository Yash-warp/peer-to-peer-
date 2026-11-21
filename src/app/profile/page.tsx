"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserProfile, Rating } from "@/types/database";
import { formatDate } from "@/lib/utils";
import {
  User,
  Building,
  Phone,
  CreditCard,
  Mail,
  Star,
  CheckCircle,
  AlertCircle,
  LogOut,
  Edit2,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState<string>("");
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  // Stats
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [borrowsCount, setBorrowsCount] = useState<number>(0);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [hostelBlock, setHostelBlock] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadProfile() {
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

      setEmail(user.email || "");

      // 1. Fetch profile from public.users
      const { data: profData, error: profError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profError) throw profError;

      if (profData) {
        setProfile(profData as UserProfile);
        setFullName(profData.full_name || "");
        setHostelBlock(profData.hostel_block || "");
        setPhone(profData.phone || "");
        setUpiId(profData.upi_id || "");
      }

      // 2. Fetch ratings received
      const { data: ratingsData } = await supabase
        .from("ratings")
        .select(`
          *,
          rater:users!ratings_rater_id_fkey(full_name, hostel_block)
        `)
        .eq("ratee_id", user.id)
        .order("created_at", { ascending: false });

      if (ratingsData && ratingsData.length > 0) {
        setRatings(ratingsData as Rating[]);
        const sum = ratingsData.reduce((acc, curr) => acc + curr.stars, 0);
        setAverageRating(Number((sum / ratingsData.length).toFixed(1)));
      }

      // 3. Fetch count of items and borrows
      const { count: itemCount } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id);
      setItemsCount(itemCount || 0);

      const { count: borrowCount } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("borrower_id", user.id);
      setBorrowsCount(borrowCount || 0);
    } catch (err: unknown) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      const cleanPhone = phone.trim().replace(/[\s-]/g, "");

      const { error: updateError } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          hostel_block: hostelBlock.trim(),
          phone: cleanPhone,
          upi_id: upiId.trim(),
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      await loadProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Top Profile Header */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-brand-50 text-brand-700 border-2 border-brand-200 flex items-center justify-center text-2xl font-black shadow-sm">
              {profile?.full_name ? profile.full_name.charAt(0) : "U"}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  {profile?.full_name || "Campus Student"}
                </h1>
                <span title="Verified Campus Student">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{email}</span>
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span>{profile?.hostel_block || "Campus Hostel"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 pt-6 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900">{itemsCount}</div>
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
              Items Listed
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900">{borrowsCount}</div>
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
              Borrow Requests
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xl sm:text-2xl font-extrabold text-brand-700 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{averageRating !== null ? averageRating : "N/A"}</span>
            </div>
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
              Avg Rating ({ratings.length})
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm mb-8 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Profile & UPI Details</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Hostel / Block
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Phone Number
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Revealed to peer only after deposit is confirmed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Your UPI ID (For Receiving Deposits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@okhdfcbank"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Borrowers pay deposits directly to this UPI address.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ratings & Reviews Received */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Ratings & Reviews Received ({ratings.length})
            </h2>
          </div>
          {averageRating !== null && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{averageRating} / 5.0 Average</span>
            </div>
          )}
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            No ratings received yet. Once you complete a borrow or lend transaction, fellow campus peers will leave feedback here.
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-gray-100">
            {ratings.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">
                      {r.rater?.full_name || "Campus Peer"}
                    </span>
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {r.rater?.hostel_block || "Campus"}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < r.stars ? "fill-amber-400 text-amber-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {r.comment && (
                  <p className="text-xs text-gray-700 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-1">
                    &quot;{r.comment}&quot;
                  </p>
                )}

                <span className="text-[10px] text-gray-400">{formatDate(r.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
