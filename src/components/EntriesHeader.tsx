"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons/Icons";

export default function EntriesHeader() {
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
      <div className="w-20" />
    </div>
  );
}
