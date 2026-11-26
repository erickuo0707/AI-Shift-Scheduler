import { Dialog } from "../ui/Dialog";
import { IconX } from "../Icons";
import { FULL_DAY, OFF, dayLabel, manualChoices, manualWarnings, parseDate } from "../../lib/scheduler";

// 點班表格子後的手動改班視窗
export function CellEditDialog({ state, cell, onClose, onApply }) {
  const open = !!cell && !!state.result;
  const person = open ? state.staff.find((p) => p.id === cell.personId) : null;
  const current = open ? state.result.assignments.filter((a) => a.employeeId === cell.personId && a.slot.date === cell.date) : [];
  const currentId = current.length ? (current[0].slot.covers && current[0].slot.covers.length > 1 ? FULL_DAY : current[0].slot.shiftId) : OFF;
  const d = open ? parseDate(cell.date) : null;
  return (
    <Dialog open={open && !!person} onClose={onClose} labelledBy="cellEditTitle">
      {open && person && (
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow mb-2">手動調整</div>
              <h2 id="cellEditTitle" className="m-0 text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink">
                {person.name} · {d.getMonth() + 1}/{d.getDate()}（{dayLabel(d.getDay())}）
              </h2>
              <p className="mt-1 text-[0.9rem] text-dim">
                目前：{current.length ? current.map((a) => a.slot.shiftName + " " + a.slot.start + "–" + a.slot.end).join("、") : "沒有排班"}
              </p>
            </div>
            <button type="button" className="btn btn-sm" onClick={onClose} aria-label="關閉"><IconX /></button>
          </div>
          <div className="grid gap-2.5">
            {manualChoices(state).map((c) => {
              const warnings = c.id === currentId ? [] : manualWarnings(state, person.id, cell.date, c.id);
              const selected = c.id === currentId;
              return (
                <button key={c.id} type="button" onClick={() => onApply(c.id, warnings)} aria-pressed={selected}
                  className={"flex items-center justify-between gap-4 rounded-2xl border-[1.5px] px-5 py-3.5 text-left transition " + (selected ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-[#c9ced8] hover:bg-[#f7f8fa]")}>
                  <span className="flex items-baseline gap-3">
                    <strong className="text-[1.08rem]">{c.label}</strong>
                    {c.time && <span className={"font-mono text-[0.8rem] " + (selected ? "text-white/70" : "text-dim")}>{c.time}</span>}
                  </span>
                  <span className="flex flex-wrap justify-end gap-1.5">
                    {selected && <span className="text-[0.8rem] font-bold">目前</span>}
                    {warnings.map((w) => <span key={w} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[0.75rem] font-bold text-amber-700 ring-1 ring-amber-200">{w}</span>)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-[0.85rem] text-dim">有提醒的選項仍可以選，改完缺額、工時和休假標記會自動重算。</p>
        </div>
      )}
    </Dialog>
  );
}
