import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { DuplicateSubmissionError, hasSubmission, insertSubmission } from "@/lib/db";
import {
  TOKEN_COOKIE,
  clientIp,
  isRespondentToken,
  isSecureRequest,
  rateLimit,
  readCookie,
} from "@/lib/http";
import { parseAnswers } from "@/lib/validate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function tokenFrom(req: Request): string | undefined {
  const cookie = readCookie(req, TOKEN_COOKIE);
  if (isRespondentToken(cookie)) return cookie;
  const header = req.headers.get("x-odev-tid");
  if (isRespondentToken(header)) return header;
  return undefined;
}

function withToken(res: NextResponse, req: Request, token: string) {
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(req),
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(req: Request) {
  try {
    const token = tokenFrom(req) ?? randomBytes(32).toString("hex");
    const done = await hasSubmission(token);
    return withToken(NextResponse.json({ stav: done ? "hotovo" : "novy", token }), req, token);
  } catch {
    return NextResponse.json(
      { error: "Dotazník teď nejde otevřít. Zkuste to za chvíli." },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
  if (!rateLimit(`submit:${clientIp(req)}`, 300, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Z této sítě přišlo příliš mnoho odpovědí. Zkuste to později." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatná data." }, { status: 400 });
  }

  const parsed = parseAnswers(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (parsed.honeypot) return NextResponse.json({ stav: "ulozeno" });

  const token = tokenFrom(req);
  if (!token) {
    return NextResponse.json({ error: "Otevřete dotazník znovu a zkuste odeslání ještě jednou." }, { status: 400 });
  }

  try {
    await insertSubmission(token, parsed.answers);
    return withToken(NextResponse.json({ stav: "ulozeno" }), req, token);
  } catch (error) {
    if (error instanceof DuplicateSubmissionError) {
      return withToken(
        NextResponse.json(
          { stav: "hotovo", error: "Tento telefon už dotazník odeslal." },
          { status: 409 },
        ),
        req,
        token,
      );
    }
    return NextResponse.json({ error: "Odpověď se nepodařilo uložit. Zkuste to znovu." }, { status: 503 });
  }
}
