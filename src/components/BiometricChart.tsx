"use client";

import { useState, useMemo } from "react";
import {
  Bar,
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
  weight: { label: "Weight", color: "#5856D6", unit: "kg" },
  muscle: { label: "Skeletal Muscle", color: "#007AFF", unit: "kg" },
  fatMass: { label: "Body Fat Mass", color: "#FF9500", unit: "kg" },
  fatPercent: { label: "Body Fat %", color: "#34C759", unit: "%" },
};

const otherMassColor = "#E5E5EA";

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
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[160px]">
        <p className="text-xs font-medium text-gray-500 mb-2 pb-2 border-b border-gray-100">
          {format(parseISO(data.date), "MMMM d, yyyy")}
        </p>
        <div className="space-y-1.5">
          {showWeight && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.weight.color }} />
                <span className="text-xs text-gray-600">{metrics.weight.label}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {data.weight.toFixed(1)} kg
              </span>
            </div>
          )}
          {showMuscle && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.muscle.color }} />
                <span className="text-xs text-gray-600">{metrics.muscle.label}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {data.muscle.toFixed(1)} kg
              </span>
            </div>
          )}
          {showFatMass && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.fatMass.color }} />
                <span className="text-xs text-gray-600">{metrics.fatMass.label}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {data.fatMass.toFixed(1)} kg
              </span>
            </div>
          )}
          {showBars && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: otherMassColor }} />
                <span className="text-xs text-gray-600">Other</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {data.other.toFixed(1)} kg
              </span>
            </div>
          )}
          {showFatPercent && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.fatPercent.color }} />
                <span className="text-xs text-gray-600">{metrics.fatPercent.label}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {data.fatPercent.toFixed(1)}%
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
          <h2 className="text-lg font-semibold text-gray-900">
            Biometric Progress
          </h2>
          <p className="text-xs text-gray-500 font-normal uppercase tracking-wider mt-0.5">
            Historical Performance Tracking
          </p>
        </div>

        {/* Time range selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(timeRanges) as TimeRange[]).map((range) => {
          const isSelected = timeRange === range;
          return (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isSelected
                  ? "bg-[#F3F4F6] text-[#1A1A1A] border-transparent"
                  : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50"
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
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 5, right: showFatPercentLine ? 60 : 5, left: -10, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
                label={{ 
                  value: 'kg', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#9ca3af' }
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

              {/* Stacked bars for muscle, fat mass, and other */}
              {(activeMetrics.includes("muscle") || activeMetrics.includes("fatMass")) && (
                <>
                  <Bar
                    yAxisId="left"
                    dataKey="muscle"
                    stackId="composition"
                    fill={metrics.muscle.color}
                    radius={[0, 0, 0, 0]}
                    isAnimationActive
                    animationDuration={800}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="fatMass"
                    stackId="composition"
                    fill={metrics.fatMass.color}
                    radius={[0, 0, 0, 0]}
                    isAnimationActive
                    animationDuration={800}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="other"
                    stackId="composition"
                    fill={otherMassColor}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={800}
                    tooltipType="none"
                  />
                </>
              )}

              {/* Weight as line overlay */}
              {activeMetrics.includes("weight") && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke={metrics.weight.color}
                  strokeWidth={2.5}
                  dot={{ fill: metrics.weight.color, r: 4, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-out"
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
                  dot={{ fill: metrics.fatPercent.color, r: 4, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-sm">No data to display</p>
            <p className="text-gray-300 text-xs mt-1">
              Log your first weigh-in to see progress
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
