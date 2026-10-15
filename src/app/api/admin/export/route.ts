import { NextResponse } from "next/server";
import { summarize } from "@/lib/aggregate";
import { isAuthenticated, unauthorized } from "@/lib/auth";
import { submissionsToCsv } from "@/lib/csv";
import { listSubmissions } from "@/lib/db";
import { formatPragueStamp } from "@/lib/format";
import { parsePeriod } from "@/lib/period";
import { buildPdf } from "@/lib/pdf";
import { buildWorkbook } from "@/lib/xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAuthenticated(req)) return unauthorized();

  const url = new URL(req.url);
  const typ = url.searchParams.get("typ");
  const period = parsePeriod(url.searchParams.get("obdobi"));
  const stamp = formatPragueStamp(new Date()).slice(0, 10);

  try {
    const rows = await listSubmissions(period);
    const summary = summarize(rows);

    if (typ === "csv") {
      return new NextResponse(submissionsToCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="vysledky-odevy-${stamp}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (typ === "xlsx") {
      const file = await buildWorkbook(rows, summary, period);
      return new NextResponse(new Uint8Array(file), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="vysledky-odevy-${stamp}.xlsx"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (typ === "pdf") {
      const file = await buildPdf(rows, summary, period);
      return new NextResponse(new Uint8Array(file), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="vysledky-odevy-${stamp}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({ error: "Neznámý formát exportu." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Export se nepodařilo vytvořit." }, { status: 503 });
  }
}
