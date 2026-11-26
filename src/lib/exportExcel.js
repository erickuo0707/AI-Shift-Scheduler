import { WEEKDAY_EN, buildRotaSheet } from "./rotaSheet";
import { downloadFile } from "./scheduler";

const PEACH = "FFFCE4D6";
const GRAY = "FFE7E6E6";
const BORDER = { style: "thin", color: { argb: "FF9E9E9E" } };
const allBorders = { top: BORDER, left: BORDER, bottom: BORDER, right: BORDER };

// 匯出成門市原本的直式週表 Excel
export async function exportRotaExcel(state) {
  const { default: ExcelJS } = await import("exceljs");
  const sheet = buildRotaSheet(state);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheet.fileName, {
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 } },
  });
  ws.columns = [{ width: 14 }, ...Array.from({ length: 7 }, () => ({ width: 15 }))];
  const font = { name: "Arial", size: 11 };
  const center = { horizontal: "center", vertical: "middle", wrapText: true };

  ws.mergeCells(1, 1, 1, 8);
  const title = ws.getCell(1, 1);
  title.value = sheet.title;
  title.font = { ...font, size: 14, bold: true };
  title.alignment = center;
  ws.getRow(1).height = 28;
  let r = 2;

  const styleRow = (row, fill, opts = {}) => {
    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.border = allBorders;
      cell.alignment = center;
      if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      cell.font = { ...font, ...(opts.font || {}) };
    }
  };

  sheet.weeks.forEach((week, wi) => {
    if (wi > 0) { ws.getRow(r).height = 8; r++; }
    const head = ws.getRow(r);
    head.values = ["Name", ...WEEKDAY_EN];
    styleRow(head, PEACH, { font: { bold: true } });
    r++;
    const dateRow = ws.getRow(r);
    dateRow.values = ["", ...week.days.map((d) => d.label)];
    styleRow(dateRow, PEACH, { font: { bold: true } });
    week.days.forEach((d, i) => {
      const cell = dateRow.getCell(i + 2);
      if (d.red) cell.font = { ...font, bold: true, color: { argb: "FFE11D48" } };
      if (!d.inMonth) cell.font = { ...font, color: { argb: "FF9E9E9E" } };
    });
    r++;
    const ev = ws.getRow(r);
    ev.values = ["節日/活動", ...week.events];
    styleRow(ev, null);
    ev.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    r++;
    week.rows.forEach((row) => {
      const x = ws.getRow(r);
      x.values = [row.name, ...row.cells.map((c) => c.text)];
      styleRow(x, GRAY);
      x.getCell(1).font = { ...font, bold: true, italic: true, underline: true };
      row.cells.forEach((c, i) => {
        if (c.color === "red") x.getCell(i + 2).font = { ...font, color: { argb: "FFE11D48" } };
        if (c.color === "blue") x.getCell(i + 2).font = { ...font, color: { argb: "FF2F80ED" } };
      });
      const lines = Math.max(1, ...row.cells.map((c) => (c.text ? c.text.split("\n").length : 1)));
      x.height = 18 * lines;
      r++;
    });
    if (week.shortage) {
      const s = ws.getRow(r);
      s.values = ["缺額", ...week.shortage];
      styleRow(s, "FFFFF1F3", { font: { color: { argb: "FFE11D48" }, bold: true } });
      r++;
    }
  });

  const buf = await wb.xlsx.writeBuffer();
  downloadFile(sheet.fileName + ".xlsx", buf, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}
