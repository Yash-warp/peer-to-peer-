"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Item, BorrowRequest, Rating } from "@/types/database";
import { formatRupees, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  Building,
  User,
  AlertCircle,
  CheckCircle,
  Package,
  Bike,
  Compass,
  Shirt,
  Camera,
  Cpu,
  Trophy,
  BookOpen,
  Send,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cycle: <Bike className="w-6 h-6" />,
  drafter: <Compass className="w-6 h-6" />,
  lab_coat: <Shirt className="w-6 h-6" />,
  camera: <Camera className="w-6 h-6" />,
  electronics: <Cpu className="w-6 h-6" />,
  sports: <Trophy className="w-6 h-6" />,
  books: <BookOpen className="w-6 h-6" />,
  other: <Package className="w-6 h-6" />,
};

export default function ItemDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [existingUserRequest, setExistingUserRequest] = useState<BorrowRequest | null>(null);
  const [ownerRatings, setOwnerRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadItemData() {
      if (!id) return;
      setLoading(true);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }

        const { data: itemData, error: itemError } = await supabase
          .from("items")
          .select(
            `
            *,
            owner:user_public_profiles (
              id,
              full_name,
              hostel_block
            )
          `
          )
          .eq("id", id)
          .single();

        if (itemError || !itemData) {
          throw new Error("Item not found or could not be loaded.");
        }

        setItem(itemData as Item);

        if (itemData.owner_id) {
          const { data: ratingsData } = await supabase
            .from("ratings")
            .select(`
              *,
              rater:user_public_profiles(full_name)
            `)
            .eq("ratee_id", itemData.owner_id)
            .order("created_at", { ascending: false });

          if (ratingsData && ratingsData.length > 0) {
            setOwnerRatings(ratingsData as Rating[]);
            const sum = ratingsData.reduce((acc, curr) => acc + curr.stars, 0);
            setAverageRating(Number((sum / ratingsData.length).toFixed(1)));
          }
        }

        if (user) {
          const { data: reqData } = await supabase
            .from("requests")
            .select("*")
            .eq("item_id", id)
            .eq("borrower_id", user.id)
            .not("status", "in", '("rejected","cancelled","completed")')
            .maybeSingle();

          if (reqData) {
            setExistingUserRequest(reqData as BorrowRequest);
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load item.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadItemData();
  }, [id]);

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) {
      router.push(`/login?redirectTo=/items/${id}`);
      return;
    }

    if (!item) return;

    setSubmittingRequest(true);
    setError(null);

    try {
      const supabase = createClient();

      if (item.status !== "available") {
        throw new Error("This item is not currently available for borrowing.");
      }

      const { data: activeRequests } = await supabase
        .from("requests")
        .select("id")
        .eq("item_id", item.id)
        .in("status", ["accepted", "deposit_paid", "picked_up"]);

      if (activeRequests && activeRequests.length > 0) {
        throw new Error("An active borrower is already in progress with this item.");
      }

      const { data: newReq, error: reqError } = await supabase
        .from("requests")
        .insert({
          item_id: item.id,
          borrower_id: currentUserId,
          message: requestMessage.trim() || null,
          status: "pending",
        })
        .select()
        .single();

      if (reqError) throw reqError;

      await supabase.from("deposits").insert({
        request_id: newReq.id,
        amount: item.deposit_amount,
        status: "unpaid",
      });

      setSuccess("Your borrow request has been sent to the owner!");
      setRequestModalOpen(false);
      setExistingUserRequest(newReq as BorrowRequest);

      setTimeout(() => {
        router.push("/my-borrows");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit request.");
      }
    } finally {
      setSubmittingRequest(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Item Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error || "This item doesn't exist or was removed."}</p>
        <Link
          href="/browse"
          className="btn-cyan inline-flex px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          Return to Browse
        </Link>
      </div>
    );
  }

  const isOwner = currentUserId === item.owner_id;
  const ownerFirstName = item.owner?.full_name ? item.owner.full_name.split(" ")[0] : "Campus Student";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{success} Redirecting to your borrows...</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Big Photo */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-[#080d19] border border-white/[0.08] shadow-2xl">
            {item.photo_url ? (
              <Image
                src={item.photo_url}
                alt={item.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1e] text-cyan-400">
                <div className="p-6 bg-cyan-950/40 rounded-3xl border border-cyan-500/20 text-cyan-400 mb-2 shadow-sm shadow-cyan-500/10">
                  {CATEGORY_ICONS[item.category] || <Package className="w-12 h-12" />}
                </div>
                <span className="text-sm font-semibold text-slate-400">No Photo Uploaded</span>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <StatusBadge status={item.status} type="item" />
            </div>

            <div className="absolute bottom-4 right-4 bg-[#060911]/90 backdrop-blur-md text-cyan-300 text-sm font-bold px-3.5 py-1.5 rounded-xl border border-cyan-500/20 shadow-lg">
              {formatRupees(item.deposit_amount)} Refundable Deposit
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-8 bg-[#0d1424]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-xl">
            <h3 className="font-bold text-white text-lg mb-3">Item Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {item.description || "No specific instructions provided by the owner. You can coordinate pickup time and campus location upon request approval."}
            </p>
          </div>

          {/* Owner Reviews Section */}
          <div className="mt-8 bg-[#0d1424]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg">
                Reviews for {ownerFirstName} ({ownerRatings.length})
              </h3>
              {averageRating !== null && (
                <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/25 text-amber-300 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{averageRating} / 5.0</span>
                </div>
              )}
            </div>

            {ownerRatings.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No ratings yet for this student. Be the first to borrow and leave a review!
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-white/[0.06]">
                {ownerRatings.slice(0, 5).map((r) => (
                  <div key={r.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-200">
                        {r.rater?.full_name ? r.rater.full_name.split(" ")[0] : "Verified Student"}
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.stars }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-slate-400 italic">&quot;{r.comment}&quot;</p>}
                    <span className="text-[10px] text-slate-500">{formatDate(r.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Item Metadata & Borrow Action Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0d1424]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {item.category.replace("_", " ")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {item.title}
              </h1>
            </div>

            {/* Deposit Box */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                Security Deposit
              </div>
              <div className="text-3xl font-black text-white">
                {formatRupees(item.deposit_amount)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Paid directly via UPI to the owner once request is accepted. 100% refunded when returned intact.
              </p>
            </div>

            {/* Owner Profile Card */}
            <div className="p-4 rounded-2xl bg-[#070b16] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-base shadow-sm">
                  {ownerFirstName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{ownerFirstName}</span>
                    <span title="Verified Campus Student">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.owner?.hostel_block || "Campus Hostel"}</span>
                  </div>
                </div>
              </div>

              {/* Rating pill */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{averageRating !== null ? `${averageRating}/5` : "New"}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {ownerRatings.length} {ownerRatings.length === 1 ? "review" : "reviews"}
                </div>
              </div>
            </div>

            {/* Action Buttons based on ownership & state */}
            {isOwner ? (
              <div className="space-y-3">
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded-xl text-xs font-medium text-center">
                  You are the owner of this item
                </div>
                <Link
                  href="/my-items"
                  className="btn-cyan w-full py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center"
                >
                  Manage in My Items
                </Link>
              </div>
            ) : item.status === "borrowed" ? (
              <div className="space-y-2">
                <div className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/25 text-center">
                  Currently Borrowed by a Student
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Check back later once the current borrower returns it.
                </p>
              </div>
            ) : item.status === "paused" ? (
              <div className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-slate-400 bg-slate-900 border border-slate-800 text-center">
                Currently Paused by Owner
              </div>
            ) : existingUserRequest ? (
              <div className="space-y-2">
                <div className="p-3 bg-purple-950/40 border border-purple-500/25 text-purple-300 rounded-xl text-xs font-medium text-center">
                  You have an active request: <strong>{existingUserRequest.status.replace("_", " ")}</strong>
                </div>
                <Link
                  href="/my-borrows"
                  className="btn-cyan w-full py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center"
                >
                  View Request in My Borrows →
                </Link>
              </div>
            ) : (
              <div>
                {!requestModalOpen ? (
                  <button
                    onClick={() => setRequestModalOpen(true)}
                    className="btn-cyan w-full py-3.5 px-6 rounded-2xl text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>Request to Borrow</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateRequest} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Note to Owner (Optional)
                      </label>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="E.g., Hi! Need this for 3 days for our tech fest workshop. Can meet at library at 5 PM."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-700/80 bg-[#070b16] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRequestModalOpen(false)}
                        className="w-1/3 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-xl border border-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingRequest}
                        className="btn-cyan w-2/3 py-2.5 text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingRequest ? "Sending..." : "Confirm Request"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Safety & Manual UPI Notice */}
            <div className="pt-4 border-t border-white/[0.06] text-xs text-slate-400 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Deposit paid via personal UPI app only after owner accepts your request.</span>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Phone numbers are unlocked once deposit is confirmed to coordinate campus pickup.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
