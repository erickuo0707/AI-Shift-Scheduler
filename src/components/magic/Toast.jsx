import { AnimatePresence, motion } from "motion/react";

export function Toast({ message }) {
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-7 z-[60] flex justify-center px-4" role="status">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="rounded-2xl border border-white/15 bg-[#14163a]/90 px-6 py-3.5 text-[1rem] font-semibold text-white shadow-[0_20px_50px_-10px_rgba(124,58,237,0.6)] backdrop-blur-xl"
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
