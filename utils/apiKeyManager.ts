export interface ApiKeyEntry {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  failCount: number;
  lastFailedAt: number | null;
}

export type KeyStatus = 'active' | 'failed' | 'cooldown';

const STORAGE_KEY = 'naikphoto_api_keys';
const LEGACY_KEY = 'naikthreads_google_key';
const COOLDOWN_MS = 60 * 60 * 1000;
const MAX_FAILS = 3;

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const readStore = (): ApiKeyEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as ApiKeyEntry[];
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && legacy !== 'system_default' && legacy.trim() !== '') {
      const migrated: ApiKeyEntry[] = [{
        id: generateId(),
        key: legacy.trim(),
        label: 'Imported Key',
        isActive: true,
        failCount: 0,
        lastFailedAt: null,
      }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch (e) {
    console.error('apiKeyManager read error', e);
  }
  return [];
};

const writeStore = (entries: ApiKeyEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('apiKeyManager write error', e);
  }
};

export const getAllKeys = (): ApiKeyEntry[] => readStore();

export const addKey = (key: string, label?: string): void => {
  const trimmed = key.trim();
  if (!trimmed) return;
  const entries = readStore();
  if (entries.some(e => e.key === trimmed)) return;
  entries.push({
    id: generateId(),
    key: trimmed,
    label: (label && label.trim()) || `Key ${entries.length + 1}`,
    isActive: true,
    failCount: 0,
    lastFailedAt: null,
  });
  writeStore(entries);
};

export const removeKey = (id: string): void => {
  writeStore(readStore().filter(e => e.id !== id));
};

export const getActiveKey = (): string | null => {
  const now = Date.now();
  const entries = readStore();
  for (const e of entries) {
    if (!e.isActive) continue;
    if (e.failCount >= MAX_FAILS) continue;
    if (e.lastFailedAt && now - e.lastFailedAt < COOLDOWN_MS) continue;
    return e.key;
  }
  return null;
};

export const markKeyAsFailed = (key: string): void => {
  const entries = readStore();
  const target = entries.find(e => e.key === key);
  if (!target) return;
  target.failCount += 1;
  target.lastFailedAt = Date.now();
  writeStore(entries);
};

export const resetAllFailCounts = (): void => {
  const entries = readStore().map(e => ({
    ...e,
    failCount: 0,
    lastFailedAt: null,
  }));
  writeStore(entries);
};

export const getKeyStatus = (entry: ApiKeyEntry): KeyStatus => {
  if (!entry.isActive || entry.failCount >= MAX_FAILS) return 'failed';
  if (entry.lastFailedAt && Date.now() - entry.lastFailedAt < COOLDOWN_MS) return 'cooldown';
  return 'active';
};

export const cooldownRemainingMs = (entry: ApiKeyEntry): number => {
  if (!entry.lastFailedAt) return 0;
  const remaining = COOLDOWN_MS - (Date.now() - entry.lastFailedAt);
  return remaining > 0 ? remaining : 0;
};
