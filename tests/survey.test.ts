import assert from "node:assert/strict";
import { after, test } from "node:test";
import { summarize, type Submission } from "../src/lib/aggregate";
import { passwordMatches, createSessionToken, isAuthenticated } from "../src/lib/auth";
import { submissionsToCsv } from "../src/lib/csv";
import { closePool, DuplicateSubmissionError, insertSubmission, listSubmissions } from "../src/lib/db";
import { formatPragueStamp } from "../src/lib/format";
import { buildPdf } from "../src/lib/pdf";
import { parsePeriod } from "../src/lib/period";
import { parseAnswers } from "../src/lib/validate";
import { buildWorkbook } from "../src/lib/xlsx";

const sample = {
  satisfaction: 5,
  sizeFit: "ano",
  quality: "dobra",
  waitTime: "do5",
  staff: 4,
  condition: "vporadku",
  improvements: ["cekani", "nic"],
  comment: "  Rychlejší fronta; prosím  ",
};

test("parseAnswers přijme platnou odpověď a z výběru nechá jen spokojenost", () => {
  const parsed = parseAnswers({ ...sample, website: "" });
  assert.equal(parsed.ok, true);
  if (!parsed.ok || parsed.honeypot) return;
  assert.deepEqual(parsed.answers.improvements, ["nic"]);
  assert.equal(parsed.answers.comment, "Rychlejší fronta; prosím");
});

test("parseAnswers odmítne neznámou hodnotu a honeypot neukládá", () => {
  assert.equal(parseAnswers({ ...sample, sizeFit: "xxl" }).ok, false);
  const bot = parseAnswers({ ...sample, website: "http://spam.test" });
  assert.equal(bot.ok && bot.honeypot, true);
});

test("souhrn spočítá průměry a podíly", () => {
  const rows: Submission[] = [
    row("a", 5, "ano", "do5"),
    row("b", 3, "nebyla", "vic"),
  ];
  const summary = summarize(rows);
  assert.equal(summary.total, 2);
  assert.equal(summary.satisfactionAvg, 4);
  assert.equal(summary.sizeOkShare, 0.5);
  assert.equal(summary.quickWaitShare, 0.5);
  assert.equal(summary.satisfaction.find((item) => item.value === "5")?.count, 1);
});

test("csv je utf-8 s oddělovačem pro český excel a ošetří středník", () => {
  const csv = submissionsToCsv([
    {
      ...row("abcdef0123456789", 4, "jina", "do15"),
      comment: 'Poznámka; s "uvozovkami"',
      improvements: ["velikosti", "sortiment"],
    },
  ]);
  assert.ok(csv.charCodeAt(0) === 0xfeff);
  assert.match(csv, /Kód;Datum;Spokojenost/);
  assert.match(csv, /"Poznámka; s ""uvozovkami"""/);
  assert.match(csv, /Sklad velikostí, Sortiment/);
  assert.match(csv, /Byla jen jiná velikost/);
});

test("období bere jen známé hodnoty", () => {
  assert.equal(parsePeriod("dnes"), "dnes");
  assert.equal(parsePeriod("rok"), "vse");
  assert.equal(parsePeriod(null), "vse");
});

test("heslo a relace správy", () => {
  process.env.ADMIN_PASSWORD = "tajne-heslo";
  process.env.SESSION_SECRET = "testovaci-tajemstvi";
  assert.equal(passwordMatches("tajne-heslo", "tajne-heslo"), true);
  assert.equal(passwordMatches("jine", "tajne-heslo"), false);
  const token = createSessionToken();
  assert.ok(token);
  const request = new Request("http://localhost/admin", {
    headers: { cookie: `odev_session=${token}` },
  });
  assert.equal(isAuthenticated(request), true);
  assert.equal(isAuthenticated(new Request("http://localhost/admin")), false);
});

test("excel a pdf se dají vytvořit z odpovědí", async () => {
  const rows = [row("abc12345", 5, "ano", "do5")];
  const summary = summarize(rows);
  const workbook = await buildWorkbook(rows, summary, "vse");
  assert.ok(workbook.byteLength > 1000);
  const pdf = await buildPdf(rows, summary, "vse");
  assert.equal(pdf.subarray(0, 5).toString("utf8"), "%PDF-");
  const pages = pdf.toString("latin1").match(/\/Type \/Page(?!s)/g)?.length ?? 0;
  assert.equal(pages, 2);
  assert.match(formatPragueStamp("2026-10-15T16:41:00.000Z"), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
});

test("stejný telefon uloží odpověď jen jednou", { skip: !process.env.DATABASE_URL }, async () => {
  const token = "ab".repeat(32);
  try {
    await insertSubmission(token, {
      satisfaction: 4,
      sizeFit: "ano",
      quality: "dobra",
      waitTime: "do15",
      staff: 5,
      condition: "vporadku",
      improvements: [],
      comment: "test",
    });
    await assert.rejects(
      () =>
        insertSubmission(token, {
          satisfaction: 1,
          sizeFit: "nebyla",
          quality: "slaba",
          waitTime: "vic",
          staff: 1,
          condition: "spatny",
          improvements: ["nic"],
          comment: "",
        }),
      DuplicateSubmissionError,
    );
    const rows = await listSubmissions("vse");
    assert.equal(rows.filter((item) => item.comment === "test").length, 1);
  } finally {
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query("DELETE FROM submissions WHERE respondent_token = $1", [token]);
    await pool.end();
  }
});

after(async () => {
  if (process.env.DATABASE_URL) await closePool();
});

function row(id: string, satisfaction: number, sizeFit: string, waitTime: string): Submission {
  return {
    id,
    createdAt: "2026-10-15T16:41:00.000Z",
    satisfaction,
    sizeFit,
    quality: "dobra",
    waitTime,
    staff: 4,
    condition: "vporadku",
    improvements: [],
    comment: "",
  };
}
