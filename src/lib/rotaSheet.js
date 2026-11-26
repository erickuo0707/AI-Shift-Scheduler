// 門市原本的「直式週表」格式（如 2026 12月內場排班），Excel 與列印共用
import { addDays, isWeekend, isoDate, monthDates, monthHolidays, parseDate } from "./scheduler";

export const WEEKDAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function buildRotaSheet(state) {
  const { result, settings, staff } = state;
  const month = settings.month;
  const [y, m] = month.split("-").map(Number);
  const dates = monthDates(month);
  const holidays = new Set(monthHolidays(settings, month).filter((d) => !isWeekend(d)));

  const byPersonDate = new Map();
  result.assignments.forEach((a) => {
    const k = a.employeeId + "|" + a.slot.date;
    if (!byPersonDate.has(k)) byPersonDate.set(k, []);
    byPersonDate.get(k).push(a.slot);
  });
  byPersonDate.forEach((list) => list.sort((p, q) => p.startAt - q.startAt));

  // 正職休假依日期編號 X1、X2…
  const xNo = new Map();
  staff.filter((p) => p.type === "正職").forEach((p) => {
    let n = 0;
    dates.forEach((d) => { if (!byPersonDate.has(p.id + "|" + d)) xNo.set(p.id + "|" + d, ++n); });
  });

  const shortByDate = new Map();
  (result.shortages || []).forEach((s) => {
    const slot = result.slots.find((x) => x.id === s.slotId);
    if (!slot) return;
    const list = shortByDate.get(slot.date) || [];
    list.push(slot.shiftName);
    shortByDate.set(slot.date, list);
  });

  const first = parseDate(dates[0]);
  let start = addDays(first, -first.getDay());
  const last = parseDate(dates[dates.length - 1]);
  const weeks = [];
  while (start <= last) {
    const days = Array.from({ length: 7 }, (_, i) => isoDate(addDays(start, i)));
    const inMonth = (d) => d.slice(0, 7) === month;
    const rows = staff.map((p) => ({
      name: p.name,
      cells: days.map((d) => {
        if (!inMonth(d)) return { text: "" };
        const slots = byPersonDate.get(p.id + "|" + d);
        if (slots) {
          const full = slots.some((s) => s.extended);
          return { text: slots.map((s) => s.start + "-" + s.end).join("\n"), color: full ? "blue" : null };
        }
        if (p.type === "正職") return { text: "X" + xNo.get(p.id + "|" + d), color: "red" };
        return { text: "" };
      }),
    }));
    const shortage = days.map((d) => {
      const list = inMonth(d) ? shortByDate.get(d) : null;
      if (!list) return "";
      const count = {};
      list.forEach((n) => { count[n] = (count[n] || 0) + 1; });
      return Object.entries(count).map(([n, c]) => n + "缺" + c).join("\n");
    });
    weeks.push({
      days: days.map((d) => ({ date: d, label: Number(d.slice(5, 7)) + "/" + Number(d.slice(8)), inMonth: inMonth(d), red: inMonth(d) && (isWeekend(d) || holidays.has(d)) })),
      events: days.map((d) => (inMonth(d) && holidays.has(d) ? "國定假日" : "")),
      rows,
      shortage: shortage.some(Boolean) ? shortage : null,
    });
    start = addDays(start, 7);
  }
  return { title: `${y} ${m}月內場排班`, fileName: `${y}年${m}月內場排班`, weeks };
}
