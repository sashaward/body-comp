"use client";

import { useState } from "react";
import { CloseIcon, CalendarIcon } from "./icons/Icons";
import { format } from "date-fns";

interface WeighInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    date: string;
    bodyWeight: number;
    skeletalMuscleMass: number;
    bodyFatMass: number;
    bodyFatPercentage: number;
  }) => Promise<void>;
}

export default function WeighInModal({ isOpen, onClose, onSave }: WeighInModalProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [bodyWeight, setBodyWeight] = useState("");
  const [skeletalMuscleMass, setSkeletalMuscleMass] = useState("");
  const [bodyFatMass, setBodyFatMass] = useState("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSave({
        date,
        bodyWeight: parseFloat(bodyWeight),
        skeletalMuscleMass: parseFloat(skeletalMuscleMass),
        bodyFatMass: parseFloat(bodyFatMass),
        bodyFatPercentage: parseFloat(bodyFatPercentage),
      });
      
      // Reset form
      setDate(format(new Date(), "yyyy-MM-dd"));
      setBodyWeight("");
      setSkeletalMuscleMass("");
      setBodyFatMass("");
      setBodyFatPercentage("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = 
    date &&
    bodyWeight && parseFloat(bodyWeight) > 0 &&
    skeletalMuscleMass && parseFloat(skeletalMuscleMass) > 0 &&
    bodyFatMass && parseFloat(bodyFatMass) > 0 &&
    bodyFatPercentage && parseFloat(bodyFatPercentage) > 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md animate-scale-in rounded-[var(--radius-card)] bg-[var(--bg-card)] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">New weigh-in</h2>
            <button
              onClick={onClose}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-[var(--radius-button)] hover:bg-white/5"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-normal tracking-wider mb-6">
            Record your performance metrics
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[var(--glass-active-bg)] border border-[var(--delta-negative)]/30 rounded-[var(--radius-button)] text-sm text-[var(--delta-negative)] font-normal">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Date field */}
              <div>
<label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                Date of entry
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--glass-active-bg)] border border-white/10 rounded-[var(--radius-metric)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-muscle)]/50 focus:border-[var(--color-muscle)]/50 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Metric fields - 2x2 grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    value={bodyWeight}
                    onChange={(e) => setBodyWeight(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-[var(--glass-active-bg)] border border-white/10 rounded-[var(--radius-metric)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-muscle)]/50 focus:border-[var(--color-muscle)]/50 transition-all tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                    Skeletal muscle (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="100"
                    value={skeletalMuscleMass}
                    onChange={(e) => setSkeletalMuscleMass(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-[var(--glass-active-bg)] border border-white/10 rounded-[var(--radius-metric)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-muscle)]/50 focus:border-[var(--color-muscle)]/50 transition-all tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                    Fat mass (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="150"
                    value={bodyFatMass}
                    onChange={(e) => setBodyFatMass(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-[var(--glass-active-bg)] border border-white/10 rounded-[var(--radius-metric)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-muscle)]/50 focus:border-[var(--color-muscle)]/50 transition-all tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                    Body fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="60"
                    value={bodyFatPercentage}
                    onChange={(e) => setBodyFatPercentage(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-[var(--glass-active-bg)] border border-white/10 rounded-[var(--radius-metric)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-muscle)]/50 focus:border-[var(--color-muscle)]/50 transition-all tabular-nums"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-[var(--color-weight)] text-[#121212] px-5 py-3.5 rounded-[var(--radius-button)] font-semibold text-sm hover:brightness-110 disabled:opacity-50 disabled:brightness-100 disabled:cursor-not-allowed transition-all shadow-[0_4px_24px_rgba(255,214,10,0.25)]"
            >
              <span>{isLoading ? "Saving..." : "Complete entry"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
