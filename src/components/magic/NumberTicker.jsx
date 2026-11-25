import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

// 參考 Magic UI「Number Ticker」：數字滾動到目標值
export function NumberTicker({ value, decimals = 0, className }) {
  const ref = useRef(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 40, stiffness: 120 });
  const inView = useInView(ref, { once: true, margin: "0px" });
  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(() => spring.on("change", (v) => {
    if (ref.current) ref.current.textContent = Number(v).toFixed(decimals);
  }), [spring, decimals]);
  return <span ref={ref} className={className}>{(0).toFixed(decimals)}</span>;
}
