import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { isAuthenticated, unauthorized } from "@/lib/auth";
import { requestOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAuthenticated(req)) return unauthorized();

  const target = `${requestOrigin(req)}/`;
  const png = await QRCode.toBuffer(target, {
    width: 720,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1e332b", light: "#fffdf8" },
  });
  const download = new URL(req.url).searchParams.get("stahnout") === "1";

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "Content-Disposition": download ? 'attachment; filename="qr-dotaznik.png"' : "inline",
    },
  });
}
