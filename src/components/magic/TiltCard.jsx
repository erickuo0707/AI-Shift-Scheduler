import { useRef } from "react";
import { cn } from "./cn";

// 參考 AIMRAN Library「3D tilt」卡片：滑鼠位置帶動立體傾斜與反光
export function TiltCard({ children, className, max = 10 }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(800px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-3px)`;
    el.style.setProperty("--gx", `${px * 100}%`); el.style.setProperty("--gy", `${py * 100}%`);
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("relative overflow-hidden transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]", className)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(240px_circle_at_var(--gx,50%)_var(--gy,0%),rgba(255,255,255,0.12),transparent_60%)]" />
      {children}
    </div>
  );
}
