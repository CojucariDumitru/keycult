import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '../../lib/hooks';
import { formatMoney, formatDateTime, statusStyle, cn } from '../../lib/format';
import { useToast } from '../../store/toast';
import ProductImage from '../../components/ProductImage';
import { PageLoader, EmptyState } from '../../components/ui';

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrders() {
  const [filter, setFilter] = useState('');
  const { data, isLoading } = useAdminOrders(filter || undefined);
  const update = useUpdateOrderStatus();
  const push = useToast((s) => s.push);
  const [expanded, setExpanded] = useState<string | null>(null);

  const changeStatus = async (id: string, status: string) => {
    try {
      await update.mutateAsync({ id, status });
      push(`Order marked ${status}`);
    } catch (err) {
      push((err as Error).message || 'Update failed', 'error');
    }
  };

  const orders = data?.orders ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Orders</h1>
        <p className="text-sm text-zinc-500">{orders.length} order(s)</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
            !filter ? 'border-accent bg-accent/15 text-white' : 'border-white/10 text-zinc-400 hover:text-white'
          )}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
              filter === s ? 'border-accent bg-accent/15 text-white' : 'border-white/10 text-zinc-400 hover:text-white'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader label="Loading orders" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders" subtitle="Orders will appear here once customers check out." />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/[0.02]"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-white">{o.orderNumber}</p>
                  <p className="text-xs text-zinc-500">{o.email} · {formatDateTime(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${statusStyle(o.status)}`}>{o.status}</span>
                  <span className="font-semibold text-white">{formatMoney(o.total)}</span>
                </div>
              </button>

              {expanded === o.id && (
                <div className="border-t border-white/5 px-5 py-4">
                  <div className="space-y-2">
                    {o.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-ink-850">
                          <ProductImage src={item.image} alt={item.name} name={item.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="flex-1 text-sm text-zinc-200">{item.name}</span>
                        <span className="text-xs text-zinc-500">×{item.quantity}</span>
                        <span className="text-sm text-zinc-300">{formatMoney(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  {o.shippingName && (
                    <p className="mt-3 text-xs text-zinc-500">
                      Ship to: {o.shippingName}{o.shippingCity ? `, ${o.shippingCity}` : ''}{o.shippingCountry ? `, ${o.shippingCountry}` : ''}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Update status:</span>
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      className="input w-auto cursor-pointer py-1.5 text-xs"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
