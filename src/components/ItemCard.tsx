import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Item } from "@/types/database";
import { formatRupees } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Package, Bike, Compass, Shirt, Camera, Cpu, Trophy, BookOpen } from "lucide-react";

interface ItemCardProps {
  item: Item;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cycle: <Bike className="w-5 h-5" />,
  drafter: <Compass className="w-5 h-5" />,
  lab_coat: <Shirt className="w-5 h-5" />,
  camera: <Camera className="w-5 h-5" />,
  electronics: <Cpu className="w-5 h-5" />,
  sports: <Trophy className="w-5 h-5" />,
  books: <BookOpen className="w-5 h-5" />,
  other: <Package className="w-5 h-5" />,
};

const CATEGORY_NAMES: Record<string, string> = {
  cycle: "Cycle",
  drafter: "Drafter",
  lab_coat: "Lab Coat",
  camera: "Camera",
  electronics: "Electronics",
  sports: "Sports",
  books: "Books",
  other: "Equipment",
};

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200 flex flex-col"
    >
      {/* Item Image */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        {item.photo_url ? (
          <Image
            src={item.photo_url}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50/50 text-brand-600">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-brand-100 text-brand-700">
              {CATEGORY_ICONS[item.category] || <Package className="w-8 h-8" />}
            </div>
            <span className="text-xs font-medium text-brand-700/80 mt-2">
              {CATEGORY_NAMES[item.category] || "Campus Item"}
            </span>
          </div>
        )}

        {/* Deposit Tag overlay */}
        <div className="absolute bottom-2.5 left-2.5 bg-gray-900/85 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm">
          {formatRupees(item.deposit_amount)} deposit
        </div>

        {/* Status badge top right */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={item.status} type="item" />
        </div>
      </div>

      {/* Item Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-brand-700 font-medium mb-1">
            <span>{CATEGORY_NAMES[item.category] || item.category}</span>
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-base">
            {item.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
            {item.description || "Available to borrow on campus with refundable deposit."}
          </p>
        </div>

        {/* Owner & Hostel footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium text-gray-700 truncate max-w-[140px]">
            {item.owner?.full_name ? item.owner.full_name.split(" ")[0] : "Student"}
          </span>
          <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 truncate max-w-[120px]">
            {item.owner?.hostel_block || "Campus"}
          </span>
        </div>
      </div>
    </Link>
  );
}

