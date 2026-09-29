// A small on-device cache so the app opens straight onto the last thing the
// member saw (their gym's colours, their account, their Home) while fresh data
// loads behind it. Each gym is its own web origin, so nothing is shared
// between gyms. Storage can be unavailable (private mode, blocked site data):
// every call quietly does nothing then, and the app just loads normally.

const PREFIX = "bq:";

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function cacheSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // full or blocked — fine, it's only a cache
  }
}

/** Forget the member's own data (on sign-out). The gym's branding stays. */
export function cacheClearMember(): void {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(PREFIX) && !k.startsWith(`${PREFIX}branding:`) && k !== `${PREFIX}theme`) localStorage.removeItem(k);
    }
  } catch {
    // blocked — nothing stored anyway
  }
}
