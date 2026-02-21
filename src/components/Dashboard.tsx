"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import MetricCard from "./MetricCard";
import BiometricChart from "./BiometricChart";
import WeighInModal from "./WeighInModal";
import ConfirmModal from "./ConfirmModal";
import { getEntries, saveEntry, clearAllEntries, BodyEntry } from "@/lib/storage";
import { DownloadIcon, StarIcon, TrashIcon } from "./icons/Icons";

type MetricKey = "weight" | "muscle" | "fatMass" | "fatPercent";

export default function Dashboard() {
  const [entries, setEntries] = useState<BodyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
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

  const handleClearDataClick = () => setIsClearConfirmOpen(true);

  const handleClearDataConfirm = () => {
    clearAllEntries();
    fetchEntries();
  };

  const handleExportCsv = () => {
    const data = getEntries();
    if (data.length === 0) return;

    const headers = ["Date", "Weight (kg)", "Muscle Mass (kg)", "Body Fat Mass (kg)", "Body Fat (%)"];
    const rows = data
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e) =>
        [e.date, e.bodyWeight, e.skeletalMuscleMass, e.bodyFatMass, e.bodyFatPercentage].join(",")
      );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `body-comp-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  const weightDelta = calculateDelta(latest?.bodyWeight, previous?.bodyWeight);
  const muscleDelta = calculateDelta(latest?.skeletalMuscleMass, previous?.skeletalMuscleMass);

  // Weight verdict: green if up from muscle, red if up from fat only or any down, neutral if no change
  const weightVerdict =
    weightDelta !== null
      ? weightDelta === 0
        ? undefined
        : weightDelta > 0
          ? (muscleDelta !== null && muscleDelta > 0 ? "good" : "bad")
          : "bad"
      : undefined;

  const metrics = {
    weight: {
      value: latest?.bodyWeight ?? null,
      delta: weightDelta,
    },
    muscle: {
      value: latest?.skeletalMuscleMass ?? null,
      delta: muscleDelta,
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
      <div className="min-h-screen flex items-center justify-center bg-blue-950/30">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 pb-4 px-4 sm:pt-12 sm:pb-6 sm:px-6 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Main content container */}
        <div className="rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 opacity-0 animate-fade-in bg-[var(--bg-card)] border border-white/[0.06] shadow-[var(--shadow-card)]">
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
                deltaVerdict={weightVerdict}
                isActive={activeMetrics.includes("weight")}
                isSoleActive={activeMetrics.length === 1 && activeMetrics.includes("weight")}
                onToggle={() => toggleMetric("weight")}
              />
            </div>
            <div className="stagger-2">
              <MetricCard
                title="Muscle mass"
                value={metrics.muscle.value}
                unit="kg"
                delta={metrics.muscle.delta}
                color="muscle"
                isActive={activeMetrics.includes("muscle")}
                isSoleActive={activeMetrics.length === 1 && activeMetrics.includes("muscle")}
                onToggle={() => toggleMetric("muscle")}
              />
            </div>
            <div className="stagger-3">
              <MetricCard
                title="Body fat mass"
                value={metrics.fatMass.value}
                unit="kg"
                delta={metrics.fatMass.delta}
                color="fatMass"
                invertDelta
                isActive={activeMetrics.includes("fatMass")}
                isSoleActive={activeMetrics.length === 1 && activeMetrics.includes("fatMass")}
                onToggle={() => toggleMetric("fatMass")}
              />
            </div>
            <div className="stagger-4">
              <MetricCard
                title="Body fat"
                value={metrics.fatPercent.value}
                unit="%"
                delta={metrics.fatPercent.delta}
                color="fatPercent"
                invertDelta
                isActive={activeMetrics.includes("fatPercent")}
                isSoleActive={activeMetrics.length === 1 && activeMetrics.includes("fatPercent")}
                onToggle={() => toggleMetric("fatPercent")}
              />
            </div>
          </div>

          {/* Chart */}
          <BiometricChart
            entries={entries}
            activeMetrics={activeMetrics}
            onLogWeighIn={() => setIsModalOpen(true)}
          />
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between py-4 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              title="Export CSV"
              disabled={entries.length === 0}
              className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-[var(--radius-button)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
            <span className="tracking-wider font-normal text-[var(--text-secondary)]">
              Information stored locally
            </span>
          </div>
          <div className="flex items-center gap-1">
            {entries.length > 0 && (
              <button
                type="button"
                onClick={handleClearDataClick}
                title="Clear all data"
                className="p-3 text-[var(--text-secondary)] hover:text-[var(--delta-negative)] hover:bg-white/5 rounded-[var(--radius-button)] transition-all"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
            <a
              href="https://github.com/sashaward/body-comp"
              target="_blank"
              rel="noopener noreferrer"
              title="View on GitHub"
              className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-[var(--radius-button)] transition-all"
            >
              <StarIcon className="w-5 h-5" />
            </a>
          </div>
        </footer>
      </div>

      {/* Modal */}
      <WeighInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
      />

      <ConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearDataConfirm}
        message="Clear all stored data? This cannot be undone. Export first if you want to keep a copy."
        confirmLabel="Delete data"
      />
    </div>
  );
}
