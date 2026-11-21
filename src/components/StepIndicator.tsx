import React from "react";
import { RequestStatus } from "@/types/database";
import { Check, Clock } from "lucide-react";

interface StepIndicatorProps {
  status: RequestStatus;
  userRole?: "borrower" | "owner";
}

const STEPS = [
  { key: "pending", label: "Requested", short: "Requested" },
  { key: "accepted", label: "Accepted", short: "Accepted" },
  { key: "deposit_paid", label: "Deposit paid", short: "Paid" },
  { key: "confirmed", label: "Deposit confirmed", short: "Confirmed" },
  { key: "picked_up", label: "Picked up", short: "Picked up" },
  { key: "returned", label: "Returned", short: "Returned" },
];

export function StepIndicator({ status }: StepIndicatorProps) {
  // If terminal error state
  if (status === "rejected" || status === "cancelled") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center justify-between">
        <span className="font-medium">
          {status === "rejected" ? "Request was declined by owner" : "Request was cancelled"}
        </span>
        <span className="text-xs uppercase tracking-wider font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded">
          {status}
        </span>
      </div>
    );
  }

  // Calculate index of current step
  const getStepIndex = (st: RequestStatus): number => {
    switch (st) {
      case "pending":
        return 0;
      case "accepted":
        return 1;
      case "deposit_paid":
        return 2;
      case "picked_up":
        return 4; // After confirmed
      case "returned":
      case "completed":
        return 5;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-2">
      {/* Mobile simplified bar */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1.5">
          <span>Step {Math.min(currentIndex + 1, STEPS.length)} of {STEPS.length}</span>
          <span className="text-brand-700 font-semibold">{STEPS[currentIndex]?.label || status}</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop / Tablet full step sequence */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-0" />
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-brand-600 -z-0 transition-all duration-300"
          style={{
            width: `${(currentIndex / (STEPS.length - 1)) * 92}%`,
          }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex || status === "completed";
          const isCurrent = index === currentIndex && status !== "completed";
          const isUpcoming = index > currentIndex && status !== "completed";

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isCompleted
                    ? "bg-brand-600 text-white ring-4 ring-white"
                    : isCurrent
                    ? "bg-white border-2 border-brand-600 text-brand-700 ring-4 ring-brand-50"
                    : "bg-white border border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 animate-spin text-brand-600" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium text-center whitespace-nowrap transition-colors ${
                  isCurrent
                    ? "text-brand-800 font-semibold"
                    : isCompleted
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

