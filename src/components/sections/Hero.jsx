const STEPS = [
  ["建立團隊", "PT 勾可上班日，正職標 X／△"],
  ["設定規則", "紅字天數、休息間隔、全天班"],
  ["生成班表", "檢查缺口，下載或列印"],
];

export function Hero() {
  return (
    <div className="no-print">
      <section className="relative mt-14 mb-12 text-center">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-120px] -z-10 h-[420px] w-[900px] max-w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(45,212,191,0.22),rgba(59,130,246,0.10)_55%,transparent)]" />
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5">
          <span className="size-1.5 rounded-full bg-teal-500" />
          <span className="eyebrow">Shift planning · 門市排班</span>
        </div>
        <h1 className="mx-auto mt-6 mb-6 max-w-[16ch] text-[clamp(2.4rem,7vw,4.6rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-ink">
          把每個人的需求，<br className="max-sm:hidden" />排進一張<span className="tide-text">好班表。</span>
        </h1>
        <p className="mx-auto m-0 max-w-[720px] text-[1.1rem] leading-[1.8] text-dim">
          PT 勾可上班的日期，正職標「X 必休」或「△ 希望休」。系統先排滿正職，再兼顧帶班、休息間隔與班別偏好，標出排不滿的缺額。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#staff" className="btn btn-primary">開始排班 <span aria-hidden>→</span></a>
          <a href="#rules" className="btn">看排班規則</a>
        </div>
      </section>

      <div className="mb-4 grid grid-cols-3 border-y border-line max-sm:grid-cols-1">
        {STEPS.map(([title, desc], i) => (
          <div key={title} className={"flex items-baseline gap-4 px-2 py-6 sm:px-6 " + (i ? "sm:border-l border-line max-sm:border-t" : "")}>
            <span className="font-mono text-[0.85rem] font-medium text-dim">{String(i + 1).padStart(2, "0")} / 03</span>
            <div>
              <strong className="block text-[1.15rem] font-extrabold tracking-[-0.01em] text-ink">{title}</strong>
              <span className="text-[0.88rem] text-dim">{desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
