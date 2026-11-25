const STEPS = [
  ["建立團隊", "PT 可上班日／正職休假需求"],
  ["設定需求", "班別、紅字與休息原則"],
  ["生成班表", "檢查缺口並匯出分享"],
];

export function Hero() {
  return (
    <div className="no-print">
      <section className="mt-8 mb-6 rounded-2xl border border-white/[0.08] bg-[#121522] px-7 py-10 sm:px-10">
        <div className="text-[0.82rem] font-extrabold uppercase tracking-[0.16em] text-violet-300">Shift planning, made thoughtful</div>
        <h1 className="mt-3 mb-4 text-[clamp(1.9rem,4.6vw,3rem)] font-black leading-[1.2] tracking-[-0.02em] text-white">
          <span className="whitespace-nowrap">把每個人的需求，</span><span className="whitespace-nowrap">排進一張好班表。</span>
        </h1>
        <p className="m-0 max-w-[880px] text-[1.05rem] leading-[1.8] text-[#c4c8e4]">
          PT 勾選可以上班的日期，正職標記「X 必休」或「△ 希望休」，再設定各班人力需求。系統會先排滿正職，兼顧工時、休息間隔、班別偏好與休假需求，並標出無法滿足的缺額。資料只存在這個瀏覽器，不會上傳。
        </p>
      </section>
      <div className="mb-6 grid grid-cols-3 gap-4 max-sm:gap-2">
        {STEPS.map(([title, desc], i) => (
          <div key={title} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#121522] p-5 max-sm:flex-col max-sm:gap-2 max-sm:p-3 max-sm:text-center">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-[1.15rem] font-black text-violet-300 max-sm:size-9">{i + 1}</div>
            <div>
              <strong className="block text-[1.1rem] font-extrabold text-white max-sm:text-[0.95rem]">{title}</strong>
              <span className="text-[0.85rem] text-dim max-sm:hidden">{desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
