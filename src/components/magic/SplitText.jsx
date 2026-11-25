import { motion } from "motion/react";

// 參考 React Bits「Split Text」：逐字進場
export function SplitText({ text, className, delay = 0, stagger = 0.045 }) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ opacity: 0, y: "0.6em", filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}
