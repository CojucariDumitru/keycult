import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../store/toast';

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-400" />,
  error: <XCircle size={18} className="text-rose-400" />,
  info: <Info size={18} className="text-sky-400" />,
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className="card pointer-events-auto flex items-center gap-3 px-4 py-3 shadow-2xl"
          >
            {icons[t.type]}
            <span className="flex-1 text-sm text-zinc-100">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-zinc-500 hover:text-white">
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
