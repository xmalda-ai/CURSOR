import { NextResponse } from "next/server";
import { summarize } from "@/lib/aggregate";
import { isAuthenticated, unauthorized } from "@/lib/auth";
import { listSubmissions } from "@/lib/db";
import { parsePeriod } from "@/lib/period";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAuthenticated(req)) return unauthorized();

  try {
    const period = parsePeriod(new URL(req.url).searchParams.get("obdobi"));
    const rows = await listSubmissions(period);
    const summary = summarize(rows);
    return NextResponse.json(
      {
        period,
        generatedAt: new Date().toISOString(),
        summary: { ...summary, comments: summary.comments.slice(0, 12) },
        recent: [...rows].reverse().slice(0, 20),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Výsledky se nepodařilo načíst." }, { status: 503 });
  }
}
