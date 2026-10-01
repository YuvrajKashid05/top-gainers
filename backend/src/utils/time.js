export function nowIso() {
  return new Date().toISOString();
}

export function marketNowParts(timeZone = "Asia/Kolkata") {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  return Object.fromEntries(
    parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  );
}

export function isWeekday(parts) {
  return !["Sat", "Sun"].includes(parts.weekday);
}

export function isWithinMarketHours(
  open = "09:15",
  close = "15:30",
  timeZone = "Asia/Kolkata",
) {
  const p = marketNowParts(timeZone);
  if (!isWeekday(p)) return false;
  const current = `${p.hour}:${p.minute}`;
  return current >= open && current <= close;
}

export function todayInTimezone(timeZone = "Asia/Kolkata") {
  const p = marketNowParts(timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

export function formatTimeZone(iso, timeZone = "Asia/Kolkata") {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(iso));
}

export function isSnapshotMinute(timeZone = "Asia/Kolkata") {
  const p = marketNowParts(timeZone);
  if (!isWeekday(p)) return false;
  const minute = Number(p.minute);
  return minute % 5 === 0;
}
