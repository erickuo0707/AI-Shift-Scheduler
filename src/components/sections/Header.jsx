import { IconSparkles } from "../Icons";
import { MonthPicker } from "../MonthPicker";

export function Header({ month, onMonth, monthsWithData }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/[0.08] bg-[#0b0d17]/95">
      <div className="mx-auto flex h-[76px] w-[min(1320px,calc(100%-40px))] items-center justify-between gap-3 max-sm:w-[calc(100%-22px)]">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-violet-500 text-[1.3rem] text-white"><IconSparkles /></div>
          <div className="leading-tight max-sm:hidden">
            <div className="text-[1.25rem] font-black tracking-tight text-white">ShiftWell</div>
            <div className="text-[0.75rem] font-bold tracking-[0.12em] text-dim">AI 排班助手</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.85rem] font-bold text-dim max-md:hidden">排班月份</span>
          <MonthPicker value={month} onChange={onMonth} monthsWithData={monthsWithData} />
        </div>
        <div className="flex items-center gap-2 text-[0.82rem] font-bold text-emerald-300 max-lg:hidden">
          <span className="size-2 rounded-full bg-emerald-400" />資料儲存在此瀏覽器
        </div>
      </div>
    </header>
  );
}
