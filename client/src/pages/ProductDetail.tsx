import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, Check, Heart, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { useProduct } from '../lib/hooks';
import { formatMoney, categoryLabel, discountPercent, cn } from '../lib/format';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { useToast } from '../store/toast';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import { PageLoader, EmptyState, Rating } from '../components/ui';

export default function ProductDetail() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useProduct(slug);
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => (data ? s.items.some((i) => i.id === data.product.id) : false));
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) return <PageLoader label="Loading product" />;
  if (isError || !data)
    return (
      <div className="container-wide py-16">
        <EmptyState title="Product not found" subtitle="It may have sold out or been removed."
          action={<Link to="/shop" className="btn-primary mt-2">Back to shop</Link>} />
      </div>
    );

  const { product, related } = data;
  const inStock = product.stock > 0;
  const discount = discountPercent(product.price, product.oldPrice);
  const specs = (product.specs ?? {}) as Record<string, string>;

  const onAdd = () => { add(product, qty); push(`${product.name} added to cart`); };

  return (
    <div className="container-wide py-6">
      <nav className="mb-5 text-xs text-muted">
        <Link to="/" className="hover:text-brand">Home</Link> /{' '}
        <Link to={`/shop?category=${product.category}`} className="hover:text-brand">{categoryLabel(product.category)}</Link> /{' '}
        <span className="text-fg">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div key={activeImg} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
            className="aspect-square overflow-hidden rounded-2xl border border-line bg-white p-6">
            <ProductImage src={product.images[activeImg]} alt={product.name} name={product.name} className="h-full w-full object-contain" />
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={cn('h-20 w-20 overflow-hidden rounded-xl border bg-white p-1', i === activeImg ? 'border-brand' : 'border-line')}>
                  <ProductImage src={img} alt={`${product.name} ${i + 1}`} name={product.name} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/shop?category=${product.category}`} className="badge bg-brand/10 text-brand">{categoryLabel(product.category)}</Link>
            <span className="text-sm text-muted">by <span className="font-semibold text-fg">{product.brand}</span></span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-fg md:text-3xl">{product.name}</h1>
          <div className="mt-2"><Rating value={product.rating} count={product.reviewCount} /></div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-extrabold text-fg">{formatMoney(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <span className="text-lg text-muted line-through">{formatMoney(product.oldPrice)}</span>
                <span className="badge bg-deal text-white">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-muted">{product.description}</p>

          <div className="mt-5 text-sm">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-500">
                <Check size={15} /> In stock{product.stock <= 6 && <span className="text-amber-500"> · only {product.stock} left</span>}
              </span>
            ) : <span className="font-medium text-deal">Out of stock</span>}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-line">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-muted hover:text-fg"><Minus size={16} /></button>
              <span className="w-8 text-center font-bold text-fg">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="grid h-11 w-11 place-items-center text-muted hover:text-fg"><Plus size={16} /></button>
            </div>
            <button onClick={onAdd} disabled={!inStock} className="btn-primary h-11 flex-1">
              <ShoppingCart size={17} /> {inStock ? 'Add to cart' : 'Out of stock'}
            </button>
            <button onClick={() => { toggleWish(product); push(wished ? 'Removed from wishlist' : 'Saved to wishlist', 'info'); }}
              className={cn('grid h-11 w-11 place-items-center rounded-xl border border-line transition', wished ? 'text-deal' : 'text-muted hover:text-deal')}>
              <Heart size={18} className={wished ? 'fill-deal' : ''} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-muted">
            <div className="card flex flex-col items-center gap-1 px-2 py-3 text-center"><Truck size={17} className="text-brand" /> Free shipping $99+</div>
            <div className="card flex flex-col items-center gap-1 px-2 py-3 text-center"><RotateCcw size={17} className="text-brand" /> 30-day returns</div>
            <div className="card flex flex-col items-center gap-1 px-2 py-3 text-center"><ShieldCheck size={17} className="text-brand" /> 2-yr warranty</div>
          </div>

          {Object.keys(specs).length > 0 && (
            <div className="card mt-6 overflow-hidden">
              <div className="border-b border-line px-4 py-3 text-sm font-bold text-fg">Specifications</div>
              <dl className="divide-y divide-line">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                    <dt className="text-muted">{k}</dt><dd className="font-semibold text-fg">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-xl font-extrabold text-fg md:text-2xl">Related products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
