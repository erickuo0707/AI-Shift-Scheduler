import { BorderBeam } from "../magic/BorderBeam";
import { SplitText } from "../magic/SplitText";
import { GradientText, ShinyText } from "../magic/GradientText";
import { BlurFade } from "../magic/BlurFade";
import { TiltCard } from "../magic/TiltCard";
import { IconSparkles } from "../Icons";

const STEPS = [
  ["建立團隊", "PT 可上班日／正職休假需求"],
  ["設定需求", "日期、班別與休息原則"],
  ["生成班表", "檢查缺口並匯出分享"],
];

export function Hero() {
  return (
    <div className="no-print">
      <section className="relative mt-9 mb-7 overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(700px_320px_at_85%_0%,rgba(139,92,246,0.45),transparent_60%),radial-gradient(600px_300px_at_0%_100%,rgba(34,211,238,0.25),transparent_60%),linear-gradient(135deg,#0b0c22,#120f33_60%,#1b1550)] px-7 py-12 sm:px-14 sm:py-16">
        <BorderBeam duration={9} />
        <div aria-hidden className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_75%_20%,#000_10%,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-44 size-[420px] rounded-full border border-white/15 shadow-[0_0_0_40px_rgba(255,255,255,0.03),0_0_0_95px_rgba(255,255,255,0.02)]" />
        <div className="relative">
          <BlurFade>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[0.82rem] font-extrabold uppercase tracking-[0.16em]">
              <span className="text-violet-300"><IconSparkles /></span>
              <ShinyText>Shift planning, made thoughtful</ShinyText>
            </div>
          </BlurFade>
          <h1 className="mt-5 mb-6 text-[clamp(1.9rem,5.6vw,3.9rem)] font-black leading-[1.15] tracking-[-0.035em] text-white">
            <SplitText className="whitespace-nowrap" text="把每個人的需求，" delay={0.1} />
            <br className="sm:hidden" />
            <GradientText className="whitespace-nowrap"><SplitText text="排進一張好班表。" delay={0.45} /></GradientText>
          </h1>
          <BlurFade delay={0.6}>
            <p className="m-0 max-w-[880px] text-[1.1rem] leading-[1.8] text-[#cfd3f6]">
              PT 勾選可以上班的日期，正職標記「X 必休」或「△ 希望休」，再設定各班人力需求。系統會兼顧工時、休息間隔、班別偏好與休假需求，並標出無法滿足的缺額。
            </p>
          </BlurFade>
          <BlurFade delay={0.75}>
            <div className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] px-5 py-3 text-[0.92rem] font-semibold text-[#e6e8ff] backdrop-blur-md">
              <span className="text-cyan-300"><IconSparkles /></span>
              目前使用可解釋的智慧排班引擎；不需要 API 金鑰，人員資料不會上傳。
            </div>
          </BlurFade>
        </div>
      </section>

      <div className="mb-7 grid grid-cols-3 gap-4 max-sm:gap-2">
        {STEPS.map(([title, desc], i) => (
          <BlurFade key={title} delay={0.15 + i * 0.1}>
            <TiltCard className="flex items-center gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-xl max-sm:flex-col max-sm:gap-2 max-sm:p-3 max-sm:text-center">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-[1.2rem] font-black text-white shadow-[0_0_24px_-4px_rgba(139,124,255,0.8)] max-sm:size-10">
                {i + 1}
              </div>
              <div>
                <strong className="block text-[1.15rem] font-extrabold text-white max-sm:text-[0.95rem]">{title}</strong>
                <span className="text-[0.85rem] text-dim max-sm:hidden">{desc}</span>
              </div>
            </TiltCard>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}
