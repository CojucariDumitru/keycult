import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../lib/categories';

export default function MegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="card absolute left-0 top-full z-50 mt-2 w-[640px] max-w-[90vw] p-3 shadow-pop"
    >
      <div className="grid grid-cols-2 gap-1.5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            to={`/shop?category=${c.key}`}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-surface2"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <c.icon size={19} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-fg">{c.label}</span>
              <span className="block truncate text-xs text-muted">{c.blurb}</span>
            </span>
          </Link>
        ))}
      </div>
      <Link
        to="/shop"
        onClick={onNavigate}
        className="mt-2 block rounded-xl bg-surface2 px-4 py-2.5 text-center text-sm font-semibold text-brand hover:bg-brand/10"
      >
        Browse all products →
      </Link>
    </motion.div>
  );
}
