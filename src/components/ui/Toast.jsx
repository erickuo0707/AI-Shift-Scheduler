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
            className="rounded-full bg-ink px-6 py-3 text-[0.98rem] font-semibold text-white shadow-[0_16px_40px_-12px_rgba(12,17,27,0.5)]"
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
