import { cn } from "./cn";

// 參考 Magic UI「Shimmer Button」：繞行的光束 + 內層玻璃底
export function ShimmerButton({ children, className, shimmerColor = "#c4b5fd", background = "linear-gradient(135deg,#4f46e5,#7c3aed 55%,#0891b2)", ...props }) {
  return (
    <button
      style={{ "--spread": "90deg", "--shimmer-color": shimmerColor, "--radius": "18px", "--speed": "2.6s", "--cut": "0.1em", "--bg": background }}
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap border border-white/15 px-8 py-4 font-black text-white [background:var(--bg)] [border-radius:var(--radius)]",
        "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px disabled:cursor-wait disabled:opacity-80",
        "shadow-[0_18px_50px_-12px_rgba(124,58,237,0.75)]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 size-full rounded-[inherit] px-4 py-1.5 shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]" />
      <div className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
    </button>
  );
}
