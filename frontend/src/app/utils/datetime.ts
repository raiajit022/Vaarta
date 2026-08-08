/**
 * Meeting date helpers.
 *
 * The backend serialises timestamps either as ISO strings or as Jackson-style
 * `[y, m, d, h, min, s]` arrays depending on the endpoint, so every read has to
 * go through `parseDate`. This was previously duplicated across views — and the
 * dashboard skipped it when formatting, which rendered "Invalid Date" whenever
 * the array form came back.
 */
export function parseDate(value: unknown): number {
  if (!value) return 0;
  if (Array.isArray(value)) {
    const [y, mo = 1, d = 1, h = 0, mi = 0, s = 0] = value as number[];
    return new Date(y, mo - 1, d, h, mi, s).getTime();
  }
  return new Date(value as string).getTime();
}

/** Full date + time, or a dash when the value is missing/unparseable. */
export function formatDateTime(value: unknown, fallback = '—'): string {
  const ts = parseDate(value);
  if (!ts || Number.isNaN(ts)) return fallback;
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Date only. */
export function formatDate(value: unknown, fallback = '—'): string {
  const ts = parseDate(value);
  if (!ts || Number.isNaN(ts)) return fallback;
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "in 20 min" / "2 h ago" — for at-a-glance lists. */
export function formatRelative(value: unknown, fallback = '—'): string {
  const ts = parseDate(value);
  if (!ts || Number.isNaN(ts)) return fallback;

  const diffMin = Math.round((ts - Date.now()) / 60000);
  const abs = Math.abs(diffMin);
  const future = diffMin > 0;

  if (abs < 1) return 'now';
  if (abs < 60) return future ? `in ${abs} min` : `${abs} min ago`;
  if (abs < 60 * 24) {
    const h = Math.round(abs / 60);
    return future ? `in ${h} h` : `${h} h ago`;
  }
  const d = Math.round(abs / (60 * 24));
  return future ? `in ${d} d` : `${d} d ago`;
}

/**
 * A meeting is "past" once it has ended, been cancelled, or its start time
 * (or creation time, for instant meetings) is more than an hour ago.
 */
export function isPastMeeting(m: {
  status?: string;
  scheduledStart?: unknown;
  createdAt?: unknown;
}): boolean {
  if (m.status === 'ENDED' || m.status === 'CANCELLED') return true;

  const anchor = m.scheduledStart ?? m.createdAt;
  if (!anchor) return false;

  const ts = parseDate(anchor);
  if (!ts || Number.isNaN(ts)) return false;

  return (Date.now() - ts) / 3_600_000 > 1;
}

/** Time-of-day greeting. The dashboard previously hardcoded "Good morning". */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
