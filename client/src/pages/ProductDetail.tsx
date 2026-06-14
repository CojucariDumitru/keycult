import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Check, ChevronLeft, Truck, RotateCcw } from 'lucide-react';
import { useProduct } from '../lib/hooks';
import { formatMoney, categoryLabel } from '../lib/format';
import { useCart } from '../store/cart';
import { useToast } from '../store/toast';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import { PageLoader, EmptyState, Rating } from '../components/ui';

export default function ProductDetail() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useProduct(slug);
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) return <PageLoader label="Loading product" />;
  if (isError || !data)
    return (
      <div className="container-wide py-16">
        <EmptyState
          title="Product not found"
          subtitle="It may have sold out or been removed."
          action={<Link to="/shop" className="btn-primary mt-2">Back to shop</Link>}
        />
      </div>
    );

  const { product, related } = data;
  const inStock = product.stock > 0;
  const specs = (product.specs ?? {}) as Record<string, string>;

  const onAdd = () => {
    add(product, qty);
    push(`${product.name} added to cart`);
  };

  return (
    <div className="container-wide py-8">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <ChevronLeft size={16} /> Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="aspect-square overflow-hidden rounded-3xl border border-white/10 bg-ink-850"
          >
            <ProductImage
              src={product.images[activeImg]}
              alt={product.name}
              name={product.name}
              className="h-full w-full object-cover"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border ${
                    i === activeImg ? 'border-accent' : 'border-white/10'
                  }`}
                >
                  <ProductImage src={img} alt={`${product.name} ${i + 1}`} name={product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-3">
            <span className="badge bg-accent/15 text-accent-soft">{categoryLabel(product.category)}</span>
            {product.featured && <span className="badge bg-white/10 text-zinc-300">Featured</span>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-white">{product.name}</h1>
          <p className="mt-1 text-zinc-500">by {product.brand}</p>
          <div className="mt-3">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>

          <p className="mt-5 text-3xl font-bold text-white">{formatMoney(product.price)}</p>

          <p className="mt-5 leading-relaxed text-zinc-400">{product.description}</p>

          {/* Stock */}
          <div className="mt-5 text-sm">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <Check size={15} /> In stock
                {product.stock <= 6 && <span className="text-amber-400"> · only {product.stock} left</span>}
              </span>
            ) : (
              <span className="text-rose-400">Sold out</span>
            )}
          </div>

          {/* Qty + add */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center text-zinc-400 hover:text-white">
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-semibold text-white">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                className="grid h-10 w-10 place-items-center text-zinc-400 hover:text-white"
              >
                <Plus size={15} />
              </button>
            </div>
            <button onClick={onAdd} disabled={!inStock} className="btn-primary flex-1">
              <ShoppingBag size={17} /> {inStock ? 'Add to cart' : 'Sold out'}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-zinc-400">
            <div className="card flex items-center gap-2 px-3 py-2.5">
              <Truck size={15} className="text-accent-soft" /> Free shipping over $150
            </div>
            <div className="card flex items-center gap-2 px-3 py-2.5">
              <RotateCcw size={15} className="text-accent-soft" /> 30-day returns
            </div>
          </div>

          {/* Specs */}
          {Object.keys(specs).length > 0 && (
            <div className="card mt-6 overflow-hidden">
              <div className="border-b border-white/5 px-4 py-3 text-sm font-semibold text-white">
                Specifications
              </div>
              <dl className="divide-y divide-white/5">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                    <dt className="text-zinc-500">{k}</dt>
                    <dd className="font-medium text-zinc-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-bold text-white">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
