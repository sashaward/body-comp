"use client";

import Link from "next/link";
import { MoreOptionsIcon } from "./icons/Icons";
import Logo from "./icons/Logo";
import { format, parseISO } from "date-fns";

interface HeaderProps {
  onLogWeighIn: () => void;
  latestDate?: string;
}

export default function Header({ onLogWeighIn, latestDate }: HeaderProps) {
  const subtitle = latestDate
    ? `Last entry ${format(parseISO(latestDate), "MMMM d, yyyy")}`
    : "Your body composition";

  return (
    <header className="flex items-center justify-between pt-0 pb-3 px-0">
      <div className="flex items-center gap-3.5">
        <Logo className="w-9 h-9 shrink-0" />
        <div className="flex flex-col justify-center">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] leading-tight">
            Track
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-normal mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Link
          href="/entries"
          title="View all entries"
          className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-[var(--radius-button)] transition-all duration-300 ease-out active:scale-[0.98]"
        >
          <MoreOptionsIcon className="w-5 h-5" />
        </Link>
        <button
          type="button"
          onClick={onLogWeighIn}
          className="flex items-center gap-2 btn-primary px-6 py-3 rounded-[var(--radius-button)] font-semibold text-sm transition-all"
        >
          Log weigh-in
        </button>
      </div>
    </header>
  );
}
