"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { BorrowRequest } from "@/types/database";
import { formatRupees, formatDate, generateUpiUrl } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { StepIndicator } from "@/components/StepIndicator";
import { EmptyState } from "@/components/EmptyState";
import { RatingModal } from "@/components/RatingModal";
import { UpiQRCodeModal } from "@/components/UpiQRCodeModal";
import {
  Package,
  Phone,
  MessageCircle,
  CheckCircle,
  CreditCard,
  Copy,
  Check,
  Star,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  QrCode,
} from "lucide-react";

export default function MyBorrowsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  // Rating modal state
  const [ratingModalData, setRatingModalData] = useState<{
    isOpen: boolean;
    requestId: string;
    rateeId: string;
    rateeName: string;
    itemTitle: string;
  }>({
    isOpen: false,
    requestId: "",
    rateeId: "",
    rateeName: "",
    itemTitle: "",
  });

  // UPI QR Code modal state
  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    requestId: string;
    upiId: string;
    payeeName: string;
    amount: number;
    itemTitle: string;
  }>({
    isOpen: false,
    requestId: "",
    upiId: "",
    payeeName: "",
    amount: 0,
    itemTitle: "",
  });

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function loadBorrows() {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          item:items(
            *,
            owner:counterparty_users(*)
          ),
          deposit:deposits(*),
          ratings(*)
        `)
        .eq("borrower_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data as BorrowRequest[]);
    } catch (err: unknown) {
      console.error("Error loading borrows:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBorrows();
  }, []);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedUpi(text);
    setTimeout(() => setCopiedUpi(null), 2000);
  }

  async function handleMarkPaid(requestId: string) {
    setActionLoading(requestId);
    setNotification(null);
    try {
      const supabase = createClient();

      const { error: depError } = await supabase
        .from("deposits")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("request_id", requestId);

      if (depError) throw depError;

      const { error: reqError } = await supabase
        .from("requests")
        .update({
          status: "deposit_paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (reqError) throw reqError;

      setNotification({
        message: "Marked as paid! The owner will check their UPI app and confirm receipt.",
        type: "success",
      });
      await loadBorrows();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to update payment status.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkPickedUp(requestId: string, itemId: string) {
    setActionLoading(requestId);
    setNotification(null);
    try {
      const supabase = createClient();

      const { error: reqError } = await supabase
        .from("requests")
        .update({
          status: "picked_up",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (reqError) throw reqError;

      const { error: itemError } = await supabase
        .from("items")
        .update({
          status: "borrowed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (itemError) throw itemError;

      setNotification({
        message: "You have picked up the item! Keep it safe and return on time.",
        type: "success",
      });
      await loadBorrows();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to record pickup.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelRequest(requestId: string) {
    const confirmCancel = window.confirm("Are you sure you want to cancel this borrow request?");
    if (!confirmCancel) return;

    setActionLoading(requestId);
    setNotification(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("requests")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      setNotification({ message: "Request cancelled.", type: "success" });
      await loadBorrows();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to cancel request.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            My Borrow Requests
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Track your requests, complete UPI deposits, and coordinate campus pickups
          </p>
        </div>

        <Link
          href="/browse"
          className="btn-cyan inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all shrink-0"
        >
          <span>Browse More Items</span>
        </Link>
      </div>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm ${
            notification.type === "success"
              ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border border-red-500/30 text-red-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Campus Dispute Disclaimer Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-[#0d1424]/80 backdrop-blur-xl border border-white/[0.08] text-slate-300 flex items-start gap-3 text-xs leading-relaxed shadow-lg">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Notice:</strong> UPI deposits move directly between students without intermediaries. When you return the item in good shape, the owner will refund your deposit to your UPI app. Any campus disputes are handled by campus student welfare or hostel wardens.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-3">Loading your borrow requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No items borrowed yet"
          description="Looking for a cycle, camera, or drafter on campus? Browse what your campus peers have listed right now."
          actionText="Browse Campus Items"
          actionHref="/browse"
        />
      ) : (
        <div className="space-y-6">
          {requests.map((req) => {
            const item = req.item;
            const owner = item?.owner;
            const ownerUpi = owner?.upi_id;
            const depositAmount = req.deposit?.amount ?? item?.deposit_amount ?? 0;
            const depositConfirmed = req.deposit?.status === "confirmed";
            const phoneRevealed = depositConfirmed || req.status === "picked_up" || req.status === "returned" || req.status === "completed";
            const canCancel = req.status === "pending" || req.status === "accepted" || req.status === "deposit_paid";

            const upiUrl = ownerUpi
              ? generateUpiUrl({
                  upiId: ownerUpi,
                  payeeName: owner?.full_name || "Campus Owner",
                  amount: depositAmount,
                  itemTitle: item?.title || "Item",
                })
              : null;

            return (
              <div
                key={req.id}
                className="bg-[#0d1424]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-5 sm:p-7 shadow-xl space-y-5"
              >
                {/* Item Details Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#080d19] shrink-0 border border-white/10">
                      {item?.photo_url ? (
                        <Image
                          src={item.photo_url}
                          alt={item.title || "Item"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-cyan-400 bg-cyan-950/40">
                          {item?.category || "Item"}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={req.status} type="request" />
                        <span className="text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                          {formatRupees(depositAmount)} deposit
                        </span>
                      </div>

                      <Link
                        href={`/items/${item?.id}`}
                        className="font-bold text-white hover:text-cyan-300 transition-colors text-base line-clamp-1"
                      >
                        {item?.title || "Requested Item"}
                      </Link>

                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Lender: {owner?.full_name ? owner.full_name.split(" ")[0] : "Student"}</span>
                        <span>•</span>
                        <span>{owner?.hostel_block || "Campus"}</span>
                      </div>
                    </div>
                  </div>

                  {canCancel && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      disabled={actionLoading === req.id}
                      className="text-xs font-medium text-slate-500 hover:text-red-400 transition-colors self-start sm:self-center"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>

                {/* Step Indicator */}
                <div>
                  <StepIndicator status={req.status} userRole="borrower" />
                </div>

                {/* STAGE 1: Pending */}
                {req.status === "pending" && (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/25 text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-amber-300">Request is pending owner approval</p>
                      <p className="mt-0.5 text-amber-200/90">
                        The owner will review your request. Once accepted, you&apos;ll be provided their UPI ID to pay the refundable deposit.
                      </p>
                    </div>
                  </div>
                )}

                {/* STAGE 2: Accepted -> Pay on UPI */}
                {req.status === "accepted" && (
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0a1224] to-[#070b16] border border-cyan-500/30 text-slate-200 space-y-4 shadow-lg shadow-cyan-500/5">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          Request Accepted! Pay Refundable Deposit of {formatRupees(depositAmount)} on UPI
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          Transfer directly to the owner&apos;s UPI ID via GPay, PhonePe, or Paytm. Once transferred, click <strong className="text-cyan-300">&quot;I have paid&quot;</strong> below.
                        </p>
                      </div>
                    </div>

                    {/* UPI Box */}
                    <div className="bg-[#0b1020] rounded-xl p-4 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Owner UPI ID
                        </span>
                        <span className="text-base font-extrabold text-cyan-300 font-mono">
                          {ownerUpi || "Ask owner during meetup"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ownerUpi && (
                          <button
                            onClick={() => handleCopy(ownerUpi)}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.05] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] flex items-center gap-1.5 transition-colors"
                          >
                            {copiedUpi === ownerUpi ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy UPI</span>
                              </>
                            )}
                          </button>
                        )}

                        {ownerUpi && (
                          <button
                            onClick={() =>
                              setQrModalData({
                                isOpen: true,
                                requestId: req.id,
                                upiId: ownerUpi,
                                payeeName: owner?.full_name || "Campus Owner",
                                amount: depositAmount,
                                itemTitle: item?.title || "Item",
                              })
                            }
                            className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-950/60 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Show QR</span>
                          </button>
                        )}

                        {upiUrl && (
                          <a
                            href={upiUrl}
                            className="btn-cyan px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Pay in UPI App</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action Button: I have paid */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleMarkPaid(req.id)}
                        disabled={actionLoading === req.id}
                        className="btn-cyan w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                        <span>I have paid {formatRupees(depositAmount)} via UPI</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STAGE 3: Deposit Paid -> Waiting for Owner Confirmation */}
                {req.status === "deposit_paid" && !depositConfirmed && (
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-purple-200 flex items-start gap-3 text-xs leading-relaxed">
                    <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-purple-300">Deposit paid! Waiting for owner to confirm receipt</p>
                      <p className="mt-0.5 text-purple-200/90">
                        The owner is verifying the transfer in their UPI app. Once confirmed, their phone number will unlock below so you can coordinate campus meetup!
                      </p>
                    </div>
                  </div>
                )}

                {/* CONTACT UNLOCKED ONCE DEPOSIT CONFIRMED */}
                {phoneRevealed && owner?.phone && (
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-sm block text-emerald-300">
                        📞 Owner Contact Unlocked: {owner.phone}
                      </span>
                      <span className="text-emerald-400/90">
                        Meet {owner.full_name} at {owner.hostel_block || "campus"} to collect {item?.title}.
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`tel:${owner.phone}`}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${owner.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* STAGE 4: Deposit Confirmed -> Pickup Button */}
                {depositConfirmed && req.status !== "picked_up" && req.status !== "returned" && req.status !== "completed" && (
                  <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-teal-200 space-y-3">
                    <div className="text-xs">
                      <strong className="text-teal-300">Deposit confirmed!</strong> When you meet the owner on campus and receive the item, tap the button below to confirm possession.
                    </div>
                    <button
                      onClick={() => handleMarkPickedUp(req.id, item?.id || "")}
                      disabled={actionLoading === req.id}
                      className="btn-cyan w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4 stroke-[2.5]" />
                      <span>I picked it up</span>
                    </button>
                  </div>
                )}

                {/* STAGE 5: In Possession */}
                {req.status === "picked_up" && (
                  <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-blue-200 text-xs flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-blue-300">Item is in your possession</p>
                      <p className="mt-0.5 text-blue-200/90">
                        Please take good care of the item. When finished, meet the owner to return it. The owner will inspect it and refund your {formatRupees(depositAmount)} deposit on UPI.
                      </p>
                    </div>
                  </div>
                )}

                {/* STAGE 6: Returned -> Rating Prompt */}
                {(req.status === "returned" || req.status === "completed") && (
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-sm text-emerald-300">Item returned & deposit refunded!</p>
                      <p className="mt-0.5 text-emerald-400/90">
                        Hope you had a great lending experience. Please leave a rating for the owner.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setRatingModalData({
                          isOpen: true,
                          requestId: req.id,
                          rateeId: item?.owner_id || "",
                          rateeName: owner?.full_name || "Owner",
                          itemTitle: item?.title || "Item",
                        })
                      }
                      className="px-4 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 flex items-center justify-center gap-1.5 transition-colors shrink-0"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Rate Owner</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      <UpiQRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData((prev) => ({ ...prev, isOpen: false }))}
        upiId={qrModalData.upiId}
        payeeName={qrModalData.payeeName}
        amount={qrModalData.amount}
        itemTitle={qrModalData.itemTitle}
        onConfirmPaid={() => handleMarkPaid(qrModalData.requestId)}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModalData.isOpen}
        onClose={() => setRatingModalData((prev) => ({ ...prev, isOpen: false }))}
        requestId={ratingModalData.requestId}
        rateeId={ratingModalData.rateeId}
        rateeName={ratingModalData.rateeName}
        itemTitle={ratingModalData.itemTitle}
        onSuccess={() => {
          setNotification({ message: "Thank you! Your rating has been submitted.", type: "success" });
          loadBorrows();
        }}
      />
    </div>
  );
}
