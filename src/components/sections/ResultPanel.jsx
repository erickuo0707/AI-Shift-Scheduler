import { Panel } from "../Panel";
import { IconDownload, IconPrinter, IconSave } from "../Icons";
import { addDays, coveredSlotIds, formatDateLabel, isoDate, monthDates, parseDate, personAvailabilityDates, personMustOffDates, personPreferredOffDates, weekKey } from "../../lib/scheduler";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ResultPanel({ state, onCsv, onBackup, onEditCell, onRestore }) {
  const result = state.result;
  const month = state.settings.month;
  const dates = monthDates(month);
  const covered = coveredSlotIds(result);
  const required = result.slots.filter((s) => !s.optional);
  const optional = result.slots.filter((s) => s.optional);
  const unfilled = result.shortages.length;
  const coveredReq = required.filter((s) => covered.has(s.id)).length;
  const coverage = required.length ? Math.round((coveredReq / required.length) * 100) : 0;
  const extendedCount = result.assignments.filter((a) => a.slot.extended).length;
  const implicitDays = [...new Set((result.implicitCovered || []).map((id) => Number(id.slice(8, 10))))];
  const redSet = new Set(result.redDates || []);
  const offLabels = result.offLabels || {};
  const avoidCount = result.assignments.filter((a) => {
    const p = state.staff.find((x) => x.id === a.employeeId);
    return p && (p.avoidShiftId === a.slot.shiftId || personPreferredOffDates(p, month).includes(a.slot.date));
  }).length;

  const assignmentMap = new Map();
  result.assignments.forEach((a) => {
    const key = a.employeeId + "|" + a.slot.date;
    if (!assignmentMap.has(key)) assignmentMap.set(key, []);
    assignmentMap.get(key).push(a.manual ? { ...a.slot, manual: true } : a.slot);
  });
  assignmentMap.forEach((items) => items.sort((a, b) => a.start.localeCompare(b.start)));
  const shortagesByDate = new Map();
  (result.shortages || []).forEach((item) => {
    const slot = result.slots.find((s) => s.id === item.slotId); if (!slot) return;
    if (!shortagesByDate.has(slot.date)) shortagesByDate.set(slot.date, []);
    const list = shortagesByDate.get(slot.date);
    let sh = list.find((x) => x.shiftId === slot.shiftId);
    if (!sh) { sh = { shiftId: slot.shiftId, shiftName: slot.shiftName, count: 0, reasons: new Set() }; list.push(sh); }
    sh.count++;
    if (item.reason) sh.reasons.add(item.reason);
  });
  const firstDay = parseDate(dates[0]);
  let weekStart = addDays(firstDay, -firstDay.getDay());
  const lastDay = parseDate(dates[dates.length - 1]);
  const weeks = [];
  while (weekStart <= lastDay) { weeks.push(Array.from({ length: 7 }, (_, i) => isoDate(addDays(weekStart, i)))); weekStart = addDays(weekStart, 7); }
  const [y, m] = month.split("-").map(Number);

  const kpis = [
    ["人力覆蓋率", coverage, "%", true],
    ["班位缺額", unfilled, "", unfilled === 0],
    ["全天班延長", extendedCount, " 次", extendedCount === 0],
    ["偏好衝突", avoidCount, " 班", avoidCount === 0],
  ];

  return (
    <Panel
      id="resultSection"
      eyebrow="Step 03 · 班表"
      title="排班建議"
      sub={formatDateLabel(dates[0]) + " 至 " + formatDateLabel(dates[dates.length - 1]) + " · 必要班位 " + required.length + " 個" + (optional.length ? "，選填 " + optional.length + " 個（已排 " + optional.filter((s) => covered.has(s.id)).length + "）" : "")}
      actions={<>
        {result.edited && <button className="btn" onClick={onRestore}>還原系統排班</button>}
        <button className="btn" onClick={onCsv}><IconDownload />下載 CSV</button>
        <button className="btn" onClick={onBackup}><IconSave />備份設定</button>
        <button className="btn btn-primary" onClick={() => window.print()}><IconPrinter />列印班表</button>
      </>}
    >
      <div className={"mb-5 rounded-[18px] border px-6 py-5 text-[1rem] font-semibold " + (unfilled ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-800")}>
        {unfilled
          ? `必要班位排出 ${coveredReq} / ${required.length} 個，還有 ${unfilled} 個缺額。請查看原因，調整人員可上班日期、班別需求或休息條件後重新生成。`
          : `所有必要班位都已安排${extendedCount ? `（其中 ${extendedCount} 天因缺人延長為全天班）` : ""}。系統遵守可上班日期、正職月休與一例一休、休息間隔與連續工作日上限。`}
        {implicitDays.length > 0 && <div className="mt-1.5 text-[0.9rem] font-normal opacity-90">{implicitDays.join("、")} 日由短班負責開店，另一人上 12 點的班即可，不另排早班。</div>}
      </div>

      <div className="my-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(([label, value, unit, good]) => (
          <div key={label} className="kpi-card rounded-2xl border border-line bg-white px-6 py-5">
            <span className="eyebrow block">{label}</span>
            <strong className={"mt-2 block text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] " + (good ? "text-ink" : "text-amber-600")}>
              {value}{unit}
            </strong>
          </div>
        ))}
      </div>

      <p className="mb-3.5 text-[0.88rem] text-dim">紅色日期為紅字（週末／國定假日）。PT 的 X 代表未勾選可上班；正職休假標「例假日／休息日」，X 是自己畫的必休、△ 是希望休。<span className="text-sky-600">藍色</span>是全天班。<b className="text-ink">點任一格可以手動改班</b>，虛線框是手動調整過的。</p>

      <div className="grid gap-5">
        <div className="rounded-xl border border-line bg-[#f7f8fa] p-4 text-center text-[1.4rem] font-black tracking-wide text-ink">
          {y} 年 {m} 月排班表
        </div>
        {weeks.map((weekDates) => (
          <div key={weekDates[0]} className="table-wrap rota">
            <table className="schedule-table">
              <thead>
                <tr><th>Name</th>{WEEKDAYS.map((d) => <th key={d}>{d}</th>)}</tr>
                <tr className="date-row"><th>Name</th>{weekDates.map((date) => {
                  const d = parseDate(date); const outside = date.slice(0, 7) !== month;
                  return <th key={date} className={outside ? "outside" : redSet.has(date) ? "red" : ""}>{d.getMonth() + 1}/{d.getDate()}</th>;
                })}</tr>
              </thead>
              <tbody>
                {state.staff.map((person) => {
                  const available = new Set(personAvailabilityDates(person, month));
                  const mustOff = new Set(personMustOffDates(person, month));
                  const preferredOff = new Set(personPreferredOffDates(person, month));
                  return (
                    <tr key={person.id}>
                      <th scope="row" className="staff-name">{person.name}</th>
                      {weekDates.map((date) => {
                        const inside = date.slice(0, 7) === month;
                        const shifts = (assignmentMap.get(person.id + "|" + date) || []);
                        let content = null;
                        if (inside && shifts.length) {
                          content = (
                            <div className="grid justify-items-center gap-1">
                              {shifts.map((slot) => (
                                <span key={slot.id} className={"work" + (slot.extended ? " extended" : preferredOff.has(date) ? " requested" : "") + (slot.manual ? " manual" : "")}>
                                  <strong>{slot.shiftName}</strong>
                                  <small>{slot.start}–{slot.end}</small>
                                  {preferredOff.has(date) && <em>△ 希望休</em>}
                                </span>
                              ))}
                            </div>
                          );
                        } else if (inside && offLabels[person.id] && offLabels[person.id][date]) {
                          content = <span className="leave">{mustOff.has(date) && <b>X </b>}{preferredOff.has(date) && <b>△ </b>}{offLabels[person.id][date]}</span>;
                        } else if (inside && mustOff.has(date)) content = <span className="off">X</span>;
                        else if (inside && preferredOff.has(date)) content = <span className="prefer">△</span>;
                        else if (inside && person.type === "正職") content = <span className="rest">休</span>;
                        else if (inside && !available.has(date)) content = <span className="off">X</span>;
                        if (!inside) return <td key={date} className="outside" />;
                        return (
                          <td key={date} className="p-0">
                            <button type="button" className="cell-btn" onClick={() => onEditCell(person.id, date)} aria-label={`調整 ${person.name} ${date} 的班`}>{content || <span className="cell-add">＋</span>}</button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="shortage-row">
                  <th scope="row">人力缺額</th>
                  {weekDates.map((date) => {
                    if (date.slice(0, 7) !== month) return <td key={date} className="outside" />;
                    const items = shortagesByDate.get(date) || [];
                    return (
                      <td key={date}>
                        {items.length ? items.map((it) => (
                          <div key={it.shiftId}>
                            <span className="vacancy">{it.shiftName} 缺 {it.count} 人</span>
                            {it.reasons.size > 0 && <small className="reason">{[...it.reasons].join("；")}</small>}
                          </div>
                        )) : <span className="text-dim">—</span>}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="mt-8 break-inside-avoid">
        <h3 className="mb-3.5 text-[1.25rem] font-black text-ink">個人工時概覽</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>人員</th><th>已排工時</th><th>班數</th><th>提醒</th></tr></thead>
            <tbody>
              {!state.staff.length && <tr><td colSpan={4}>目前沒有可顯示的人員。</td></tr>}
              {state.staff.map((person) => {
                const own = result.assignments.filter((a) => a.employeeId === person.id);
                const hours = own.reduce((sum, a) => sum + a.slot.hours, 0);
                const max = Number(person.maxHours) || 0;
                const byWeek = new Map();
                own.forEach((a) => { const k = weekKey(a.slot.date); byWeek.set(k, (byWeek.get(k) || 0) + a.slot.hours); });
                let reminder = "—";
                if (!own.length) reminder = "尚未排班";
                else if ([...byWeek.values()].some((v) => v > max)) reminder = "某週超過工時上限";
                else if (personPreferredOffDates(person, month).some((d) => own.some((a) => a.slot.date === d))) reminder = "含希望休日期";
                else if (person.avoidShiftId && own.some((a) => a.slot.shiftId === person.avoidShiftId)) reminder = "含避開班別";
                const ext = own.filter((a) => a.slot.extended).length;
                if (ext) reminder = "含 " + ext + " 天全天班" + ([...byWeek.values()].some((v) => v > max) ? "，某週超過工時上限" : "");
                if (person.type === "正職" && offLabels[person.id]) reminder = "本月休 " + Object.keys(offLabels[person.id]).length + " 天" + (reminder === "—" ? "" : "；" + reminder);
                const pct = max ? Math.min(100, (Math.max(...byWeek.values(), 0) / max) * 100) : 0;
                return (
                  <tr key={person.id}>
                    <td><span className="font-extrabold text-ink">{person.name}</span> <span className={person.type === "正職" ? "tag" : "tag tag-cyan"}>{person.type}</span></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="w-24 whitespace-nowrap">{hours.toFixed(1)} 小時</span>
                        <div className="no-print h-2 w-32 overflow-hidden rounded-full bg-[#eef0f3]" title="單週最高工時／上限">
                          <div className="h-full rounded-full bg-sky-500" style={{ width: pct + "%" }} />
                        </div>
                      </div>
                    </td>
                    <td>{own.length} 班</td>
                    <td><span className="text-[0.88rem] text-dim">{reminder}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-5 text-[0.88rem] text-dim">這是依目前輸入條件產生的建議班表，請由管理者確認需求、休息安排及適用的工作規範後再發布。</p>
    </Panel>
  );
}
