export function getSiteMidnightUtc(now, timezone) {
  if (!timezone) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  try {
    const dateParts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(now);
    const date = Object.fromEntries(
      dateParts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    );
    const desiredMidnight = Date.UTC(date.year, date.month - 1, date.day);
    let candidate = desiredMidnight;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const localParts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hourCycle: "h23",
      }).formatToParts(new Date(candidate));
      const local = Object.fromEntries(
        localParts
          .filter((part) => part.type !== "literal")
          .map((part) => [part.type, Number(part.value)])
      );
      const representedAsUtc = Date.UTC(
        local.year,
        local.month - 1,
        local.day,
        local.hour,
        local.minute,
        local.second
      );
      candidate += desiredMidnight - representedAsUtc;
    }

    return candidate;
  } catch {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
}

export function getSiteDayRange(timezone, daysAgo = 0, now = new Date()) {
  const anchor = new Date(now.getTime() - daysAgo * 86400000);
  const fromUtc = getSiteMidnightUtc(anchor, timezone);
  const nextDayStart = getSiteMidnightUtc(
    new Date(anchor.getTime() + 86400000),
    timezone
  );

  return {
    fromUtc,
    toUtc: daysAgo === 0 ? now.getTime() : nextDayStart - 1,
  };
}

export function getRangeForDays(days, timezone, now = new Date()) {
  if (days <= 1) {
    return getSiteDayRange(timezone, days, now);
  }

  return {
    fromUtc: getSiteDayRange(timezone, days, now).fromUtc,
    toUtc: now.getTime(),
  };
}

export function getComparisonRange(days, timezone, now = new Date()) {
  const current = getRangeForDays(days, timezone, now);

  if (days === 0) {
    const yesterday = getSiteDayRange(timezone, 1, now);
    const elapsed = now.getTime() - current.fromUtc;

    return {
      fromUtc: yesterday.fromUtc,
      toUtc: Math.min(yesterday.fromUtc + elapsed, yesterday.toUtc),
    };
  }

  const duration = current.toUtc - current.fromUtc;
  const toUtc = current.fromUtc - 1;

  return {
    fromUtc: toUtc - duration,
    toUtc,
  };
}

export function percentChange(current, previous) {
  if (
    current == null ||
    previous == null ||
    !Number.isFinite(current) ||
    !Number.isFinite(previous) ||
    previous === 0
  ) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

export function comparisonLabel(days) {
  return days === 0 ? "yesterday" : "previous period";
}

export function formatComparison(change, label) {
  if (change == null) return null;

  const rounded = Math.round(Math.abs(change));
  if (rounded === 0) return `Same as ${label}`;

  return `${rounded}% ${change > 0 ? "More" : "Less"} than ${label}`;
}

export function getSiteDateKey(timezone, now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return now.toISOString().slice(0, 10);
  }
}
