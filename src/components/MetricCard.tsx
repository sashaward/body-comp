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
  weight: { inner: "#4169E1", outer: "#E0E0F0" },
  muscle: { inner: "#007AFF", outer: "#E0EDFF" },
  fatMass: { inner: "#FF9500", outer: "#FFF0E0" },
  fatPercent: { inner: "#34C759", outer: "#E0F5E0" },
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

  const pillGood = "bg-[#E0F5E0] text-[#4CAF50]";
  const pillBad = "bg-[#FFE0E0] text-[#FF3B30]";

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
      className={`w-full text-left rounded-[var(--radius-metric)] p-6 flex flex-col justify-between min-h-[160px] opacity-0 animate-slide-up transition-all cursor-pointer ${
        isActive
          ? "bg-white border border-[#E5E7EB]"
          : "bg-white border border-[#E5E7EB] opacity-60 hover:opacity-80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isActive ? "text-[#777777]" : "text-[#9CA3AF]"
          }`}
        >
          {title}
        </span>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isActive ? outer : "#F3F4F6",
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isActive ? inner : "#9CA3AF",
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        {value !== null ? (
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-4xl font-extrabold tabular-nums ${
                isActive ? "text-black" : "text-[#9CA3AF]"
              }`}
            >
              {value.toFixed(1)}
            </span>
            <span
              className={`text-base font-medium uppercase ${
                isActive ? "text-[#A0A0A0]" : "text-[#9CA3AF]"
              }`}
            >
              {unit}
            </span>
          </div>
        ) : (
          <span className="text-2xl text-[#A0A0A0]">—</span>
        )}
      </div>

      {delta !== null && (
        <div className="flex justify-center mt-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide ${
              deltaIsGood ? pillGood : deltaIsBad ? pillBad : "bg-gray-100 text-[#777777]"
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
