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

  const [itemsCount, setItemsCount] = useState<number>(0);
  const [borrowsCount, setBorrowsCount] = useState<number>(0);

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

      const { data: ratingsData } = await supabase
        .from("ratings")
        .select("*")
        .eq("ratee_id", user.id)
        .order("created_at", { ascending: false });

      if (ratingsData && ratingsData.length > 0) {
        const raterIds = Array.from(new Set(ratingsData.map((r) => r.rater_id).filter(Boolean)));
        const ratersMap: Record<string, { full_name: string; hostel_block: string }> = {};

        if (raterIds.length > 0) {
          const { data: raters } = await supabase
            .from("user_public_profiles")
            .select("id, full_name, hostel_block")
            .in("id", raterIds);

          if (raters) {
            raters.forEach((r) => {
              ratersMap[r.id] = r;
            });
          }
        }

        const mergedRatings = ratingsData.map((r) => ({
          ...r,
          rater: ratersMap[r.rater_id] || undefined,
        }));

        setRatings(mergedRatings as Rating[]);
        const sum = ratingsData.reduce((acc, curr) => acc + curr.stars, 0);
        setAverageRating(Number((sum / ratingsData.length).toFixed(1)));
      }

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
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Top Profile Header */}
      <div className="bg-[#0d1424]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-cyan-950/50 text-cyan-300 border-2 border-cyan-500/30 flex items-center justify-center text-2xl font-black shadow-lg shadow-cyan-500/10">
              {profile?.full_name ? profile.full_name.charAt(0) : "U"}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {profile?.full_name || "Campus Student"}
                </h1>
                <span title="Verified Campus Student">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{email}</span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile?.hostel_block || "Campus Hostel"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.05] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-300 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 pt-6 text-center">
          <div className="p-3.5 rounded-2xl bg-[#070b16] border border-white/[0.06]">
            <div className="text-xl sm:text-2xl font-extrabold text-white">{itemsCount}</div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Items Listed
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070b16] border border-white/[0.06]">
            <div className="text-xl sm:text-2xl font-extrabold text-white">{borrowsCount}</div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Borrow Requests
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070b16] border border-white/[0.06]">
            <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{averageRating !== null ? averageRating : "N/A"}</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Avg Rating ({ratings.length})
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-[#0d1424]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl mb-8 animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-4">Edit Profile & UPI Details</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 bg-[#070b16] text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Hostel / Block
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 bg-[#070b16] text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 bg-[#070b16] text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Revealed to peer only after deposit is confirmed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Your UPI ID (For Receiving Deposits)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@okhdfcbank"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 bg-[#070b16] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Borrowers pay deposits directly to this UPI address.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-cyan px-5 py-2 text-xs rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ratings & Reviews Received */}
      <div className="bg-[#0d1424]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              Ratings & Reviews Received ({ratings.length})
            </h2>
          </div>
          {averageRating !== null && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/25 text-amber-300 text-xs font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{averageRating} / 5.0 Average</span>
            </div>
          )}
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No ratings received yet. Once you complete a borrow or lend transaction, fellow campus peers will leave feedback here.
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-white/[0.06]">
            {ratings.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-200">
                      {r.rater?.full_name || "Campus Peer"}
                    </span>
                    <span className="text-[11px] text-slate-400 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded">
                      {r.rater?.hostel_block || "Campus"}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < r.stars ? "fill-amber-400 text-amber-400" : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {r.comment && (
                  <p className="text-xs text-slate-300 leading-relaxed italic bg-[#070b16] p-3 rounded-xl border border-white/[0.06] mb-1">
                    &quot;{r.comment}&quot;
                  </p>
                )}

                <span className="text-[10px] text-slate-500">{formatDate(r.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
