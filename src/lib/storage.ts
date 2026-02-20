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

export function getEntries(): BodyEntry[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
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
