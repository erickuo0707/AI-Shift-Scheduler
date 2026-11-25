import { Panel } from "../Panel";
import { CommitInput } from "../CommitInput";
import { IconClock, IconPlus } from "../Icons";
import { DAY_NAMES, defaultBreakHours } from "../../lib/scheduler";

export function ShiftPanel({ state, onAdd, onEdit, onDelete }) {
  return (
    <Panel
      className="no-print"
      icon={<IconClock />}
      title="班別與每日人力需求"
      sub="每個班別可設定時段、每班人數、適用星期，以及必要或選填。"
      actions={<button className="btn" onClick={onAdd}><IconPlus />新增班別</button>}
    >
      <div className="grid gap-4">
        {!state.shifts.length && <div className="p-9 text-center text-dim">尚未設定班別。請新增至少一個班別。</div>}
        {state.shifts.map((s) => (
          <article key={s.id} className="grid grid-cols-2 items-end gap-4 rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5 transition hover:border-violet-400/40 hover:shadow-[0_0_40px_-16px_rgba(139,124,255,0.7)] sm:p-6 lg:grid-cols-[1.1fr_.9fr_.9fr_.8fr_.8fr_auto]">
            <label className="flex min-w-0 flex-col gap-2 max-lg:col-span-2">
              <span className="label">班別名稱</span>
              <CommitInput type="text" maxLength={20} value={s.name} onCommit={(v) => onEdit(s.id, "name", v)} />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              <span className="label">開始時間</span>
              <input className="input" type="time" value={s.start} onChange={(e) => onEdit(s.id, "start", e.target.value)} />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              <span className="label">結束時間</span>
              <input className="input" type="time" value={s.end} onChange={(e) => onEdit(s.id, "end", e.target.value)} />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              <span className="label">休息扣除（小時）</span>
              <CommitInput type="number" min={0} max={8} step={0.5} value={s.breakHours === undefined ? defaultBreakHours(s.start, s.end) : s.breakHours} onCommit={(v) => onEdit(s.id, "breakHours", v)} />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              <span className="label">每班人數</span>
              <CommitInput type="number" min={1} max={30} value={s.headcount} onCommit={(v) => onEdit(s.id, "headcount", v)} />
            </label>
            <div className="max-lg:col-span-2 max-lg:justify-self-end">
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(s.id)}>刪除</button>
            </div>
            <div className="col-span-full flex flex-wrap items-center gap-3">
              <span className="label">班別性質</span>
              <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
                {[[false, "必要班"], [true, "選填班"]].map(([v, t]) => (
                  <button key={t} type="button" aria-pressed={!!s.optional === v} onClick={() => onEdit(s.id, "optional", v)}
                    className={"rounded-xl px-4 py-1.5 text-[0.92rem] font-extrabold transition " + (!!s.optional === v ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white" : "text-dim hover:text-white")}>{t}</button>
                ))}
              </div>
              <span className="text-[0.82rem] text-dim">{s.optional ? "有人能排才排，沒排到不算缺額（例如短班）" : "每天一定要有人；缺人時可延長同天的人為全天班"}</span>
            </div>
            <div className="col-span-full flex flex-col gap-2">
              <span className="label">適用星期</span>
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((d, i) => {
                  const on = (s.days || []).includes(i);
                  return (
                    <button key={d} type="button" aria-pressed={on} onClick={() => onEdit(s.id, "days", { day: i, checked: !on })}
                      className={"min-w-[3.1rem] rounded-xl border-[1.5px] px-3.5 py-2 text-[1rem] font-extrabold transition " + (on ? "border-violet-400/60 bg-violet-500/20 text-violet-100 shadow-[0_0_18px_-6px_rgba(139,124,255,0.9)]" : "border-white/10 bg-white/[0.03] text-dim hover:text-white")}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
