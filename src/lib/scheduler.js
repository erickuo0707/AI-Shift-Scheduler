// 排班引擎：依門市實際排班方式（正職月休＝紅字天數、一例一休、選填短班、缺人延長全天班）。
export const STORE_KEY = "shiftwell.scheduler.v1";
export const DAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

export function pad(n) { return String(n).padStart(2, "0"); }
export function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
export function parseDate(value) { const p = value.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2], 12, 0, 0, 0); }
export function addDays(d, n) { const next = new Date(d); next.setDate(next.getDate() + n); return next; }
export function currentMonth() { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1); }
export function nextMonth() { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + 1); return d.getFullYear() + "-" + pad(d.getMonth() + 1); }
export function monthDates(month) {
  const parts = month.split("-").map(Number);
  const count = new Date(parts[0], parts[1], 0).getDate();
  return Array.from({ length: count }, (_, i) => parts[0] + "-" + pad(parts[1]) + "-" + pad(i + 1));
}
export function uid(prefix) { return prefix + "-" + Math.random().toString(36).slice(2, 9); }
export function offRequestLimit(month) { return Math.min(5, Math.ceil(monthDates(month).length / 7)); }
function sampleOffRequests(month) {
  const dates = monthDates(month);
  return { must: [dates[2], dates[9], dates[16], dates[23]].filter(Boolean), prefer: [dates[dates.length - 1]] };
}
export function timeMinutes(time) { const p = time.split(":").map(Number); return p[0] * 60 + p[1]; }
export function shiftGrossHours(start, end) {
  if (!start || !end) return 0;
  let hours = (timeMinutes(end) - timeMinutes(start)) / 60;
  if (hours <= 0) hours += 24;
  return hours;
}
export function defaultBreakHours(start, end) { return shiftGrossHours(start, end) >= 6 ? 1 : 0; }
export function dayLabel(day) { return "週" + DAY_NAMES[day]; }

// 平日的國定放假日（含補假）。週六、週日一律算紅字，不列在此表。
// 依行政院人事行政總處 115、116 年政府行政機關辦公日曆表；各店可在畫面上自行調整。
const TW_WEEKDAY_HOLIDAYS = {
  2026: ["01-01", "02-16", "02-17", "02-18", "02-19", "02-20", "02-27", "04-03", "04-06", "05-01", "06-19", "09-25", "09-28", "10-09", "10-26", "12-25"],
  2027: ["01-01", "02-04", "02-05", "02-08", "02-09", "02-10", "03-01", "04-05", "04-06", "04-30", "06-09", "09-15", "09-28", "10-11", "10-25", "12-24", "12-31"],
};
export function isWeekend(date) { const d = parseDate(date).getDay(); return d === 0 || d === 6; }
export function defaultHolidays(month) {
  const list = TW_WEEKDAY_HOLIDAYS[Number(month.slice(0, 4))] || [];
  return list.map((md) => month.slice(0, 4) + "-" + md).filter((d) => d.slice(0, 7) === month);
}
export function monthHolidays(settings, month) {
  const saved = settings.holidaysByMonth && settings.holidaysByMonth[month];
  return Array.isArray(saved) ? saved.slice().sort() : defaultHolidays(month);
}
export function redDates(settings, month) {
  const hol = new Set(monthHolidays(settings, month));
  return monthDates(month).filter((d) => isWeekend(d) || hol.has(d));
}

// 門市固定班別：早班、晚班每天都要有人；短班有人能上才排（每天皆可，依短班人員可上班日）
export const FIXED_SHIFTS = [
  { id: "kc11", name: "早班", start: "11:00", end: "20:00", breakHours: 1, headcount: 1, days: [0, 1, 2, 3, 4, 5, 6], optional: false },
  { id: "kc12", name: "晚班", start: "12:00", end: "21:00", breakHours: 1, headcount: 1, days: [0, 1, 2, 3, 4, 5, 6], optional: false },
  { id: "kc1116", name: "短班", start: "10:30", end: "16:00", breakHours: 0, headcount: 1, days: [0, 1, 2, 3, 4, 5, 6], optional: true },
];
const fixedShifts = () => FIXED_SHIFTS.map((x) => ({ ...x, days: x.days.slice() }));

export function demoState() {
  const month = nextMonth();
  const daySets = [[1, 2, 4, 5, 6], [2, 3, 4, 5, 0], [1, 3, 4, 6, 0], [1, 2, 5, 6, 0], [2, 3, 5, 6, 0], [1, 3, 4, 5, 0]];
  const people = ["示範正職", "示範 PT 1", "示範 PT 2", "示範 PT 3", "示範 PT 4", "示範 PT 5（10:30短班）"];
  const types = ["正職", "PT", "PT", "PT", "PT", "PT"];
  const shifts = fixedShifts();
  const staff = people.map((name, i) => {
    const type = types[i];
    const availabilityByMonth = {};
    const requestedOffByMonth = {};
    const preferredOffByMonth = {};
    if (type === "正職") {
      const requests = sampleOffRequests(month);
      requestedOffByMonth[month] = requests.must;
      preferredOffByMonth[month] = requests.prefer;
    } else {
      availabilityByMonth[month] = monthDates(month).filter((date) => daySets[i].includes(parseDate(date).getDay()));
    }
    const preferredShiftId = i === 0 ? "kc11" : i === 5 ? "kc1116" : i % 2 ? "kc11" : "kc12";
    const allowedShiftIds = i === 5 ? ["kc1116"] : ["kc11", "kc12"];
    return { id: "demo-" + i, name, type, availabilityByMonth, requestedOffByMonth, preferredOffByMonth, allowedShiftIds, lead: i <= 1, maxHours: type === "正職" ? 40 : 28, preferredShiftId, avoidShiftId: "" };
  });
  return { staff, shifts, settings: { month, minRestHours: 11, maxConsecutiveDays: 5, extendToFullDay: true, holidaysByMonth: {}, monthDefaultVersion: 1, referencePatternVersion: 3, featureVersion: 5 }, result: null };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return demoState();
    const parsed = JSON.parse(raw);
    const base = demoState();
    const oldSettings = parsed.settings || {};
    const savedMonth = oldSettings.month || (oldSettings.startDate ? oldSettings.startDate.slice(0, 7) : base.settings.month);
    const migrateMonthDefault = oldSettings.monthDefaultVersion !== 1 && savedMonth === currentMonth();
    const month = migrateMonthDefault ? nextMonth() : savedMonth;
    const migrateReferencePattern = oldSettings.referencePatternVersion !== 3;
    const migrateFeatures = (Number(oldSettings.featureVersion) || 0) < 4;
    const sourceStaff = Array.isArray(parsed.staff) ? parsed.staff : base.staff;
    const demoTypes = ["正職", "PT", "PT", "PT", "PT", "PT"];
    const demoNames = ["示範正職", "示範 PT 1", "示範 PT 2", "示範 PT 3", "示範 PT 4", "示範 PT 5（10:30短班）"];
    const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    const staff = sourceStaff.map((person, index) => {
      const availabilityByMonth = Object.assign({}, person.availabilityByMonth || {});
      const requestedOffByMonth = Object.assign({}, person.requestedOffByMonth || {});
      const preferredOffByMonth = Object.assign({}, person.preferredOffByMonth || {});
      if (!has(availabilityByMonth, month) && Array.isArray(person.availabilityDays)) {
        availabilityByMonth[month] = monthDates(month).filter((date) => person.availabilityDays.includes(parseDate(date).getDay()));
      }
      const isDemo = String(person.id || "").indexOf("demo-") === 0;
      const isDemoSample = isDemo && String(person.name || "").indexOf("示範") === 0;
      const idNumber = Number(String(person.id || "").replace(/^demo-/, ""));
      const sampleIndex = Number.isFinite(idNumber) ? idNumber : index;
      const migrateDemoPattern = migrateReferencePattern && isDemoSample;
      const type = migrateDemoPattern ? (demoTypes[sampleIndex] || "PT") : person.type === "正職" ? "正職" : "PT";
      const demoShortStaff = isDemo && sampleIndex === 5;
      const allowedShiftIds = migrateReferencePattern ? (demoShortStaff ? ["kc1116"] : ["kc11", "kc12"]) : Array.isArray(person.allowedShiftIds) ? person.allowedShiftIds.slice() : null;
      const savedPreferred = person.preferredShiftId || "";
      const preferredShiftId = savedPreferred && Array.isArray(allowedShiftIds) && !allowedShiftIds.includes(savedPreferred) ? (demoShortStaff ? "kc1116" : "") : savedPreferred;
      const avoidShiftId = person.avoidShiftId && Array.isArray(allowedShiftIds) && !allowedShiftIds.includes(person.avoidShiftId) ? "" : person.avoidShiftId || "";
      if (migrateMonthDefault && isDemo && !has(availabilityByMonth, month) && Array.isArray(availabilityByMonth[savedMonth])) {
        const weekdays = new Set(availabilityByMonth[savedMonth].map((date) => parseDate(date).getDay()));
        availabilityByMonth[month] = monthDates(month).filter((date) => weekdays.has(parseDate(date).getDay()));
      }
      if (migrateDemoPattern && type === "正職" && !has(requestedOffByMonth, month)) {
        const requests = sampleOffRequests(month);
        requestedOffByMonth[month] = requests.must;
        preferredOffByMonth[month] = requests.prefer;
      }
      return {
        id: person.id || "person-" + index,
        name: migrateDemoPattern ? (demoNames[sampleIndex] || person.name) : person.name || "未命名",
        type,
        availabilityByMonth,
        requestedOffByMonth,
        preferredOffByMonth,
        maxHours: person.maxHours === undefined || migrateDemoPattern ? (type === "正職" ? 40 : 28) : Number(person.maxHours),
        allowedShiftIds,
        lead: person.lead === undefined ? (migrateFeatures && isDemoSample && sampleIndex <= 1) : !!person.lead,
        preferredShiftId,
        avoidShiftId,
      };
    });
    const ps = parsed.shifts;
    const oldDefaultShifts = Array.isArray(ps) && ps.length === 2 && ps[0].id === "early" && ps[0].name === "早班" && ps[0].start === "09:00" && ps[0].end === "15:00" && ps[1].id === "late" && ps[1].name === "晚班" && ps[1].start === "16:00" && ps[1].end === "22:00";
    const migrateDemoShifts = migrateReferencePattern && oldDefaultShifts;
    const migrateDemoShortShift = migrateReferencePattern && Array.isArray(ps) && ps.some((shift) => shift.id === "kc1116" && shift.name === "KC-11-16" && shift.start === "11:00" && shift.end === "16:00" && (shift.breakHours === undefined || Number(shift.breakHours) === 0));
    const shifts = Array.isArray(ps) && !migrateDemoShifts
      ? ps.map((shift) => {
        const updateShortShift = migrateDemoShortShift && shift.id === "kc1116";
        return { id: shift.id, name: updateShortShift ? "10:30-16" : shift.name, start: updateShortShift ? "10:30" : shift.start, end: shift.end, breakHours: shift.breakHours === undefined ? defaultBreakHours(shift.start, shift.end) : Number(shift.breakHours), headcount: shift.headcount, days: shift.days, optional: shift.optional === undefined ? (migrateFeatures && shift.id === "kc1116") : !!shift.optional };
      })
      : base.shifts;
    // 班別固定為 FIXED_SHIFTS：舊班別依時間（或 id）對應過去，人員的可排／偏好／避開班別一併換成新 id
    const idMap = new Map();
    shifts.forEach((old) => {
      const match = FIXED_SHIFTS.find((f) => f.start === old.start && f.end === old.end) || FIXED_SHIFTS.find((f) => f.id === old.id);
      if (match) idMap.set(old.id, match.id);
    });
    const oldIds = shifts.map((x) => x.id);
    staff.forEach((p) => {
      const source = Array.isArray(p.allowedShiftIds) ? p.allowedShiftIds : oldIds; // 原本「全部可排」＝原有的班別
      const mapped = [...new Set(source.map((id) => idMap.get(id)).filter(Boolean))];
      p.allowedShiftIds = mapped.length ? (mapped.length === FIXED_SHIFTS.length ? null : mapped) : ["kc11", "kc12"];
      p.preferredShiftId = idMap.get(p.preferredShiftId) || "";
      p.avoidShiftId = idMap.get(p.avoidShiftId) || "";
    });
    return {
      staff,
      shifts: fixedShifts(),
      settings: {
        month,
        minRestHours: oldSettings.minRestHours === undefined ? base.settings.minRestHours : oldSettings.minRestHours,
        maxConsecutiveDays: oldSettings.maxConsecutiveDays === undefined ? base.settings.maxConsecutiveDays : oldSettings.maxConsecutiveDays,
        extendToFullDay: oldSettings.extendToFullDay === undefined ? true : !!oldSettings.extendToFullDay,
        holidaysByMonth: oldSettings.holidaysByMonth && typeof oldSettings.holidaysByMonth === "object" ? oldSettings.holidaysByMonth : {},
        monthDefaultVersion: 1,
        referencePatternVersion: 3,
        featureVersion: 5,
      },
      // 已生成（含手動調整）的班表在同月份時保留
      result: parsed.result && parsed.result.month === month && Array.isArray(parsed.result.slots) && Array.isArray(parsed.result.assignments) ? parsed.result : null,
    };
  } catch (e) {
    return demoState();
  }
}

export function persist(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
}

export function canWorkShift(person, shiftId) {
  return !Array.isArray(person.allowedShiftIds) || person.allowedShiftIds.includes(shiftId);
}
export function personMustOffDates(person, month) {
  const values = person.requestedOffByMonth && person.requestedOffByMonth[month];
  return Array.isArray(values) ? values.slice().sort() : [];
}
export function personPreferredOffDates(person, month) {
  const values = person.preferredOffByMonth && person.preferredOffByMonth[month];
  return Array.isArray(values) ? values.slice().sort() : [];
}
export function personAvailabilityDates(person, month) {
  if (person.type === "正職") {
    const mustOff = new Set(personMustOffDates(person, month));
    return monthDates(month).filter((date) => !mustOff.has(date));
  }
  const values = person.availabilityByMonth && person.availabilityByMonth[month];
  return Array.isArray(values) ? values.slice().sort() : [];
}

function slotTimes(date, start, end, breakHours) {
  const startAt = parseDate(date); const [sh, sm] = start.split(":").map(Number); startAt.setHours(sh, sm, 0, 0);
  const endAt = parseDate(date); const [eh, em] = end.split(":").map(Number); endAt.setHours(eh, em, 0, 0);
  if (timeMinutes(end) <= timeMinutes(start)) endAt.setDate(endAt.getDate() + 1);
  const grossHours = (endAt - startAt) / 3600000;
  const rest = Math.max(0, Number(breakHours === undefined ? defaultBreakHours(start, end) : breakHours) || 0);
  return { startAt: startAt.getTime(), endAt: endAt.getTime(), grossHours, breakHours: rest, hours: Math.max(0, grossHours - rest) };
}
// 一週＝週日到週六（與門市班表相同）
export function weekKey(date) {
  const d = parseDate(date); return isoDate(addDays(d, -d.getDay()));
}
function daySerial(date) {
  const p = date.split("-").map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000);
}
function maxStreak(dates) {
  const vals = [...new Set(dates)].map(daySerial).sort((a, b) => a - b); let best = 0; let run = 0; let prev = null;
  for (const n of vals) { run = prev === null || n === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = n; }
  return best;
}
function makeSlots(state, dates) {
  const slots = [];
  dates.forEach((date) => {
    const weekday = parseDate(date).getDay();
    state.shifts.filter((s) => (s.days || []).includes(weekday)).forEach((shift) => {
      for (let i = 0; i < Math.max(1, Number(shift.headcount) || 1); i++) {
        const times = slotTimes(date, shift.start, shift.end, shift.breakHours);
        slots.push({ id: date + "|" + shift.id + "|" + i, date, weekday, optional: !!shift.optional, shiftId: shift.id, shiftName: shift.name, start: shift.start, end: shift.end, slotNo: i + 1, startAt: times.startAt, endAt: times.endAt, hours: times.hours, grossHours: times.grossHours, breakHours: times.breakHours });
      }
    });
  });
  return slots;
}
export function weeklyHours(assignments, employeeId, week) {
  return assignments.reduce((sum, a) => (a.employeeId === employeeId && weekKey(a.slot.date) === week ? sum + a.slot.hours : sum), 0);
}
function respectsRest(slot, otherSlots, minRestHours) {
  const restMs = minRestHours * 3600000;
  for (const other of otherSlots) {
    if (slot.startAt < other.endAt && other.startAt < slot.endAt) return false;
    if (slot.startAt >= other.endAt && slot.startAt - other.endAt < restMs) return false;
    if (other.startAt >= slot.endAt && other.startAt - slot.endAt < restMs) return false;
  }
  return true;
}

// 每週第一個休假日標「例假日」，其餘標「休息日」
function labelOff(off) {
  const labels = {};
  const seen = new Set();
  [...off].sort().forEach((d) => { const k = weekKey(d); labels[d] = seen.has(k) ? "休息日" : "例假日"; seen.add(k); });
  return labels;
}

// 當天已排的班加起來是否能蓋住某個時段（例如短班 10:30-16 + 晚班 12-21 蓋住早班 11-20）
function timeCovered(date, startAt, endAt, list) {
  const ranges = list.filter((a) => a.slot.date === date).map((a) => [a.slot.startAt, a.slot.endAt]).sort((x, y) => x[0] - y[0]);
  let reach = startAt;
  for (const [s, e] of ranges) { if (s > reach) break; reach = Math.max(reach, e); if (reach >= endAt) return true; }
  return reach >= endAt;
}

// 某班位是否已被排到（全天班延長會同時涵蓋兩個班位）
export function coveredSlotIds(result) {
  const set = new Set(result.implicitCovered || []);
  result.assignments.forEach((a) => (a.slot.covers || [a.slot.id]).forEach((id) => set.add(id)));
  return set;
}

// 綁定 state 的引擎
export function createEngine(state) {
  const month = state.settings.month;
  const dates = monthDates(month);
  const red = redDates(state.settings, month);
  const ptAvail = new Map(state.staff.filter((p) => p.type !== "正職").map((p) => [p.id, new Set(personAvailabilityDates(p, month))]));
  const othersCount = new Map(dates.map((d) => [d, [...ptAvail.values()].filter((set) => set.has(d)).length]));
  let offPlan = new Map(); // 正職 personId -> Set(休假日)
  const isAvail = (p, date) => (p.type === "正職"
    ? !(offPlan.get(p.id) || new Set(personMustOffDates(p, month))).has(date)
    : ptAvail.get(p.id).has(date));

  // 正職休假規劃：月休天數＝當月紅字天數；每週（日～六）至少休 2 天；優先排在 △ 希望休
  function planFullTimeOff(person) {
    const must = new Set(personMustOffDates(person, month));
    const prefer = new Set(personPreferredOffDates(person, month));
    const off = new Set(must);
    const target = Math.max(red.length, must.size);
    const weeks = new Map();
    dates.forEach((d) => { const k = weekKey(d); if (!weeks.has(k)) weeks.set(k, []); weeks.get(k).push(d); });
    // 這天少了這位正職，其他人還排得滿必要班嗎？（短班人員可負責開店，抵一個人）
    const canSpare = (d) => {
      const wd = parseDate(d).getDay();
      const need = state.shifts.filter((x) => !x.optional && (x.days || []).includes(wd)).reduce((n, x) => n + Math.max(1, Number(x.headcount) || 1), 0);
      const others = state.staff.filter((p) => p.id !== person.id && p.type !== "正職" && ptAvail.get(p.id).has(d));
      const main = others.filter((p) => state.shifts.some((x) => !x.optional && (x.days || []).includes(wd) && canWorkShift(p, x.id))).length;
      const opener = others.some((p) => state.shifts.some((x) => x.optional && (x.days || []).includes(wd) && canWorkShift(p, x.id)) && !state.shifts.some((x) => !x.optional && canWorkShift(p, x.id)));
      return main >= need || (opener && main >= need - 1);
    };
    const spare = new Map(dates.map((d) => [d, canSpare(d)]));
    // 分數越小越適合休：排得出人的希望休最優先；少了她會缺人的日子盡量不休
    const rank = new Map(dates.map((d) => [d, (prefer.has(d) && spare.get(d) ? -100 : 0) + (spare.get(d) ? 0 : 200) - (othersCount.get(d) || 0) * 6 + Math.random() * 8]));
    const pick = (ds) => ds.filter((d) => !off.has(d)).sort((a, b) => rank.get(a) - rank.get(b))[0];
    const offIn = (ds) => ds.filter((d) => off.has(d)).length;
    for (const ds of weeks.values()) {
      const need = Math.round((ds.length * 2) / 7);
      while (offIn(ds) < need) { const d = pick(ds); if (!d) break; off.add(d); }
    }
    while (off.size < target) {
      const preferLeft = [...prefer].filter((d) => !off.has(d) && spare.get(d)); // 希望休當天人手不足就不給休
      if (preferLeft.length) { off.add(pick(preferLeft)); continue; }
      const ws = [...weeks.values()].filter((ds) => ds.some((d) => !off.has(d))).sort((a, b) => offIn(a) / a.length - offIn(b) / b.length);
      if (!ws.length) break;
      off.add(pick(ws[0]));
    }
    return off;
  }
  function eligible(person, slot, assignments) {
    if (!canWorkShift(person, slot.shiftId)) return false;
    if (!isAvail(person, slot.date)) return false;
    const current = weeklyHours(assignments, person.id, weekKey(slot.date));
    if (current + slot.hours > Number(person.maxHours) + 0.001) return false;
    const own = assignments.filter((a) => a.employeeId === person.id).map((a) => a.slot);
    if (!respectsRest(slot, own, state.settings.minRestHours)) return false;
    if (maxStreak(own.map((x) => x.date).concat(slot.date)) > state.settings.maxConsecutiveDays) return false;
    return true;
  }
  const isLate = (slot) => timeMinutes(slot.start) >= 15 * 60 || timeMinutes(slot.end) >= 20 * 60;
  const isEarly = (slot) => timeMinutes(slot.start) < 10 * 60;
  const prefOff = (p) => personPreferredOffDates(p, month);
  const leadIds = new Set(state.staff.filter((p) => p.lead).map((p) => p.id));

  function assignmentScore(person, slot, assignments) {
    const current = weeklyHours(assignments, person.id, weekKey(slot.date));
    const capacity = Math.max(1, Number(person.maxHours) || 1);
    let score = ((current + slot.hours) / capacity) * 75 + (current / capacity) * 8;
    if (person.type === "正職") score -= 300; // 正職在排定的上班日一定先排
    if (person.preferredShiftId === slot.shiftId) score -= 22;
    if (person.avoidShiftId === slot.shiftId) score += 32;
    if (prefOff(person).includes(slot.date)) score += 65;
    if (!slot.optional && person.lead) {
      const hasLead = assignments.some((a) => a.slot.date === slot.date && !a.slot.optional && leadIds.has(a.employeeId));
      if (!hasLead) score -= 12; // 當天還沒有帶班的人，優先排資深人員
    }
    const own = assignments.filter((a) => a.employeeId === person.id).map((a) => a.slot);
    const nextStreak = maxStreak(own.map((x) => x.date).concat(slot.date));
    score += Math.max(0, nextStreak - 2) * 4;
    const weekend = slot.weekday === 0 || slot.weekday === 6;
    if (weekend) score += own.filter((x) => x.weekday === 0 || x.weekday === 6).length * 2.5;
    for (const other of own) {
      const gap = Math.abs(daySerial(slot.date) - daySerial(other.date));
      if (gap === 1) {
        const earlier = slot.startAt < other.startAt ? slot : other;
        const later = earlier === slot ? other : slot;
        if (isLate(earlier) && isEarly(later)) score += 18;
        if (slot.shiftId === other.shiftId) score -= 1;
      }
    }
    return score + Math.random() * 1.5;
  }

  // 補缺：1) 當天其他班已蓋住就不算缺；2) 把同天的人換到缺的班，讓其他班蓋住原本的班；3) 都不行才延長成全天班（可超過每週上限）
  function resolveCoverage(slots, assignments) {
    const implicitCovered = [];
    const covered = coveredSlotIds({ assignments });
    const missing = slots.filter((s) => !s.optional && !covered.has(s.id));
    for (const slot of missing) {
      if (timeCovered(slot.date, slot.startAt, slot.endAt, assignments)) { implicitCovered.push(slot.id); continue; }
      let swapped = false;
      for (const a of assignments.filter((x) => x.slot.date === slot.date && !x.slot.optional && !x.slot.extended)) {
        const person = state.staff.find((p) => p.id === a.employeeId);
        if (!person || !canWorkShift(person, slot.shiftId)) continue;
        if (assignments.some((x) => x !== a && x.employeeId === a.employeeId && x.slot.date === slot.date)) continue;
        const others = assignments.filter((x) => x !== a && x.employeeId === a.employeeId).map((x) => x.slot);
        if (!respectsRest(slot, others, state.settings.minRestHours)) continue;
        const vacated = a.slot;
        const trial = assignments.map((x) => (x === a ? { ...x, slot } : x));
        if (!timeCovered(vacated.date, vacated.startAt, vacated.endAt, trial)) continue;
        a.slot = slot;
        implicitCovered.push(vacated.id);
        swapped = true;
        break;
      }
      if (swapped) continue;
      if (state.settings.extendToFullDay) extendOne(slot, assignments);
    }
    return implicitCovered;
  }

  // 把當天已排班的人延長成涵蓋兩個班的全天班
  function extendOne(slot, assignments) {
    const candidates = assignments.filter((a) => a.slot.date === slot.date && !a.slot.optional && !a.slot.extended);
    for (const a of candidates) {
      const person = state.staff.find((p) => p.id === a.employeeId);
      if (!person || !canWorkShift(person, slot.shiftId)) continue;
      if (assignments.some((x) => x !== a && x.employeeId === a.employeeId && x.slot.date === slot.date)) continue;
      if (!(a.slot.startAt <= slot.endAt && slot.startAt <= a.slot.endAt)) continue;
      const startAt = Math.min(a.slot.startAt, slot.startAt);
      const endAt = Math.max(a.slot.endAt, slot.endAt);
      const others = assignments.filter((x) => x !== a && x.employeeId === a.employeeId).map((x) => x.slot);
      if (!respectsRest({ startAt, endAt }, others, state.settings.minRestHours)) continue;
      const breakHours = Math.max(a.slot.breakHours || 0, slot.breakHours || 0);
      const grossHours = (endAt - startAt) / 3600000;
      a.slot = {
        ...a.slot,
        start: a.slot.startAt <= slot.startAt ? a.slot.start : slot.start,
        end: a.slot.endAt >= slot.endAt ? a.slot.end : slot.end,
        startAt, endAt, grossHours, breakHours, hours: Math.max(0, grossHours - breakHours),
        shiftName: "全天班", extended: true, covers: [a.slot.id, slot.id],
      };
      break;
    }
  }

  function scheduleGrade(slots, assignments, implicitCovered = []) {
    const covered = coveredSlotIds({ assignments, implicitCovered });
    const missingReq = slots.filter((s) => !s.optional && !covered.has(s.id)).length;
    const missingOpt = slots.filter((s) => s.optional && !covered.has(s.id)).length;
    const extended = assignments.filter((a) => a.slot.extended).length;
    const weeks = [...new Set(slots.map((slot) => weekKey(slot.date)))];
    const ratios = state.staff.filter((p) => p.type !== "正職").map((p) => {
      const capacity = Math.max(1, Number(p.maxHours) || 1);
      return weeks.length ? weeks.reduce((sum, week) => sum + weeklyHours(assignments, p.id, week) / capacity, 0) / weeks.length : 0;
    });
    const mean = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
    const variance = ratios.length ? ratios.reduce((sum, x) => sum + (x - mean) * (x - mean), 0) / ratios.length : 0;
    let preferencePenalty = 0; let preferredOffPenalty = 0; let lateEarly = 0; let noLeadDays = 0;
    assignments.forEach((a) => {
      const person = state.staff.find((p) => p.id === a.employeeId);
      if (person && person.avoidShiftId === a.slot.shiftId) preferencePenalty++;
      if (person && prefOff(person).includes(a.slot.date)) preferredOffPenalty++;
    });
    state.staff.forEach((person) => {
      const own = assignments.filter((a) => a.employeeId === person.id).map((a) => a.slot).sort((a, b) => a.startAt - b.startAt);
      for (let i = 1; i < own.length; i++) if (isLate(own[i - 1]) && isEarly(own[i]) && daySerial(own[i].date) - daySerial(own[i - 1].date) === 1) lateEarly++;
    });
    if (leadIds.size) {
      dates.forEach((d) => {
        const leadFree = state.staff.some((p) => p.lead && isAvail(p, d));
        const leadOn = assignments.some((a) => a.slot.date === d && !a.slot.optional && leadIds.has(a.employeeId));
        if (leadFree && !leadOn) noLeadDays++;
      });
    }
    return missingReq * 100000 + extended * 400 + missingOpt * 30 + noLeadDays * 25 + variance * 2000 + preferencePenalty * 40 + preferredOffPenalty * 90 + lateEarly * 45;
  }

  function runAttempt(slots) {
    offPlan = new Map(state.staff.filter((p) => p.type === "正職").map((p) => [p.id, planFullTimeOff(p)]));
    const assignments = [];
    const ordered = slots.map((slot) => {
      const count = state.staff.filter((p) => isAvail(p, slot.date) && canWorkShift(p, slot.shiftId)).length;
      return { slot, count, tie: Math.random() };
    }).sort((a, b) => (a.slot.optional - b.slot.optional) || a.count - b.count || a.tie - b.tie).map((x) => x.slot);
    for (const slot of ordered) {
      const choices = state.staff.filter((person) => eligible(person, slot, assignments)).map((person) => ({ person, score: assignmentScore(person, slot, assignments) })).sort((a, b) => a.score - b.score);
      if (!choices.length) continue;
      let chosen = choices[0];
      if (choices[1] && choices[1].score < choices[0].score + 7 && Math.random() < 0.18) chosen = choices[1];
      assignments.push({ slot, employeeId: chosen.person.id });
    }
    const implicitCovered = resolveCoverage(slots, assignments);
    return { slots, assignments, implicitCovered, offPlan, grade: scheduleGrade(slots, assignments, implicitCovered) };
  }

  function shortageReason(slot, assignments) {
    const available = state.staff.filter((p) => isAvail(p, slot.date));
    if (!available.length) return "該日沒有可排人員（PT 未勾選可上班／正職休假）";
    const qualified = available.filter((p) => canWorkShift(p, slot.shiftId));
    if (!qualified.length) return "當日可上班的人員都沒有「" + slot.shiftName + "」班別資格";
    const blocked = new Set();
    qualified.forEach((p) => {
      const own = assignments.filter((a) => a.employeeId === p.id).map((a) => a.slot);
      if (weeklyHours(assignments, p.id, weekKey(slot.date)) + slot.hours > Number(p.maxHours) + 0.001) blocked.add("每週工時上限");
      if (maxStreak(own.map((x) => x.date).concat(slot.date)) > state.settings.maxConsecutiveDays) blocked.add("連續工作日上限");
      if (!respectsRest(slot, own, state.settings.minRestHours)) blocked.add("兩班休息間隔");
    });
    if (blocked.size) return "可排人員已受" + [...blocked].join("、") + "限制";
    return "目前其他硬性條件下找不到可用人員";
  }

  // 回傳 { error } 或 { result }
  function createSchedule() {
    if (!month) return { error: "請選擇要排班的月份。" };
    if (!state.staff.length) return { error: "請先新增至少一位人員。" };
    if (!state.shifts.length) return { error: "請先新增至少一個班別。" };
    const invalid = state.shifts.find((s) => !s.name.trim() || !s.start || !s.end || timeMinutes(s.start) === timeMinutes(s.end) || Number(s.breakHours) < 0 || Number(s.breakHours) >= shiftGrossHours(s.start, s.end));
    if (invalid) return { error: "請確認每個班別名稱與時間，開始和結束時間不可相同。" };
    const slots = makeSlots(state, dates);
    if (!slots.length) return { error: "這個月沒有排班需求，請檢查班別適用星期。" };
    let best = null;
    for (let i = 0; i < 60; i++) {
      const trial = runAttempt(slots);
      if (!best || trial.grade < best.grade) best = trial;
    }
    offPlan = best.offPlan;
    const covered = coveredSlotIds(best);
    const shortages = best.slots.filter((s) => !s.optional && !covered.has(s.id)).map((s) => ({ slotId: s.id, reason: shortageReason(s, best.assignments) }));
    const workedDays = (id) => new Set(best.assignments.filter((a) => a.employeeId === id).map((a) => a.slot.date));
    const offLabels = {};
    best.offPlan.forEach((off, id) => {
      const worked = workedDays(id);
      offLabels[id] = labelOff(new Set([...dates].filter((d) => off.has(d) || !worked.has(d))));
    });
    return { result: { slots: best.slots, assignments: best.assignments, implicitCovered: best.implicitCovered, shortages, offLabels, redDates: red, month, createdAt: new Date().toISOString() } };
  }
  return { createSchedule, shortageReason };
}


// ===== 生成後手動調整 =====
export const FULL_DAY = "fullday";
export const OFF = "off";

function shiftSlot(state, date, shiftId) {
  const sh = state.shifts.find((x) => x.id === shiftId);
  const t = slotTimes(date, sh.start, sh.end, sh.breakHours);
  return { date, weekday: parseDate(date).getDay(), optional: !!sh.optional, shiftId, shiftName: sh.name, start: sh.start, end: sh.end, slotNo: 1, ...t };
}
// 全天班＝當天必要班最早開始到最晚結束（例如 11:00–21:00，扣休息 1 小時）
function fullDaySlot(state, date) {
  const req = state.shifts.filter((x) => !x.optional);
  const first = req.reduce((a, b) => (timeMinutes(b.start) < timeMinutes(a.start) ? b : a));
  const last = req.reduce((a, b) => (timeMinutes(b.end) > timeMinutes(a.end) ? b : a));
  const breakHours = Math.max(...req.map((x) => Number(x.breakHours) || 0));
  const t = slotTimes(date, first.start, last.end, breakHours);
  return { date, weekday: parseDate(date).getDay(), optional: false, shiftId: first.id, shiftName: "全天班", start: first.start, end: last.end, slotNo: 1, extended: true, ...t };
}
export function manualChoices(state) {
  const req = state.shifts.filter((x) => !x.optional);
  const fd = fullDaySlot(state, state.settings.month + "-01");
  return [
    ...state.shifts.map((x) => ({ id: x.id, label: x.name, time: x.start + "–" + x.end })),
    ...(req.length > 1 ? [{ id: FULL_DAY, label: "全天班", time: fd.start + "–" + fd.end }] : []),
    { id: OFF, label: "休／不排", time: "" },
  ];
}
// 手動改班前的提醒（不阻擋）
export function manualWarnings(state, personId, date, choice) {
  if (choice === OFF) return [];
  const p = state.staff.find((x) => x.id === personId);
  const month = state.settings.month;
  const others = state.result.assignments.filter((a) => !(a.employeeId === personId && a.slot.date === date));
  const w = [];
  if (p.type === "正職") {
    if (personMustOffDates(p, month).includes(date)) w.push("這天畫了 X 必休");
    else if (personPreferredOffDates(p, month).includes(date)) w.push("這天畫了 △ 希望休");
  } else if (!personAvailabilityDates(p, month).includes(date)) w.push("這天沒勾可上班");
  const ids = choice === FULL_DAY ? state.shifts.filter((x) => !x.optional).map((x) => x.id) : [choice];
  if (ids.some((id) => !canWorkShift(p, id))) w.push("不在他的可排班別");
  const slot = choice === FULL_DAY ? fullDaySlot(state, date) : shiftSlot(state, date, choice);
  const own = others.filter((a) => a.employeeId === personId).map((a) => a.slot);
  if (!respectsRest(slot, own, state.settings.minRestHours)) w.push("跟前後天的班間隔不到 " + state.settings.minRestHours + " 小時");
  const hours = weeklyHours(others, personId, weekKey(date)) + slot.hours;
  if (hours > Number(p.maxHours) + 0.001) w.push("這週會到 " + hours + " 小時，超過上限 " + p.maxHours);
  if (maxStreak(own.map((x) => x.date).concat(date)) > state.settings.maxConsecutiveDays) w.push("會連續上班超過 " + state.settings.maxConsecutiveDays + " 天");
  return w;
}
// 套用手動調整，重算缺額、短班開店涵蓋與正職休假標記
export function applyManualEdit(state, personId, date, choice) {
  const r = state.result;
  const assignments = r.assignments.filter((a) => !(a.employeeId === personId && a.slot.date === date));
  let slots = r.slots.slice();
  const taken = coveredSlotIds({ assignments });
  const takeSlot = (shiftId) => {
    let s = slots.find((x) => x.date === date && x.shiftId === shiftId && !taken.has(x.id));
    if (!s) { s = { ...shiftSlot(state, date, shiftId), id: date + "|" + shiftId + "|m" + Math.random().toString(36).slice(2, 8), optional: true, extra: true }; slots.push(s); }
    taken.add(s.id);
    return s;
  };
  if (choice === FULL_DAY) {
    const parts = state.shifts.filter((x) => !x.optional).map((x) => takeSlot(x.id));
    assignments.push({ employeeId: personId, manual: true, slot: { ...fullDaySlot(state, date), id: parts[0].id, covers: parts.map((x) => x.id) } });
  } else if (choice !== OFF) {
    assignments.push({ employeeId: personId, manual: true, slot: takeSlot(choice) });
  }
  const used = coveredSlotIds({ assignments });
  slots = slots.filter((x) => !x.extra || used.has(x.id));
  const implicitCovered = slots.filter((x) => !x.optional && !used.has(x.id) && timeCovered(x.date, x.startAt, x.endAt, assignments)).map((x) => x.id);
  const oldReasons = new Map((r.shortages || []).map((x) => [x.slotId, x.reason]));
  const shortages = slots.filter((x) => !x.optional && !used.has(x.id) && !implicitCovered.includes(x.id))
    .map((x) => ({ slotId: x.id, reason: oldReasons.get(x.id) || "手動調整後沒有人上這個班" }));
  const dates = monthDates(state.settings.month);
  const offLabels = {};
  state.staff.filter((p) => p.type === "正職").forEach((p) => {
    const worked = new Set(assignments.filter((a) => a.employeeId === p.id).map((a) => a.slot.date));
    offLabels[p.id] = labelOff(new Set(dates.filter((d) => !worked.has(d))));
  });
  return { ...r, slots, assignments, implicitCovered, shortages, offLabels, edited: true };
}

export function downloadFile(name, content, type) {
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
export function exportCsv(state) {
  const lines = [["日期", "星期", "班別", "開始", "結束", "計薪工時", "人員", "狀態"]];
  state.result.slots.forEach((slot) => {
    const assigned = state.result.assignments.find((a) => (a.slot.covers || [a.slot.id]).includes(slot.id));
    const person = assigned && state.staff.find((p) => p.id === assigned.employeeId);
    if (assigned && assigned.slot.extended && assigned.slot.id !== slot.id) return; // 全天班只列一次
    const s = assigned ? assigned.slot : slot;
    const implicit = (state.result.implicitCovered || []).includes(slot.id);
    const status = person ? (assigned.manual ? "手動調整" : s.extended ? "已安排（缺人延長為全天班）" : "已安排") : implicit ? "由當天其他班別涵蓋（如短班開店）" : slot.optional ? "選填班未排" : (state.result.shortages.find((x) => x.slotId === slot.id) || {}).reason || "缺額";
    lines.push([slot.date, dayLabel(slot.weekday), s.shiftName, s.start, s.end, s.hours, person ? person.name : "", status]);
  });
  const csv = "﻿" + lines.map((row) => row.map((value) => '"' + String(value).replace(/"/g, '""') + '"').join(",")).join("\r\n");
  downloadFile("ShiftWell_班表.csv", csv, "text/csv;charset=utf-8");
}
export function exportBackup(state) {
  const backup = { version: 1, staff: state.staff, shifts: state.shifts, settings: state.settings };
  downloadFile("ShiftWell_排班設定.json", JSON.stringify(backup, null, 2), "application/json");
}
export function formatDateLabel(date) {
  const d = parseDate(date);
  return d.getFullYear() + "/" + pad(d.getMonth() + 1) + "/" + pad(d.getDate()) + "（" + dayLabel(d.getDay()) + "）";
}
