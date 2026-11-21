"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Item, BorrowRequest, RequestStatus } from "@/types/database";
import { formatRupees, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { StepIndicator } from "@/components/StepIndicator";
import { EmptyState } from "@/components/EmptyState";
import { RatingModal } from "@/components/RatingModal";
import {
  PlusCircle,
  Phone,
  MessageCircle,
  Building,
  CheckCircle,
  XCircle,
  RotateCcw,
  Star,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function MyItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [requestsByItem, setRequestsByItem] = useState<Record<string, BorrowRequest[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

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

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Fetch user's items
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData as Item[]);

      // Default expand the first item if exists
      if (itemsData && itemsData.length > 0 && !expandedItemId) {
        setExpandedItemId(itemsData[0].id);
      }

      // 2. Fetch requests for all owned items
      if (itemsData && itemsData.length > 0) {
        const itemIds = itemsData.map((i) => i.id);
        const { data: reqsData, error: reqsError } = await supabase
          .from("requests")
          .select(`
            *,
            borrower:users!requests_borrower_id_fkey(*),
            deposit:deposits(*),
            ratings(*)
          `)
          .in("item_id", itemIds)
          .order("created_at", { ascending: false });

        if (reqsError) throw reqsError;

        // Group by item_id
        const grouped: Record<string, BorrowRequest[]> = {};
        (reqsData as BorrowRequest[]).forEach((req) => {
          if (!grouped[req.item_id]) grouped[req.item_id] = [];
          grouped[req.item_id].push(req);
        });
        setRequestsByItem(grouped);
      }
    } catch (err: unknown) {
      console.error("Error loading my items:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Action: Accept Request
  async function handleAcceptRequest(requestId: string, itemId: string) {
    setActionLoading(requestId);
    setNotification(null);
    try {
      const supabase = createClient();

      // Ensure no other request for this item is already active
      const { data: activeOthers } = await supabase
        .from("requests")
        .select("id")
        .eq("item_id", itemId)
        .in("status", ["accepted", "deposit_paid", "picked_up"])
        .neq("id", requestId);

      if (activeOthers && activeOthers.length > 0) {
        throw new Error("Another request is already active for this item.");
      }

      // Update request status to 'accepted'
      const { error: reqError } = await supabase
        .from("requests")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (reqError) throw reqError;

      setNotification({
        message: "Request accepted! Borrower has been instructed to pay the deposit to your UPI ID.",
        type: "success",
      });
      await loadData();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to accept request.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  // Action: Reject Request
  async function handleRejectRequest(requestId: string) {
    setActionLoading(requestId);
    setNotification(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("requests")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;
      setNotification({ message: "Request declined.", type: "success" });
      await loadData();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to reject request.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  // Action: Confirm Deposit Received
  async function handleConfirmDeposit(requestId: string) {
    setActionLoading(requestId);
    setNotification(null);
    try {
      const supabase = createClient();

      // Update deposit status to confirmed
      const { error: depError } = await supabase
        .from("deposits")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("request_id", requestId);

      if (depError) throw depError;

      // Also ensure request status is deposit_paid or keep in sync
      const { error: reqError } = await supabase
        .from("requests")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (reqError) throw reqError;

      setNotification({
        message: "Deposit confirmed! Borrower's contact info is now unlocked below. Coordinate campus meetup.",
        type: "success",
      });
      await loadData();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to confirm deposit.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  // Action: Confirm Return & Refund Deposit
  async function handleConfirmReturnAndRefund(
    requestId: string,
    itemId: string,
    depositAmount: number,
    borrowerName: string
  ) {
    const confirmPrompt = window.confirm(
      `IMPORTANT:\nPlease confirm you have inspected your item and transferred back the refundable deposit of ${formatRupees(
        depositAmount
      )} to ${borrowerName} via your UPI app outside the website.\n\nClick OK to mark this item as returned and available again.`
    );

    if (!confirmPrompt) return;

    setActionLoading(requestId);
    setNotification(null);

    try {
      const supabase = createClient();

      // 1. Update deposit to 'refunded'
      const { error: depError } = await supabase
        .from("deposits")
        .update({
          status: "refunded",
          refunded_at: new Date().toISOString(),
        })
        .eq("request_id", requestId);

      if (depError) throw depError;

      // 2. Update request status to 'returned'
      const { error: reqError } = await supabase
        .from("requests")
        .update({
          status: "returned",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (reqError) throw reqError;

      // 3. Mark item status as 'available' again!
      const { error: itemError } = await supabase
        .from("items")
        .update({
          status: "available",
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (itemError) throw itemError;

      setNotification({
        message: `Item marked as returned and deposit refunded! Please leave a rating for ${borrowerName}.`,
        type: "success",
      });
      await loadData();
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : "Failed to confirm return.",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  // Action: Toggle Item Status between available and paused
  async function handleToggleStatus(itemId: string, currentStatus: string) {
    if (currentStatus === "borrowed") {
      alert("Cannot change status while item is currently borrowed by a student.");
      return;
    }

    const nextStatus = currentStatus === "available" ? "paused" : "available";
    try {
      const supabase = createClient();
      await supabase.from("items").update({ status: nextStatus }).eq("id", itemId);
      await loadData();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Listed Items & Borrow Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your items, accept incoming requests, and verify UPI deposits
          </p>
        </div>

        <Link
          href="/items/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Another Item</span>
        </Link>
      </div>

      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm ${
            notification.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Campus Dispute Disclaimer Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-start gap-3 text-xs leading-relaxed">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Notice:</strong> UPI deposits move directly student-to-student. Make sure you check your UPI app (GPay / PhonePe / Paytm) before tapping &quot;Confirm deposit received&quot;. Any physical damage or non-return disputes are arbitrated by campus student welfare or hostel wardens.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-3">Loading your items and requests...</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-8 h-8" />}
          title="You haven't listed any items yet"
          description="Have an extra bicycle, drafter, camera, or lab coat sitting in your hostel room? List it now to help campus mates!"
          actionText="List an Item for Free"
          actionHref="/items/new"
        />
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const itemReqs = requestsByItem[item.id] || [];
            const isExpanded = expandedItemId === item.id;
            const pendingCount = itemReqs.filter((r) => r.status === "pending").length;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm transition-all"
              >
                {/* Item Summary Bar */}
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      {item.photo_url ? (
                        <Image
                          src={item.photo_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-brand-600 bg-brand-50">
                          {item.category}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={item.status} type="item" />
                        <span className="text-xs font-bold text-gray-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {formatRupees(item.deposit_amount)} deposit
                        </span>
                      </div>
                      <Link
                        href={`/items/${item.id}`}
                        className="font-bold text-gray-900 hover:text-brand-600 transition-colors text-base line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <span className="text-xs text-gray-400">Listed on {formatDate(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 sm:self-center">
                    {item.status !== "borrowed" && (
                      <button
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          item.status === "available"
                            ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {item.status === "available" ? "Pause Listing" : "Resume Listing"}
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <span>
                        Requests ({itemReqs.length})
                        {pendingCount > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                            {pendingCount} new
                          </span>
                        )}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Requests Section */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50/60 divide-y divide-gray-200/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                      Incoming Borrow Requests ({itemReqs.length})
                    </h3>

                    {itemReqs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-400">
                        No requests received for this item yet. When students tap &quot;Request to borrow&quot;, they will appear here.
                      </div>
                    ) : (
                      <div className="space-y-6 pt-2">
                        {itemReqs.map((req) => {
                          const depositConfirmed = req.deposit?.status === "confirmed";
                          const depositRefunded = req.deposit?.status === "refunded";
                          const isDepositPaid = req.status === "deposit_paid" || req.deposit?.status === "paid";
                          const phoneRevealed = depositConfirmed || req.status === "picked_up" || req.status === "returned" || req.status === "completed";

                          return (
                            <div
                              key={req.id}
                              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4"
                            >
                              {/* Borrower Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-100">
                                    {req.borrower?.full_name ? req.borrower.full_name.charAt(0) : "B"}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                      <span>{req.borrower?.full_name || "Campus Student"}</span>
                                      <span className="text-[11px] font-normal text-gray-400">
                                        • {formatDate(req.created_at)}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                      <Building className="w-3.5 h-3.5 text-gray-400" />
                                      <span>{req.borrower?.hostel_block || "Campus Hostel"}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <StatusBadge status={req.status} type="request" />
                                </div>
                              </div>

                              {/* Borrower's note if any */}
                              {req.message && (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-700 italic">
                                  &quot;{req.message}&quot;
                                </div>
                              )}

                              {/* Progress Step Indicator */}
                              <div className="pt-2">
                                <StepIndicator status={req.status} userRole="owner" />
                              </div>

                              {/* Phone details UNLOCKED ONLY AFTER DEPOSIT CONFIRMED */}
                              {phoneRevealed && req.borrower?.phone && (
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div>
                                    <span className="font-bold block text-sm">
                                      📞 Contact Unlocked: {req.borrower.phone}
                                    </span>
                                    <span className="text-emerald-700">
                                      Coordinate meetup with {req.borrower.full_name} at hostel or library.
                                    </span>
                                  </div>

                                  <div className="flex gap-2">
                                    <a
                                      href={`tel:${req.borrower.phone}`}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      <span>Call</span>
                                    </a>
                                    <a
                                      href={`https://wa.me/91${req.borrower.phone.replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>WhatsApp</span>
                                    </a>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons for this request */}
                              <div className="pt-2 flex flex-wrap items-center gap-3">
                                {/* STEP 2: Pending -> Accept / Reject */}
                                {req.status === "pending" && (
                                  <>
                                    <button
                                      disabled={actionLoading === req.id}
                                      onClick={() => handleAcceptRequest(req.id, item.id)}
                                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Accept Request</span>
                                    </button>
                                    <button
                                      disabled={actionLoading === req.id}
                                      onClick={() => handleRejectRequest(req.id)}
                                      className="px-4 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      <span>Decline</span>
                                    </button>
                                  </>
                                )}

                                {/* STEP 3: Accepted, awaiting borrower's UPI payment */}
                                {req.status === "accepted" && (
                                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium w-full">
                                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>
                                      Awaiting borrower payment. Borrower will send {formatRupees(item.deposit_amount)} to your UPI ID and tap &quot;I have paid&quot;.
                                    </span>
                                  </div>
                                )}

                                {/* STEP 4: Borrower paid -> Owner confirms deposit */}
                                {req.status === "deposit_paid" && !depositConfirmed && (
                                  <div className="w-full space-y-2">
                                    <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs">
                                      <strong>Borrower marked deposit as paid on UPI!</strong> Please open your UPI app (GPay / PhonePe / Paytm) and verify that you received <strong>{formatRupees(item.deposit_amount)}</strong>.
                                    </div>
                                    <button
                                      disabled={actionLoading === req.id}
                                      onClick={() => handleConfirmDeposit(req.id)}
                                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Confirm Deposit Received ({formatRupees(item.deposit_amount)})</span>
                                    </button>
                                  </div>
                                )}

                                {/* STEP 5: Deposit confirmed, waiting for borrower to meet & mark picked up */}
                                {(req.status === "deposit_paid" || req.status === "accepted") && depositConfirmed && (
                                  <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium w-full">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                      Deposit confirmed! Meet {req.borrower?.full_name} on campus. Borrower will tap &quot;I picked it up&quot; once handed over.
                                    </span>
                                  </div>
                                )}

                                {/* STEP 6: Picked Up -> Owner confirms Return & Refunds deposit */}
                                {req.status === "picked_up" && (
                                  <div className="w-full space-y-2">
                                    <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs">
                                      Item is in borrower&apos;s possession. When they return it, inspect the condition and refund the {formatRupees(item.deposit_amount)} deposit on UPI.
                                    </div>
                                    <button
                                      disabled={actionLoading === req.id}
                                      onClick={() =>
                                        handleConfirmReturnAndRefund(
                                          req.id,
                                          item.id,
                                          item.deposit_amount,
                                          req.borrower?.full_name || "Borrower"
                                        )
                                      }
                                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                      <span>Confirm Return & Refund Deposit ({formatRupees(item.deposit_amount)})</span>
                                    </button>
                                  </div>
                                )}

                                {/* STEP 7: Returned -> Rating prompt */}
                                {(req.status === "returned" || req.status === "completed") && (
                                  <div className="flex items-center gap-3 w-full">
                                    <button
                                      onClick={() =>
                                        setRatingModalData({
                                          isOpen: true,
                                          requestId: req.id,
                                          rateeId: req.borrower_id,
                                          rateeName: req.borrower?.full_name || "Borrower",
                                          itemTitle: item.title,
                                        })
                                      }
                                      className="px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                                    >
                                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                      <span>Rate Borrower</span>
                                    </button>
                                    <span className="text-xs text-gray-500">
                                      Returned & deposit refunded.
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModalData.isOpen}
        onClose={() => setRatingModalData((prev) => ({ ...prev, isOpen: false }))}
        requestId={ratingModalData.requestId}
        rateeId={ratingModalData.rateeId}
        rateeName={ratingModalData.rateeName}
        itemTitle={ratingModalData.itemTitle}
        onSuccess={() => {
          setNotification({ message: "Thank you! Rating submitted.", type: "success" });
          loadData();
        }}
      />
    </div>
  );
}

