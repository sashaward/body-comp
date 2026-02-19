"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import MetricCard from "./MetricCard";
import BiometricChart from "./BiometricChart";
import WeighInModal from "./WeighInModal";
import { getEntries, saveEntry, BodyEntry } from "@/lib/storage";

type MetricKey = "weight" | "muscle" | "fatMass" | "fatPercent";

export default function Dashboard() {
  const [entries, setEntries] = useState<BodyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>([
    "weight",
    "muscle",
    "fatMass",
    "fatPercent",
  ]);

  const allMetrics: MetricKey[] = ["weight", "muscle", "fatMass", "fatPercent"];

  const toggleMetric = (metric: MetricKey) => {
    setActiveMetrics((prev) => {
      const isSoleActive = prev.length === 1 && prev.includes(metric);
      if (isSoleActive) {
        return allMetrics;
      }
      return [metric];
    });
  };

  const fetchEntries = useCallback(() => {
    const data = getEntries();
    setEntries(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSaveEntry = async (data: {
    date: string;
    bodyWeight: number;
    skeletalMuscleMass: number;
    bodyFatMass: number;
    bodyFatPercentage: number;
  }) => {
    saveEntry(data);
    fetchEntries();
  };

  // Calculate metrics from entries
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const latest = sortedEntries[0];
  const previous = sortedEntries[1];

  const calculateDelta = (
    latestValue: number | undefined,
    previousValue: number | undefined
  ): number | null => {
    if (latestValue === undefined || previousValue === undefined) return null;
    return parseFloat((latestValue - previousValue).toFixed(1));
  };

  const metrics = {
    weight: {
      value: latest?.bodyWeight ?? null,
      delta: calculateDelta(latest?.bodyWeight, previous?.bodyWeight),
    },
    muscle: {
      value: latest?.skeletalMuscleMass ?? null,
      delta: calculateDelta(latest?.skeletalMuscleMass, previous?.skeletalMuscleMass),
    },
    fatMass: {
      value: latest?.bodyFatMass ?? null,
      delta: calculateDelta(latest?.bodyFatMass, previous?.bodyFatMass),
    },
    fatPercent: {
      value: latest?.bodyFatPercentage ?? null,
      delta: calculateDelta(latest?.bodyFatPercentage, previous?.bodyFatPercentage),
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-[var(--color-weight)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto">
        {/* Unified card container - frosted glass */}
        <div className="rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 opacity-0 animate-fade-in bg-[var(--bg-card)] border border-white/[0.06] shadow-[var(--shadow-card)]">
          {/* Header */}
          <Header onLogWeighIn={() => setIsModalOpen(true)} />

          {/* Metric Cards - tap to toggle visibility on graph */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stagger-1">
              <MetricCard
                title="Weight"
                value={metrics.weight.value}
                unit="kg"
                delta={metrics.weight.delta}
                color="weight"
                invertDelta
                isActive={activeMetrics.includes("weight")}
                onToggle={() => toggleMetric("weight")}
              />
            </div>
            <div className="stagger-2">
              <MetricCard
                title="Muscle Mass"
                value={metrics.muscle.value}
                unit="kg"
                delta={metrics.muscle.delta}
                color="muscle"
                isActive={activeMetrics.includes("muscle")}
                onToggle={() => toggleMetric("muscle")}
              />
            </div>
            <div className="stagger-3">
              <MetricCard
                title="Body Fat Mass"
                value={metrics.fatMass.value}
                unit="kg"
                delta={metrics.fatMass.delta}
                color="fatMass"
                invertDelta
                isActive={activeMetrics.includes("fatMass")}
                onToggle={() => toggleMetric("fatMass")}
              />
            </div>
            <div className="stagger-4">
              <MetricCard
                title="Body Fat"
                value={metrics.fatPercent.value}
                unit="%"
                delta={metrics.fatPercent.delta}
                color="fatPercent"
                invertDelta
                isActive={activeMetrics.includes("fatPercent")}
                onToggle={() => toggleMetric("fatPercent")}
              />
            </div>
          </div>

          {/* Chart */}
          <BiometricChart entries={entries} activeMetrics={activeMetrics} />
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between py-4 text-xs text-[var(--text-secondary)] mt-6">
          <span className="uppercase tracking-wider font-normal">
            stored locally
          </span>
          <a
            href="https://sashaward.me"
            target="_blank"
            rel="noopener noreferrer"
            className="uppercase tracking-wider font-normal hover:text-[var(--text-primary)] transition-colors"
          >
            leave feedback
          </a>
        </footer>
      </div>

      {/* Modal */}
      <WeighInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
      />
    </div>
  );
}
