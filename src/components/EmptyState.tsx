import React from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-[#0d1424]/80 backdrop-blur-xl rounded-3xl border border-dashed border-slate-700/80 shadow-2xl max-w-xl mx-auto my-6">
      <div className="w-16 h-16 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-sm shadow-cyan-500/10">
        {icon || <PackageSearch className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="btn-cyan inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm transition-all"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
