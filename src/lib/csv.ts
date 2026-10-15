import type { Submission } from "./aggregate";
import { formatPragueStamp } from "./format";
import {
  conditionOptions,
  improvementLabels,
  labelFor,
  qualityOptions,
  sizeOptions,
  waitOptions,
} from "./questions";

function field(value: string | number): string {
  const text = String(value);
  if (/[";\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function submissionsToCsv(rows: Submission[]): string {
  const header = [
    "Kód",
    "Datum",
    "Spokojenost",
    "Velikost",
    "Kvalita",
    "Čekání",
    "Personál",
    "Stav oděvu",
    "Co zlepšit",
    "Komentář",
  ];

  const lines = rows.map((row) =>
    [
      row.id.slice(0, 8),
      formatPragueStamp(row.createdAt),
      row.satisfaction,
      labelFor(sizeOptions, row.sizeFit),
      labelFor(qualityOptions, row.quality),
      labelFor(waitOptions, row.waitTime),
      row.staff,
      labelFor(conditionOptions, row.condition),
      improvementLabels(row.improvements),
      row.comment,
    ]
      .map(field)
      .join(";"),
  );

  return `\uFEFF${[header.join(";"), ...lines].join("\r\n")}\r\n`;
}
