import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { api } from '../lib/api';
import { getStripe } from '../lib/stripe';
import { formatMoney } from '../lib/format';
import ProductImage from './ProductImage';
import { Spinner } from './ui';

const FREE_SHIPPING = 15000;

export default function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove, subtotal } = useCart();
  const { user } = useAuth();
  const push = useToast((s) => s.push);
  const [loading, setLoading] = useState(false);

  const sub = subtotal();
  const remaining = Math.max(0, FREE_SHIPPING - sub);

  const checkout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const { url, sessionId } = await api.post<{ url: string; sessionId: string }>(
        '/payment/create-checkout-session',
        {
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          email: user?.email,
        }
      );
      const stripe = await getStripe();
      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error && url) window.location.href = url;
      } else if (url) {
        window.location.href = url;
      }
    } catch (err) {
      push((err as Error).message || 'Checkout failed', 'error');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-900"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-white">
                Your cart{items.length > 0 && <span className="text-zinc-500"> · {items.length}</span>}
              </h2>
              <button onClick={close} className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-white/5 text-zinc-500">
                  <ShoppingBag size={26} />
                </div>
                <p className="text-zinc-400">Your cart is empty.</p>
                <Link to="/shop" onClick={close} className="btn-primary">
                  Browse products
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {items.map((line) => (
                    <div key={line.product.id} className="flex gap-3">
                      <Link to={`/product/${line.product.slug}`} onClick={close} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-850">
                        <ProductImage src={line.product.images[0]} alt={line.product.name} name={line.product.name} className="h-full w-full object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <Link to={`/product/${line.product.slug}`} onClick={close} className="text-sm font-medium text-white hover:text-accent-soft">
                            {line.product.name}
                          </Link>
                          <button onClick={() => remove(line.product.id)} className="text-zinc-500 hover:text-rose-400">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500">{line.product.brand}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-white/10">
                            <button onClick={() => setQuantity(line.product.id, line.quantity - 1)} className="grid h-7 w-7 place-items-center text-zinc-400 hover:text-white">
                              <Minus size={13} />
                            </button>
                            <span className="w-5 text-center text-sm text-white">{line.quantity}</span>
                            <button onClick={() => setQuantity(line.product.id, line.quantity + 1)} className="grid h-7 w-7 place-items-center text-zinc-400 hover:text-white">
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {formatMoney(line.product.price * line.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 px-5 py-4">
                  {remaining > 0 ? (
                    <p className="mb-3 text-center text-xs text-zinc-400">
                      Add <span className="font-semibold text-accent-soft">{formatMoney(remaining)}</span> more for free shipping
                    </p>
                  ) : (
                    <p className="mb-3 text-center text-xs text-emerald-400">You've unlocked free shipping ✓</p>
                  )}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Subtotal</span>
                    <span className="text-lg font-bold text-white">{formatMoney(sub)}</span>
                  </div>
                  <button onClick={checkout} disabled={loading} className="btn-primary w-full">
                    {loading ? <><Spinner className="h-4 w-4" /> Redirecting…</> : 'Checkout'}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-zinc-600">Secure payment via Stripe</p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
