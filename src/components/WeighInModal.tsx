"use client";

import { useState } from "react";
import { CloseIcon, CalendarIcon, SaveIcon } from "./icons/Icons";
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
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in bg-black/30 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md animate-scale-in rounded-[var(--radius-card)] bg-[rgba(255,255,255,0.75)] backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">New Weigh-in</h2>
            <button
              onClick={onClose}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-[var(--radius-button)] hover:bg-[var(--border-color)]"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-normal uppercase tracking-wider mb-6">
            Record your performance metrics
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-[var(--radius-button)] text-sm text-[var(--delta-negative)] font-normal">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Date field */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-2">
                  Date of Entry
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-[var(--radius-metric)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Metric fields - 2x2 grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-2">
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
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-[var(--radius-metric)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-2">
                    Skeletal Muscle (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="100"
                    value={skeletalMuscleMass}
                    onChange={(e) => setSkeletalMuscleMass(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-[var(--radius-metric)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-2">
                    Fat Mass (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="150"
                    value={bodyFatMass}
                    onChange={(e) => setBodyFatMass(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-[var(--radius-metric)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-2">
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="60"
                    value={bodyFatPercentage}
                    onChange={(e) => setBodyFatPercentage(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-[var(--radius-metric)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all tabular-nums"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-black text-white px-5 py-3.5 rounded-[var(--radius-button)] font-semibold text-sm hover:bg-[#1E293B] disabled:bg-[var(--text-muted)] disabled:cursor-not-allowed transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
            >
              <SaveIcon className="w-4 h-4" />
              <span>{isLoading ? "Saving..." : "Complete Entry"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
