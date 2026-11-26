import { cn } from "./ui/cn";

export function Panel({ eyebrow, title, sub, actions, children, className, id }) {
  return (
    <section id={id} className={cn("print-plain my-7 scroll-mt-28 rounded-[28px] border border-line bg-white p-6 shadow-[0_1px_0_rgba(12,17,27,0.04),0_12px_40px_-24px_rgba(12,17,27,0.18)] sm:p-9", className)}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          {eyebrow && <div className="eyebrow no-print mb-2.5">{eyebrow}</div>}
          <h2 className="m-0 text-[1.6rem] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
          {sub && <p className="mt-1.5 max-w-[760px] text-[0.92rem] text-dim">{sub}</p>}
        </div>
        {actions && <div className="no-print flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
