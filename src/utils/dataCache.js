const CACHE_PREFIX = "cms-cache:";
const DEFAULT_TTL = 5 * 60 * 1000;

function getStorage(scope) {
  return scope === "session" ? sessionStorage : localStorage;
}

export function readCache(key, scope = "local") {
  try {
    const raw = getStorage(scope).getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (!entry || !entry.savedAt) return null;

    const ttl = entry.ttl ?? DEFAULT_TTL;
    return {
      data: entry.data,
      savedAt: entry.savedAt,
      stale: Date.now() - entry.savedAt > ttl,
    };
  } catch {
    return null;
  }
}

export function writeCache(key, data, ttl = DEFAULT_TTL, scope = "local") {
  try {
    getStorage(scope).setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, savedAt: Date.now(), ttl })
    );
  } catch {
    // Storage can be unavailable or full; caching is best-effort.
  }
}

export function clearCache() {
  [localStorage, sessionStorage].forEach((storage) => {
    try {
      const keys = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
      }
      keys.forEach((key) => storage.removeItem(key));
    } catch {
      // Ignore storage errors during logout.
    }
  });
}

export { DEFAULT_TTL };
