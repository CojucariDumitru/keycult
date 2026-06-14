import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from '../lib/hooks';
import { categoryLabel, cn } from '../lib/format';
import { CATEGORIES } from '../lib/categories';
import ProductCard from '../components/ProductCard';
import { PageLoader, EmptyState } from '../components/ui';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const page = parseInt(params.get('page') ?? '1', 10);
  const minPrice = params.get('minPrice') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [minLocal, setMinLocal] = useState(minPrice);
  const [maxLocal, setMaxLocal] = useState(maxPrice);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (search) next.set('search', search);
        else next.delete('search');
        next.delete('page');
        return next;
      });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setParam = (key: string, value: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });

  const { data, isLoading, isError } = useProducts({
    category: category || undefined,
    search: params.get('search') || undefined,
    sort,
    page,
    limit: 12,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  const pagination = data?.pagination;
  const applyPrice = () => {
    setParam('minPrice', minLocal);
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (maxLocal) next.set('maxPrice', maxLocal); else next.delete('maxPrice');
      next.delete('page');
      return next;
    });
  };

  const Sidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Categories</h3>
        <div className="flex flex-col">
          <button
            onClick={() => setParam('category', '')}
            className={cn('rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-surface2',
              !category ? 'bg-brand/10 text-brand' : 'text-fg')}
          >
            All products
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setParam('category', c.key)}
              className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-surface2',
                category === c.key ? 'bg-brand/10 text-brand' : 'text-fg')}
            >
              <c.icon size={15} /> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Price (USD)</h3>
        <div className="flex items-center gap-2">
          <input type="number" min="0" value={minLocal} onChange={(e) => setMinLocal(e.target.value)} placeholder="Min" className="input py-2" />
          <span className="text-muted">–</span>
          <input type="number" min="0" value={maxLocal} onChange={(e) => setMaxLocal(e.target.value)} placeholder="Max" className="input py-2" />
        </div>
        <button onClick={applyPrice} className="btn-soft mt-2 w-full py-2">Apply</button>
      </div>
    </div>
  );

  return (
    <div className="container-wide py-8">
      {/* breadcrumb + title */}
      <nav className="mb-2 text-xs text-muted">
        <Link to="/" className="hover:text-brand">Home</Link> / <span className="text-fg">{category ? categoryLabel(category) : 'All products'}</span>
      </nav>
      <h1 className="font-display text-2xl font-extrabold text-fg md:text-3xl">
        {category ? categoryLabel(category) : 'All products'}
      </h1>
      <p className="mt-1 text-sm text-muted">{pagination ? `${pagination.total} products` : 'Browse the full catalog'}</p>

      <div className="mt-6 lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-44 card p-4">{Sidebar}</div>
        </aside>

        <div>
          {/* toolbar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="input pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFiltersOpen(true)} className="btn-outline lg:hidden">
                <SlidersHorizontal size={15} /> Filters
              </button>
              <select value={sort} onChange={(e) => setParam('sort', e.target.value)} className="input w-auto cursor-pointer py-2.5">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <PageLoader label="Loading products" />
          ) : isError ? (
            <EmptyState title="Couldn't load products" subtitle="Please try again in a moment." />
          ) : data && data.products.length === 0 ? (
            <EmptyState title="No products found" subtitle="Try a different search, category or price range." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {data?.products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button disabled={page <= 1} onClick={() => setParam('page', String(page - 1))} className="btn-outline disabled:opacity-40">Previous</button>
                  <span className="px-3 text-sm text-muted">Page {pagination.page} of {pagination.totalPages}</span>
                  <button disabled={page >= pagination.totalPages} onClick={() => setParam('page', String(page + 1))} className="btn-outline disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-fg/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-fg">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface2"><X size={18} /></button>
            </div>
            {Sidebar}
            <button onClick={() => setFiltersOpen(false)} className="btn-primary mt-6 w-full">Show results</button>
          </div>
        </div>
      )}
    </div>
  );
}
