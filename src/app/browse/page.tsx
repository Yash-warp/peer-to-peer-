"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Item } from "@/types/database";
import { ITEM_CATEGORIES } from "@/config/college";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import { Search, PlusCircle, Filter, X } from "lucide-react";
import Link from "next/link";

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const supabase = createClient();
        // Fetch all items with owner information
        const { data, error } = await supabase
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
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching items:", error);
        } else if (data) {
          setItems(data as Item[]);
        }
      } catch (err) {
        console.error("Unexpected fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Filter items based on category and title search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category match
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search query match (title or description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = (item.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(window.location.search);
    if (categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }
    router.replace(`/browse?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Browse Campus Items
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover equipment and essentials available to borrow from students on campus
          </p>
        </div>

        <Link
          href="/items/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List an Item to Lend</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 mb-8 shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item name (e.g., Hero Sprint cycle, Drafter kit, DSLR)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category horizontal scroll / chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            onClick={() => handleCategorySelect("all")}
            className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Items
          </button>
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm animate-pulse"
            >
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={
            searchQuery || selectedCategory !== "all"
              ? "No matching items found"
              : "No items listed yet"
          }
          description={
            searchQuery || selectedCategory !== "all"
              ? "Try clearing your filters or search keywords to see all available campus items."
              : "Be the first to list a cycle, drafter, or camera on campus! Help a classmate and earn goodwill."
          }
          actionText="List an Item"
          actionHref="/items/new"
        />
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4 px-1">
            <span>
              Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? "item" : "items"}
            </span>
            {selectedCategory !== "all" && (
              <button
                onClick={() => handleCategorySelect("all")}
                className="text-brand-600 hover:underline font-medium"
              >
                Clear category filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading campus items...</div>}>
      <BrowseContent />
    </Suspense>
  );
}

