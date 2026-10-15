export const periods = ["dnes", "7", "30", "vse"] as const;

export type Period = (typeof periods)[number];

export function parsePeriod(value: string | null): Period {
  if (value === "dnes" || value === "7" || value === "30" || value === "vse") return value;
  return "vse";
}

export function periodLabel(period: Period): string {
  switch (period) {
    case "dnes":
      return "Dnes";
    case "7":
      return "Posledních 7 dní";
    case "30":
      return "Posledních 30 dní";
    default:
      return "Všechny odpovědi";
  }
}

export function periodClause(period: Period): string {
  switch (period) {
    case "dnes":
      return `WHERE (created_at AT TIME ZONE 'Europe/Prague')::date = (NOW() AT TIME ZONE 'Europe/Prague')::date`;
    case "7":
      return `WHERE created_at >= NOW() - INTERVAL '7 days'`;
    case "30":
      return `WHERE created_at >= NOW() - INTERVAL '30 days'`;
    default:
      return "";
  }
}
