"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
}

type TimeRange = "3m" | "6m" | "1y" | "all";

const metrics: Record<
  MetricKey,
  { label: string; color: string; unit: string }
> = {
  weight: { label: "Weight", color: "#FFD60A", unit: "kg" },
  muscle: { label: "Skeletal Muscle", color: "#A855F7", unit: "kg" },
  fatMass: { label: "Body Fat Mass", color: "#40E0D0", unit: "kg" },
  fatPercent: { label: "Body Fat %", color: "#5DD39E", unit: "%" },
};

const otherMassColor = "#6B6B6B";

const timeRanges: Record<TimeRange, { label: string; days: number | null }> = {
  "3m": { label: "3M", days: 90 },
  "6m": { label: "6M", days: 180 },
  "1y": { label: "1Y", days: 365 },
  all: { label: "All", days: null },
};

export default function BiometricChart({
  entries,
  activeMetrics,
}: BiometricChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1y");
  const [isDissolving, setIsDissolving] = useState(false);
  const [pendingTimeRange, setPendingTimeRange] = useState<TimeRange | null>(null);
  const [metricFadeOpacity, setMetricFadeOpacity] = useState(1);
  const prevActiveMetricsRef = useRef(activeMetrics);

  // Fade chart when metric tiles are toggled
  useEffect(() => {
    const prev = prevActiveMetricsRef.current.join("-");
    const next = activeMetrics.join("-");
    if (prev !== next) {
      prevActiveMetricsRef.current = activeMetrics;
      setMetricFadeOpacity(0);
      const timer = setTimeout(() => setMetricFadeOpacity(1), 200);
      return () => clearTimeout(timer);
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
      return {
        date: entry.date,
        formattedDate: format(parseISO(entry.date), "MMM yy"),
        weight: entry.bodyWeight,
        muscle: entry.skeletalMuscleMass,
        fatMass: entry.bodyFatMass,
        other: Math.max(0, other), // Other mass (water, bones, organs, etc.)
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

    const showWeight = activeMetrics.includes("weight");
    const showMuscle = activeMetrics.includes("muscle");
    const showFatMass = activeMetrics.includes("fatMass");
    const showFatPercent = activeMetrics.includes("fatPercent");
    const showBars = showMuscle || showFatMass;

    return (
      <div className="bg-[var(--bg-elevated)] backdrop-blur-xl rounded-[var(--radius-metric)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/[0.08] p-3 min-w-[160px]">
        <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 pb-2 border-b border-white/10">
          {format(parseISO(data.date), "MMMM d, yyyy")}
        </p>
        <div className="space-y-1.5">
          {showWeight && (
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
                {data.muscle.toFixed(1)} kg
              </span>
            </div>
          )}
          {showFatMass && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.fatMass.color }} />
                <span className="text-xs text-[var(--text-secondary)]">{metrics.fatMass.label}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {data.fatMass.toFixed(1)} kg
              </span>
            </div>
          )}
          {showFatPercent && (
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
          {showBars && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: otherMassColor }} />
                <span className="text-xs text-[var(--text-secondary)]">Other Mass</span>
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

  const showBars = activeMetrics.includes("muscle") || activeMetrics.includes("fatMass");
  const showFatPercentLine = activeMetrics.includes("fatPercent");

  return (
    <div className="opacity-0 animate-slide-up stagger-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Progress
          </h2>
        </div>

        {/* Time range selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(timeRanges) as TimeRange[]).map((range) => {
          const isSelected = timeRange === range;
          return (
            <button
              key={range}
              onClick={() => handleTimeRangeClick(range)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? "bg-[var(--glass-active-bg)] text-[var(--text-primary)] border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
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
          className="h-80 w-full min-w-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: isDissolving ? 0 : metricFadeOpacity,
          }}
          onTransitionEnd={handleDissolveEnd}
        >
          <ResponsiveContainer width="100%" height="100%" debounce={0}>
            <ComposedChart
              key={`${timeRange}-${activeMetrics.join("-")}`}
              data={chartData}
              margin={{ top: 10, right: showFatPercentLine ? 80 : 20, left: 10, bottom: 25 }}
              barCategoryGap="20%"
              animationDuration={800}
              animationEasing="ease-out"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 11, fill: "#A0A0A0" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#A0A0A0" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
                label={{ 
                  value: 'kg', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#A0A0A0' }
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

              {/* Stacked bars: BarStack gives pill-shaped rounded caps on whole stack */}
              {showBars && (
                <BarStack stackId="composition" radius={12}>
                  {activeMetrics.includes("muscle") && (
                    <Bar
                      yAxisId="left"
                      dataKey="muscle"
                      fill={metrics.muscle.color}
                      isAnimationActive={false}
                    />
                  )}
                  {activeMetrics.includes("fatMass") && (
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
              )}

              {/* Weight as line overlay */}
              {activeMetrics.includes("weight") && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke={metrics.weight.color}
                  strokeWidth={2.5}
                  dot={{ fill: metrics.weight.color, r: 4, strokeWidth: 2, stroke: "#1E1E1E" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#1E1E1E" }}
                />
              )}

              {/* Body fat percentage on secondary axis */}
              {activeMetrics.includes("fatPercent") && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fatPercent"
                  stroke={metrics.fatPercent.color}
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ fill: metrics.fatPercent.color, r: 4, strokeWidth: 2, stroke: "#1E1E1E" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#1E1E1E" }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center bg-[var(--bg-elevated)] rounded-[var(--radius-metric)] px-8 py-6 border border-white/[0.08]">
            <p className="text-[var(--text-muted)] text-sm">No data to display</p>
            <p className="text-[var(--text-muted)] text-xs mt-1 opacity-80">
              Log your first weigh-in to see progress
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
