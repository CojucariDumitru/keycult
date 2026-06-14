import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAdminStats } from '../../lib/hooks';
import { formatMoney, formatDateTime, statusStyle } from '../../lib/format';
import { PageLoader } from '../../components/ui';

export default function Dashboard() {
  const { data, isLoading } = useAdminStats();
  if (isLoading || !data) return <PageLoader label="Loading dashboard" />;

  const { kpis, revenueByDay, topProducts, recentOrders } = data;
  const maxRev = Math.max(1, ...revenueByDay.map((d) => d.total));

  const cards = [
    { label: 'Revenue', value: formatMoney(kpis.revenue), icon: DollarSign, tint: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Orders', value: String(kpis.orders), icon: ShoppingCart, tint: 'text-sky-500 bg-sky-500/10' },
    { label: 'Products', value: String(kpis.products), icon: Package, tint: 'text-brand bg-brand/10' },
    { label: 'Customers', value: String(kpis.customers), icon: Users, tint: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-extrabold text-fg">Dashboard</h1>
        <p className="text-sm text-muted">Store performance at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${c.tint}`}><c.icon size={18} /></div>
            <p className="text-2xl font-extrabold text-fg">{c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      {kpis.lowStock > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-300">
          <AlertTriangle size={16} /> {kpis.lowStock} product(s) low on stock
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2"><TrendingUp size={16} className="text-brand" /><h2 className="font-bold text-fg">Revenue · last 7 days</h2></div>
          <div className="flex h-44 items-end justify-between gap-2">
            {revenueByDay.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-brand transition-all" style={{ height: `${(d.total / maxRev) * 100}%`, minHeight: d.total > 0 ? 4 : 0 }} title={formatMoney(d.total)} />
                </div>
                <span className="text-[10px] text-muted">{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-bold text-fg">Top sellers</h2>
          {topProducts.length === 0 ? <p className="text-sm text-muted">No sales yet.</p> : (
            <ol className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-surface2 text-xs font-bold text-muted">{i + 1}</span>
                  <span className="flex-1 truncate text-sm text-fg">{p.name}</span>
                  <span className="text-sm font-bold text-fg">{p.sold}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-bold text-fg">Recent orders</h2></div>
        {recentOrders.length === 0 ? <p className="px-5 py-8 text-center text-sm text-muted">No orders yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface2">
                    <td className="px-5 py-3 font-mono text-xs text-fg">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-muted">{o.email}</td>
                    <td className="px-5 py-3 text-muted">{formatDateTime(o.createdAt)}</td>
                    <td className="px-5 py-3"><span className={`badge ${statusStyle(o.status)}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-right font-bold text-fg">{formatMoney(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
