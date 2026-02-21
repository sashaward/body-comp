"use client";

import Link from "next/link";
import { ChevronLeftIcon, TrashIcon } from "@/components/icons/Icons";

interface EntriesHeaderProps {
  onClearAll?: () => void;
  hasEntries?: boolean;
}

export default function EntriesHeader({ onClearAll, hasEntries }: EntriesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        <span className="text-sm font-medium tracking-wider">Back</span>
      </Link>
      <h1 className="text-lg font-semibold text-[var(--text-primary)]">
        All entries
      </h1>
      {hasEntries && onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          title="Clear all data"
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--delta-negative)] hover:bg-white/5 rounded-[var(--radius-button)] transition-all"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-9" />
      )}
    </div>
  );
}
