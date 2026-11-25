import { IconSparkles } from "../Icons";

export function Header() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/[0.08] bg-[#05060f]/55 backdrop-blur-2xl backdrop-saturate-150 [box-shadow:inset_0_-1px_0_rgba(255,255,255,0.04),0_10px_40px_-20px_rgba(0,0,0,0.8)]">
      <div className="mx-auto flex h-[84px] w-[min(1320px,calc(100%-40px))] items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative grid size-[50px] place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-[1.45rem] text-white shadow-[0_0_30px_-4px_rgba(168,85,247,0.8)]">
            <IconSparkles />
          </div>
          <div className="leading-tight">
            <div className="text-[1.35rem] font-black tracking-tight text-white">ShiftWell</div>
            <div className="text-[0.78rem] font-bold tracking-[0.14em] text-dim">AI 排班助手</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-[0.82rem] font-extrabold text-emerald-300 max-sm:px-2.5 max-sm:text-[0.7rem]">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          資料儲存在此瀏覽器
        </div>
      </div>
    </header>
  );
}
