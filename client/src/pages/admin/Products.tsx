import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useProducts, useDeleteProduct } from '../../lib/hooks';
import { formatMoney, categoryLabel } from '../../lib/format';
import { useToast } from '../../store/toast';
import ProductImage from '../../components/ProductImage';
import { PageLoader } from '../../components/ui';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts({ search: search || undefined, limit: 48 });
  const del = useDeleteProduct();
  const push = useToast((s) => s.push);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const onDelete = async (id: string, name: string) => {
    try { await del.mutateAsync(id); push(`${name} deleted`); }
    catch (err) { push((err as Error).message || 'Delete failed', 'error'); }
    finally { setConfirmId(null); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-fg">Products</h1>
          <p className="text-sm text-muted">{data?.pagination.total ?? 0} total</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary"><Plus size={16} /> New product</Link>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="input pl-9" />
      </div>

      {isLoading ? <PageLoader label="Loading products" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Featured</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-line bg-white p-0.5">
                          <ProductImage src={p.images[0]} alt={p.name} name={p.name} className="h-full w-full object-contain" />
                        </div>
                        <div><p className="font-semibold text-fg">{p.name}</p><p className="text-xs text-muted">{p.brand}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{categoryLabel(p.category)}</td>
                    <td className="px-4 py-3 font-semibold text-fg">{formatMoney(p.price)}</td>
                    <td className="px-4 py-3"><span className={p.stock <= 6 ? 'text-amber-500' : 'text-fg'}>{p.stock}</span></td>
                    <td className="px-4 py-3">{p.featured ? <span className="badge bg-brand/10 text-brand">Yes</span> : <span className="text-muted">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/products/${p.id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-fg"><Pencil size={15} /></Link>
                        {confirmId === p.id ? (
                          <button onClick={() => onDelete(p.id, p.name)} className="rounded-lg bg-deal/15 px-2 py-1 text-xs font-bold text-deal">Confirm</button>
                        ) : (
                          <button onClick={() => setConfirmId(p.id)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface2 hover:text-deal"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
