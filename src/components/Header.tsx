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
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Body composition
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-normal uppercase tracking-wider">
            Inbody Weigh Ins
          </p>
        </div>
      </div>
      
      <button
        onClick={onLogWeighIn}
        className="flex items-center gap-2 bg-[var(--color-weight)] text-[#121212] px-5 py-2.5 rounded-[var(--radius-button)] font-semibold text-sm uppercase tracking-wide hover:brightness-110 transition-all shadow-[0_4px_24px_rgba(255,214,10,0.25)]"
      >
        Log Weigh-In
      </button>
    </header>
  );
}
