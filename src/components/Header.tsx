"use client";

import Logo from "./icons/Logo";

interface HeaderProps {
  onLogWeighIn: () => void;
}

export default function Header({ onLogWeighIn }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-4">
        <Logo className="w-10 h-10" />
        <div>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">
            Body composition
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-normal uppercase tracking-wider">
            Inbody Weigh Ins
          </p>
        </div>
      </div>
      
      <button
        onClick={onLogWeighIn}
        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-[var(--radius-button)] font-semibold text-sm uppercase tracking-wide hover:bg-[#2C2C2E] transition-colors"
      >
        Log Weigh-In
      </button>
    </header>
  );
}
