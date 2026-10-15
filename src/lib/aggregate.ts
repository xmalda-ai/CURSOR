import {
  conditionOptions,
  improvementOptions,
  qualityOptions,
  satisfactionScale,
  sizeOptions,
  staffScale,
  waitOptions,
  type Choice,
} from "./questions";

export type Submission = {
  id: string;
  createdAt: string;
  satisfaction: number;
  sizeFit: string;
  quality: string;
  waitTime: string;
  staff: number;
  condition: string;
  improvements: string[];
  comment: string;
};

export type Bucket = {
  value: string;
  label: string;
  count: number;
  share: number;
};

export type Summary = {
  total: number;
  satisfactionAvg: number | null;
  staffAvg: number | null;
  sizeOkShare: number | null;
  quickWaitShare: number | null;
  satisfaction: Bucket[];
  size: Bucket[];
  quality: Bucket[];
  wait: Bucket[];
  staff: Bucket[];
  condition: Bucket[];
  improvements: Bucket[];
  comments: { createdAt: string; text: string }[];
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function buckets(rows: Submission[], pick: (row: Submission) => string, options: Choice[]): Bucket[] {
  const total = rows.length;
  return options.map((option) => {
    const count = rows.reduce((sum, row) => sum + (pick(row) === option.value ? 1 : 0), 0);
    return {
      value: option.value,
      label: option.label,
      count,
      share: total === 0 ? 0 : count / total,
    };
  });
}

export function summarize(rows: Submission[]): Summary {
  const total = rows.length;
  const satisfactionAvg =
    total === 0 ? null : round1(rows.reduce((sum, row) => sum + row.satisfaction, 0) / total);
  const staffAvg = total === 0 ? null : round1(rows.reduce((sum, row) => sum + row.staff, 0) / total);
  const sizeOk = rows.filter((row) => row.sizeFit === "ano").length;
  const quick = rows.filter((row) => row.waitTime === "do5").length;

  return {
    total,
    satisfactionAvg,
    staffAvg,
    sizeOkShare: total === 0 ? null : sizeOk / total,
    quickWaitShare: total === 0 ? null : quick / total,
    satisfaction: buckets(rows, (row) => String(row.satisfaction), satisfactionScale),
    size: buckets(rows, (row) => row.sizeFit, sizeOptions),
    quality: buckets(rows, (row) => row.quality, qualityOptions),
    wait: buckets(rows, (row) => row.waitTime, waitOptions),
    staff: buckets(rows, (row) => String(row.staff), staffScale),
    condition: buckets(rows, (row) => row.condition, conditionOptions),
    improvements: improvementOptions.map((option) => {
      const count = rows.reduce(
        (sum, row) => sum + (row.improvements.includes(option.value) ? 1 : 0),
        0,
      );
      return {
        value: option.value,
        label: option.label,
        count,
        share: total === 0 ? 0 : count / total,
      };
    }),
    comments: rows
      .filter((row) => row.comment.trim() !== "")
      .map((row) => ({ createdAt: row.createdAt, text: row.comment }))
      .reverse(),
  };
}
