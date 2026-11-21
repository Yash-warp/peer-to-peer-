"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ITEM_CATEGORIES, ItemCategory } from "@/config/college";
import { formatRupees } from "@/lib/utils";
import { Upload, X, AlertCircle, ArrowLeft, Image as ImageIcon, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NewItemPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory>("cycle");
  const [depositAmount, setDepositAmount] = useState<number>(200);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userUpiId, setUserUpiId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkOwnerUpi() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("upi_id")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.upi_id) {
          setUserUpiId(profile.upi_id);
        }
      }
    }
    checkOwnerUpi();
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title for your item.");
      return;
    }

    if (depositAmount < 0) {
      setError("Deposit amount cannot be negative.");
      return;
    }

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

      let photoUrl: string | null = null;

      // Upload photo if selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("item-photos")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.warn("Storage upload failed, proceeding without image:", uploadError);
          // If storage bucket isn't created yet or permission error, inform user
          setError(`Photo upload failed: ${uploadError.message}. Make sure the 'item-photos' bucket is created in Supabase.`);
          setLoading(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("item-photos").getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Insert item record into items table
      const { data: newItem, error: insertError } = await supabase
        .from("items")
        .insert({
          owner_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          deposit_amount: depositAmount,
          photo_url: photoUrl,
          status: "available",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/items/${newItem.id}`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to list item. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          List an Item for Lending
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Make your unused cycle, drafter, or camera useful to a fellow student on campus.
        </p>
      </div>

      {!userUpiId && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 text-xs leading-relaxed">
          <CreditCard className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Note: Add your UPI ID on your profile</p>
            <p className="mt-0.5">
              You haven&apos;t added a UPI ID yet. When a borrower&apos;s request is accepted, they will need your UPI ID to pay the refundable deposit.
            </p>
            <Link
              href="/profile"
              className="inline-block mt-2 font-semibold text-amber-900 underline hover:text-black"
            >
              Update your UPI ID in Profile →
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Item Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Item Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hero Sprint 21-Speed Gear Bicycle, Mini Drafter with Board Clips"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Category & Deposit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Refundable Deposit (Rupees) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                placeholder="200"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Paid via UPI before pickup; refunded when returned in good condition.
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Description & Campus Pickup Details
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe condition, accessories included, preferred pickup spots (e.g. Hostel Gate 2 or Library entrance), and any usage rules."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Photo Upload to Supabase Storage */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Item Photo (Optional but recommended)
          </label>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] w-full max-w-md bg-gray-100 border border-gray-200">
              <Image
                src={imagePreview}
                alt="Item preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-brand-50/30">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
                <ImageIcon className="w-6 h-6 text-brand-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">
                Upload a photo of your item
              </span>
              <span className="text-xs text-gray-400 mt-0.5">PNG, JPG, or WEBP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Link
            href="/browse"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Publishing Item..." : "Publish Item on Campus"}
          </button>
        </div>
      </form>
    </div>
  );
}

