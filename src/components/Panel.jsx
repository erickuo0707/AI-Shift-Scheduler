import { cn } from "./ui/cn";

export function Panel({ icon, title, sub, actions, children, className, id }) {
  return (
    <section id={id} className={cn("print-plain my-6 scroll-mt-28 rounded-2xl border border-white/[0.08] bg-[#121522] p-6 sm:p-8", className)}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="no-print grid size-12 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-[1.4rem] text-violet-300">
            {icon}
          </div>
          <div>
            <h2 className="m-0 text-[1.45rem] font-black tracking-tight text-white">{title}</h2>
            {sub && <p className="mt-1 text-[0.9rem] text-dim">{sub}</p>}
          </div>
        </div>
        {actions && <div className="no-print flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
