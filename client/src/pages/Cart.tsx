import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { api } from '../lib/api';
import { getStripe } from '../lib/stripe';
import { formatMoney } from '../lib/format';
import ProductImage from '../components/ProductImage';
import { EmptyState, Spinner } from '../components/ui';

const FREE_SHIPPING = 15000;
const SHIPPING = 1200;

export default function Cart() {
  const { items, setQuantity, remove, subtotal } = useCart();
  const { user } = useAuth();
  const push = useToast((s) => s.push);
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const sub = subtotal();
  const shipping = sub >= FREE_SHIPPING || sub === 0 ? 0 : SHIPPING;
  const total = sub + shipping;
  const canceled = params.get('canceled');

  const checkout = async () => {
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

  if (items.length === 0) {
    return (
      <div className="container-wide py-16">
        <h1 className="mb-8 font-display text-3xl font-bold text-white">Your cart</h1>
        <EmptyState
          title="Your cart is empty"
          subtitle="Looks like you haven't added anything yet."
          action={<Link to="/shop" className="btn-primary mt-2">Start shopping</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-wide py-10">
      <h1 className="mb-2 font-display text-3xl font-bold text-white">Your cart</h1>
      {canceled && (
        <p className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
          Checkout was canceled — your cart is still here.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((line) => (
            <div key={line.product.id} className="card flex gap-4 p-4">
              <Link to={`/product/${line.product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-850">
                <ProductImage src={line.product.images[0]} alt={line.product.name} name={line.product.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link to={`/product/${line.product.slug}`} className="font-medium text-white hover:text-accent-soft">
                      {line.product.name}
                    </Link>
                    <p className="text-xs text-zinc-500">{line.product.brand}</p>
                  </div>
                  <button onClick={() => remove(line.product.id)} className="text-zinc-500 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2 rounded-full border border-white/10">
                    <button onClick={() => setQuantity(line.product.id, line.quantity - 1)} className="grid h-8 w-8 place-items-center text-zinc-400 hover:text-white">
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm text-white">{line.quantity}</span>
                    <button onClick={() => setQuantity(line.product.id, line.quantity + 1)} className="grid h-8 w-8 place-items-center text-zinc-400 hover:text-white">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-semibold text-white">{formatMoney(line.product.price * line.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="card p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-white">Order summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white">{formatMoney(sub)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-white">{shipping === 0 ? 'Free' : formatMoney(shipping)}</span>
              </div>
              <div className="my-3 h-px bg-white/10" />
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
            <button onClick={checkout} disabled={loading} className="btn-primary mt-5 w-full">
              {loading ? <><Spinner className="h-4 w-4" /> Redirecting…</> : <><ShoppingBag size={16} /> Checkout</>}
            </button>
            <p className="mt-3 text-center text-[11px] text-zinc-600">
              You'll enter card details on Stripe's secure page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
