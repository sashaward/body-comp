"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Bar,
  BarStack,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { BodyEntry } from "@/lib/storage";

type MetricKey = "weight" | "muscle" | "fatMass" | "fatPercent";

interface BiometricChartProps {
  entries: BodyEntry[];
  activeMetrics: MetricKey[];
  onLogWeighIn?: () => void;
}

type TimeRange = "3m" | "6m" | "1y" | "all";

const metrics: Record<
  MetricKey,
  { label: string; color: string; unit: string }
> = {
  weight: { label: "Weight", color: "#FFB347", unit: "kg" },
  muscle: { label: "Skeletal muscle", color: "#00B2B2", unit: "kg" },
  fatMass: { label: "Body fat mass", color: "#00D4AA", unit: "kg" },
  fatPercent: { label: "Body fat %", color: "#5DD39E", unit: "%" },
};

const otherMassColor = "#6B7F86";

// Custom dot with no border (overrides Line's strokeDasharray inheritance)
const SolidDot = (props: React.SVGProps<SVGCircleElement>) => {
  const { cx = 0, cy = 0, fill, r = 4, stroke: _s, strokeWidth: _sw, strokeDasharray: _sa, ...rest } = props;
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke="none" {...rest} />;
};

const SolidActiveDot = (props: React.SVGProps<SVGCircleElement>) => {
  const { cx = 0, cy = 0, fill, r = 6, stroke: _s, strokeWidth: _sw, strokeDasharray: _sa, ...rest } = props;
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke="none" {...rest} />;
};

const timeRanges: Record<TimeRange, { label: string; days: number | null }> = {
  "3m": { label: "3M", days: 90 },
  "6m": { label: "6M", days: 180 },
  "1y": { label: "1Y", days: 365 },
  all: { label: "ALL", days: null },
};

// Placeholder data for blurred empty-state background
const placeholderChartData = (() => {
  const points = 10;
  const baseDate = new Date();
  return Array.from({ length: points }, (_, i) => {
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() - (points - 1 - i));
    const date = format(d, "yyyy-MM-dd");
    const weight = 78 + Math.sin(i * 0.8) * 2.5;
    const fatPercent = 17 + Math.sin(i * 0.5) * 2;
    const fatMass = (weight * fatPercent) / 100;
    const muscle = 35 + i * 0.2;
    const other = Math.max(0, weight - muscle - fatMass);
    return {
      date,
      formattedDate: format(d, "MMM yy"),
      weight,
      muscle,
      fatMass,
      other,
      nonFat: Math.max(0, weight - fatMass),
      nonMuscle: Math.max(0, weight - muscle),
      fatPercent,
    };
  });
})();

export default function BiometricChart({
  entries,
  activeMetrics,
  onLogWeighIn,
}: BiometricChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1y");
  const [isDissolving, setIsDissolving] = useState(false);
  const [pendingTimeRange, setPendingTimeRange] = useState<TimeRange | null>(null);
  const [metricFadeOpacity, setMetricFadeOpacity] = useState(1);
  const [displayedMetrics, setDisplayedMetrics] = useState<MetricKey[]>(activeMetrics);
  const prevActiveMetricsRef = useRef(activeMetrics);

  // Fade out -> swap metrics -> fade in when metric tiles are toggled (preserves line drawing animation)
  useEffect(() => {
    const prev = prevActiveMetricsRef.current.join("-");
    const next = activeMetrics.join("-");
    if (prev !== next) {
      prevActiveMetricsRef.current = activeMetrics;
      setMetricFadeOpacity(0);
      const timer = setTimeout(() => {
        setDisplayedMetrics(activeMetrics);
        setMetricFadeOpacity(1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDisplayedMetrics(activeMetrics);
    }
  }, [activeMetrics]);

  const handleTimeRangeClick = useCallback((range: TimeRange) => {
    if (range === timeRange || pendingTimeRange) return;
    setPendingTimeRange(range);
    setIsDissolving(true);
  }, [timeRange, pendingTimeRange]);

  const handleDissolveEnd = useCallback(() => {
    if (pendingTimeRange) {
      setTimeRange(pendingTimeRange);
      setPendingTimeRange(null);
      setIsDissolving(false);
    }
  }, [pendingTimeRange]);

  const filteredEntries = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (timeRange === "all" || !timeRanges[timeRange].days) {
      return sorted;
    }

    const cutoffDate = subDays(new Date(), timeRanges[timeRange].days!);
    return sorted.filter((entry) =>
      isAfter(parseISO(entry.date), cutoffDate)
    );
  }, [entries, timeRange]);

  const chartData = useMemo(() => {
    return filteredEntries.map((entry) => {
      const other = entry.bodyWeight - entry.skeletalMuscleMass - entry.bodyFatMass;
      const nonFat = entry.bodyWeight - entry.bodyFatMass; // Total weight minus fat, for fat-in-context bars
      const nonMuscle = entry.bodyWeight - entry.skeletalMuscleMass; // Total weight minus muscle, for muscle-in-context bars
      return {
        date: entry.date,
        formattedDate: format(parseISO(entry.date), "MMM yy"),
        weight: entry.bodyWeight,
        muscle: entry.skeletalMuscleMass,
        fatMass: entry.bodyFatMass,
        other: Math.max(0, other), // Other mass (water, bones, organs, etc.)
        nonFat: Math.max(0, nonFat), // Non-fat mass, for fat-as-proportion-of-weight bars
        nonMuscle: Math.max(0, nonMuscle), // Non-muscle mass, for muscle-as-proportion-of-weight bars
        fatPercent: entry.bodyFatPercentage,
      };
    });
  }, [filteredEntries]);

  // Calculate domain for body fat percentage to give more fidelity
  const fatPercentDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 20];
    const values = chartData.map((d) => d.fatPercent);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.3;
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [chartData]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ 
      color: string; 
      name: string; 
      value: number; 
      dataKey: string; 
      payload?: { date: string; weight: number; muscle: number; fatMass: number; other: number; fatPercent: number } 
    }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    const showWeight = displayedMetrics.includes("weight");
    const showMuscle = displayedMetrics.includes("muscle");
    const showFatMass = displayedMetrics.includes("fatMass");
    const showFatPercent = displayedMetrics.includes("fatPercent");
    const showBars = showMuscle || showFatMass;
    const showFatMassOnly = showFatMass && !showMuscle;
    const showMuscleOnly = showMuscle && !showFatMass;

    return (
      <div className="glass rounded-[var(--radius-metric)] shadow-[var(--glass-shadow)] border border-white/[0.1] p-4 min-w-[160px]">
        <p className="text-xs font-medium text-[var(--text-secondary)] mb-2.5 pb-2.5 border-b border-white/10">
          {format(parseISO(data.date), "MMMM d, yyyy")}
        </p>
        <div className="space-y-2">
          {showWeight && !showFatMassOnly && !showMuscleOnly && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.weight.color }} />
                <span className="text-xs text-[var(--text-secondary)]">{metrics.weight.label}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {data.weight.toFixed(1)} kg
              </span>
            </div>
          )}
          {showMuscle && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.muscle.color }} />
                <span className="text-xs text-[var(--text-secondary)]">{metrics.muscle.label}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {data.muscle.toFixed(1)} kg{showMuscleOnly ? ` of ${data.weight.toFixed(1)} kg` : ""}
              </span>
            </div>
          )}
          {showFatMass && !showMuscleOnly && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.fatMass.color }} />
                <span className="text-xs text-[var(--text-secondary)]">{metrics.fatMass.label}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {data.fatMass.toFixed(1)} kg{showFatMassOnly ? ` of ${data.weight.toFixed(1)} kg` : ""}
              </span>
            </div>
          )}
          {showFatPercent && !showMuscleOnly && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.fatPercent.color }} />
                <span className="text-xs text-[var(--text-secondary)]">{metrics.fatPercent.label}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {data.fatPercent.toFixed(1)}%
              </span>
            </div>
          )}
          {showBars && !showFatMassOnly && !showMuscleOnly && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: otherMassColor }} />
                <span className="text-xs text-[var(--text-secondary)]">Other mass</span>
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {data.other.toFixed(1)} kg
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const showBars = displayedMetrics.includes("muscle") || displayedMetrics.includes("fatMass");
  const showFatPercentLine = displayedMetrics.includes("fatPercent");
  // Fat/muscle only: show as proportion of total weight; composition: show muscle + fat + other
  const showFatMassOnly = displayedMetrics.includes("fatMass") && !displayedMetrics.includes("muscle");
  const showMuscleOnly = displayedMetrics.includes("muscle") && !displayedMetrics.includes("fatMass");

  return (
    <div className="opacity-0 animate-slide-up stagger-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-5 mt-12 mb-8">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Progress
          </h2>
        </div>

        {/* Time range selector */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {(Object.keys(timeRanges) as TimeRange[]).map((range) => {
          const isSelected = timeRange === range;
          return (
            <button
              key={range}
              onClick={() => handleTimeRangeClick(range)}
              className={`w-14 min-w-14 py-2.5 rounded-full text-xs font-bold transition-all text-center ${
                isSelected
                  ? "bg-[var(--glass-active-bg)] text-[var(--color-accent)] border border-[var(--color-accent)]/40 shadow-[0_2px_12px_rgba(0,178,178,0.15)]"
                  : "bg-transparent text-[var(--text-secondary)] hover:bg-white/5 hover:border hover:border-white/5"
              }`}
            >
              {timeRanges[range].label}
            </button>
          );
        })}
      </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div
          className="chart-no-bottom-grid h-80 w-full min-w-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: isDissolving ? 0 : metricFadeOpacity,
          }}
          onTransitionEnd={handleDissolveEnd}
        >
          <ResponsiveContainer width="100%" height="100%" debounce={0} className="chart-no-bottom-grid">
            <ComposedChart
              key={`${timeRange}-${displayedMetrics.join("-")}`}
              data={chartData}
              margin={{ top: 10, right: showFatPercentLine ? 80 : 20, left: 10, bottom: 25 }}
              barCategoryGap="20%"
              barSize={24}
            >
              <CartesianGrid
                strokeDasharray="4 14"
                stroke="rgba(255,255,255,0.08)"
                strokeLinecap="round"
                vertical={false}
              />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 11, fill: "#A0B0B6" }}
                tickLine={false}
                axisLine={{ stroke: "transparent", strokeWidth: 0 }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#A0B0B6" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
                label={{ 
                  value: 'kg', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#A0B0B6' }
                }}
              />
              {showFatPercentLine && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: metrics.fatPercent.color }}
                  tickLine={false}
                  axisLine={false}
                  domain={fatPercentDomain}
                  tickFormatter={(value) => `${value}%`}
                  label={{ 
                    value: 'Body Fat %', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { fontSize: 11, fill: metrics.fatPercent.color }
                  }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />

              {/* Stacked bars: fat/muscle-only = as proportion of total weight; composition = muscle + fat + other */}
              {showBars && (
                showMuscleOnly ? (
                  <BarStack stackId="muscleInWeight" radius={12}>
                    <Bar
                      yAxisId="left"
                      dataKey="muscle"
                      fill={metrics.muscle.color}
                      isAnimationActive={false}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="nonMuscle"
                      fill="rgba(255,255,255,0.06)"
                      tooltipType="none"
                      isAnimationActive={false}
                    />
                  </BarStack>
                ) : showFatMassOnly ? (
                  <BarStack stackId="fatInWeight" radius={12}>
                    <Bar
                      yAxisId="left"
                      dataKey="fatMass"
                      fill={metrics.fatMass.color}
                      isAnimationActive={false}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="nonFat"
                      fill="rgba(255,255,255,0.06)"
                      tooltipType="none"
                      isAnimationActive={false}
                    />
                  </BarStack>
                ) : (
                  <BarStack stackId="composition" radius={12}>
                    {displayedMetrics.includes("muscle") && (
                      <Bar
                        yAxisId="left"
                        dataKey="muscle"
                        fill={metrics.muscle.color}
                        isAnimationActive={false}
                      />
                    )}
                    {displayedMetrics.includes("fatMass") && (
                      <Bar
                        yAxisId="left"
                        dataKey="fatMass"
                        fill={metrics.fatMass.color}
                        isAnimationActive={false}
                      />
                    )}
                    <Bar
                      yAxisId="left"
                      dataKey="other"
                      fill={otherMassColor}
                      tooltipType="none"
                      isAnimationActive={false}
                    />
                  </BarStack>
                )
              )}

              {/* Weight as line overlay */}
              {displayedMetrics.includes("weight") && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke={metrics.weight.color}
                  strokeWidth={2.5}
                  animationDuration={1600}
                  animationEasing={"cubic-bezier(0.25, 1, 0.5, 1)" as "ease"}
                  dot={{ fill: metrics.weight.color, r: 4, strokeWidth: 2, stroke: "#1A282D" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#1A282D" }}
                />
              )}

              {/* Body fat percentage on secondary axis */}
              {displayedMetrics.includes("fatPercent") && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fatPercent"
                  stroke={metrics.fatPercent.color}
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  animationDuration={1600}
                  animationEasing={"cubic-bezier(0.25, 1, 0.5, 1)" as "ease"}
                  dot={<SolidDot fill={metrics.fatPercent.color} r={4} />}
                  activeDot={<SolidActiveDot fill={metrics.fatPercent.color} r={6} />}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="relative h-80 w-full min-w-0 overflow-hidden rounded-[var(--radius-metric)]">
          {/* Blurred chart background */}
          <div
            className="absolute inset-0 opacity-40 blur-2xl pointer-events-none select-none"
            aria-hidden
          >
            <ResponsiveContainer width="100%" height="100%" className="chart-no-bottom-grid">
              <ComposedChart
                data={placeholderChartData}
                margin={{ top: 10, right: 80, left: 10, bottom: 25 }}
                barCategoryGap="20%"
                barSize={24}
              >
                <CartesianGrid
                  strokeDasharray="4 14"
                  stroke="rgba(255,255,255,0.08)"
                  strokeLinecap="round"
                  vertical={false}
                />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 11, fill: "#A0B0B6" }}
                  tickLine={false}
                  axisLine={{ stroke: "transparent", strokeWidth: 0 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "#A0B0B6" }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, "auto"]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: metrics.fatPercent.color }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 25]}
                  tickFormatter={(v) => `${v}%`}
                />
                <BarStack stackId="composition" radius={12}>
                  <Bar yAxisId="left" dataKey="muscle" fill={metrics.muscle.color} isAnimationActive={false} />
                  <Bar yAxisId="left" dataKey="fatMass" fill={metrics.fatMass.color} isAnimationActive={false} />
                  <Bar yAxisId="left" dataKey="other" fill={otherMassColor} isAnimationActive={false} />
                </BarStack>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke={metrics.weight.color}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fatPercent"
                  stroke={metrics.fatPercent.color}
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Empty state overlay */}
          <div className="relative flex items-center justify-center h-full">
            <div className="text-center glass rounded-[var(--radius-metric)] px-10 py-12 border border-white/[0.1] max-w-sm shadow-[var(--glass-shadow)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Track your body composition
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mt-3 leading-relaxed">
                Log weight, muscle mass, and body fat over time. See how your composition changes—not just the number on the scale.
              </p>
              {onLogWeighIn && (
                <button
                  onClick={onLogWeighIn}
                  className="mt-8 flex items-center gap-2 bg-[var(--color-accent)] text-[#0F1A1E] px-6 py-3 rounded-[var(--radius-button)] font-semibold text-sm hover:brightness-110 transition-all shadow-[var(--shadow-accent)] mx-auto"
                >
                  Add your first weigh-in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
