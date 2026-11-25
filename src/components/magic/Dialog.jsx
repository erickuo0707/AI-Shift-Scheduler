import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

// 參考 SmoothUI 的對話框：彈簧縮放 + 背景模糊
export function Dialog({ open, onClose, children, labelledBy }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby={labelledBy}
            className="relative my-auto w-full max-w-[820px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0f22]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, scale: 0.92, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 12, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
