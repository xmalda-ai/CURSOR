import ExcelJS from "exceljs";
import type { Submission, Summary } from "./aggregate";
import { formatCzechNumber, formatPrague, formatPragueStamp } from "./format";
import {
  conditionOptions,
  improvementLabels,
  labelFor,
  qualityOptions,
  sizeOptions,
  waitOptions,
} from "./questions";
import type { Period } from "./period";
import { periodLabel } from "./period";

const ink = "1E332B";
const paper = "FFFDF8";
const thread = "C4491D";

function styleHeader(sheet: ExcelJS.Worksheet) {
  const row = sheet.getRow(1);
  row.font = { name: "Calibri", bold: true, color: { argb: `FF${paper}` }, size: 12 };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${ink}` } };
  row.alignment = { vertical: "middle", wrapText: true };
  row.height = 22;
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
}

export async function buildWorkbook(rows: Submission[], summary: Summary, period: Period): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Dotazník výdeje oděvů";
  workbook.created = new Date();

  const answers = workbook.addWorksheet("Odpovědi");
  answers.columns = [
    { header: "Kód", key: "kod", width: 14 },
    { header: "Datum", key: "datum", width: 22 },
    { header: "Spokojenost", key: "spokojenost", width: 14 },
    { header: "Velikost", key: "velikost", width: 28 },
    { header: "Kvalita", key: "kvalita", width: 16 },
    { header: "Čekání", key: "cekani", width: 22 },
    { header: "Personál", key: "personal", width: 12 },
    { header: "Stav oděvu", key: "stav", width: 28 },
    { header: "Co zlepšit", key: "zlepsit", width: 36 },
    { header: "Komentář", key: "komentar", width: 42 },
  ];
  for (const row of rows) {
    answers.addRow({
      kod: row.id.slice(0, 8),
      datum: formatPragueStamp(row.createdAt),
      spokojenost: row.satisfaction,
      velikost: labelFor(sizeOptions, row.sizeFit),
      kvalita: labelFor(qualityOptions, row.quality),
      cekani: labelFor(waitOptions, row.waitTime),
      personal: row.staff,
      stav: labelFor(conditionOptions, row.condition),
      zlepsit: improvementLabels(row.improvements),
      komentar: row.comment,
    });
  }
  styleHeader(answers);

  const overview = workbook.addWorksheet("Souhrn");
  overview.columns = [
    { header: "Položka", key: "polozka", width: 34 },
    { header: "Hodnota", key: "hodnota", width: 28 },
    { header: "Počet", key: "pocet", width: 12 },
    { header: "Podíl %", key: "podil", width: 12 },
  ];
  overview.addRow({
    polozka: "Období",
    hodnota: periodLabel(period),
  });
  overview.addRow({
    polozka: "Vygenerováno",
    hodnota: formatPrague(new Date()),
  });
  overview.addRow({ polozka: "Odpovědí celkem", hodnota: summary.total });
  overview.addRow({
    polozka: "Průměrná spokojenost (1–5)",
    hodnota: summary.satisfactionAvg === null ? "" : Number(formatCzechNumber(summary.satisfactionAvg, 1).replace(",", ".")),
  });
  overview.addRow({
    polozka: "Průměr personálu (1–5)",
    hodnota: summary.staffAvg === null ? "" : Number(formatCzechNumber(summary.staffAvg, 1).replace(",", ".")),
  });
  overview.addRow({});

  const groups: { title: string; buckets: Summary["size"] }[] = [
    { title: "Spokojenost", buckets: summary.satisfaction },
    { title: "Velikost", buckets: summary.size },
    { title: "Kvalita", buckets: summary.quality },
    { title: "Čekání", buckets: summary.wait },
    { title: "Personál", buckets: summary.staff },
    { title: "Stav oděvu", buckets: summary.condition },
    { title: "Co zlepšit", buckets: summary.improvements },
  ];

  for (const group of groups) {
    const titleRow = overview.addRow({ polozka: group.title });
    titleRow.font = { bold: true, color: { argb: `FF${thread}` } };
    for (const bucket of group.buckets) {
      const dataRow = overview.addRow({
        polozka: bucket.label,
        pocet: bucket.count,
        podil: summary.total === 0 ? 0 : Math.round(bucket.share * 1000) / 10,
      });
      dataRow.getCell("podil").numFmt = "0.0";
    }
    overview.addRow({});
  }
  styleHeader(overview);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
