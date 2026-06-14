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
    { label: 'Revenue', value: formatMoney(kpis.revenue), icon: DollarSign, tint: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Orders', value: String(kpis.orders), icon: ShoppingCart, tint: 'text-sky-400 bg-sky-500/10' },
    { label: 'Products', value: String(kpis.products), icon: Package, tint: 'text-accent-soft bg-accent/10' },
    { label: 'Customers', value: String(kpis.customers), icon: Users, tint: 'text-amber-400 bg-amber-500/10' },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500">Store performance at a glance</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${c.tint}`}>
              <c.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-sm text-zinc-500">{c.label}</p>
          </div>
        ))}
      </div>

      {kpis.lowStock > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
          <AlertTriangle size={16} /> {kpis.lowStock} product(s) low on stock
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-soft" />
            <h2 className="font-semibold text-white">Revenue · last 7 days</h2>
          </div>
          <div className="flex h-44 items-end justify-between gap-2">
            {revenueByDay.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-accent/40 to-accent transition-all"
                    style={{ height: `${(d.total / maxRev) * 100}%`, minHeight: d.total > 0 ? 4 : 0 }}
                    title={formatMoney(d.total)}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">
                  {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-white">Top sellers</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">No sales yet.</p>
          ) : (
            <ol className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-xs font-semibold text-zinc-400">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-zinc-200">{p.name}</span>
                  <span className="text-sm font-semibold text-white">{p.sold}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="font-semibold text-white">Recent orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-mono text-xs text-white">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-zinc-400">{o.email}</td>
                    <td className="px-5 py-3 text-zinc-400">{formatDateTime(o.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${statusStyle(o.status)}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-white">{formatMoney(o.total)}</td>
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
