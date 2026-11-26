import { useEffect, useRef, useState } from "react";
import { currentMonth, nextMonth, pad } from "../lib/scheduler";

const shift = (month, n) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1);
};
const label = (month) => { const [y, m] = month.split("-").map(Number); return `${y} 年 ${m} 月`; };

// 月份切換器：左右箭頭切上下月，點中間開啟 12 個月格子；有資料的月份標小圓點
export function MonthPicker({ value, onChange, monthsWithData = new Set() }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(Number(value.slice(0, 4)));
  const ref = useRef(null);
  useEffect(() => { setYear(Number(value.slice(0, 4))); }, [value, open]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);
  const pick = (m) => { onChange(m); setOpen(false); };
  const now = currentMonth();
  const arrow = "grid size-9 place-items-center rounded-full text-[1.2rem] text-[#3d4452] hover:bg-[#eef0f3]";

  return (
    <div ref={ref} className="relative flex items-center gap-0.5 rounded-full border border-line bg-white p-1 shadow-[0_1px_2px_rgba(12,17,27,0.06)]">
      <button type="button" className={arrow} onClick={() => onChange(shift(value, -1))} aria-label="上個月">‹</button>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog"
        className="min-w-[9.5rem] rounded-full px-3 py-1.5 text-center text-[1.05rem] font-extrabold tracking-[-0.01em] text-ink hover:bg-[#eef0f3] max-sm:min-w-[7.5rem] max-sm:text-[0.98rem]">
        {label(value)} <span className="text-[0.8rem] text-dim">▾</span>
      </button>
      <button type="button" className={arrow} onClick={() => onChange(shift(value, 1))} aria-label="下個月">›</button>

      {open && (
        <div role="dialog" aria-label="選擇排班月份" className="absolute left-1/2 top-[calc(100%+8px)] z-50 w-[320px] -translate-x-1/2 rounded-2xl border border-line bg-white p-4 shadow-[0_24px_60px_-20px_rgba(12,17,27,0.35)]">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className={arrow} onClick={() => setYear((y) => y - 1)} aria-label="上一年">‹</button>
            <strong className="text-[1.1rem] text-ink">{year} 年</strong>
            <button type="button" className={arrow} onClick={() => setYear((y) => y + 1)} aria-label="下一年">›</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const m = year + "-" + pad(i + 1);
              const selected = m === value;
              return (
                <button key={m} type="button" onClick={() => pick(m)} aria-pressed={selected}
                  className={"relative rounded-lg py-2.5 text-[1rem] font-bold transition " + (selected ? "bg-ink text-white" : m === now ? "bg-[#eef0f3] text-ink ring-1 ring-[#c9ced8]" : "bg-[#f7f8fa] text-[#3d4452] hover:bg-[#eef0f3]")}>
                  {i + 1} 月
                  {monthsWithData.has(m) && <span className={"absolute right-1.5 top-1.5 size-1.5 rounded-full " + (selected ? "bg-white" : "bg-teal-500")} />}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <div className="flex gap-2">
              <button type="button" className="btn btn-sm" onClick={() => pick(now)}>本月</button>
              <button type="button" className="btn btn-sm" onClick={() => pick(nextMonth())}>下個月</button>
            </div>
            <span className="flex items-center gap-1.5 text-[0.75rem] text-dim"><span className="size-1.5 rounded-full bg-teal-500" />已有資料</span>
          </div>
        </div>
      )}
    </div>
  );
}
