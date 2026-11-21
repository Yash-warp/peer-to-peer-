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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Available to Borrow
          </span>
        );
      case "borrowed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 mr-1.5 bg-amber-500 rounded-full"></span>
            Currently Borrowed
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            Paused / Inactive
          </span>
        );
      default:
        return <span className="inline-flex px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">{status}</span>;
    }
  }

  // Request & Deposit statuses
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          ⏳ Pending Owner Approval
        </span>
      );
    case "accepted":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          ✓ Request Accepted (Awaiting UPI Deposit)
        </span>
      );
    case "deposit_paid":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          💳 Deposit Paid (Awaiting Owner Confirmation)
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          ✓ Deposit Confirmed (Ready to Meet)
        </span>
      );
    case "picked_up":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          📦 Currently in Possession (Picked Up)
        </span>
      );
    case "returned":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
          🔄 Returned & Deposit Refunded
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
          ★ Completed
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          ✕ Request Rejected
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          ✕ Cancelled
        </span>
      );
    default:
      return <span className="inline-flex px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">{status}</span>;
  }
}

