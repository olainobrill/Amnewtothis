export function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];

  let value = seconds;
  for (const [amount, unit] of units) {
    if (value < amount) return `${Math.max(1, Math.floor(value))}${unit}`;
    value /= amount;
  }
  return "now";
}
