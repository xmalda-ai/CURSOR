import { NextResponse } from "next/server";
import { adminConfigured, createSessionToken, passwordMatches, setSessionCookie } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Správa není nastavená. Doplňte ADMIN_PASSWORD a SESSION_SECRET." },
      { status: 503 },
    );
  }

  if (!rateLimit(`login:${clientIp(req)}`, 12, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Příliš mnoho pokusů. Zkuste to za čtvrt hodiny." }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    password = "";
  }

  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!password || !passwordMatches(password, expected)) {
    return NextResponse.json({ error: "Heslo nesedí." }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Správa není nastavená." }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, req, token);
  return res;
}
