import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useMyOrders } from '../lib/hooks';
import { formatMoney, formatDate, statusStyle } from '../lib/format';
import ProductImage from '../components/ProductImage';
import { PageLoader, EmptyState } from '../components/ui';

export default function Orders() {
  const { data, isLoading } = useMyOrders();

  if (isLoading) return <PageLoader label="Loading orders" />;

  const orders = data?.orders ?? [];

  return (
    <div className="container-wide max-w-3xl py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-white">My orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          subtitle="When you place an order it'll show up here."
          action={<Link to="/shop" className="btn-primary mt-2">Start shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-accent-soft" />
                  <span className="font-mono text-sm font-semibold text-white">{order.orderNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-500">{formatDate(order.createdAt)}</span>
                  <span className={`badge ${statusStyle(order.status)}`}>{order.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-5 py-3">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="h-11 w-11 overflow-hidden rounded-lg border border-ink-900 bg-ink-850">
                      <ProductImage src={item.image} alt={item.name} name={item.name} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-zinc-400">
                  {order.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                </span>
                <span className="ml-auto font-semibold text-white">{formatMoney(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
