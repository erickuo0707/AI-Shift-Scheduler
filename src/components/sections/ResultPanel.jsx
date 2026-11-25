import { Panel } from "../Panel";
import { NumberTicker } from "../magic/NumberTicker";
import { IconCheck, IconDownload, IconPrinter, IconSave } from "../Icons";
import { addDays, formatDateLabel, isoDate, monthDates, parseDate, personAvailabilityDates, personMustOffDates, personPreferredOffDates, weekKey } from "../../lib/scheduler";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ResultPanel({ state, onCsv, onBackup }) {
  const result = state.result;
  const month = state.settings.month;
  const dates = monthDates(month);
  const unfilled = result.slots.length - result.assignments.length;
  const coverage = result.slots.length ? Math.round((result.assignments.length / result.slots.length) * 100) : 0;
  const used = new Set(result.assignments.map((a) => a.employeeId)).size;
  const avoidCount = result.assignments.filter((a) => {
    const p = state.staff.find((x) => x.id === a.employeeId);
    return p && (p.avoidShiftId === a.slot.shiftId || personPreferredOffDates(p, month).includes(a.slot.date));
  }).length;

  const assignmentMap = new Map();
  result.assignments.forEach((a) => {
    const key = a.employeeId + "|" + a.slot.date;
    if (!assignmentMap.has(key)) assignmentMap.set(key, []);
    assignmentMap.get(key).push(a.slot);
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
    ["已排人員", used, " 人", true],
    ["偏好衝突", avoidCount, " 班", avoidCount === 0],
  ];

  return (
    <Panel
      id="resultSection"
      beam
      icon={<IconCheck />}
      title="排班建議"
      sub={formatDateLabel(dates[0]) + " 至 " + formatDateLabel(dates[dates.length - 1]) + " · " + result.slots.length + " 個班位"}
      actions={<>
        <button className="btn" onClick={onCsv}><IconDownload />下載 CSV</button>
        <button className="btn" onClick={onBackup}><IconSave />備份設定</button>
        <button className="btn btn-primary" onClick={() => window.print()}><IconPrinter />列印班表</button>
      </>}
    >
      <div className={"mb-5 rounded-[18px] border px-6 py-5 text-[1rem] font-semibold " + (unfilled ? "border-amber-400/30 bg-amber-400/10 text-amber-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200")}>
        {unfilled
          ? `目前排出 ${result.assignments.length} / ${result.slots.length} 個班位，還有 ${unfilled} 個缺額。請查看原因，調整人員可上班日期、班別需求或休息條件後重新生成。`
          : "所有班位都已安排。系統遵守目前設定的可上班日期、每週工時上限、休息間隔與連續工作日上限。"}
      </div>

      <div className="my-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(([label, value, unit, good]) => (
          <div key={label} className="kpi-card relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.01] px-6 py-5">
            <div aria-hidden className={"no-print absolute -right-8 -bottom-8 size-28 rounded-full blur-2xl " + (good ? "bg-violet-500/30" : "bg-amber-500/30")} />
            <span className="relative block text-[0.9rem] font-bold text-dim">{label}</span>
            <strong className={"relative mt-1 block text-[2.4rem] font-black leading-tight tracking-tight " + (good ? "bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent" : "text-amber-300")}>
              <NumberTicker value={value} />{unit}
            </strong>
          </div>
        ))}
      </div>

      <p className="mb-3.5 text-[0.88rem] text-dim">PT 的 X 代表未勾選可上班；正職的 X 是必休、△ 是希望休、休是未排班日。班別時間會列在員工與日期交會的格子中。</p>

      <div className="grid gap-5">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-violet-900/80 to-indigo-950 p-4 text-center text-[1.4rem] font-black tracking-wide text-white ring-1 ring-violet-400/30">
          {y} 年 {m} 月排班表
        </div>
        {weeks.map((weekDates) => (
          <div key={weekDates[0]} className="table-wrap rota">
            <table className="schedule-table">
              <thead>
                <tr><th>Name</th>{WEEKDAYS.map((d) => <th key={d}>{d}</th>)}</tr>
                <tr className="date-row"><th>Name</th>{weekDates.map((date) => {
                  const d = parseDate(date); const outside = date.slice(0, 7) !== month;
                  return <th key={date} className={outside ? "outside" : ""}>{d.getMonth() + 1}/{d.getDate()}</th>;
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
                        const shifts = assignmentMap.get(person.id + "|" + date) || [];
                        let content = null;
                        if (inside && shifts.length) {
                          content = (
                            <div className="grid justify-items-center gap-1">
                              {shifts.map((slot) => (
                                <span key={slot.id} className={"work" + (preferredOff.has(date) ? " requested" : "")}>
                                  <strong>{slot.shiftName}</strong>
                                  <small>{slot.start}–{slot.end}</small>
                                  {preferredOff.has(date) && <em>△ 希望休</em>}
                                </span>
                              ))}
                            </div>
                          );
                        } else if (inside && mustOff.has(date)) content = <span className="off">X</span>;
                        else if (inside && preferredOff.has(date)) content = <span className="prefer">△</span>;
                        else if (inside && person.type === "正職") content = <span className="rest">休</span>;
                        else if (inside && !available.has(date)) content = <span className="off">X</span>;
                        return <td key={date} className={inside ? "" : "outside"}>{content}</td>;
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
        <h3 className="mb-3.5 text-[1.25rem] font-black text-white">個人工時概覽</h3>
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
                const pct = max ? Math.min(100, (Math.max(...byWeek.values(), 0) / max) * 100) : 0;
                return (
                  <tr key={person.id}>
                    <td><span className="font-extrabold text-white">{person.name}</span> <span className={person.type === "正職" ? "tag" : "tag tag-cyan"}>{person.type}</span></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="w-24 whitespace-nowrap">{hours.toFixed(1)} 小時</span>
                        <div className="no-print h-2 w-32 overflow-hidden rounded-full bg-white/10" title="單週最高工時／上限">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" style={{ width: pct + "%" }} />
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
