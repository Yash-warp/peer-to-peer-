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

        // Fetch item with owner info
        const { data: itemData, error: itemError } = await supabase
          .from("items")
          .select(
            `
            *,
            owner:users (
              id,
              full_name,
              hostel_block,
              phone
            )
          `
          )
          .eq("id", id)
          .single();

        if (itemError || !itemData) {
          throw new Error("Item not found or could not be loaded.");
        }

        setItem(itemData as Item);

        // Fetch owner ratings
        if (itemData.owner_id) {
          const { data: ratingsData } = await supabase
            .from("ratings")
            .select(`
              *,
              rater:users!ratings_rater_id_fkey(full_name)
            `)
            .eq("ratee_id", itemData.owner_id)
            .order("created_at", { ascending: false });

          if (ratingsData && ratingsData.length > 0) {
            setOwnerRatings(ratingsData as Rating[]);
            const sum = ratingsData.reduce((acc, curr) => acc + curr.stars, 0);
            setAverageRating(Number((sum / ratingsData.length).toFixed(1)));
          }
        }

        // Check if current user has an active request for this item
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

      // Check if item is available
      if (item.status !== "available") {
        throw new Error("This item is not currently available for borrowing.");
      }

      // Check if there is already an active accepted/deposit_paid/picked_up request on this item
      const { data: activeRequests } = await supabase
        .from("requests")
        .select("id")
        .eq("item_id", item.id)
        .in("status", ["accepted", "deposit_paid", "picked_up"]);

      if (activeRequests && activeRequests.length > 0) {
        throw new Error("An active borrower is already in progress with this item.");
      }

      // Insert new request
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

      // Automatically create the deposit record for this request
      await supabase.from("deposits").insert({
        request_id: newReq.id,
        amount: item.deposit_amount,
        status: "unpaid",
      });

      setSuccess("Your borrow request has been sent to the owner!");
      setRequestModalOpen(false);
      setExistingUserRequest(newReq as BorrowRequest);

      // Redirect to My Borrows after short notice
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
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Item Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">{error || "This item doesn't exist or was removed."}</p>
        <Link
          href="/browse"
          className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success} Redirecting to your borrows...</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Big Photo */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
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
              <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50/60 text-brand-600">
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-brand-100 text-brand-700 mb-2">
                  {CATEGORY_ICONS[item.category] || <Package className="w-12 h-12" />}
                </div>
                <span className="text-sm font-semibold text-brand-700">No Photo Uploaded</span>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <StatusBadge status={item.status} type="item" />
            </div>

            <div className="absolute bottom-4 right-4 bg-gray-900/85 backdrop-blur-md text-white text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-sm">
              {formatRupees(item.deposit_amount)} Refundable Deposit
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-8 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
            <h3 className="font-bold text-gray-900 text-lg mb-3">Item Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {item.description || "No specific instructions provided by the owner. You can coordinate pickup time and campus location upon request approval."}
            </p>
          </div>

          {/* Owner Reviews Section */}
          <div className="mt-8 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">
                Reviews for {ownerFirstName} ({ownerRatings.length})
              </h3>
              {averageRating !== null && (
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{averageRating} / 5.0</span>
                </div>
              )}
            </div>

            {ownerRatings.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                No ratings yet for this student. Be the first to borrow and leave a review!
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-gray-100">
                {ownerRatings.slice(0, 5).map((r) => (
                  <div key={r.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-800">
                        {r.rater?.full_name ? r.rater.full_name.split(" ")[0] : "Verified Student"}
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.stars }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-gray-600 italic">&quot;{r.comment}&quot;</p>}
                    <span className="text-[10px] text-gray-400">{formatDate(r.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Item Metadata & Borrow Action Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {item.category.replace("_", " ")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                {item.title}
              </h1>
            </div>

            {/* Deposit Box */}
            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80">
              <div className="text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">
                Security Deposit
              </div>
              <div className="text-3xl font-black text-brand-900">
                {formatRupees(item.deposit_amount)}
              </div>
              <p className="text-[11px] text-brand-700 mt-1">
                Paid directly via UPI to the owner once request is accepted. 100% refunded when returned intact.
              </p>
            </div>

            {/* Owner Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center font-bold text-base shadow-sm">
                  {ownerFirstName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <span>{ownerFirstName}</span>
                    <span title="Verified Campus Student">
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.owner?.hostel_block || "Campus Hostel"}</span>
                  </div>
                </div>
              </div>

              {/* Rating pill */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{averageRating !== null ? `${averageRating}/5` : "New"}</span>
                </div>
                <div className="text-[10px] text-gray-400">
                  {ownerRatings.length} {ownerRatings.length === 1 ? "review" : "reviews"}
                </div>
              </div>
            </div>

            {/* Action Buttons based on ownership & state */}
            {isOwner ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium text-center">
                  You are the owner of this item
                </div>
                <Link
                  href="/my-items"
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center"
                >
                  Manage in My Items
                </Link>
              </div>
            ) : item.status === "borrowed" ? (
              <div className="space-y-2">
                <div className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-amber-800 bg-amber-100 border border-amber-200 text-center">
                  Currently Borrowed by a Student
                </div>
                <p className="text-[11px] text-gray-400 text-center">
                  Check back later once the current borrower returns it.
                </p>
              </div>
            ) : item.status === "paused" ? (
              <div className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 text-center">
                Currently Paused by Owner
              </div>
            ) : existingUserRequest ? (
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl text-xs font-medium text-center">
                  You have an active request: <strong>{existingUserRequest.status.replace("_", " ")}</strong>
                </div>
                <Link
                  href="/my-borrows"
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center"
                >
                  View Request in My Borrows →
                </Link>
              </div>
            ) : (
              <div>
                {!requestModalOpen ? (
                  <button
                    onClick={() => setRequestModalOpen(true)}
                    className="w-full py-3.5 px-6 rounded-2xl text-base font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>Request to Borrow</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateRequest} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Note to Owner (Optional)
                      </label>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="E.g., Hi! Need this for 3 days for our tech fest workshop. Can meet at library at 5 PM."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRequestModalOpen(false)}
                        className="w-1/3 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingRequest}
                        className="w-2/3 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
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
            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Deposit paid via personal UPI app only after owner accepts your request.</span>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>Phone numbers are unlocked once deposit is confirmed to coordinate campus pickup.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
