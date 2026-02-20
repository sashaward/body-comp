"use client";

import { TrendUpIcon, TrendDownIcon } from "./icons/Icons";

type DeltaVerdict = "good" | "bad" | "neutral";

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  delta: number | null;
  color: "weight" | "muscle" | "fatMass" | "fatPercent";
  invertDelta?: boolean; // When true: decrease is good (e.g. body fat mass/%)
  deltaVerdict?: DeltaVerdict; // Override: use custom verdict instead of invertDelta
  isActive?: boolean; // Toggles visibility on graph
  isSoleActive?: boolean; // True when this is the only metric selected (subtle active emphasis)
  onToggle?: () => void;
}

const colorConfig: Record<string, { inner: string; outer: string }> = {
  weight: { inner: "#FFD60A", outer: "rgba(255, 214, 10, 0.25)" },
  muscle: { inner: "#A855F7", outer: "rgba(168, 85, 247, 0.25)" },
  fatMass: { inner: "#40E0D0", outer: "rgba(64, 224, 208, 0.25)" },
  fatPercent: { inner: "#5DD39E", outer: "rgba(93, 211, 158, 0.25)" },
};

export default function MetricCard({
  title,
  value,
  unit,
  delta,
  color,
  invertDelta = false,
  deltaVerdict,
  isActive = true,
  isSoleActive = false,
  onToggle,
}: MetricCardProps) {
  const isPositive = delta !== null && delta > 0;
  const isNegative = delta !== null && delta < 0;

  const deltaIsGood =
    deltaVerdict !== undefined
      ? deltaVerdict === "good"
      : invertDelta
        ? isNegative
        : isPositive;
  const deltaIsBad =
    deltaVerdict !== undefined
      ? deltaVerdict === "bad"
      : invertDelta
        ? isPositive
        : isNegative;

  const pillGood = "bg-[var(--glass-active-bg)] text-[var(--delta-positive)] border border-[var(--delta-positive)]/30";
  const pillBad = "bg-[var(--glass-active-bg)] text-[var(--delta-negative)] border border-[var(--delta-negative)]/30";

  const formatDelta = (d: number, u: string) => {
    const sign = d > 0 ? "+" : "";
    const unitDisplay = u === "kg" ? "kg" : u;
    return `${sign}${d.toFixed(1)}${unitDisplay} vs last`;
  };

  const { inner, outer } = colorConfig[color];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-[var(--radius-metric)] p-6 flex flex-col justify-between min-h-[160px] opacity-0 animate-slide-up transition-all duration-300 ease-out cursor-pointer overflow-hidden hover:scale-[1.02] active:scale-[0.98] ${
        isActive
          ? isSoleActive
            ? "bg-[var(--bg-elevated)] border border-white/[0.12]"
            : "bg-[var(--bg-elevated)] border border-white/[0.08]"
          : "bg-[var(--glass-bg)] backdrop-blur-[20px] border border-white/[0.06] opacity-70 hover:opacity-95 hover:bg-[var(--glass-bg-elevated)]"
      }`}
      style={
        isActive && isSoleActive
          ? { boxShadow: `0 0 0 1px ${outer}` }
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold tracking-wider transition-colors duration-300 ${
            isActive ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"
          }`}
        >
          {title}
        </span>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
          style={{
            backgroundColor: isActive ? outer : "rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: isActive ? inner : "#6B6B6B",
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        {value !== null ? (
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-4xl font-extrabold tabular-nums transition-colors duration-300 ${
                isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
              }`}
            >
              {value.toFixed(1)}
            </span>
            <span
              className={`text-base font-medium transition-colors duration-300 ${
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
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs tracking-wide ${
              deltaIsGood ? pillGood : deltaIsBad ? pillBad : "bg-[var(--glass-active-bg)] text-[var(--text-secondary)] border border-white/10"
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
