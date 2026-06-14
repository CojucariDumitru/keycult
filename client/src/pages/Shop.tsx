import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useProducts } from '../lib/hooks';
import { categoryLabel, cn } from '../lib/format';
import ProductCard from '../components/ProductCard';
import { PageLoader, EmptyState } from '../components/ui';

const CATEGORIES = ['KEYBOARD', 'KEYCAP', 'SWITCH', 'ACCESSORY', 'DESKMAT'];
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
  const [search, setSearch] = useState(params.get('search') ?? '');

  // Debounce search input into the URL.
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

  const { data, isLoading, isError } = useProducts({
    category: category || undefined,
    search: params.get('search') || undefined,
    sort,
    page,
    limit: 12,
  });

  const setParam = (key: string, value: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });

  const pagination = data?.pagination;

  return (
    <div className="container-wide py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          {category ? categoryLabel(category) : 'All products'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {pagination ? `${pagination.total} products` : 'Browse the full catalog'}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-zinc-500" />
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="input w-auto cursor-pointer py-2"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setParam('category', '')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition',
            !category
              ? 'border-accent bg-accent/15 text-white'
              : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-white'
          )}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setParam('category', c)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition',
              category === c
                ? 'border-accent bg-accent/15 text-white'
                : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-white'
            )}
          >
            {categoryLabel(c)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader label="Loading products" />
      ) : isError ? (
        <EmptyState title="Couldn't load products" subtitle="Please try again in a moment." />
      ) : data && data.products.length === 0 ? (
        <EmptyState title="No products found" subtitle="Try a different search or category." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data?.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setParam('page', String(page - 1))}
                className="btn-ghost disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 text-sm text-zinc-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setParam('page', String(page + 1))}
                className="btn-ghost disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
