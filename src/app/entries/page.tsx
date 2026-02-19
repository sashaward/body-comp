"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeftIcon, SaveIcon } from "@/components/icons/Icons";
import { getEntries, updateEntry, BodyEntry } from "@/lib/storage";
import { format } from "date-fns";

export default function EntriesPage() {
  const [entries, setEntries] = useState<BodyEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, Partial<BodyEntry>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleExpand = (entry: BodyEntry) => {
    setExpandedId(expandedId === entry.id ? null : entry.id);
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

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[var(--bg-primary)]">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 opacity-0 animate-fade-in bg-[var(--bg-card)] border border-white/[0.06] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Back
              </span>
            </Link>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              All Entries
            </h1>
            <div className="w-20" />
          </div>

          {error && (
            <div className="p-3 bg-[var(--glass-active-bg)] border border-[var(--delta-negative)]/30 rounded-[var(--radius-button)] text-sm text-[var(--delta-negative)]">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[var(--radius-metric)] bg-[var(--glass-active-bg)] border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => handleExpand(entry)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[var(--text-primary)] font-medium tabular-nums">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </span>
                    <span className="text-[var(--text-secondary)] text-sm tabular-nums">
                      {entry.bodyWeight} kg · {entry.bodyFatPercentage}% fat
                    </span>
                  </div>
                  <span className="text-[var(--text-muted)] text-xs">
                    {expandedId === entry.id ? "▼" : "▶"}
                  </span>
                </button>

                {expandedId === entry.id && editing[entry.id] && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/10 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editing[entry.id]?.date ?? ""}
                        onChange={(e) =>
                          handleEditChange(entry.id, "date", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-1">
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
                          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-1">
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
                          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-1">
                          Fat Mass (kg)
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
                          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-metric-label)] uppercase tracking-wider mb-1">
                          Body Fat (%)
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
                          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-white/10 rounded-[var(--radius-button)] text-[var(--text-primary)] text-sm tabular-nums"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSave(entry.id)}
                      disabled={savingId === entry.id}
                      className="flex items-center gap-2 bg-[var(--color-weight)] text-[#121212] px-4 py-2.5 rounded-[var(--radius-button)] font-semibold text-sm hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                      <SaveIcon className="w-4 h-4" />
                      {savingId === entry.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {entries.length === 0 && (
            <p className="text-center text-[var(--text-secondary)] py-8">
              No entries yet. Log your first weigh-in from the dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
