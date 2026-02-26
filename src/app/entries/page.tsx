"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDownIcon } from "@/components/icons/Icons";
import EntriesHeader from "@/components/EntriesHeader";
import ConfirmModal from "@/components/ConfirmModal";
import WeighInModal from "@/components/WeighInModal";
import { getEntries, updateEntry, clearAllEntries, saveEntry, BodyEntry } from "@/lib/storage";
import { format } from "date-fns";

export default function EntriesPage() {
  const [entries, setEntries] = useState<BodyEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, Partial<BodyEntry>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isWeighInModalOpen, setIsWeighInModalOpen] = useState(false);

  const fetchEntries = useCallback(() => {
    const data = getEntries();
    setEntries(
      [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (!openingId) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpeningId(null));
    });
    return () => cancelAnimationFrame(id);
  }, [openingId]);

  const handleExpand = (entry: BodyEntry) => {
    if (expandedId === entry.id) {
      setClosingId(entry.id);
      setExpandedId(null);
    } else {
      setClosingId(expandedId);
      setExpandedId(entry.id);
      setOpeningId(entry.id);
      if (!editing[entry.id]) {
        setEditing((prev) => ({
          ...prev,
          [entry.id]: {
            date: entry.date,
            bodyWeight: entry.bodyWeight,
            skeletalMuscleMass: entry.skeletalMuscleMass,
            bodyFatMass: entry.bodyFatMass,
            bodyFatPercentage: entry.bodyFatPercentage,
          },
        }));
      }
    }
  };

  const handleCollapseEnd = () => {
    if (closingId) {
      setEditing((prev) => {
        const next = { ...prev };
        delete next[closingId];
        return next;
      });
      setClosingId(null);
    }
  };

  const handleEditChange = (
    id: string,
    field: keyof BodyEntry,
    value: string | number
  ) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: string) => {
    const data = editing[id];
    if (!data) return;

    const { date, bodyWeight, skeletalMuscleMass, bodyFatMass, bodyFatPercentage } =
      data;

    if (
      !date ||
      bodyWeight == null ||
      skeletalMuscleMass == null ||
      bodyFatMass == null ||
      bodyFatPercentage == null
    ) {
      setError("All fields are required");
      return;
    }

    if (
      bodyWeight <= 0 ||
      skeletalMuscleMass <= 0 ||
      bodyFatMass <= 0 ||
      bodyFatPercentage <= 0
    ) {
      setError("Values must be greater than 0");
      return;
    }

    setError(null);
    setSavingId(id);

    try {
      const updated = updateEntry(id, {
        date,
        bodyWeight: Number(bodyWeight),
        skeletalMuscleMass: Number(skeletalMuscleMass),
        bodyFatMass: Number(bodyFatMass),
        bodyFatPercentage: Number(bodyFatPercentage),
      });
      if (updated) {
        fetchEntries();
        setExpandedId(null);
        setEditing((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        setError("Failed to save - possible date conflict");
      }
    } catch {
      setError("Failed to save entry");
    } finally {
      setSavingId(null);
    }
  };

  const handleClearAllClick = () => setIsClearConfirmOpen(true);

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

  const handleClearAllConfirm = () => {
    clearAllEntries();
    fetchEntries();
  };

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[var(--radius-card)] p-8 sm:p-10 space-y-8 opacity-0 animate-fade-in glass border border-white/[0.08] shadow-[var(--shadow-card)]">
          <EntriesHeader
            onClearAll={handleClearAllClick}
            hasEntries={entries.length > 0}
          />

          {error && (
            <div className="p-4 bg-[var(--glass-active-bg)] border border-[var(--delta-negative)]/30 rounded-[var(--radius-button)] text-sm text-[var(--delta-negative)]">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[var(--radius-metric)] bg-[var(--glass-active-bg)] border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => handleExpand(entry)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <span className="w-[7.5rem] shrink-0 text-[var(--text-primary)] font-medium tabular-nums">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </span>
                    <span className="text-[var(--text-secondary)] text-sm tabular-nums">
                      {entry.bodyWeight} kg · {entry.bodyFatPercentage}% fat
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ease-out ${
                      expandedId === entry.id ? "" : "-rotate-90"
                    }`}
                  />
                </button>

                {((expandedId === entry.id || openingId === entry.id || closingId === entry.id) && editing[entry.id]) && (
                  <div
                    className={`overflow-hidden transition-all ${
                      expandedId === entry.id && !openingId
                        ? "duration-300 ease-out max-h-[500px] opacity-100"
                        : "duration-150 ease-in max-h-0 opacity-0"
                    }`}
                    onTransitionEnd={() => {
                      if (closingId === entry.id) handleCollapseEnd();
                    }}
                  >
                  <div className="px-5 pb-5 pt-2 border-t border-white/10 space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editing[entry.id]?.date ?? ""}
                        onChange={(e) =>
                          handleEditChange(entry.id, "date", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editing[entry.id]?.bodyWeight ?? ""}
                          onChange={(e) =>
                            handleEditChange(
                              entry.id,
                              "bodyWeight",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                          Muscle (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editing[entry.id]?.skeletalMuscleMass ?? ""}
                          onChange={(e) =>
                            handleEditChange(
                              entry.id,
                              "skeletalMuscleMass",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                          Fat mass (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editing[entry.id]?.bodyFatMass ?? ""}
                          onChange={(e) =>
                            handleEditChange(
                              entry.id,
                              "bodyFatMass",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-metric-label)] tracking-wider mb-2">
                          Body fat (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={editing[entry.id]?.bodyFatPercentage ?? ""}
                          onChange={(e) =>
                            handleEditChange(
                              entry.id,
                              "bodyFatPercentage",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm tabular-nums"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSave(entry.id)}
                      disabled={savingId === entry.id}
                      className="flex items-center gap-2 bg-[var(--color-accent)] text-[#0F1A1E] px-5 py-3 rounded-[var(--radius-button)] font-semibold text-sm hover:brightness-110 disabled:opacity-50 transition-all shadow-[var(--shadow-accent)]"
                    >
                      {savingId === entry.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {entries.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[var(--text-primary)] font-medium">
                No entries yet
              </p>
              <p className="text-[var(--text-secondary)] text-sm mt-2">
                Track your body composition from the dashboard — add your first weigh-in to get started.
              </p>
              <button
                type="button"
                onClick={() => setIsWeighInModalOpen(true)}
                className="inline-flex items-center gap-2 mt-6 bg-[var(--color-accent)] text-[#0F1A1E] px-5 py-2.5 rounded-[var(--radius-button)] font-semibold text-sm hover:brightness-110 transition-all shadow-[var(--shadow-accent)]"
              >
                Add first weigh-in
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearAllConfirm}
        message="Clear all stored data? This cannot be undone. Export from the dashboard first if you want to keep a copy."
        confirmLabel="Delete data"
      />

      <WeighInModal
        isOpen={isWeighInModalOpen}
        onClose={() => setIsWeighInModalOpen(false)}
        onSave={handleSaveEntry}
      />
    </div>
  );
}
