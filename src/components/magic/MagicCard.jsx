import { useRef } from "react";
import { cn } from "./cn";

// 參考 Magic UI「Magic Card」：滑鼠跟隨的聚光燈 + 邊框發光
export function MagicCard({ children, className, gradientColor = "rgba(139,124,255,0.16)", as: Tag = "div", ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      className={cn("group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0d1d]/80 backdrop-blur-xl", className)}
      style={{ "--mx": "-500px", "--my": "-500px" }}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(520px circle at var(--mx) var(--my), ${gradientColor}, transparent 45%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: 1,
          background: "radial-gradient(360px circle at var(--mx) var(--my), rgba(167,139,250,0.7), rgba(34,211,238,0.35) 40%, transparent 70%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="relative">{children}</div>
    </Tag>
  );
}
