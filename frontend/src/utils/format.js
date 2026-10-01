export const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});
export const integerFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});
export function money(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `₹${numberFormatter.format(Number(value))}`;
}
export function number(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return numberFormatter.format(Number(value));
}
export function integer(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return integerFormatter.format(Number(value));
}
export function percent(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${Number(value) >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;
}
export function dateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}
export function shortTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
