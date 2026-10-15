const pragueParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Prague",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((item) => item.type === type)?.value ?? "";
}

export function formatPrague(input: string | Date): string {
  const parts = pragueParts.formatToParts(input instanceof Date ? input : new Date(input));
  return `${part(parts, "day")}. ${part(parts, "month")}. ${part(parts, "year")} ${part(parts, "hour")}:${part(parts, "minute")}`;
}

export function formatPragueStamp(input: string | Date): string {
  const parts = pragueParts.formatToParts(input instanceof Date ? input : new Date(input));
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")} ${part(parts, "hour")}:${part(parts, "minute")}:${part(parts, "second")}`;
}

export function formatCzechNumber(value: number, digits = 0): string {
  return value.toFixed(digits).replace(".", ",");
}

export function formatShare(share: number): string {
  return `${formatCzechNumber(share * 100, share === 0 || share === 1 ? 0 : 1)} %`;
}
