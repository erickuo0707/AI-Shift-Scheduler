import { useEffect, useRef, useState } from "react";
import { Dialog } from "../ui/Dialog";
import { IconX } from "../Icons";
import { DAY_NAMES, defaultBreakHours, monthDates, redDates, shiftGrossHours, offRequestLimit, parseDate, personAvailabilityDates, personMustOffDates, personPreferredOffDates } from "../../lib/scheduler";

function initialForm(person, month, shifts) {
  const type = person ? person.type : "PT";
  const status = {};
  if (person && type === "正職") {
    personPreferredOffDates(person, month).forEach((d) => { status[d] = "prefer"; });
    personMustOffDates(person, month).forEach((d) => { status[d] = "must"; });
  }
  return {
    name: person ? person.name : "",
    type,
    maxHours: person ? person.maxHours : 28,
    preferredShiftId: person ? person.preferredShiftId : "",
    avoidShiftId: person ? person.avoidShiftId : "",
    available: new Set(person && type === "PT" ? personAvailabilityDates(person, month) : []),
    status,
    lead: person ? !!person.lead : false,
    allowed: new Set(person ? (Array.isArray(person.allowedShiftIds) ? person.allowedShiftIds : shifts.map((s) => s.id)) : shifts.filter((s) => !s.optional).map((s) => s.id)),
  };
}

export function StaffDialog({ open, person, state, onClose, onSave, toast }) {
  const month = state.settings.month;
  const [form, setForm] = useState(() => initialForm(person, month, state.shifts));
  const nameRef = useRef(null);
  useEffect(() => {
    if (open) { setForm(initialForm(person, month, state.shifts)); setTimeout(() => nameRef.current && nameRef.current.focus(), 60); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, person?.id, month]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const dates = monthDates(month);
  const firstWeekday = parseDate(dates[0]).getDay();
  const isFull = form.type === "正職";
  const offCount = Object.values(form.status).filter(Boolean).length;
  const limit = offRequestLimit(month);
  const redList = redDates(state.settings, month);
  const redCount = redList.length;
  const redSet = new Set(redList);

  const changeType = (type) => {
    if (type === form.type) return;
    set({ type, maxHours: type === "正職" ? 40 : 28, available: new Set(), status: {} });
    toast("日期設定方式已切換，請重新標記。");
  };
  const toggleDate = (date) => {
    if (isFull) {
      const cur = form.status[date] || "none";
      const next = cur === "none" ? "prefer" : cur === "prefer" ? "must" : "none";
      set({ status: { ...form.status, [date]: next === "none" ? undefined : next } });
    } else {
      const s = new Set(form.available);
      if (s.has(date)) s.delete(date); else s.add(date);
      set({ available: s });
    }
  };
  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { toast("請填寫人員名稱。"); return; }
    const selectedShiftIds = state.shifts.map((s) => s.id).filter((id) => form.allowed.has(id));
    if (!selectedShiftIds.length) { toast("請至少勾選一個可排班別。"); return; }
    const mustOff = dates.filter((d) => form.status[d] === "must");
    const preferredOff = dates.filter((d) => form.status[d] === "prefer");
    onSave({
      name, type: form.type, maxHours: Number(form.maxHours),
      preferredShiftId: form.preferredShiftId, avoidShiftId: form.avoidShiftId,
      available: dates.filter((d) => form.available.has(d)), mustOff, preferredOff,
      allowedShiftIds: selectedShiftIds.length === state.shifts.length ? null : selectedShiftIds,
      lead: form.lead,
    });
  };
  const options = (
    <>
      <option value="">無偏好</option>
      {state.shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} labelledBy="dialogTitle">
      <form onSubmit={submit} className="p-6 sm:p-9">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h2 id="dialogTitle" className="m-0 text-[1.6rem] font-black text-white">{person ? "編輯人員" : "新增人員"}</h2>
            <p className="mt-1 text-[0.9rem] text-dim">可以隨時修改或刪除人員資料。</p>
          </div>
          <button type="button" className="btn btn-sm" onClick={onClose} aria-label="關閉"><IconX /></button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="label">姓名或代稱</span>
            <input ref={nameRef} className="input" maxLength={30} required placeholder="例如：小安" value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <div className="flex flex-col gap-2">
            <span className="label">人員類型</span>
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
              {["PT", "正職"].map((t) => (
                <button key={t} type="button" onClick={() => changeType(t)}
                  className={"rounded-xl py-2 text-[1rem] font-extrabold transition " + (form.type === t ? "bg-violet-500 text-white" : "text-dim hover:text-white")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="label">資深・可帶班</span>
            <button type="button" aria-pressed={form.lead} onClick={() => set({ lead: !form.lead })}
              className={"flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-2.5 text-left transition " + (form.lead ? "border-amber-300/60 bg-amber-300/10" : "border-white/10 bg-white/[0.03] hover:border-white/25")}>
              <span className={"relative h-6 w-11 rounded-full transition " + (form.lead ? "bg-amber-400" : "bg-white/15")}><span className={"absolute top-0.5 size-5 rounded-full bg-white shadow transition-all " + (form.lead ? "left-[22px]" : "left-0.5")} /></span>
              <span className="text-[0.9rem] font-bold text-[#d8dcf6]">{form.lead ? "★ 帶班人員" : "一般人員"}</span>
            </button>
            <span className="text-[0.8rem] text-dim">每天盡量至少排一位帶班的人；帶班的人同天上班或同天休都可以。</span>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <span className="label">{isFull ? "正職休假需求" : "PT 可上班日期"}</span>
            <span className="text-[0.85rem] text-dim">{month.replace("-", "年")}月</span>
            <div className="grid grid-cols-7 gap-2">
              {DAY_NAMES.map((d) => <div key={d} className="text-center text-[0.75rem] font-bold text-dim">週{d}</div>)}
              {Array.from({ length: firstWeekday }, (_, i) => <div key={"b" + i} />)}
              {dates.map((date) => {
                const n = Number(date.slice(-2));
                const st = form.status[date];
                const on = !isFull && form.available.has(date);
                const label = st === "must" ? "X 必休" : st === "prefer" ? "△ 希望休" : isFull ? "一般" : on ? "可上班" : "";
                return (
                  <button key={date} type="button" onClick={() => toggleDate(date)} aria-pressed={isFull ? !!st : on} aria-label={date + " " + (label || "未勾選")}
                    className={"date-cell flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 " + (on ? "on" : st === "must" ? "must" : st === "prefer" ? "prefer" : "")}>
                    <strong className={"text-[1.05rem] leading-none " + (redSet.has(date) ? "text-rose-300" : "text-white")}>{n}</strong>
                    <small className={"text-[0.66rem] font-extrabold leading-none " + (st === "must" ? "text-rose-300" : st === "prefer" ? "text-amber-300" : on ? "text-violet-200" : "text-dim")}>{label || "—"}</small>
                  </button>
                );
              })}
            </div>
            <span className="text-[0.85rem] leading-relaxed text-dim">
              {isFull
                ? `正職本月可休 ${redCount} 天（＝當月紅字天數），可自選 4–5 天（目前 ${offCount}／${limit} 天），其餘由系統安排並符合每週休 2 天。點日期切換：一般 → △希望休 → X必休。`
                : "PT 請點選可上班的日期；未選的日期不會安排班表。"}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <span className="label">可排班別</span>
            <div className="flex flex-wrap gap-2.5">
                            {state.shifts.map((shift) => {
                const on = form.allowed.has(shift.id);
                const breakHours = shift.breakHours === undefined ? defaultBreakHours(shift.start, shift.end) : Number(shift.breakHours);
                const h = Math.max(0, shiftGrossHours(shift.start, shift.end) - breakHours);
                const hours = Number.isInteger(h) ? String(h) : h.toFixed(1);
                return (
                  <button key={shift.id} type="button" aria-pressed={on}
                    onClick={() => { const a = new Set(form.allowed); if (a.has(shift.id)) a.delete(shift.id); else a.add(shift.id); set({ allowed: a }); }}
                    className={"flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-2.5 text-left transition " + (on ? "border-violet-400/60 bg-violet-500/15" : "border-white/10 bg-white/[0.03] opacity-70 hover:opacity-100")}>
                    <span className={"grid size-5 place-items-center rounded-md border text-[0.75rem] " + (on ? "border-violet-300 bg-violet-500 text-white" : "border-white/25")}>{on ? "✓" : ""}</span>
                    <span className="flex flex-col leading-tight">
                      <strong className="text-[1rem] text-white">{shift.name}</strong>
                      <small className="text-[0.78rem] text-dim">{shift.start}–{shift.end} · {hours} 小時</small>
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-[0.85rem] text-dim">只會安排已勾選的班別。只上短班的人（例如 Sammy）請只勾短班；早班、晚班每天都要有人，短班有人能上才排（週一到週五）。</span>
          </div>
          <label className="flex flex-col gap-2">
            <span className="label">每週最高工時</span>
            <input className="input" type="number" min={1} max={168} required value={form.maxHours} onChange={(e) => set({ maxHours: e.target.value })} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label">偏好班別</span>
            <select className="input" value={form.preferredShiftId} onChange={(e) => set({ preferredShiftId: e.target.value })}>{options}</select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="label">希望避開的班別</span>
            <select className="input" value={form.avoidShiftId} onChange={(e) => set({ avoidShiftId: e.target.value })}>{options}</select>
          </label>
          <p className="text-[0.85rem] text-dim sm:col-span-2">每週工時預設值可依實際制度調整；排班仍會檢查每週最高工時。</p>
        </div>
        <div className="mt-7 flex justify-end gap-2.5">
          <button type="button" className="btn" onClick={onClose}>取消</button>
          <button type="submit" className="btn btn-primary">儲存人員</button>
        </div>
      </form>
    </Dialog>
  );
}
