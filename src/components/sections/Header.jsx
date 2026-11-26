import { MonthPicker } from "../MonthPicker";

export function Header({ month, onMonth, monthsWithData }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] w-[min(1320px,calc(100%-40px))] items-center justify-between gap-3 max-sm:w-[calc(100%-22px)]">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-ink font-mono text-[1.05rem] font-bold text-white">S</div>
          <div className="text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink max-sm:hidden">shift<span className="text-dim">well</span></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="eyebrow max-md:hidden">排班月份</span>
          <MonthPicker value={month} onChange={onMonth} monthsWithData={monthsWithData} />
        </div>
        <div className="eyebrow flex items-center gap-2 max-lg:hidden">
          <span className="size-1.5 rounded-full bg-teal-500" />資料只存在此瀏覽器
        </div>
      </div>
    </header>
  );
}
