import {
  conditionOptions,
  improvementOptions,
  qualityOptions,
  sizeOptions,
  waitOptions,
} from "./questions";

export type Answers = {
  satisfaction: number;
  sizeFit: string;
  quality: string;
  waitTime: string;
  staff: number;
  condition: string;
  improvements: string[];
  comment: string;
};

export type ParseResult =
  | { ok: true; honeypot: true }
  | { ok: true; honeypot: false; answers: Answers }
  | { ok: false; error: string };

const sizeValues = new Set(sizeOptions.map((option) => option.value));
const qualityValues = new Set(qualityOptions.map((option) => option.value));
const waitValues = new Set(waitOptions.map((option) => option.value));
const conditionValues = new Set(conditionOptions.map((option) => option.value));
const improvementValues = new Set(improvementOptions.map((option) => option.value));

const COMMENT_LIMIT = 400;

function score(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(number) || number < 1 || number > 5) return null;
  return number;
}

function oneOf(value: unknown, allowed: Set<string>): string | null {
  if (typeof value !== "string" || !allowed.has(value)) return null;
  return value;
}

export function parseAnswers(input: unknown): ParseResult {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Chybí odpovědi." };
  }

  const body = input as Record<string, unknown>;
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return { ok: true, honeypot: true };
  }

  const satisfaction = score(body.satisfaction);
  const staff = score(body.staff);
  const sizeFit = oneOf(body.sizeFit, sizeValues);
  const quality = oneOf(body.quality, qualityValues);
  const waitTime = oneOf(body.waitTime, waitValues);
  const condition = oneOf(body.condition, conditionValues);

  if (
    satisfaction === null ||
    staff === null ||
    !sizeFit ||
    !quality ||
    !waitTime ||
    !condition
  ) {
    return { ok: false, error: "Některá odpověď chybí nebo nesedí." };
  }

  if (!Array.isArray(body.improvements)) {
    return { ok: false, error: "Výběr zlepšení nesedí." };
  }

  const picked = body.improvements.filter(
    (value): value is string => typeof value === "string" && improvementValues.has(value),
  );
  const improvements = picked.includes("nic") ? ["nic"] : [...new Set(picked)];

  let comment = "";
  if (body.comment !== undefined && body.comment !== null) {
    if (typeof body.comment !== "string") {
      return { ok: false, error: "Komentář nesedí." };
    }
    comment = body.comment.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
    if (comment.length > COMMENT_LIMIT) comment = comment.slice(0, COMMENT_LIMIT);
  }

  return {
    ok: true,
    honeypot: false,
    answers: { satisfaction, sizeFit, quality, waitTime, staff, condition, improvements, comment },
  };
}
