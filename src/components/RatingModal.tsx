"use client";

import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  rateeId: string;
  rateeName: string;
  itemTitle: string;
  onSuccess: () => void;
}

export function RatingModal({
  isOpen,
  onClose,
  requestId,
  rateeId,
  rateeName,
  itemTitle,
  onSuccess,
}: RatingModalProps) {
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Please log in to rate.");

      // Insert rating
      const { error: ratingError } = await supabase.from("ratings").insert({
        request_id: requestId,
        rater_id: user.id,
        ratee_id: rateeId,
        stars,
        comment: comment.trim() || null,
      });

      if (ratingError) {
        // If already rated
        if (ratingError.code === "23505") {
          throw new Error("You have already submitted a rating for this borrow request.");
        }
        throw ratingError;
      }

      // Check if both sides rated or mark request completed
      const { data: existingRatings } = await supabase
        .from("ratings")
        .select("id")
        .eq("request_id", requestId);

      if (existingRatings && existingRatings.length >= 2) {
        await supabase
          .from("requests")
          .update({ status: "completed" })
          .eq("id", requestId);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit rating. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1">Rate Experience</h3>
        <p className="text-sm text-gray-500 mb-5">
          How was your lending experience with <span className="font-semibold text-gray-800">{rateeName}</span> for <span className="font-semibold text-gray-800">{itemTitle}</span>?
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star selector */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const filled = starVal <= (hoverStars || stars);
                return (
                  <button
                    type="button"
                    key={starVal}
                    onMouseEnter={() => setHoverStars(starVal)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setStars(starVal)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        filled ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-medium text-gray-600 mt-2">
              {stars === 5 && "Excellent (5/5)"}
              {stars === 4 && "Great (4/5)"}
              {stars === 3 && "Average (3/5)"}
              {stars === 2 && "Poor (2/5)"}
              {stars === 1 && "Terrible (1/5)"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Review Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="E.g., Returned in perfect condition on time, very polite!"
              rows={3}
              className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

