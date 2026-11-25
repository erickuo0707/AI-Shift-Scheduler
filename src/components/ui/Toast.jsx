import { AnimatePresence, motion } from "motion/react";

export function Toast({ message }) {
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-7 z-[60] flex justify-center px-4" role="status">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl border border-white/15 bg-[#22263a] px-6 py-3.5 text-[1rem] font-semibold text-white shadow-xl"
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
