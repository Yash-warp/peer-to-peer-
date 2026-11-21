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
      className="group bg-[#0d1424]/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] hover:border-cyan-500/40 hover-lift overflow-hidden shadow-lg shadow-black/40 transition-all duration-200 flex flex-col"
    >
      {/* Item Image */}
      <div className="relative aspect-[4/3] w-full bg-[#080d1a] overflow-hidden">
        {item.photo_url ? (
          <Image
            src={item.photo_url}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1e] text-cyan-400">
            <div className="p-4 bg-cyan-950/40 rounded-2xl border border-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-500/10">
              {CATEGORY_ICONS[item.category] || <Package className="w-8 h-8" />}
            </div>
            <span className="text-xs font-semibold text-slate-400 mt-2">
              {CATEGORY_NAMES[item.category] || "Campus Item"}
            </span>
          </div>
        )}

        {/* Deposit Tag overlay */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#060911]/90 backdrop-blur-md text-cyan-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-cyan-500/20 shadow-lg">
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
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mb-1">
            <span>{CATEGORY_NAMES[item.category] || item.category}</span>
          </div>
          <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 text-base">
            {item.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description || "Available to borrow on campus with refundable deposit."}
          </p>
        </div>

        {/* Owner & Hostel footer */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300 truncate max-w-[140px]">
            {item.owner?.full_name ? item.owner.full_name.split(" ")[0] : "Student"}
          </span>
          <span className="text-[11px] bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded text-slate-300 truncate max-w-[120px]">
            {item.owner?.hostel_block || "Campus"}
          </span>
        </div>
      </div>
    </Link>
  );
}
