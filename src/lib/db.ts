import { randomUUID } from "crypto";
import { Pool, type QueryResultRow } from "pg";
import type { Submission } from "./aggregate";
import type { Answers } from "./validate";
import { periodClause, type Period } from "./period";

export class DuplicateSubmissionError extends Error {
  constructor() {
    super("duplicate");
    this.name = "DuplicateSubmissionError";
  }
}

let pool: Pool | null = null;
let schema: Promise<void> | null = null;

function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL není nastavená.");
  if (!pool) {
    const local = /localhost|127\.0\.0\.1|\.internal/.test(url);
    pool = new Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 10_000,
      ssl: local || /sslmode=/.test(url) ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function ensureSchema(): Promise<void> {
  if (!schema) {
    schema = (async () => {
      const db = getPool();
      await db.query(`
        CREATE TABLE IF NOT EXISTS submissions (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          respondent_token TEXT NOT NULL UNIQUE,
          satisfaction SMALLINT NOT NULL CHECK (satisfaction BETWEEN 1 AND 5),
          size_fit TEXT NOT NULL CHECK (size_fit IN ('ano', 'jina', 'nebyla')),
          quality TEXT NOT NULL CHECK (quality IN ('vyborna', 'dobra', 'prumerna', 'slaba')),
          wait_time TEXT NOT NULL CHECK (wait_time IN ('do5', 'do15', 'do30', 'vic')),
          staff SMALLINT NOT NULL CHECK (staff BETWEEN 1 AND 5),
          garment_condition TEXT NOT NULL CHECK (garment_condition IN ('vporadku', 'drobnosti', 'spatny')),
          improvements JSONB NOT NULL,
          comment TEXT NOT NULL DEFAULT ''
        )
      `);
      await db.query(
        `CREATE INDEX IF NOT EXISTS submissions_created_at_idx ON submissions (created_at DESC)`,
      );
    })().catch((error) => {
      schema = null;
      throw error;
    });
  }
  return schema;
}

function asImprovements(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: QueryResultRow): Submission {
  const created = row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at));
  return {
    id: String(row.id),
    createdAt: created.toISOString(),
    satisfaction: Number(row.satisfaction),
    sizeFit: String(row.size_fit),
    quality: String(row.quality),
    waitTime: String(row.wait_time),
    staff: Number(row.staff),
    condition: String(row.garment_condition),
    improvements: asImprovements(row.improvements),
    comment: String(row.comment ?? ""),
  };
}

export async function hasSubmission(token: string): Promise<boolean> {
  await ensureSchema();
  const result = await getPool().query(`SELECT 1 FROM submissions WHERE respondent_token = $1 LIMIT 1`, [
    token,
  ]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function insertSubmission(token: string, answers: Answers): Promise<string> {
  await ensureSchema();
  const id = randomUUID();
  try {
    await getPool().query(
      `INSERT INTO submissions (
        id, respondent_token, satisfaction, size_fit, quality, wait_time, staff, garment_condition, improvements, comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
      [
        id,
        token,
        answers.satisfaction,
        answers.sizeFit,
        answers.quality,
        answers.waitTime,
        answers.staff,
        answers.condition,
        JSON.stringify(answers.improvements),
        answers.comment,
      ],
    );
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new DuplicateSubmissionError();
    }
    throw error;
  }
  return id;
}

export async function listSubmissions(period: Period): Promise<Submission[]> {
  await ensureSchema();
  const where = periodClause(period);
  const result = await getPool().query(
    `SELECT id, created_at, satisfaction, size_fit, quality, wait_time, staff, garment_condition, improvements, comment
     FROM submissions
     ${where}
     ORDER BY created_at ASC`,
  );
  return result.rows.map(mapRow);
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    schema = null;
  }
}
