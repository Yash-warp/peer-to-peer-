import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an amount into Indian Rupees (e.g. ₹500)
 */
export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Returns a human-friendly formatted date string (e.g. 21 Nov, 2026)
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Returns relative time string (e.g. "2 hours ago", "yesterday")
 */
export function timeAgo(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "just now";
  } catch {
    return dateString;
  }
}

/**
 * Generates a UPI intent URI for mobile deep-linking
 * e.g. upi://pay?pa=owner@okhdfcbank&pn=ItemOwner&am=500&cu=INR&tn=Deposit%20for%20cycle
 */
export function generateUpiUrl(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  itemTitle: string;
}): string {
  const note = encodeURIComponent(`Deposit for ${params.itemTitle.slice(0, 30)}`);
  const name = encodeURIComponent(params.payeeName || "Campus Peer");
  return `upi://pay?pa=${encodeURIComponent(params.upiId)}&pn=${name}&am=${params.amount}&cu=INR&tn=${note}`;
}

