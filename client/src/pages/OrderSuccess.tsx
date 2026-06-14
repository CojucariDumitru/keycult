import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package } from 'lucide-react';
import { useOrderBySession } from '../lib/hooks';
import { useCart } from '../store/cart';
import { formatMoney, statusStyle } from '../lib/format';
import ProductImage from '../components/ProductImage';
import { Spinner } from '../components/ui';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const clear = useCart((s) => s.clear);
  const { data, isLoading } = useOrderBySession(sessionId);

  // Payment succeeded — empty the cart.
  useEffect(() => {
    clear();
  }, [clear]);

  const order = data?.order;

  return (
    <div className="container-wide flex flex-col items-center py-16">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"
      >
        <CheckCircle2 size={42} />
      </motion.div>
      <h1 className="mt-6 font-display text-3xl font-bold text-white">Thank you for your order!</h1>
      <p className="mt-2 max-w-md text-center text-zinc-400">
        Your payment was successful and a confirmation email is on its way.
      </p>

      <div className="mt-8 w-full max-w-lg">
        {isLoading ? (
          <div className="card flex items-center justify-center gap-3 py-12 text-zinc-500">
            <Spinner className="h-5 w-5 text-accent" /> Confirming your order…
          </div>
        ) : order ? (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <p className="text-xs text-zinc-500">Order number</p>
                <p className="font-mono font-semibold text-white">{order.orderNumber}</p>
              </div>
              <span className={`badge ${statusStyle(order.status)}`}>{order.status}</span>
            </div>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-ink-850">
                    <ProductImage src={item.image} alt={item.name} name={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-zinc-500">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm text-zinc-300">{formatMoney(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-white/5 px-5 py-4 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span><span className="text-white">{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span><span className="text-white">{order.shipping === 0 ? 'Free' : formatMoney(order.shipping)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-bold text-white">
                <span>Total</span><span>{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card px-5 py-8 text-center text-zinc-400">
            <Package className="mx-auto mb-3 text-accent-soft" />
            Your order is being processed. Check your email for confirmation.
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Link to="/shop" className="btn-primary">Continue shopping</Link>
        <Link to="/account/orders" className="btn-ghost">View my orders</Link>
      </div>
    </div>
  );
}
