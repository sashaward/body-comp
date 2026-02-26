"use client";

import Link from "next/link";
import { MoreOptionsIcon } from "./icons/Icons";

interface HeaderProps {
  onLogWeighIn: () => void;
}

export default function Header({ onLogWeighIn }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pt-0 pb-3 px-0">
      <div className="flex items-center gap-5">
        <div className="flex flex-col justify-center">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            BodyComp
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-normal tracking-wider">
            Track your body composition
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
          onClick={onLogWeighIn}
          className="flex items-center gap-2 bg-[var(--color-accent)] text-[#0F1A1E] px-6 py-3 rounded-[var(--radius-button)] font-semibold text-sm hover:brightness-110 transition-all shadow-[var(--shadow-accent)]"
        >
          Log weigh-in
        </button>
      </div>
    </header>
  );
}
