"use client";

import { TrendUpIcon, TrendDownIcon } from "./icons/Icons";

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  delta: number | null;
  color: "weight" | "muscle" | "fatMass" | "fatPercent";
  invertDelta?: boolean; // When true: decrease is good (e.g. weight, body fat)
  isActive?: boolean; // Toggles visibility on graph
  onToggle?: () => void;
}

const colorConfig: Record<string, { inner: string; outer: string }> = {
  weight: { inner: "#6366F1", outer: "#E0E7FF" },
  muscle: { inner: "#0891B2", outer: "#CFFAFE" },
  fatMass: { inner: "#EA580C", outer: "#FFEDD5" },
  fatPercent: { inner: "#059669", outer: "#D1FAE5" },
};

export default function MetricCard({
  title,
  value,
  unit,
  delta,
  color,
  invertDelta = false,
  isActive = true,
  onToggle,
}: MetricCardProps) {
  const isPositive = delta !== null && delta > 0;
  const isNegative = delta !== null && delta < 0;

  const deltaIsGood = invertDelta ? isNegative : isPositive;
  const deltaIsBad = invertDelta ? isPositive : isNegative;

  const pillGood = "bg-emerald-500/15 backdrop-blur-sm text-emerald-700 border border-emerald-500/20";
  const pillBad = "bg-red-500/15 backdrop-blur-sm text-red-700 border border-red-500/20";

  const formatDelta = (d: number, u: string) => {
    const sign = d > 0 ? "+" : "";
    const unitDisplay = u === "kg" ? "KG" : u;
    return `${sign}${d.toFixed(1)}${unitDisplay} VS LAST`;
  };

  const { inner, outer } = colorConfig[color];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-[var(--radius-metric)] p-6 flex flex-col justify-between min-h-[160px] opacity-0 animate-slide-up transition-all cursor-pointer overflow-hidden ${
        isActive
          ? "bg-[rgba(255,255,255,0.5)] backdrop-blur-[12px] border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
          : "bg-[rgba(255,255,255,0.35)] backdrop-blur-[12px] border border-white/30 opacity-70 hover:opacity-90 hover:bg-[rgba(255,255,255,0.45)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isActive ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"
          }`}
        >
          {title}
        </span>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isActive ? outer : "#F1F5F9",
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isActive ? inner : "#94A3B8",
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        {value !== null ? (
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-4xl font-extrabold tabular-nums ${
                isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
              }`}
            >
              {value.toFixed(1)}
            </span>
            <span
              className={`text-base font-medium uppercase ${
                isActive ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"
              }`}
            >
              {unit}
            </span>
          </div>
        ) : (
          <span className="text-2xl text-[var(--text-muted)]">—</span>
        )}
      </div>

      {delta !== null && (
        <div className="flex justify-start mt-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide ${
              deltaIsGood ? pillGood : deltaIsBad ? pillBad : "bg-white/40 backdrop-blur-sm text-[var(--text-secondary)] border border-white/30"
            }`}
          >
            {deltaIsGood ? (
              <TrendUpIcon className="w-4 h-4 shrink-0" />
            ) : deltaIsBad ? (
              <TrendDownIcon className="w-4 h-4 shrink-0" />
            ) : null}
            <span>{formatDelta(delta, unit)}</span>
          </div>
        </div>
      )}
    </button>
  );
}
