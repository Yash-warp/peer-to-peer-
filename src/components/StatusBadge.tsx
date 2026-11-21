import React from "react";
import { ItemStatus, RequestStatus, DepositStatus } from "@/types/database";

interface StatusBadgeProps {
  status: ItemStatus | RequestStatus | DepositStatus | string;
  type?: "item" | "request" | "deposit";
}

export function StatusBadge({ status, type = "request" }: StatusBadgeProps) {
  if (type === "item") {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm shadow-emerald-500/10">
            <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400"></span>
            Available to Borrow
          </span>
        );
      case "borrowed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">
            <span className="w-1.5 h-1.5 mr-1.5 bg-amber-400 rounded-full"></span>
            Currently Borrowed
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
            Paused / Inactive
          </span>
        );
      default:
        return <span className="inline-flex px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  }

  // Request & Deposit statuses
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
          ⏳ Pending Owner Approval
        </span>
      );
    case "accepted":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shadow-sm shadow-cyan-500/10">
          ✓ Request Accepted (Awaiting UPI Deposit)
        </span>
      );
    case "deposit_paid":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/25">
          💳 Deposit Paid (Awaiting Owner Confirmation)
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/25">
          ✓ Deposit Confirmed (Ready to Meet)
        </span>
      );
    case "picked_up":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/25">
          📦 Currently in Possession (Picked Up)
        </span>
      );
    case "returned":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
          🔄 Returned & Deposit Refunded
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-sm shadow-cyan-500/10">
          ★ Completed
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/25">
          ✕ Request Rejected
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
          ✕ Cancelled
        </span>
      );
    default:
      return <span className="inline-flex px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300">{status}</span>;
  }
}
