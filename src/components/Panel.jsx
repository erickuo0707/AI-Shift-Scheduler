import { MagicCard } from "./magic/MagicCard";
import { BlurFade } from "./magic/BlurFade";
import { BorderBeam } from "./magic/BorderBeam";
import { cn } from "./magic/cn";

export function Panel({ icon, title, sub, actions, children, className, beam, id }) {
  return (
    <BlurFade className={cn("my-6", className)}>
      <MagicCard as="section" id={id} className="print-plain scroll-mt-28 p-6 sm:p-9">
        {beam && <span className="no-print"><BorderBeam duration={10} /></span>}
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="no-print grid size-14 shrink-0 place-items-center rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/20 to-cyan-400/10 text-[1.6rem] text-violet-200 shadow-[0_0_30px_-8px_rgba(139,124,255,0.6)]">
              {icon}
            </div>
            <div>
              <h2 className="m-0 text-[1.5rem] font-black tracking-tight text-white">{title}</h2>
              {sub && <p className="mt-1 text-[0.9rem] text-dim">{sub}</p>}
            </div>
          </div>
          {actions && <div className="no-print flex flex-wrap items-center gap-2.5">{actions}</div>}
        </div>
        {children}
      </MagicCard>
    </BlurFade>
  );
}
