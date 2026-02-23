const store = new Map<string, { timestamps: number[] }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;

/** Returns null if allowed, or a Response if rate-limited. */
export function checkRateLimit(key: string): Response | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { timestamps: [now] });
    return null;
  }

  // Keep only timestamps within the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  entry.timestamps.push(now);
  return null;
}
