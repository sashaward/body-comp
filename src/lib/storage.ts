export interface BodyEntry {
  id: string;
  date: string;
  bodyWeight: number;
  skeletalMuscleMass: number;
  bodyFatMass: number;
  bodyFatPercentage: number;
  createdAt: string;
}

const STORAGE_KEY = "body-comp-entries";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Seed data from InBody scans
const SEED_DATA: Omit<BodyEntry, "id" | "createdAt">[] = [
  { date: "2018-07-15", bodyWeight: 86.7, skeletalMuscleMass: 41.6, bodyFatMass: 14.3, bodyFatPercentage: 16.5 },
  { date: "2018-10-15", bodyWeight: 87.7, skeletalMuscleMass: 43.1, bodyFatMass: 12.9, bodyFatPercentage: 14.8 },
  { date: "2019-03-15", bodyWeight: 86.9, skeletalMuscleMass: 42.7, bodyFatMass: 12.8, bodyFatPercentage: 14.7 },
  { date: "2019-05-15", bodyWeight: 87.6, skeletalMuscleMass: 43.8, bodyFatMass: 11.7, bodyFatPercentage: 13.4 },
  { date: "2019-06-15", bodyWeight: 87.2, skeletalMuscleMass: 43.5, bodyFatMass: 11.8, bodyFatPercentage: 13.5 },
  { date: "2019-12-15", bodyWeight: 88.8, skeletalMuscleMass: 44.2, bodyFatMass: 12.1, bodyFatPercentage: 13.6 },
  { date: "2020-10-15", bodyWeight: 88.2, skeletalMuscleMass: 43.2, bodyFatMass: 13.5, bodyFatPercentage: 15.3 },
  { date: "2021-08-15", bodyWeight: 85.5, skeletalMuscleMass: 42.5, bodyFatMass: 11.6, bodyFatPercentage: 13.6 },
  { date: "2023-01-15", bodyWeight: 87.0, skeletalMuscleMass: 44.0, bodyFatMass: 10.9, bodyFatPercentage: 12.5 },
  { date: "2023-06-15", bodyWeight: 87.6, skeletalMuscleMass: 45.0, bodyFatMass: 9.8, bodyFatPercentage: 11.1 },
  { date: "2024-07-15", bodyWeight: 83.1, skeletalMuscleMass: 41.3, bodyFatMass: 11.1, bodyFatPercentage: 13.3 },
  { date: "2024-09-15", bodyWeight: 86.7, skeletalMuscleMass: 44.7, bodyFatMass: 9.3, bodyFatPercentage: 10.7 },
  { date: "2024-11-15", bodyWeight: 87.0, skeletalMuscleMass: 45.6, bodyFatMass: 8.2, bodyFatPercentage: 9.4 },
  { date: "2024-12-15", bodyWeight: 88.2, skeletalMuscleMass: 46.6, bodyFatMass: 7.4, bodyFatPercentage: 8.4 },
  { date: "2025-03-15", bodyWeight: 88.4, skeletalMuscleMass: 46.4, bodyFatMass: 8.5, bodyFatPercentage: 9.7 },
  { date: "2025-10-15", bodyWeight: 88.7, skeletalMuscleMass: 45.8, bodyFatMass: 9.6, bodyFatPercentage: 10.8 },
  { date: "2026-02-15", bodyWeight: 87.4, skeletalMuscleMass: 45.1, bodyFatMass: 9.4, bodyFatPercentage: 10.7 },
];

function initializeSeedData(): BodyEntry[] {
  const entries: BodyEntry[] = SEED_DATA.map((data, index) => ({
    ...data,
    id: `seed-${index}`,
    createdAt: new Date(data.date).toISOString(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export function getEntries(): BodyEntry[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Initialize with seed data on first load
      return initializeSeedData();
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveEntry(entry: Omit<BodyEntry, "id" | "createdAt">): BodyEntry {
  const entries = getEntries();
  
  // Check if entry for this date already exists (upsert logic)
  const existingIndex = entries.findIndex((e) => e.date === entry.date);
  
  const newEntry: BodyEntry = {
    ...entry,
    id: existingIndex >= 0 ? entries[existingIndex].id : generateId(),
    createdAt: existingIndex >= 0 ? entries[existingIndex].createdAt : new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    entries[existingIndex] = newEntry;
  } else {
    entries.push(newEntry);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return newEntry;
}

export function updateEntry(
  id: string,
  data: Omit<BodyEntry, "id" | "createdAt">
): BodyEntry | null {
  const entries = getEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index < 0) return null;

  // When changing date, avoid duplicate - remove old if date changes
  const existing = entries[index];
  const dateChanged = existing.date !== data.date;
  if (dateChanged) {
    const dateConflict = entries.some((e) => e.id !== id && e.date === data.date);
    if (dateConflict) return null;
  }

  const updated: BodyEntry = {
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
  };
  entries[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return updated;
}

export function deleteEntry(id: string): boolean {
  const entries = getEntries();
  const filtered = entries.filter((e) => e.id !== id);
  
  if (filtered.length === entries.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function clearAllEntries(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function resetToSeedData(): BodyEntry[] {
  return initializeSeedData();
}
