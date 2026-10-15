import { readFileSync } from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import type { Bucket, Submission, Summary } from "./aggregate";
import { formatCzechNumber, formatPrague, formatShare } from "./format";
import { periodLabel, type Period } from "./period";

const regularFont = path.join(process.cwd(), "assets/fonts/DejaVuSans.ttf");
const boldFont = path.join(process.cwd(), "assets/fonts/DejaVuSans-Bold.ttf");

const ink = "#1e332b";
const thread = "#c4491d";
const muted = "#5c564c";
const line = "#d9d0bf";
const pine = "#243f34";

function drawBars(
  doc: PDFKit.PDFDocument,
  title: string,
  buckets: Bucket[],
  y: number,
): number {
  if (y > 700) {
    doc.addPage();
    y = 48;
  }
  doc.font("sans-bold").fontSize(12).fillColor(ink).text(title, 48, y, { width: 500 });
  y += 22;
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1);
  for (const bucket of buckets) {
    if (y > 760) {
      doc.addPage();
      y = 48;
    }
    doc.font("sans").fontSize(9).fillColor(ink).text(bucket.label, 48, y, { width: 190 });
    const width = Math.max(2, (bucket.count / max) * 210);
    doc.roundedRect(250, y + 1, width, 9, 2).fill(pine);
    doc
      .font("sans")
      .fontSize(9)
      .fillColor(muted)
      .text(`${bucket.count} · ${formatShare(bucket.share)}`, 468, y, { width: 80, align: "right" });
    y += 18;
  }
  return y + 8;
}

export function buildPdf(rows: Submission[], summary: Summary, period: Period): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      bufferPages: true,
      info: {
        Title: "Výsledky dotazníku k výdeji pracovních oděvů",
        Author: "Dotazník výdeje oděvů",
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("sans", readFileSync(regularFont));
    doc.registerFont("sans-bold", readFileSync(boldFont));
    doc.font("sans");

    doc.rect(0, 0, doc.page.width, 86).fill(ink);
    doc.font("sans").fontSize(10).fillColor("#f3ead8").text("VÝDEJ PRACOVNÍCH ODĚVŮ", 48, 28);
    doc.font("sans-bold").fontSize(18).fillColor("#fffdf8").text("Výsledky dotazníku", 48, 46);
    doc.moveTo(48, 108).lineTo(547, 108).strokeColor(thread).lineWidth(2).stroke();

    doc.font("sans").fontSize(10).fillColor(muted);
    doc.text(`${periodLabel(period)}  ·  vygenerováno ${formatPrague(new Date())}`, 48, 118);

    const cards = [
      ["Odpovědí", String(summary.total)],
      ["Spokojenost", summary.satisfactionAvg === null ? "—" : `${formatCzechNumber(summary.satisfactionAvg, 1)} z 5`],
      ["Správná velikost", summary.sizeOkShare === null ? "—" : formatShare(summary.sizeOkShare)],
      ["Do 5 minut", summary.quickWaitShare === null ? "—" : formatShare(summary.quickWaitShare)],
    ];
    cards.forEach((card, index) => {
      const x = 48 + (index % 4) * 126;
      doc.roundedRect(x, 146, 118, 52, 8).fillAndStroke("#fffdf8", line);
      doc.font("sans").fontSize(8).fillColor(muted).text(card[0], x + 8, 154, { width: 102 });
      doc.font("sans-bold").fontSize(12).fillColor(ink).text(card[1], x + 8, 170, { width: 102 });
    });

    let y = 220;
    y = drawBars(doc, "Celková spokojenost", summary.satisfaction, y);
    y = drawBars(doc, "Velikost", summary.size, y);
    y = drawBars(doc, "Kvalita oděvu", summary.quality, y);
    y = drawBars(doc, "Čekání", summary.wait, y);
    y = drawBars(doc, "Personál", summary.staff, y);
    y = drawBars(doc, "Stav oděvu", summary.condition, y);
    y = drawBars(doc, "Co zlepšit", summary.improvements, y);

    if (y > 700) {
      doc.addPage();
      y = 48;
    }
    doc.font("sans-bold").fontSize(12).fillColor(ink).text("Komentáře", 48, y);
    y += 20;
    const comments = rows.filter((row) => row.comment.trim() !== "").slice(-100).reverse();
    if (comments.length === 0) {
      doc.font("sans").fontSize(10).fillColor(muted).text("Zatím bez komentářů.", 48, y);
    } else {
      const shown = comments.slice(0, 80);
      for (const comment of shown) {
        const height = doc.heightOfString(comment.comment, { width: 500 }) + 16;
        if (y + height > 780) {
          doc.addPage();
          y = 48;
        }
        doc.font("sans").fontSize(8).fillColor(thread).text(formatPrague(comment.createdAt), 48, y);
        y += 12;
        doc.font("sans").fontSize(10).fillColor(ink).text(comment.comment, 48, y, { width: 500 });
        y += doc.heightOfString(comment.comment, { width: 500 }) + 10;
      }
      if (comments.length > shown.length) {
        doc
          .font("sans")
          .fontSize(9)
          .fillColor(muted)
          .text("Další komentáře jsou v exportu do Excelu.", 48, y);
      }
    }

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      const previousBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.font("sans").fontSize(8).fillColor(muted);
      doc.text(`Strana ${i + 1} / ${range.count}`, 48, doc.page.height - 28, {
        width: doc.page.width - 96,
        align: "right",
        lineBreak: false,
      });
      doc.page.margins.bottom = previousBottom;
    }

    doc.end();
  });
}
