import { Panel } from "../Panel";
import { MonthPicker } from "../MonthPicker";
import { CommitInput } from "../CommitInput";
import { IconCalendar, IconSparkles } from "../Icons";
import { DAY_NAMES, defaultHolidays, isWeekend, monthDates, monthHolidays, parseDate } from "../../lib/scheduler";

function Toggle({ on, onChange, label }) {
  return (
    <button type="button" aria-pressed={on} onClick={() => onChange(!on)} className="flex items-center gap-3 text-left">
      <span className={"relative h-6 w-11 shrink-0 rounded-full transition " + (on ? "bg-violet-500" : "bg-white/15")}>
        <span className={"absolute top-0.5 size-5 rounded-full bg-white shadow transition-all " + (on ? "left-[22px]" : "left-0.5")} />
      </span>
      <span className="text-[0.92rem] font-bold text-[#d8dcf6]">{label}</span>
    </button>
  );
}

export function SettingsPanel({ state, onSetting, onGenerate, busy, monthsWithData }) {
  const st = state.settings;
  const dates = monthDates(st.month);
  const holidays = new Set(monthHolidays(st, st.month));
  const isCustom = Array.isArray(st.holidaysByMonth && st.holidaysByMonth[st.month]);
  const weekendCount = dates.filter(isWeekend).length;
  const holidayCount = dates.filter((d) => !isWeekend(d) && holidays.has(d)).length;
  const firstWeekday = parseDate(dates[0]).getDay();
  const toggleHoliday = (d) => {
    const next = new Set(holidays);
    if (next.has(d)) next.delete(d); else next.add(d);
    onSetting("holidays", [...next].sort());
  };
  return (
    <Panel
      className="no-print"
      icon={<IconCalendar />}
      title="排班期間與休息規則"
      sub="硬性規則不會被偏好分數覆蓋；條件不足時會保留缺額並說明原因。"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="label">排班月份</span>
          <MonthPicker value={st.month} onChange={(m) => onSetting("month", m)} monthsWithData={monthsWithData} />
        </div>
        <label className="flex flex-col gap-2">
          <span className="label">兩班最少休息（小時）</span>
          <CommitInput type="number" min={0} max={24} step={0.5} value={st.minRestHours} onCommit={(v) => onSetting("minRestHours", v)} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="label">連續工作日上限</span>
          <CommitInput type="number" min={1} max={7} step={1} value={st.maxConsecutiveDays} onCommit={(v) => onSetting("maxConsecutiveDays", v)} />
        </label>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="label">本月紅字（國定假日）</span>
            {isCustom && <button className="btn btn-sm" onClick={() => onSetting("holidays", null)}>還原預設</button>}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_NAMES.map((d) => <div key={d} className="text-center text-[0.72rem] font-bold text-dim">{d}</div>)}
            {Array.from({ length: firstWeekday }, (_, i) => <div key={"b" + i} />)}
            {dates.map((d) => {
              const weekend = isWeekend(d);
              const hol = holidays.has(d);
              return (
                <button key={d} type="button" disabled={weekend} onClick={() => toggleHoliday(d)}
                  title={weekend ? "週末固定為紅字" : hol ? "點一下取消國定假日" : "點一下設為國定假日"}
                  className={"rounded-lg py-1.5 text-[0.9rem] font-extrabold transition " + (weekend ? "cursor-default bg-rose-500/10 text-rose-300/80" : hol ? "bg-rose-500/30 text-rose-100 ring-1 ring-rose-300/60" : "bg-white/[0.04] text-[#c9cdf0] hover:bg-white/10")}>
                  {Number(d.slice(-2))}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-dim">
            本月紅字 <b className="text-rose-200">{weekendCount + holidayCount} 天</b>（週末 {weekendCount}＋國定假日 {holidayCount}）→ 正職本月可休 {weekendCount + holidayCount} 天，休哪幾天不限星期幾。
            {!isCustom && defaultHolidays(st.month).length === 0 && " 本月沒有內建國定假日，可直接點日期加上。"}
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
          <span className="label">排班規則</span>
          <Toggle on={st.extendToFullDay !== false} onChange={(v) => onSetting("extendToFullDay", v)} label="缺人時延長為全天班" />
          <p className="m-0 text-[0.85rem] leading-relaxed text-dim">某個必要班沒人能上時，把當天已排班的人延長成涵蓋兩班的全天班（例如 11:00–21:00，扣休息 1 小時算 9 小時），可超過每週上限。</p>
          <p className="m-0 text-[0.85rem] leading-relaxed text-dim">正職：月休天數＝紅字天數，每週（日～六）至少休 2 天，休假日標「例假日／休息日」。PT：只排勾選可上班的日期。</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-dashed border-white/10 pt-7">
        <p className="m-0 max-w-[680px] text-[0.88rem] leading-relaxed text-dim">
          排班會先排滿正職，再依帶班、班別偏好與工時平衡安排 PT；必要班優先，選填班有人才排。
        </p>
        <button onClick={onGenerate} disabled={busy} className="btn btn-primary justify-center px-8 py-3.5 text-[1.15rem] disabled:cursor-wait disabled:opacity-70 max-sm:w-full">
          {busy ? <><span className="inline-block size-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white" /> 排班運算中…</> : <><IconSparkles /> 生成建議班表</>}
        </button>
      </div>
    </Panel>
  );
}
